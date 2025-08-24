'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Plus, Calendar as CalendarIcon, Tag, Repeat } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { parseFrenchRecurrence } from '@/lib/rrule/parseFr'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'

const priorityOptions = [
  { value: 'basse', label: 'Basse', color: 'bg-gray-500' },
  { value: 'normale', label: 'Normale', color: 'bg-blue-500' },
  { value: 'haute', label: 'Haute', color: 'bg-orange-500' },
  { value: 'urgente', label: 'Urgente', color: 'bg-red-500' },
]

interface TaskQuickAddProps {
  projectId?: string
  onCreated?: () => void
}

export function TaskQuickAdd({ projectId, onCreated }: TaskQuickAddProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<string>('normale')
  const [dueDate, setDueDate] = useState<Date>()
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrenceText, setRecurrenceText] = useState('')
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    
    try {
      let rrule = null
      if (isRecurring && recurrenceText.trim()) {
        rrule = parseFrenchRecurrence(recurrenceText.trim(), dueDate || new Date())
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Non authentifié",
          description: "Veuillez vous connecter pour créer une tâche.",
          variant: 'destructive',
        })
        return
      }
      
      const { error } = await supabase
        .from('tasks')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          priority,
          // Si aucune date choisie, laisser null pour apparaître dans "Sans échéance"
          due_at: dueDate?.toISOString() || null,
          tags,
          is_recurring: isRecurring,
          rrule,
          // Ne pas envoyer user_id: la colonne a DEFAULT auth.uid() et RLS exige que user_id = auth.uid()
          ...(projectId ? { project_id: projectId } : {}),
        })

      if (error) throw error

      // Reset form
      setTitle('')
      setDescription('')
      setPriority('normale')
      setDueDate(undefined)
      setTags([])
      setIsRecurring(false)
      setRecurrenceText('')
      setExpanded(false)
      
      onCreated?.()
      router.refresh()
      toast({
        title: 'Tâche créée',
        description: 'Votre tâche a été ajoutée.',
      })
    } catch (error: any) {
      console.error('Erreur lors de la création de la tâche:', error?.message || error)
      toast({
        title: "Erreur",
        description: error?.message || 'Impossible de créer la tâche.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex space-x-2">
        <Input
          placeholder="Nouvelle tâche..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1"
          required
        />
        <Button 
          type="button" 
          variant="outline" 
          size="icon"
          onClick={() => setExpanded(!expanded)}
        >
          <Plus className={cn("h-4 w-4 transition-transform", expanded && "rotate-45")} />
        </Button>
        <Button type="submit" disabled={loading || !title.trim()} className="button-glow">
          Ajouter
        </Button>
      </div>

      {expanded && (
        <div className="space-y-4 pt-4 border-t">
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Description de la tâche..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priorité</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center space-x-2">
                        <div className={cn("w-2 h-2 rounded-full", option.color)} />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date d'échéance</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP", { locale: fr }) : "Choisir une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
            <div className="flex space-x-2 mb-2">
              <Input
                id="tags"
                placeholder="Ajouter un tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                <Tag className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="recurring"
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
              />
              <Label htmlFor="recurring" className="flex items-center space-x-2">
                <Repeat className="h-4 w-4" />
                <span>Tâche récurrente</span>
              </Label>
            </div>
            
            {isRecurring && (
              <Input
                placeholder="Ex: tous les lundis, chaque mois, quotidien..."
                value={recurrenceText}
                onChange={(e) => setRecurrenceText(e.target.value)}
              />
            )}
          </div>
        </div>
      )}
    </form>
  )
}
