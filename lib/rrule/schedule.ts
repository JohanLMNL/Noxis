import { RRule } from 'rrule'

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function normalizeDateAtStartOfDay(d: Date): Date {
  const n = new Date(d)
  n.setHours(0, 0, 0, 0)
  return n
}

// Compute the first occurrence on or after today, anchored to the rule's DTSTART
export function computeNextDueDate(rruleString: string, ref: Date = startOfToday()): Date | null {
  try {
    const rule = RRule.fromString(rruleString)
    const next = rule.after(ref, true) // first occurrence >= ref
    return next ? normalizeDateAtStartOfDay(next) : null
  } catch (e) {
    console.error('computeNextDueDate error', e)
    return null
  }
}

// After completion, we move directly to the next future occurrence (skipping missed ones)
export function computeNextAfterCompletion(rruleString: string, ref: Date = new Date()): Date | null {
  try {
    const rule = RRule.fromString(rruleString)
    const next = rule.after(ref, false) // first strictly after now
    return next ? normalizeDateAtStartOfDay(next) : null
  } catch (e) {
    console.error('computeNextAfterCompletion error', e)
    return null
  }
}

export function toIsoDate(date: Date | null | undefined): string | null {
  return date ? new Date(date).toISOString() : null
}
