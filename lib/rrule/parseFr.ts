import { RRule, Frequency } from 'rrule'

// Mapping des termes français vers les fréquences RRULE
const frequencyMap: Record<string, Frequency> = {
  'jour': RRule.DAILY,
  'jours': RRule.DAILY,
  'quotidien': RRule.DAILY,
  'quotidienne': RRule.DAILY,
  'semaine': RRule.WEEKLY,
  'semaines': RRule.WEEKLY,
  'hebdomadaire': RRule.WEEKLY,
  'mois': RRule.MONTHLY,
  'mensuel': RRule.MONTHLY,
  'mensuelle': RRule.MONTHLY,
  'année': RRule.YEARLY,
  'années': RRule.YEARLY,
  'annuel': RRule.YEARLY,
  'annuelle': RRule.YEARLY
}

// Mapping des jours de la semaine
const weekdayMap: Record<string, number> = {
  'lundi': RRule.MO.weekday,
  'mardi': RRule.TU.weekday,
  'mercredi': RRule.WE.weekday,
  'jeudi': RRule.TH.weekday,
  'vendredi': RRule.FR.weekday,
  'samedi': RRule.SA.weekday,
  'dimanche': RRule.SU.weekday
}

export function parseFrenchRecurrence(text: string, startDate: Date = new Date()): string | null {
  const lowerText = text.toLowerCase().trim()
  
  // Patterns de base
  const patterns = [
    // "tous les X jours/semaines/mois"
    {
      regex: /tous les (\d+) (jours?|semaines?|mois)/,
      handler: (match: RegExpMatchArray) => {
        const interval = parseInt(match[1])
        const unit = match[2]
        const freq = frequencyMap[unit]
        if (freq) {
          return new RRule({
            freq,
            interval,
            dtstart: startDate
          }).toString()
        }
        return null
      }
    },
    
    // "chaque jour/semaine/mois"
    {
      regex: /chaque (jour|semaine|mois|année)/,
      handler: (match: RegExpMatchArray) => {
        const unit = match[1]
        const freq = frequencyMap[unit]
        if (freq) {
          return new RRule({
            freq,
            dtstart: startDate
          }).toString()
        }
        return null
      }
    },
    
    // "tous les lundis/mardis/etc"
    {
      regex: /tous les (lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)s?/,
      handler: (match: RegExpMatchArray) => {
        const day = match[1]
        const weekday = weekdayMap[day]
        if (weekday !== undefined) {
          return new RRule({
            freq: RRule.WEEKLY,
            byweekday: [weekday],
            dtstart: startDate
          }).toString()
        }
        return null
      }
    },
    
    // "le X de chaque mois" (ex: "le 15 de chaque mois")
    {
      regex: /le (\d+) de chaque mois/,
      handler: (match: RegExpMatchArray) => {
        const monthday = parseInt(match[1])
        if (monthday >= 1 && monthday <= 31) {
          return new RRule({
            freq: RRule.MONTHLY,
            bymonthday: [monthday],
            dtstart: startDate
          }).toString()
        }
        return null
      }
    },
    
    // "quotidien/hebdomadaire/mensuel/annuel"
    {
      regex: /^(quotidien|quotidienne|hebdomadaire|mensuel|mensuelle|annuel|annuelle)$/,
      handler: (match: RegExpMatchArray) => {
        const unit = match[1]
        const freq = frequencyMap[unit]
        if (freq) {
          return new RRule({
            freq,
            dtstart: startDate
          }).toString()
        }
        return null
      }
    }
  ]
  
  // Essayer chaque pattern
  for (const pattern of patterns) {
    const match = lowerText.match(pattern.regex)
    if (match) {
      const result = pattern.handler(match)
      if (result) {
        return result
      }
    }
  }
  
  return null
}

export function rruleToFrench(rruleString: string): string {
  try {
    const rule = RRule.fromString(rruleString)
    const options = rule.options
    
    let description = ''
    
    switch (options.freq) {
      case RRule.DAILY:
        if (options.interval === 1) {
          description = 'Tous les jours'
        } else {
          description = `Tous les ${options.interval} jours`
        }
        break
        
      case RRule.WEEKLY:
        if (options.byweekday && options.byweekday.length > 0) {
          const days = options.byweekday.map((day: any) => {
            const dayNames = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
            return dayNames[typeof day === 'number' ? day : day.weekday]
          })
          
          if (days.length === 1) {
            description = `Tous les ${days[0]}s`
          } else {
            description = `Tous les ${days.join(', ')}`
          }
        } else if (options.interval === 1) {
          description = 'Toutes les semaines'
        } else {
          description = `Toutes les ${options.interval} semaines`
        }
        break
        
      case RRule.MONTHLY:
        if (options.bymonthday && options.bymonthday.length > 0) {
          description = `Le ${options.bymonthday[0]} de chaque mois`
        } else if (options.interval === 1) {
          description = 'Tous les mois'
        } else {
          description = `Tous les ${options.interval} mois`
        }
        break
        
      case RRule.YEARLY:
        if (options.interval === 1) {
          description = 'Tous les ans'
        } else {
          description = `Tous les ${options.interval} ans`
        }
        break
        
      default:
        description = 'Récurrence personnalisée'
    }
    
    return description
  } catch (error) {
    return 'Récurrence invalide'
  }
}
