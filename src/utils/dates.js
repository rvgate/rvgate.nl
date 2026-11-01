// Helpers for dates used in src/content.js: 'YYYY-MM' or just 'YYYY'.

const hasMonth = (value) => /^\d{4}-\d{1,2}$/.test(String(value))

function toMonthIndex(value) {
  if (!value) {
    const now = new Date()
    return now.getFullYear() * 12 + now.getMonth()
  }
  const [y, m] = String(value).split('-').map(Number)
  return y * 12 + (m || 1) - 1
}

/** '2022-03' → 'Mar 2022' (depends on locale); '2005' → '2005' */
export function formatMonth(value, locale = 'en-GB') {
  if (!hasMonth(value)) return String(value)
  const [y, m] = String(value).split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString(locale, { month: 'short', year: 'numeric' })
}

/**
 * Duration between two dates (to = null → now), both months inclusive.
 * Returns '' when a date has no month, since the duration would be a guess.
 */
export function formatDuration(from, to, labels) {
  if (!hasMonth(from) || (to && !hasMonth(to))) return ''
  const months = toMonthIndex(to) - toMonthIndex(from) + 1
  if (!(months > 0)) return ''
  const y = Math.floor(months / 12)
  const m = months % 12
  const word = (n, [one, many]) => `${n} ${n === 1 ? one : many}`
  return [y && word(y, labels.year), m && word(m, labels.month)].filter(Boolean).join(' ')
}
