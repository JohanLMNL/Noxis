'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Project {
  id: string
  name: string
  color: string
}

interface FiltersBarProps {
  projects: Project[]
  tags: string[]
  currentFilters: {
    status?: string
    priority?: string
    project?: string
    tag?: string
  }
}

const statusOptions = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'à_faire', label: 'À faire' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'terminé', label: 'Terminé' },
  { value: 'annulé', label: 'Annulé' },
]

const priorityOptions = [
  { value: 'all', label: 'Toutes les priorités' },
  { value: 'basse', label: 'Basse', color: 'bg-gray-500' },
  { value: 'normale', label: 'Normale', color: 'bg-blue-500' },
  { value: 'haute', label: 'Haute', color: 'bg-orange-500' },
  { value: 'urgente', label: 'Urgente', color: 'bg-red-500' },
]

export function FiltersBar({ projects, tags, currentFilters }: FiltersBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value === 'all' || value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    
    router.push(`/tasks?${params.toString()}`)
  }

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(key)
    router.push(`/tasks?${params.toString()}`)
  }

  const clearAllFilters = () => {
    router.push('/tasks')
  }

  const hasActiveFilters = Object.values(currentFilters).some(value => value && value !== 'all')

  return (
    <div className="space-y-4">
      {/* Contrôles de filtres */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Statut</label>
          <Select 
            value={currentFilters.status || 'all'} 
            onValueChange={(value) => updateFilter('status', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Priorité</label>
          <Select 
            value={currentFilters.priority || 'all'} 
            onValueChange={(value) => updateFilter('priority', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center space-x-2">
                    {option.color && (
                      <div className={cn("w-2 h-2 rounded-full", option.color)} />
                    )}
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Projet</label>
          <Select 
            value={currentFilters.project || 'all'} 
            onValueChange={(value) => updateFilter('project', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les projets</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: project.color }}
                    />
                    <span>{project.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Tag</label>
          <Select 
            value={currentFilters.tag || 'all'} 
            onValueChange={(value) => updateFilter('tag', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les tags</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filtres actifs */}
      {hasActiveFilters && (
        <div className="flex items-center space-x-2 flex-wrap">
          <span className="text-sm font-medium">Filtres actifs:</span>
          
          {currentFilters.status && currentFilters.status !== 'all' && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Statut: {statusOptions.find(s => s.value === currentFilters.status)?.label}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0"
                onClick={() => removeFilter('status')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {currentFilters.priority && currentFilters.priority !== 'all' && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Priorité: {priorityOptions.find(p => p.value === currentFilters.priority)?.label}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0"
                onClick={() => removeFilter('priority')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {currentFilters.project && currentFilters.project !== 'all' && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Projet: {projects.find(p => p.id === currentFilters.project)?.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0"
                onClick={() => removeFilter('project')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {currentFilters.tag && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Tag: {currentFilters.tag}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0"
                onClick={() => removeFilter('tag')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          <Button variant="outline" size="sm" onClick={clearAllFilters}>
            Effacer tous les filtres
          </Button>
        </div>
      )}
    </div>
  )
}
