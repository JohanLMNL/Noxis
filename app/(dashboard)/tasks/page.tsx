import { createClient } from '@/lib/supabase/server'
import { TaskList } from '@/components/TaskList'
import { FiltersBar } from '@/components/FiltersBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckSquare, Filter } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface SearchParams {
  status?: string
  priority?: string
  project?: string
  tag?: string
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = createClient()
  const { data: auth } = await supabase.auth.getUser()
  const userId = auth?.user?.id

  if (!userId) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Tâches</h1>
        <p className="text-muted-foreground">Vous devez être connecté pour voir vos tâches.</p>
      </div>
    )
  }
  
  // Construire la requête avec les filtres (select simple pour debug)
  let query = supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  // Appliquer les filtres
  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('status', searchParams.status)
  }
  
  if (searchParams.priority && searchParams.priority !== 'all') {
    query = query.eq('priority', searchParams.priority)
  }
  
  if (searchParams.project && searchParams.project !== 'all') {
    query = query.eq('project_id', searchParams.project)
  }
  
  if (searchParams.tag) {
    query = query.contains('tags', [searchParams.tag])
  }

  const { data: tasks } = await query
  
  // Récupérer les projets pour les filtres
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, color')
    .eq('user_id', userId)
    .eq('status', 'actif')
    .order('name')

  // Récupérer tous les tags uniques
  const { data: allTasks } = await supabase
    .from('tasks')
    .select('tags')
    .eq('user_id', userId)
    .not('tags', 'is', null)

  const allTags = Array.from(
    new Set(
      allTasks?.flatMap(task => task.tags || []) || []
    )
  ).sort()

  // Statistiques
  const totalTasks = tasks?.length || 0
  const completedTasks = tasks?.filter(task => task.status === 'terminé').length || 0
  const inProgressTasks = tasks?.filter(task => task.status === 'en_cours').length || 0
  const pendingTasks = tasks?.filter(task => task.status === 'à_faire').length || 0

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tâches</h1>
          <p className="text-muted-foreground">
            Gérez toutes vos tâches
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <CheckSquare className="h-3 w-3" />
            <span>{totalTasks} tâches</span>
          </Badge>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              À faire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks}</div>
          </CardContent>
        </Card>
        
        <Card className="card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-400">{inProgressTasks}</div>
          </CardContent>
        </Card>
        
        <Card className="card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Terminées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{completedTasks}</div>
          </CardContent>
        </Card>
        
        <Card className="card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtres</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FiltersBar 
            projects={projects || []}
            tags={allTags}
            currentFilters={searchParams}
          />
        </CardContent>
      </Card>

      {/* Liste des tâches */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle>
            Tâches {totalTasks > 0 && `(${totalTasks})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tasks && tasks.length > 0 ? (
            <TaskList tasks={tasks} showProject />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {Object.keys(searchParams).length > 0 
                ? "Aucune tâche ne correspond aux filtres sélectionnés"
                : "Aucune tâche créée pour le moment"
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
