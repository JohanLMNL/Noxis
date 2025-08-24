"use client"

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Plus } from 'lucide-react'

export default function ExpenseCreateModal({ projectId, onCreated }: { projectId: string, onCreated?: () => void }) {
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10))
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  const onSubmit = async () => {
    const a = Number(amount)
    if (!a || a <= 0) {
      toast({ title: 'Montant invalide', description: 'Veuillez saisir un montant > 0.', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.from('expenses').insert({
        project_id: projectId,
        description: description.trim(),
        amount: a,
        category: category.trim() || null,
        date,
      })
      if (error) throw error
      toast({ title: 'Dépense ajoutée' })
      setOpen(false)
      setDescription(''); setAmount(''); setCategory('')
      onCreated?.()
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.message || 'Impossible d\'ajouter la dépense', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button className="button-glow" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> Ajouter une dépense
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => !loading && setOpen(false)} />
          <div className="relative z-10 w-[95vw] max-w-md rounded-xl border bg-background p-6 shadow-2xl">
            <div className="text-lg font-semibold mb-4">Nouvelle dépense</div>
            <div className="space-y-3">
              <div>
                <label className="text-sm mb-1 block">Description</label>
                <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: Hébergement" disabled={loading} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm mb-1 block">Montant (€)</label>
                  <Input inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Ex: 25" disabled={loading} />
                </div>
                <div>
                  <label className="text-sm mb-1 block">Catégorie</label>
                  <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="Optionnel" disabled={loading} />
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
