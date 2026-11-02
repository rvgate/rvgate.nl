"""
Contact form backend for rvgate.nl.

A tiny, dependency-free HTTP service (Python standard library only) that
accepts the contact form as JSON on POST /api/contact and e-mails it over
SMTP. nginx in the `web` container proxies /api/ to this service.

Configuration (environment variables):
  SMTP_HOST, SMTP_PORT (587), SMTP_USER, SMTP_PASSWORD   SMTP server (STARTTLS)
  MAIL_FROM   sender address, e.g. info@rvgate.nl
  MAIL_TO     where messages are delivered (defaults to MAIL_FROM)
  DRY_RUN=1   print the e-mail instead of sending it (for local development)
  PORT        listen port (8000)

Spam / abuse protection: a hidden honeypot field, a minimum time between
showing and submitting the form, a per-IP rate limit, size limits, and
newlines are stripped from anything that ends up in a mail header.
"""

import json
import os
import re
import smtplib
import ssl
import sys
import threading
import time
from collections import defaultdict, deque
from email.message import EmailMessage
from email.utils import formataddr, make_msgid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

SMTP_HOST = os.environ.get("SMTP_HOST", "")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ.get("SMTP_USER", "")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")
MAIL_FROM = os.environ.get("MAIL_FROM", "info@rvgate.nl")
MAIL_TO = os.environ.get("MAIL_TO", MAIL_FROM)
DRY_RUN = os.environ.get("DRY_RUN", "") not in ("", "0", "false")
PORT = int(os.environ.get("PORT", "8000"))

MAX_BODY = 16 * 1024          # bytes of JSON we accept
MAX_NAME = 100
MAX_EMAIL = 254
MAX_PHONE = 30
MAX_SOURCE = 120
MAX_MESSAGE = 5000
MIN_FILL_SECONDS = 3          # faster than this is a bot
RATE_LIMIT = 5                # messages ...
RATE_WINDOW = 60 * 60         # ... per IP per hour

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE_RE = re.compile(r"^[0-9+()\-. ]{6,30}$")

_hits = defaultdict(deque)
_hits_lock = threading.Lock()


def log(*args):
    print(time.strftime("%Y-%m-%d %H:%M:%S"), *args, file=sys.stderr, flush=True)


def rate_limited(ip):
    now = time.monotonic()
    with _hits_lock:
        hits = _hits[ip]
        while hits and now - hits[0] > RATE_WINDOW:
            hits.popleft()
        if len(hits) >= RATE_LIMIT:
            return True
        hits.append(now)
        # forget idle addresses so the table can't grow forever
        if len(_hits) > 10000:
            for key in [k for k, v in _hits.items() if not v]:
                del _hits[key]
        return False


def one_line(value):
    """Collapse whitespace (incl. newlines) so a value is safe in a header."""
    return " ".join(str(value).split())


def validate(data):
    """Return (fields, error). error is a short machine-readable code."""
    if not isinstance(data, dict):
        return None, "invalid"
    name = one_line(data.get("name", ""))[:MAX_NAME + 1]
    email = one_line(data.get("email", ""))[:MAX_EMAIL + 1]
    phone = one_line(data.get("phone", ""))[:MAX_PHONE + 1]
    reason = one_line(data.get("reason", ""))[:MAX_SOURCE]
    source = one_line(data.get("source", ""))[:MAX_SOURCE]
    message = str(data.get("message", "")).strip()
    if not name or len(name) > MAX_NAME:
        return None, "name"
    if not EMAIL_RE.match(email) or len(email) > MAX_EMAIL:
        return None, "email"
    if phone and not PHONE_RE.match(phone):
        return None, "phone"
    if not message or len(message) > MAX_MESSAGE:
        return None, "message"
    return {"name": name, "email": email, "phone": phone, "reason": reason, "source": source, "message": message,
            "lang": one_line(data.get("lang", ""))[:5]}, None


def is_bot(data):
    if str(data.get("website", "")).strip():   # honeypot, hidden from people
        return True
    try:
        elapsed_ms = int(data.get("elapsed", 0))
    except (TypeError, ValueError):
        return True
    return elapsed_ms < MIN_FILL_SECONDS * 1000


def send_mail(fields, ip):
    msg = EmailMessage()
    reason = f"{fields['reason']} - " if fields["reason"] else ""
    msg["Subject"] = f"rvgate.nl: {reason}message from {fields['name']}"
    msg["From"] = formataddr(("rvgate.nl contact form", MAIL_FROM))
    msg["To"] = MAIL_TO
    msg["Reply-To"] = formataddr((fields["name"], fields["email"]))
    msg["Message-ID"] = make_msgid(domain=MAIL_FROM.split("@")[-1])
    msg.set_content(
        f"{fields['message']}\n\n"
        f"-- \n"
        f"Name:      {fields['name']}\n"
        f"E-mail:    {fields['email']}\n"
        f"Phone:     {fields['phone'] or '-'}\n"
        f"Reason:    {fields['reason'] or '-'}\n"
        f"Found via: {fields['source'] or '-'}\n"
        f"Language:  {fields['lang'] or '-'}\n"
        f"IP:        {ip}\n"
    )

    if DRY_RUN:
        log("DRY_RUN, not sending:\n" + msg.as_string())
        return

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20) as smtp:
        smtp.starttls(context=ssl.create_default_context())
        if SMTP_USER:
            smtp.login(SMTP_USER, SMTP_PASSWORD)
        smtp.send_message(msg)


class Handler(BaseHTTPRequestHandler):
    server_version = "rvgate-contact"
    sys_version = ""

    def client_ip(self):
        # set by nginx (which gets it from the nginx-proxy in front of it)
        return self.headers.get("X-Real-IP") or self.client_address[0]

    def reply(self, status, body):
        payload = json.dumps(body).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self):
        if self.path == "/api/health":
            return self.reply(200, {"ok": True})
        self.reply(404, {"ok": False, "error": "not_found"})

    def do_POST(self):
        if self.path != "/api/contact":
            return self.reply(404, {"ok": False, "error": "not_found"})

        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0 or length > MAX_BODY:
            return self.reply(413, {"ok": False, "error": "too_large"})
        try:
            data = json.loads(self.rfile.read(length))
        except ValueError:
            return self.reply(400, {"ok": False, "error": "invalid"})

        ip = self.client_ip()
        if not isinstance(data, dict):
            return self.reply(400, {"ok": False, "error": "invalid"})
        if is_bot(data):
            # pretend it worked so bots don't learn anything
            log(f"bot rejected from {ip}")
            return self.reply(200, {"ok": True})

        fields, error = validate(data)
        if error:
            return self.reply(400, {"ok": False, "error": error})
        if rate_limited(ip):
            return self.reply(429, {"ok": False, "error": "rate_limited"})

        try:
            send_mail(fields, ip)
        except Exception as exc:  # noqa: BLE001 - report any SMTP failure
            log(f"sending failed: {exc!r}")
            return self.reply(502, {"ok": False, "error": "send_failed"})

        log(f"sent message from {fields['email']} ({ip})")
        self.reply(200, {"ok": True})

    def log_message(self, fmt, *args):
        pass  # keep the log for the lines above


def main():
    if not DRY_RUN and not SMTP_HOST:
        sys.exit("SMTP_HOST is not set (use DRY_RUN=1 for local development)")
    log(f"listening on :{PORT}{' (dry run)' if DRY_RUN else ''}")
    ThreadingHTTPServer(("", PORT), Handler).serve_forever()


if __name__ == "__main__":
    main()
