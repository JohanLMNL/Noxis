'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TaskList } from '@/components/TaskList'
import { TaskQuickAdd } from '@/components/TaskQuickAdd'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  CheckSquare, 
  DollarSign, 
  Clock, 
  FileText, 
  BookOpen,
  Trash2,
  Edit
} from 'lucide-react'
import { formatDate } from '@/lib/dates'
import type { Task, TimeEntry, Expense, Resource, JournalEntry } from '@/lib/types'
import TimeEntryCreateModal from '@/components/TimeEntryCreateModal'
import ExpenseCreateModal from '@/components/ExpenseCreateModal'
import ResourceCreateModal from '@/components/ResourceCreateModal'
import JournalEntryCreateModal from '@/components/JournalEntryCreateModal'

interface ProjectTabsProps {
  projectId: string
}

export function ProjectTabs({ projectId }: ProjectTabsProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [projectId])

  const loadData = async () => {
    setLoading(true)
    
    try {
      const [tasksRes, timeRes, expensesRes, resourcesRes, journalRes] = await Promise.all([
        supabase
          .from('tasks')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('time_entries')
          .select('*, task:tasks(title)')
          .eq('project_id', projectId)
          .order('date', { ascending: false }),
        
        supabase
          .from('expenses')
          .select('*')
          .eq('project_id', projectId)
          .order('date', { ascending: false }),
        
        supabase
          .from('resources')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('journal_entries')
          .select('*')
          .eq('project_id', projectId)
          .order('date', { ascending: false })
      ])

      setTasks(tasksRes.data || [])
      setTimeEntries(timeRes.data || [])
      setExpenses(expensesRes.data || [])
      setResources(resourcesRes.data || [])
      setJournalEntries(journalRes.data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>
  }

  return (
    <Tabs defaultValue="tasks" className="space-y-4">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="tasks" className="flex items-center space-x-2">
          <CheckSquare className="h-4 w-4" />
          <span>Tâches ({tasks.length})</span>
        </TabsTrigger>
        <TabsTrigger value="time" className="flex items-center space-x-2">
          <Clock className="h-4 w-4" />
          <span>Temps ({timeEntries.length})</span>
        </TabsTrigger>
        <TabsTrigger value="budget" className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4" />
          <span>Budget ({expenses.length})</span>
        </TabsTrigger>
        <TabsTrigger value="resources" className="flex items-center space-x-2">
          <FileText className="h-4 w-4" />
          <span>Ressources ({resources.length})</span>
        </TabsTrigger>
        <TabsTrigger value="journal" className="flex items-center space-x-2">
          <BookOpen className="h-4 w-4" />
          <span>Journal ({journalEntries.length})</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="tasks" className="space-y-4">
        <Card className="card-glow">
          <CardHeader className="flex flex-col gap-4">
            <CardTitle>Tâches du projet</CardTitle>
            <TaskQuickAdd projectId={projectId} onCreated={loadData} />
          </CardHeader>
          <CardContent>
            {tasks.length > 0 ? (
              <TaskList tasks={tasks} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucune tâche dans ce projet
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="time" className="space-y-4">
        <Card className="card-glow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Suivi du temps</CardTitle>
            <TimeEntryCreateModal projectId={projectId} onCreated={loadData} />
          </CardHeader>
          <CardContent>
            {timeEntries.length > 0 ? (
              <div className="space-y-3">
                {timeEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">
                        {entry.description || 'Temps de travail'}
                      </div>
                      {entry.task && (
                        <div className="text-sm text-muted-foreground">
                          Tâche: {entry.task.title}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {formatDate(entry.date, 'dd/MM/yyyy')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {Math.round(entry.minutes / 60 * 10) / 10}h
                      </div>
                      {entry.hourly_rate && (
                        <div className="text-sm text-muted-foreground">
                          {((entry.minutes / 60) * entry.hourly_rate).toFixed(2)}€
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucune entrée de temps enregistrée
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="budget" className="space-y-4">
        <Card className="card-glow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Dépenses</CardTitle>
            <ExpenseCreateModal projectId={projectId} onCreated={loadData} />
          </CardHeader>
          <CardContent>
            {expenses.length > 0 ? (
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{expense.description}</div>
                      {expense.category && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {expense.category}
                        </Badge>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {formatDate(expense.date, 'dd/MM/yyyy')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">
                        {expense.amount.toLocaleString('fr-FR')}€
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucune dépense enregistrée
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="resources" className="space-y-4">
        <Card className="card-glow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ressources</CardTitle>
            <ResourceCreateModal projectId={projectId} onCreated={loadData} />
          </CardHeader>
          <CardContent>
            {resources.length > 0 ? (
              <div className="space-y-3">
                {resources.map((resource) => (
                  <div key={resource.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{resource.name}</div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {resource.type}
                        </Badge>
                        {resource.content && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {resource.content}
                          </p>
                        )}
                        {resource.url && (
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-violet-400 hover:underline mt-1 block"
                          >
                            {resource.url}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucune ressource ajoutée
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="journal" className="space-y-4">
        <Card className="card-glow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Journal du projet</CardTitle>
            <JournalEntryCreateModal projectId={projectId} onCreated={loadData} />
          </CardHeader>
          <CardContent>
            {journalEntries.length > 0 ? (
              <div className="space-y-4">
                {journalEntries.map((entry) => (
                  <div key={entry.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      {entry.title && (
                        <h4 className="font-medium">{entry.title}</h4>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {formatDate(entry.date, 'dd/MM/yyyy')}
                      </div>
                    </div>
                    <div className="text-sm whitespace-pre-wrap">
                      {entry.content}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucune entrée de journal
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
