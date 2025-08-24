import { createClient } from '@/lib/supabase/server'
import { ProjectTabs } from '@/components/ProjectTabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, 
  FolderOpen, 
  CheckSquare, 
  Clock, 
  DollarSign,
  Calendar,
  Briefcase,
  User,
  Edit
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/dates'
import { cn } from '@/lib/utils'

const statusColors = {
  'actif': 'bg-green-500',
  'en_pause': 'bg-yellow-500',
  'terminé': 'bg-blue-500',
  'archivé': 'bg-gray-500'
}

const statusLabels = {
  'actif': 'Actif',
  'en_pause': 'En pause',
  'terminé': 'Terminé',
  'archivé': 'Archivé'
}

const typeIcons = {
  'personnel': User,
  'professionnel': Briefcase
}

export default async function ProjectPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  
  // Récupérer le projet
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!project) {
    notFound()
  }

  // Récupérer les statistiques
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, status')
    .eq('project_id', params.id)

  const { data: timeEntries } = await supabase
    .from('time_entries')
    .select('minutes')
    .eq('project_id', params.id)

  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount')
    .eq('project_id', params.id)

  const TypeIcon = typeIcons[project.type as keyof typeof typeIcons] || User
  
  // Calculer les statistiques
  const totalTasks = tasks?.length || 0
  const completedTasks = tasks?.filter(t => t.status === 'terminé').length || 0
  const totalMinutes = timeEntries?.reduce((sum, entry) => sum + entry.minutes, 0) || 0
  const totalHours = Math.round(totalMinutes / 60 * 10) / 10
  const totalExpenses = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0
  
  const budgetProgress = project.budget_total > 0 
    ? Math.min((project.budget_spent / project.budget_total) * 100, 100)
    : 0

  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center space-x-4">
        <Link href="/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <h1 className="text-2xl font-bold">{project.name}</h1>
        </div>
      </div>

      {/* En-tête du projet */}
      <Card className="card-glow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <TypeIcon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground capitalize">
                  {project.type}
                </span>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", statusColors[project.status as keyof typeof statusColors])}
                >
                  {statusLabels[project.status as keyof typeof statusLabels]}
                </Badge>
              </div>
              
              {project.description && (
                <p className="text-muted-foreground max-w-2xl">
                  {project.description}
                </p>
              )}
              
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Créé le {formatDate(project.created_at, 'dd/MM/yyyy')}</span>
              </div>
            </div>
            
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground mb-2">
                <CheckSquare className="h-4 w-4" />
                <span>Tâches</span>
              </div>
              <div className="text-2xl font-bold">{totalTasks}</div>
              <div className="text-xs text-muted-foreground">
                {completedTasks} terminées
              </div>
              {totalTasks > 0 && (
                <Progress value={taskProgress} className="mt-2 h-2" />
              )}
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground mb-2">
                <Clock className="h-4 w-4" />
                <span>Temps</span>
              </div>
              <div className="text-2xl font-bold">{totalHours}h</div>
              <div className="text-xs text-muted-foreground">
                {totalMinutes} minutes
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground mb-2">
                <DollarSign className="h-4 w-4" />
                <span>Dépenses</span>
              </div>
              <div className="text-2xl font-bold">{totalExpenses.toLocaleString('fr-FR')}€</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground mb-2">
                <DollarSign className="h-4 w-4" />
                <span>Budget</span>
              </div>
              <div className="text-2xl font-bold">{project.budget_total.toLocaleString('fr-FR')}€</div>
              {project.budget_total > 0 && (
                <>
                  <div className="text-xs text-muted-foreground">
                    {project.budget_spent.toLocaleString('fr-FR')}€ utilisés
                  </div>
                  <Progress 
                    value={budgetProgress} 
                    className={cn(
                      "mt-2 h-2",
                      budgetProgress > 90 && "[&>div]:bg-red-500",
                      budgetProgress > 75 && budgetProgress <= 90 && "[&>div]:bg-orange-500"
                    )}
                  />
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onglets du projet */}
      <ProjectTabs projectId={params.id} />
    </div>
  )
}
