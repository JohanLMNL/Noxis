export interface Project {
  id: string
  user_id: string
  name: string
  description?: string
  type: 'personnel' | 'professionnel'
  color: string
  budget_total: number
  budget_spent: number
  status: 'actif' | 'en_pause' | 'terminé' | 'archivé'
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  project_id?: string
  title: string
  description?: string
  status: 'à_faire' | 'en_cours' | 'terminé' | 'annulé'
  priority: 'basse' | 'normale' | 'haute' | 'urgente'
  due_at?: string
  completed_at?: string
  is_recurring: boolean
  rrule?: string
  recurring_parent_id?: string
  original_due_date?: string
  next_due_date?: string
  last_completed_at?: string
  tags: string[]
  estimated_minutes?: number
  actual_minutes?: number
  created_at: string
  updated_at: string
  project?: Project
}

export interface TimeEntry {
  id: string
  user_id: string
  project_id: string
  task_id?: string
  description?: string
  minutes: number
  hourly_rate?: number
  date: string
  created_at: string
  updated_at: string
  project?: Project
  task?: Task
}

export interface Expense {
  id: string
  user_id: string
  project_id?: string
  description: string
  amount: number
  category?: string
  date: string
  receipt_url?: string
  created_at: string
  updated_at: string
  project?: Project
}

export interface Resource {
  id: string
  user_id: string
  project_id: string
  name: string
  type: 'lien' | 'fichier' | 'note' | 'contact'
  content?: string
  url?: string
  created_at: string
  updated_at: string
  project?: Project
}

export interface JournalEntry {
  id: string
  user_id: string
  project_id: string
  title?: string
  content: string
  date: string
  created_at: string
  updated_at: string
  project?: Project
}
