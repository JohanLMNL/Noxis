import { createClient } from '@/lib/supabase/server'
import { TaskQuickAdd } from '@/components/TaskQuickAdd'
import { TaskList } from '@/components/TaskList'
import { formatDate, getTodayRange } from '@/lib/dates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, AlertTriangle } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function TodayPage() {
  const supabase = createClient()
  const { start, end } = getTodayRange()
  const { data: auth } = await supabase.auth.getUser()
  const userId = auth?.user?.id

  if (!userId) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Aujourd'hui</h1>
        <p className="text-muted-foreground">Vous devez être connecté pour voir vos tâches.</p>
      </div>
    )
  }

  // Récupérer toutes les tâches non terminées, on partitionne côté serveur
  const { data: allUserTasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .neq('status', 'terminé')
    .order('created_at', { ascending: false })

  // Calculer la plage "cette semaine" (de demain 00:00 à dimanche 23:59:59.999)
  const tomorrowStart = new Date(start)
  tomorrowStart.setDate(tomorrowStart.getDate() + 1)
  tomorrowStart.setHours(0, 0, 0, 0)

  const weekEnd = new Date(start)
  const dow = weekEnd.getDay() // 0=dimanche, 1=lundi, ...
  const daysUntilSunday = (7 - dow) % 7
  weekEnd.setDate(weekEnd.getDate() + daysUntilSunday)
  weekEnd.setHours(23, 59, 59, 999)

  // Partitionner côté serveur en utilisant une "due" effective
  const effectiveDue = (t: any): Date | null => {
    const iso = t.is_recurring && t.next_due_date ? t.next_due_date : t.due_at
    return iso ? new Date(iso) : null
  }

  const sortedTasks = (allUserTasks || []).slice().sort((a, b) => {
    const ad = effectiveDue(a)?.getTime() ?? Infinity
    const bd = effectiveDue(b)?.getTime() ?? Infinity
    if (ad === bd) return (b.priority || '').localeCompare(a.priority || '')
    return ad - bd
  })

  const overdueTasks = sortedTasks.filter(t => {
    const d = effectiveDue(t)
    return d && d < start
  })
  const todayTasks = sortedTasks.filter(t => {
    const d = effectiveDue(t)
    return d && d >= start && d <= end
  })
  const weekTasks = sortedTasks.filter(t => {
    const d = effectiveDue(t)
    return d && d >= tomorrowStart && d <= weekEnd
  })
  const undatedTasks = sortedTasks.filter(t => !effectiveDue(t))

  const { data: focusTask } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'en_cours')
    .single()

  // Map project info without joins (avoid RLS joins)
  const allTasks = [
    ...todayTasks,
    ...weekTasks,
    ...overdueTasks,
    ...undatedTasks
  ]
  const projectIds = Array.from(new Set(allTasks.map(t => t.project_id).filter(Boolean))) as string[]
  let projectMap: Record<string, { name: string; color: string }> = {}
  if (projectIds.length > 0) {
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name, color')
      .eq('user_id', userId)
      .in('id', projectIds)
    if (projects) {
      projectMap = Object.fromEntries(projects.map(p => [p.id, { name: p.name, color: p.color }]))
    }
  }

  const attachProject = (tasks?: any[] | null) =>
    (tasks || []).map(t => ({ ...t, project: t.project_id ? projectMap[t.project_id] : undefined }))

  const todayWithProject = attachProject(todayTasks)
  const weekWithProject = attachProject(weekTasks)
  const overdueWithProject = attachProject(overdueTasks)
  const undatedWithProject = attachProject(undatedTasks)
  const focusWithProject = focusTask ? { ...focusTask, project: focusTask.project_id ? projectMap[focusTask.project_id] : undefined } : null

  const totalTasks = todayTasks.length + overdueTasks.length + weekTasks.length + undatedTasks.length

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Aujourd'hui</h1>
          <p className="text-muted-foreground">
            {formatDate(new Date(), 'EEEE d MMMM yyyy')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{totalTasks} tâches</span>
          </Badge>
        </div>
      </div>

      {/* Ajout rapide de tâche */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Ajouter une tâche</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TaskQuickAdd />
        </CardContent>
      </Card>

      {/* Tâche focus */}
      {focusWithProject && (
        <Card className="card-glow border-violet-500/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-violet-400">
              <Clock className="h-5 w-5" />
              <span>Tâche en cours</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h3 className="font-semibold">{focusWithProject.title}</h3>
              {focusWithProject.description && (
                <p className="text-sm text-muted-foreground">
                  {focusWithProject.description}
                </p>
              )}
              {focusWithProject.project && (
                <Badge 
                  variant="outline" 
                  style={{ borderColor: focusWithProject.project.color }}
                >
                  {focusWithProject.project.name}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tâches en retard */}
      {overdueWithProject && overdueWithProject.length > 0 && (
        <Card className="card-glow border-red-500/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              <span>En retard ({overdueWithProject.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TaskList tasks={overdueWithProject} showProject />
          </CardContent>
        </Card>
      )}

      {/* Tâches d'aujourd'hui */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Aujourd'hui ({todayTasks?.length || 0})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayWithProject && todayWithProject.length > 0 ? (
            <TaskList tasks={todayWithProject} showProject />
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Aucune tâche prévue pour aujourd'hui
            </p>
          )}
        </CardContent>
      </Card>

      {/* Cette semaine (hors aujourd'hui) */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Cette semaine ({weekTasks?.length || 0})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {weekWithProject && weekWithProject.length > 0 ? (
            <TaskList tasks={weekWithProject} showProject />
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Aucune tâche prévue pour cette semaine
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tâches sans échéance */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Sans échéance ({undatedTasks?.length || 0})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {undatedWithProject && undatedWithProject.length > 0 ? (
            <TaskList tasks={undatedWithProject} showProject />
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Aucune tâche sans échéance
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
