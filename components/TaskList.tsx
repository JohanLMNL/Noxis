'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TaskCard } from '@/components/TaskCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatRelativeDate } from '@/lib/dates'
import { getNextOccurrence } from '@/lib/rrule/nextOccurrence'
import { useRouter } from 'next/navigation'
import type { Task } from '@/lib/types'

interface TaskListProps {
  tasks: Task[]
  showProject?: boolean
}

export function TaskList({ tasks, showProject = false }: TaskListProps) {
  const [updatingTasks, setUpdatingTasks] = useState<Set<string>>(new Set())
  const supabase = createClient()
  const router = useRouter()

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    setUpdatingTasks(prev => new Set(prev).add(taskId))
    
    try {
      const task = tasks.find(t => t.id === taskId)
      if (!task) return

      const updateData: Partial<Task> = {
        status: newStatus,
        updated_at: new Date().toISOString()
      }

      // Si la tâche est marquée comme terminée
      if (newStatus === 'terminé') {
        updateData.completed_at = new Date().toISOString()

        // Si c'est une tâche récurrente, créer la prochaine occurrence
        if (task.is_recurring && task.rrule) {
          const nextOccurrence = getNextOccurrence(task.rrule, new Date())
          
          if (nextOccurrence) {
            // Normaliser à début de journée (00:00) pour qu'elle s'affiche le jour J
            const due = new Date(nextOccurrence)
            due.setHours(0, 0, 0, 0)

            // Créer une nouvelle tâche pour la prochaine occurrence
            await supabase
              .from('tasks')
              .insert({
                title: task.title,
                description: task.description,
                priority: task.priority,
                project_id: task.project_id,
                due_at: due.toISOString(),
                status: 'à_faire',
                is_recurring: true,
                rrule: task.rrule,
                recurring_parent_id: task.recurring_parent_id || task.id,
                tags: task.tags,
                estimated_minutes: task.estimated_minutes
              })
          }
        }
      } else {
        updateData.completed_at = undefined
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error)
    } finally {
      setUpdatingTasks(prev => {
        const newSet = new Set(prev)
        newSet.delete(taskId)
        return newSet
      })
    }
  }

  const deleteTask = async (taskId: string) => {
    setUpdatingTasks(prev => new Set(prev).add(taskId))
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error)
    } finally {
      setUpdatingTasks(prev => {
        const newSet = new Set(prev)
        newSet.delete(taskId)
        return newSet
      })
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucune tâche à afficher
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          showProject={showProject}
          onStatusChange={updateTaskStatus}
          onDelete={deleteTask}
          isUpdating={updatingTasks.has(task.id)}
        />
      ))}
    </div>
  )
}
