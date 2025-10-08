'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  MoreHorizontal, 
  Play, 
  Pause, 
  Trash2, 
  Repeat,
  AlertTriangle 
} from 'lucide-react'
import { formatRelativeDate, isOverdue } from '@/lib/dates'
import { rruleToFrench } from '@/lib/rrule/parseFr'
import { cn } from '@/lib/utils'
import type { Task } from '@/lib/types'

interface TaskCardProps {
  task: Task
  showProject?: boolean
  onStatusChange: (taskId: string, status: Task['status']) => void
  onDelete: (taskId: string) => void
  isUpdating?: boolean
}

const priorityColors = {
  basse: 'bg-gray-500',
  normale: 'bg-blue-500',
  haute: 'bg-orange-500',
  urgente: 'bg-red-500'
}

const statusIcons = {
  'à_faire': Circle,
  'en_cours': Play,
  'terminé': CheckCircle2,
  'annulé': Pause
}

export function TaskCard({ 
  task, 
  showProject = false, 
  onStatusChange, 
  onDelete, 
  isUpdating = false 
}: TaskCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  
  const StatusIcon = statusIcons[task.status]
  const effectiveDue = task.is_recurring && task.next_due_date ? task.next_due_date : task.due_at
  const isTaskOverdue = effectiveDue && isOverdue(effectiveDue) && task.status !== 'terminé'

  const handleStatusClick = () => {
    if (task.status === 'à_faire') {
      onStatusChange(task.id, 'en_cours')
    } else if (task.status === 'en_cours') {
      onStatusChange(task.id, 'terminé')
    } else if (task.status === 'terminé') {
      onStatusChange(task.id, 'à_faire')
    }
  }

  return (
    <Card className={cn(
      "card-glow transition-all duration-200 hover:shadow-lg",
      task.status === 'terminé' && "opacity-60",
      isTaskOverdue && "border-red-500/30",
      task.status === 'en_cours' && "border-violet-500/30"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-6 w-6 rounded-full flex-shrink-0 mt-1",
              task.status === 'terminé' && "text-green-500",
              task.status === 'en_cours' && "text-violet-500"
            )}
            onClick={handleStatusClick}
            disabled={isUpdating}
          >
            <StatusIcon className="h-4 w-4" />
          </Button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className={cn(
                  "font-medium text-sm",
                  task.status === 'terminé' && "line-through text-muted-foreground"
                )}>
                  {task.title}
                </h3>
                
                {task.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {task.description}
                  </p>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onStatusChange(task.id, 'à_faire')}>
                    <Circle className="mr-2 h-4 w-4" />
                    À faire
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(task.id, 'en_cours')}>
                    <Play className="mr-2 h-4 w-4" />
                    En cours
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(task.id, 'terminé')}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Terminé
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(task.id, 'annulé')}>
                    <Pause className="mr-2 h-4 w-4" />
                    Annulé
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(task.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center flex-wrap gap-2 mt-2">
              {/* Priorité */}
              <div className="flex items-center space-x-1">
                <div className={cn("w-2 h-2 rounded-full", priorityColors[task.priority])} />
                <span className="text-xs text-muted-foreground capitalize">
                  {task.priority}
                </span>
              </div>

              {/* Date d'échéance (next_due_date pour récurrentes) */}
              {effectiveDue && (
                <div className={cn(
                  "flex items-center space-x-1 text-xs",
                  isTaskOverdue ? "text-red-400" : "text-muted-foreground"
                )}>
                  {isTaskOverdue && <AlertTriangle className="h-3 w-3" />}
                  <Clock className="h-3 w-3" />
                  <span>{formatRelativeDate(effectiveDue)}</span>
                </div>
              )}

              {/* Projet */}
              {showProject && task.project && (
                <Badge 
                  variant="outline" 
                  className="text-xs"
                  style={{ borderColor: task.project.color }}
                >
                  {task.project.name}
                </Badge>
              )}

              {/* Récurrence */}
              {task.is_recurring && task.rrule && (
                <Badge variant="outline" className="text-xs flex items-center space-x-1">
                  <Repeat className="h-3 w-3" />
                  <span>{rruleToFrench(task.rrule)}</span>
                </Badge>
              )}

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {task.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {task.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{task.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
