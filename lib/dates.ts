import { format, isToday, isTomorrow, isYesterday, parseISO, startOfDay, endOfDay, addDays, isWithinInterval } from 'date-fns'
import { fr } from 'date-fns/locale'

export function formatDate(date: string | Date, formatStr: string = 'PPP'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatStr, { locale: fr })
}

export function formatRelativeDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  
  if (isToday(dateObj)) {
    return "Aujourd'hui"
  }
  
  if (isTomorrow(dateObj)) {
    return 'Demain'
  }
  
  if (isYesterday(dateObj)) {
    return 'Hier'
  }
  
  return formatDate(dateObj, 'EEEE d MMMM')
}

export function formatTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'HH:mm', { locale: fr })
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'PPP à HH:mm', { locale: fr })
}

export function isOverdue(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return dateObj < new Date()
}

export function isDueToday(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return isToday(dateObj)
}

export function isDueTomorrow(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return isTomorrow(dateObj)
}

export function getTodayRange() {
  const today = new Date()
  return {
    start: startOfDay(today),
    end: endOfDay(today)
  }
}

export function getWeekRange() {
  const today = new Date()
  return {
    start: startOfDay(today),
    end: endOfDay(addDays(today, 7))
  }
}

export function isInRange(date: string | Date, start: Date, end: Date): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return isWithinInterval(dateObj, { start, end })
}
