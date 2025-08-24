import { createClient } from '@/lib/supabase/server'
import { ProjectCard } from '@/components/ProjectCard'
import { Button } from '@/components/ui/button'
import ProjectCreateModal from '@/components/ProjectCreateModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, FolderOpen, DollarSign, Clock } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProjectsPage() {
  const supabase = createClient()
  const { data: auth } = await supabase.auth.getUser()
  const userId = auth?.user?.id

  if (!userId) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Projets</h1>
        <p className="text-muted-foreground">Vous devez être connecté pour voir et créer des projets.</p>
      </div>
    )
  }

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  // Calculer les statistiques
  const totalProjects = projects?.length || 0
  const activeProjects = projects?.filter(p => p.status === 'actif').length || 0
  const totalBudget = projects?.reduce((sum, p) => sum + (p.budget_total || 0), 0) || 0
  const totalSpent = projects?.reduce((sum, p) => sum + (p.budget_spent || 0), 0) || 0

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projets</h1>
          <p className="text-muted-foreground">
            Gérez vos projets personnels et professionnels
          </p>
        </div>
        <ProjectCreateModal />
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total projets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
          </CardContent>
        </Card>
        
        <Card className="card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Projets actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-400">{activeProjects}</div>
          </CardContent>
        </Card>
        
        <Card className="card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Budget total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBudget.toLocaleString('fr-FR')}€</div>
          </CardContent>
        </Card>
        
        <Card className="card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Dépensé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">{totalSpent.toLocaleString('fr-FR')}€</div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des projets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects && projects.length > 0 ? (
          projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        ) : (
          <Card className="card-glow col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun projet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Commencez par créer votre premier projet pour organiser vos tâches.
              </p>
              <ProjectCreateModal />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
