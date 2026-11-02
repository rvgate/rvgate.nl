FROM python:3.13-alpine
WORKDIR /app
COPY contact.py .
USER nobody
ENV PYTHONUNBUFFERED=1
EXPOSE 8000
CMD ["python", "contact.py"]
