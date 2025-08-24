'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  MoreHorizontal, 
  FolderOpen, 
  CheckSquare, 
  Clock, 
  DollarSign,
  Calendar,
  Briefcase,
  User,
  Trash2
} from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { formatDate } from '@/lib/dates'
import { cn } from '@/lib/utils'
import type { Project } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ProjectCardProps {
  project: Project & {
    tasks?: { count: number }[]
    time_entries?: { minutes: number }[]
    expenses?: { amount: number }[]
  }
}

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

export function ProjectCard({ project }: ProjectCardProps) {
  const TypeIcon = typeIcons[project.type]
  const router = useRouter()
  const { toast } = useToast()
  const [pending, setPending] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const supabase = createClient()
  
  // Calculer les statistiques
  const taskCount = project.tasks?.[0]?.count || 0
  const totalMinutes = project.time_entries?.reduce((sum, entry) => sum + entry.minutes, 0) || 0
  const totalHours = Math.round(totalMinutes / 60 * 10) / 10
  const totalExpenses = project.expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0
  
  const budgetProgress = project.budget_total > 0 
    ? Math.min((project.budget_spent / project.budget_total) * 100, 100)
    : 0

  const markCompleted = async () => {
    if (project.status === 'terminé') return
    try {
      setPending(true)
      const { error } = await supabase
        .from('projects')
        .update({ status: 'terminé' })
        .eq('id', project.id)
      if (error) throw error
      toast({ title: 'Projet marqué comme terminé' })
      router.refresh()
    } catch (e: any) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' })
    } finally {
      setPending(false)
    }
  }

  const deleteProject = async () => {
    try {
      setPending(true)
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id)
      if (error) throw error
      toast({ title: 'Projet supprimé' })
      setDeleteOpen(false)
      router.refresh()
    } catch (e: any) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' })
    } finally {
      setPending(false)
    }
  }

  return (
    <Card className="card-glow hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: project.color }}
            />
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg truncate">{project.name}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <TypeIcon className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground capitalize">
                  {project.type}
                </span>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", statusColors[project.status])}
                >
                  {statusLabels[project.status]}
                </Badge>
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6" disabled={pending}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/projects/${project.id}`}>
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Ouvrir
                </Link>
              </DropdownMenuItem>
              {project.status !== 'terminé' && (
                <DropdownMenuItem onClick={markCompleted}>
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Marquer terminé
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
            {project.description}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground mb-1">
              <CheckSquare className="h-3 w-3" />
              <span>Tâches</span>
            </div>
            <div className="font-semibold">{taskCount}</div>
          </div>
          
          <div>
            <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground mb-1">
              <Clock className="h-3 w-3" />
              <span>Temps</span>
            </div>
            <div className="font-semibold">{totalHours}h</div>
          </div>
          
          <div>
            <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground mb-1">
              <DollarSign className="h-3 w-3" />
              <span>Dépensé</span>
            </div>
            <div className="font-semibold">{totalExpenses.toLocaleString('fr-FR')}€</div>
          </div>
        </div>

        {/* Budget */}
        {project.budget_total > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Budget</span>
              <span>
                {project.budget_spent.toLocaleString('fr-FR')}€ / {project.budget_total.toLocaleString('fr-FR')}€
              </span>
            </div>
            <Progress 
              value={budgetProgress} 
              className={cn(
                "h-2",
                budgetProgress > 90 && "bg-red-100",
                budgetProgress > 75 && budgetProgress <= 90 && "bg-orange-100"
              )}
            />
          </div>
        )}

        {/* Date de création */}
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>Créé le {formatDate(project.created_at, 'dd/MM/yyyy')}</span>
        </div>

        {/* Action */}
        <Link href={`/projects/${project.id}`} className="block">
          <Button variant="outline" className="w-full" disabled={pending}>
            <FolderOpen className="mr-2 h-4 w-4" />
            Ouvrir le projet
          </Button>
        </Link>
      </CardContent>
      {/* Modal de confirmation suppression */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le projet ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Les temps, dépenses, ressources et journaux liés seront supprimés.
              Les tâches seront détachées du projet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={deleteProject} disabled={pending}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

