"use client"

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Plus } from 'lucide-react'

export default function TimeEntryCreateModal({ projectId, onCreated }: { projectId: string, onCreated?: () => void }) {
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [minutes, setMinutes] = useState('')
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10))
  const [hourlyRate, setHourlyRate] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  const onSubmit = async () => {
    const m = Number(minutes)
    if (!m || m <= 0) {
      toast({ title: 'Minutes invalides', description: 'Veuillez saisir un nombre de minutes > 0.', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.from('time_entries').insert({
        project_id: projectId,
        description: description.trim() || null,
        minutes: m,
        hourly_rate: hourlyRate ? Number(hourlyRate) : null,
        date,
      })
      if (error) throw error
      toast({ title: 'Temps ajouté' })
      setOpen(false)
      setDescription(''); setMinutes(''); setHourlyRate('')
      onCreated?.()
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.message || 'Impossible d\'ajouter le temps', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button className="button-glow" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> Ajouter du temps
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => !loading && setOpen(false)} />
          <div className="relative z-10 w-[95vw] max-w-md rounded-xl border bg-background p-6 shadow-2xl">
            <div className="text-lg font-semibold mb-4">Ajouter du temps</div>
            <div className="space-y-3">
              <div>
                <label className="text-sm mb-1 block">Description</label>
                <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: Dév front" disabled={loading} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm mb-1 block">Minutes</label>
                  <Input inputMode="numeric" value={minutes} onChange={e => setMinutes(e.target.value)} placeholder="Ex: 90" disabled={loading} />
                </div>
                <div>
                  <label className="text-sm mb-1 block">Taux horaire (€)</label>
                  <Input inputMode="decimal" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} placeholder="Optionnel" disabled={loading} />
                </div>
              </div>
              <div>
                <label className="text-sm mb-1 block">Date</label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} disabled={loading} />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Annuler</Button>
              <Button onClick={onSubmit} disabled={loading} className="button-glow">Ajouter</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
