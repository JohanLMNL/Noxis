import { RRule } from 'rrule'
import { addMinutes } from 'date-fns'

export function getNextOccurrence(rruleString: string, after: Date = new Date()): Date | null {
  try {
    const rule = RRule.fromString(rruleString)
    
    // Obtenir la prochaine occurrence après la date donnée
    const nextOccurrence = rule.after(after, true)
    
    return nextOccurrence
  } catch (error) {
    console.error('Erreur lors du calcul de la prochaine occurrence:', error)
    return null
  }
}

export function getNextOccurrences(rruleString: string, count: number = 5, after: Date = new Date()): Date[] {
  try {
    const rule = RRule.fromString(rruleString)
    
    // Obtenir les prochaines occurrences
    const occurrences = rule.between(after, addMinutes(after, 365 * 24 * 60), true) // Sur 1 an
    
    return occurrences.slice(0, count)
  } catch (error) {
    console.error('Erreur lors du calcul des prochaines occurrences:', error)
    return []
  }
}

export function shouldCreateNextOccurrence(task: { completed_at?: string, rrule?: string, due_at?: string }): Date | null {
  if (!task.rrule || !task.completed_at) {
    return null
  }
  
  try {
    const completedAt = new Date(task.completed_at)
    const nextOccurrence = getNextOccurrence(task.rrule, completedAt)
    
    return nextOccurrence
  } catch (error) {
    console.error('Erreur lors de la vérification de la prochaine occurrence:', error)
    return null
  }
}
