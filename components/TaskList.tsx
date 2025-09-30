'use client'

import { useEffect, useState, useTransition } from 'react'
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
  // Local copy for optimistic UI
  const [items, setItems] = useState<Task[]>(tasks)
  const supabase = createClient()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Keep local list in sync when server provides new props
  useEffect(() => {
    setItems(tasks)
  }, [tasks])

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    setUpdatingTasks(prev => new Set(prev).add(taskId))

    try {
      const task = items.find(t => t.id === taskId)
      if (!task) return

      const updateData: Partial<Task> = {
        status: newStatus,
        updated_at: new Date().toISOString()
      }

      // Si la tâche est marquée comme terminée
      if (newStatus === 'terminé') {
        updateData.completed_at = new Date().toISOString()
        // Optimistic: reflect completed in UI instantly
        setItems(prev => prev.map(t => t.id === taskId ? { ...t, status: 'terminé', completed_at: updateData.completed_at! } : t))

        // Si c'est une tâche récurrente, créer la prochaine occurrence
        if (task.is_recurring && task.rrule) {
          const nextOccurrence = getNextOccurrence(task.rrule, new Date())

          if (nextOccurrence) {
            // Normaliser à début de journée (00:00) pour qu'elle s'affiche le jour J
            const due = new Date(nextOccurrence)
            due.setHours(0, 0, 0, 0)

            // Créer une nouvelle tâche pour la prochaine occurrence
            const { data: inserted, error: insertError } = await supabase
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
              .select('*')
            if (insertError) throw insertError
            if (inserted && inserted.length > 0) {
              // Ajouter la nouvelle occurrence à la liste locale
              setItems(prev => [
                // Place new recurring task near the top for visibility
                inserted[0] as Task,
                ...prev
              ])
            }
          }
        }
      } else {
        updateData.completed_at = undefined
        // Optimistic: reflect status change instantly
        setItems(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus, completed_at: undefined } : t))
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)

      if (error) throw error
      // Refresh in background to resync server data (counts, other sections)
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error)
      // Revert optimistic change on error by re-syncing from props
      setItems(tasks)
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
    // Optimistic: remove locally
    const previous = items
    setItems(prev => prev.filter(t => t.id !== taskId))
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error
      // Refresh in background
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error)
      // Revert optimistic delete
      setItems(previous)
    } finally {
      setUpdatingTasks(prev => {
        const newSet = new Set(prev)
        newSet.delete(taskId)
        return newSet
      })
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucune tâche à afficher
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((task) => (
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
