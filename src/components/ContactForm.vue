<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import BaseIcon from './BaseIcon.vue'
import { useLanguage } from '../composables/useLanguage.js'
import { addMessageNode } from '../composables/useNetwork.js'

const props = defineProps({
  form: { type: Object, required: true }, // labels from content.js (contact.form)
})

const { lang } = useLanguage()

const empty = () => ({ name: '', email: '', phone: '', reason: '', source: '', sourceOther: '', message: '', website: '' }) // website = honeypot
const fields = reactive(empty())
const isOther = computed(() => props.form.sources?.find((s) => s.value === fields.source)?.other)
const status = ref('idle') // idle | sending | sent | error
const error = ref('')      // general error above the button: key in form.errors
let shownAt = Date.now()

// ---- validation: messages appear under each field ----
const errors = reactive({})  // field -> key in form.errors ('' = fine)
const touched = reactive({}) // only nag about a field after the visitor left it
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const PHONE_RE = /^[0-9+()\-. ]{6,30}$/ // same rule as the backend
const VALIDATED = ['name', 'email', 'phone', 'sourceOther', 'message']

function check(field) {
  const value = String(fields[field] ?? '').trim()
  switch (field) {
    case 'name': return value ? '' : 'nameRequired'
    case 'email': return !value ? 'emailRequired' : EMAIL_RE.test(value) ? '' : 'email'
    case 'phone': return !value || PHONE_RE.test(value) ? '' : 'phone'
    case 'sourceOther': return !isOther.value || value ? '' : 'sourceOtherRequired'
    case 'message': return value ? '' : 'messageRequired'
    default: return ''
  }
}

const validate = (field) => { errors[field] = check(field) }
const onBlur = (field) => { if (fields[field]) touched[field] = true; if (touched[field]) validate(field) }
// once a message is showing, update it while typing so it disappears as soon as it's fixed
const onInput = (field) => { if (touched[field] || errors[field]) validate(field) }
const hasErrors = computed(() => VALIDATED.some((f) => errors[f]))

/** Validate everything; returns the invalid fields in form order. */
function validateAll() {
  for (const field of VALIDATED) {
    touched[field] = true
    validate(field)
  }
  return VALIDATED.filter((f) => errors[f])
}

/** Focus the first invalid field and give the invalid ones a little shake. */
async function showInvalid(invalid) {
  await nextTick()
  const inputs = invalid.map((f) => card.value?.querySelector(`[data-field="${f}"]`)).filter(Boolean)
  inputs[0]?.focus()
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  for (const el of inputs) {
    el.animate(
      [0, -6, 6, -4, 4, 0].map((x) => ({ transform: `translateX(${x}px)` })),
      { duration: 380, easing: 'ease-out' },
    )
  }
}

const card = ref(null)

async function submit() {
  if (status.value === 'sending') return
  error.value = ''
  const invalid = validateAll()
  if (invalid.length) {
    status.value = 'idle'
    return showInvalid(invalid)
  }
  status.value = 'sending'
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: fields.name,
        email: fields.email,
        phone: fields.phone,
        reason: fields.reason,
        source: isOther.value ? `${fields.source}: ${fields.sourceOther}` : fields.source,
        message: fields.message,
        website: fields.website,
        lang: lang.value,
        elapsed: Date.now() - shownAt,
      }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok || !body.ok) {
      // the backend checks the same rules; show its verdict on the field itself
      const field = { name: ['name', 'nameRequired'], email: ['email', 'email'], phone: ['phone', 'phone'], message: ['message', 'messageRequired'] }[body.error]
      if (field) {
        errors[field[0]] = field[1]
        status.value = 'idle'
        return showInvalid([field[0]])
      }
      error.value = body.error === 'rate_limited' ? 'rate_limited' : 'failed'
    }
  } catch {
    error.value = 'failed'
  }
  if (error.value) {
    status.value = 'error'
    return
  }
  // keep the card's height so the page doesn't jump when the form is replaced
  const height = card.value?.offsetHeight
  await sendIntoNetwork()
  if (card.value && height) card.value.style.minHeight = `${height}px`
  status.value = 'sent'
  await nextTick()
  card.value?.animate(
    [{ opacity: 0, transform: 'scale(.96)' }, { opacity: 1, transform: 'none' }],
    { duration: 450, easing: 'ease-out' },
  )
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Where the message lands: in the margin beside the card when there is
 * room, otherwise in the visible part of the card itself (the "sent" card
 * is see-through, so the node shows through it).
 */
function landingSpot(rect) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const jitter = (range) => (Math.random() - 0.5) * range
  // visible part of the card, below the sticky navigation
  const top = Math.max(rect.top, 150)
  const bottom = Math.min(rect.bottom, vh - 40)
  const y = top + (bottom - top) * 0.3 + jitter(60)
  const right = vw - rect.right
  if (right > 90) return { x: rect.right + right / 2 + jitter(right / 3), y }
  if (rect.left > 90) return { x: rect.left / 2 + jitter(rect.left / 3), y }
  return { x: rect.left + rect.width * (0.25 + Math.random() * 0.5), y }
}

/**
 * The card folds into a glowing dot that flies off into the background,
 * where it becomes a pulsing node of the network (NetworkBackground).
 */
async function sendIntoNetwork() {
  const el = card.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const to = landingSpot(rect)
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !el.animate) {
    addMessageNode(to.x, to.y)
    return
  }

  const from = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  const fold = el.animate(
    [
      { transform: 'scale(1)', opacity: 1, borderRadius: '14px' },
      { transform: 'scale(.04)', opacity: 0, borderRadius: '50%' },
    ],
    { duration: 550, easing: 'cubic-bezier(.5, 0, .75, 0)', fill: 'forwards' },
  )

  // the dot the card turns into
  const dot = document.createElement('div')
  dot.setAttribute('aria-hidden', 'true')
  Object.assign(dot.style, {
    position: 'fixed', left: '0', top: '0', width: '14px', height: '14px', zIndex: '20',
    borderRadius: '50%', pointerEvents: 'none', opacity: '0',
    background: 'var(--teal)',
    boxShadow: '0 0 18px 6px color-mix(in srgb, var(--teal) 55%, transparent)',
  })
  document.body.append(dot)

  await wait(380)
  const at = (p, scale) => `translate(${p.x - 7}px, ${p.y - 7}px) scale(${scale})`
  // a slight arc on the way, getting smaller as it "moves away"
  const mid = { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - 60 }
  const flight = dot.animate(
    [
      { transform: at(from, 0), opacity: 0 },
      { transform: at(from, 2.2), opacity: 1, offset: 0.18 },
      { transform: at(mid, 1.2), opacity: 1, offset: 0.6 },
      { transform: at(to, 0.45), opacity: 1 },
    ],
    { duration: 950, easing: 'cubic-bezier(.4, 0, .2, 1)', fill: 'forwards' },
  )
  await flight.finished
  addMessageNode(to.x, to.y)
  dot.remove()
  fold.cancel()
}

function reset() {
  Object.assign(fields, empty())
  for (const field of VALIDATED) errors[field] = touched[field] = ''
  if (card.value) card.value.style.minHeight = ''
  status.value = 'idle'
  error.value = ''
  shownAt = Date.now()
}
</script>

<template>
  <div ref="card" v-reveal class="contact-form card no-print" :class="{ 'is-sent': status === 'sent' }">
    <h3>{{ form.title }}</h3>

    <div v-if="status === 'sent'" class="sent" role="status">
      <BaseIcon name="check" />
      <p>{{ form.sent }}</p>
      <button type="button" class="link-button" @click="reset">{{ form.again }}</button>
    </div>

    <form v-else novalidate @submit.prevent="submit">
      <div class="row">
        <label :class="{ invalid: errors.name }">
          <span>{{ form.name }}</span>
          <input
            v-model="fields.name" data-field="name" name="name" autocomplete="name" maxlength="100" required
            :aria-invalid="!!errors.name" aria-describedby="cf-name-error"
            @blur="onBlur('name')" @input="onInput('name')"
          >
          <Transition name="field-error">
            <small v-if="errors.name" id="cf-name-error" class="field-error"><BaseIcon name="alert" />{{ form.errors[errors.name] }}</small>
          </Transition>
        </label>
        <label :class="{ invalid: errors.email }">
          <span>{{ form.email }}</span>
          <input
            v-model="fields.email" data-field="email" name="email" type="email" autocomplete="email" maxlength="254" required
            :aria-invalid="!!errors.email" aria-describedby="cf-email-error"
            @blur="onBlur('email')" @input="onInput('email')"
          >
          <Transition name="field-error">
            <small v-if="errors.email" id="cf-email-error" class="field-error"><BaseIcon name="alert" />{{ form.errors[errors.email] }}</small>
          </Transition>
        </label>
      </div>
      <div class="row">
        <label :class="{ invalid: errors.phone }">
          <span>{{ form.phone }} <em>({{ form.optional }})</em></span>
          <input
            v-model="fields.phone" data-field="phone" name="phone" type="tel" autocomplete="tel" maxlength="30"
            :aria-invalid="!!errors.phone" aria-describedby="cf-phone-error"
            @blur="onBlur('phone')" @input="onInput('phone')"
          >
          <Transition name="field-error">
            <small v-if="errors.phone" id="cf-phone-error" class="field-error"><BaseIcon name="alert" />{{ form.errors[errors.phone] }}</small>
          </Transition>
        </label>
        <label v-if="form.reasons?.length">
          <span>{{ form.reason }} <em>({{ form.optional }})</em></span>
          <select v-model="fields.reason" name="reason">
            <option value="">{{ form.choose }}</option>
            <option v-for="option in form.reasons" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>
      </div>
      <div v-if="form.sources?.length" class="row">
        <label>
          <span>{{ form.source }} <em>({{ form.optional }})</em></span>
          <select v-model="fields.source" name="source" @change="errors.sourceOther = ''">
            <option value="">{{ form.choose }}</option>
            <option v-for="option in form.sources" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>
        <label v-if="isOther" :class="{ invalid: errors.sourceOther }">
          <span>{{ form.sourceOther }}</span>
          <input
            v-model="fields.sourceOther" data-field="sourceOther" name="source-other" maxlength="80" required
            :aria-invalid="!!errors.sourceOther" aria-describedby="cf-source-error"
            @blur="onBlur('sourceOther')" @input="onInput('sourceOther')"
          >
          <Transition name="field-error">
            <small v-if="errors.sourceOther" id="cf-source-error" class="field-error"><BaseIcon name="alert" />{{ form.errors[errors.sourceOther] }}</small>
          </Transition>
        </label>
      </div>
      <label :class="{ invalid: errors.message }">
        <span>{{ form.message }}</span>
        <textarea
          v-model="fields.message" data-field="message" name="message" rows="6" maxlength="5000" required
          :aria-invalid="!!errors.message" aria-describedby="cf-message-error"
          @blur="onBlur('message')" @input="onInput('message')"
        />
        <Transition name="field-error">
          <small v-if="errors.message" id="cf-message-error" class="field-error"><BaseIcon name="alert" />{{ form.errors[errors.message] }}</small>
        </Transition>
      </label>

      <!-- honeypot: invisible to people, bots tend to fill it in -->
      <label class="hp" aria-hidden="true">
        Website <input v-model="fields.website" name="website" tabindex="-1" autocomplete="off">
      </label>

      <Transition name="field-error">
        <div v-if="error || hasErrors" class="form-alert" :class="{ soft: !error }" role="alert">
          <BaseIcon name="alert" />
          <span>{{ form.errors[error || 'check'] }}</span>
        </div>
      </Transition>

      <button type="submit" class="send" :disabled="status === 'sending'">
        <BaseIcon name="mail" />
        {{ status === 'sending' ? form.sending : form.send }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.contact-form { margin-top: 16px; }
.contact-form:hover { transform: none; }

/* see-through once sent, so the message node in the network shows */
.contact-form.is-sent,
.contact-form.is-sent:hover {
  background: color-mix(in srgb, var(--bg-raised) 35%, transparent);
  box-shadow: none;
}

.contact-form h3 { margin-bottom: 16px; }

form {
  display: grid;
  gap: 14px;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: start; /* an error under one field must not stretch its neighbour */
  gap: 14px;
}

label {
  display: grid;
  align-content: start;
  gap: 6px;
  font-size: .85rem;
  font-weight: 600;
  color: var(--muted);
}

input, textarea, select {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg);
  color: var(--text);
  font: inherit;
  font-size: .95rem;
  font-weight: 400;
  transition: border-color .2s, box-shadow .2s;
}

textarea { resize: vertical; min-height: 120px; }

select { cursor: pointer; }

label em {
  font-style: normal;
  font-weight: 400;
  opacity: .8;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 25%, transparent);
}

.hp {
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.send {
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 11px 22px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--blue), var(--teal));
  color: #fff;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: transform .2s, box-shadow .2s, opacity .2s;
}

.send:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px color-mix(in srgb, var(--blue) 35%, transparent);
}

.send:disabled { opacity: .6; cursor: progress; }

/* ---- validation ---- */
label.invalid > span { color: var(--pink); }

label.invalid input,
label.invalid textarea {
  border-color: var(--pink);
  background: color-mix(in srgb, var(--pink) 5%, var(--bg));
}

label.invalid input:focus,
label.invalid textarea:focus {
  border-color: var(--pink);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--pink) 22%, transparent);
}

.field-error {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: .82rem;
  font-weight: 500;
  line-height: 1.4;
  color: var(--pink);
}

.field-error .icon { flex: none; margin-top: 1px; font-size: 15px; }

/* general problem (sending failed, rate limit) or a summary of field errors */
.form-alert {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px;
  border: 1px solid color-mix(in srgb, var(--pink) 45%, transparent);
  border-left-width: 4px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--pink) 9%, transparent);
  color: var(--text);
  font-size: .9rem;
}

.form-alert .icon { flex: none; margin-top: 2px; font-size: 18px; color: var(--pink); }

.form-alert.soft {
  border-color: transparent;
  border-left-color: var(--pink);
  background: color-mix(in srgb, var(--pink) 6%, transparent);
  color: var(--muted);
}

.field-error-enter-active, .field-error-leave-active { transition: opacity .2s, transform .2s; }
.field-error-enter-from, .field-error-leave-to { opacity: 0; transform: translateY(-4px); }

.sent {
  flex: 1;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 10px;
  text-align: center;
}

.sent .icon {
  font-size: 40px;
  color: var(--green);
}

.sent p { margin: 0; color: var(--text); }

.link-button {
  padding: 0;
  border: none;
  background: none;
  color: var(--accent);
  font: inherit;
  font-size: .9rem;
  cursor: pointer;
  text-decoration: underline;
}

@media (max-width: 600px) {
  .row { grid-template-columns: 1fr; }
}
</style>
