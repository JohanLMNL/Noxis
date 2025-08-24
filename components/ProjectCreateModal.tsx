"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Plus } from 'lucide-react'

export default function ProjectCreateModal() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'personnel' | 'professionnel'>('personnel')
  const [color, setColor] = useState('#7c3aed')
  const [budget, setBudget] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const reset = () => {
    setName('')
    setDescription('')
    setType('personnel')
    setColor('#7c3aed')
    setBudget('')
  }

  const onSubmit = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      toast({ title: 'Nom requis', description: 'Veuillez saisir un nom de projet.', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const budget_total = budget ? Number(budget) : undefined
      if (budget && isNaN(Number(budget))) {
        throw new Error('Le budget doit être un nombre valide')
      }

      const { error } = await supabase
        .from('projects')
        .insert({
          name: trimmed,
          description: description.trim() || null,
          type,
          color,
          ...(budget_total !== undefined ? { budget_total } : {}),
        })

      if (error) throw error

      toast({ title: 'Projet créé', description: `"${trimmed}" a été ajouté.` })
      setOpen(false)
      reset()
      router.refresh()
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.message || 'Impossible de créer le projet', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="button-glow">
        <Plus className="mr-2 h-4 w-4" />
        Nouveau projet
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => !loading && setOpen(false)} />
          <div className="relative z-10 w-[95vw] max-w-lg rounded-xl border bg-background p-6 shadow-2xl">
            <div className="text-xl font-semibold mb-4">Nouveau projet</div>

            <div className="space-y-4">
              <div>
                <label className="text-sm mb-1 block">Nom</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Refonte site" disabled={loading} />
              </div>

              <div>
                <label className="text-sm mb-1 block">Description</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Objectifs, contexte..." disabled={loading} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm mb-1 block">Type</label>
                  <Select value={type} onValueChange={(v: any) => setType(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personnel">Personnel</SelectItem>
                      <SelectItem value="professionnel">Professionnel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm mb-1 block">Couleur</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-9 w-12 rounded-md border bg-transparent p-1"
                      disabled={loading}
                    />
                    <Input value={color} onChange={(e) => setColor(e.target.value)} disabled={loading} />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm mb-1 block">Budget total (€)</label>
                <Input inputMode="decimal" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Ex: 1000" disabled={loading} />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Annuler</Button>
              <Button onClick={onSubmit} disabled={loading} className="button-glow">Créer</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
