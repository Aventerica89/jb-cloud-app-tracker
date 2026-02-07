const MINUTE = 60
const HOUR = MINUTE * 60
const DAY = HOUR * 24
const MONTH = DAY * 30
const YEAR = DAY * 365

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

export function formatRelativeTime(dateString: string): string {
  const now = Date.now()
  const date = new Date(dateString).getTime()
  const diffSeconds = Math.round((date - now) / 1000)
  const absDiff = Math.abs(diffSeconds)

  if (absDiff < 60) return 'just now'
  if (absDiff < HOUR) return rtf.format(Math.round(diffSeconds / MINUTE), 'minute')
  if (absDiff < DAY) return rtf.format(Math.round(diffSeconds / HOUR), 'hour')
  if (absDiff < MONTH) return rtf.format(Math.round(diffSeconds / DAY), 'day')
  if (absDiff < YEAR) return rtf.format(Math.round(diffSeconds / MONTH), 'month')
  return rtf.format(Math.round(diffSeconds / YEAR), 'year')
}
