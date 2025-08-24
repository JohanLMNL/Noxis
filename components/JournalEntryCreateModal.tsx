"use client"

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Plus } from 'lucide-react'

export default function JournalEntryCreateModal({ projectId, onCreated }: { projectId: string, onCreated?: () => void }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10))
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  const onSubmit = async () => {
    if (!content.trim()) {
      toast({ title: 'Contenu requis', description: 'Veuillez saisir du contenu.', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.from('journal_entries').insert({
        project_id: projectId,
        title: title.trim() || null,
        content: content.trim(),
        date,
      })
      if (error) throw error
      toast({ title: 'Entrée ajoutée' })
      setOpen(false)
      setTitle(''); setContent('')
      onCreated?.()
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.message || 'Impossible d\'ajouter l\'entrée', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button className="button-glow" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> Nouvelle entrée
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => !loading && setOpen(false)} />
          <div className="relative z-10 w-[95vw] max-w-md rounded-xl border bg-background p-6 shadow-2xl">
            <div className="text-lg font-semibold mb-4">Nouvelle entrée de journal</div>
            <div className="space-y-3">
              <div>
                <label className="text-sm mb-1 block">Titre</label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Optionnel" disabled={loading} />
              </div>
              <div>
                <label className="text-sm mb-1 block">Contenu</label>
                <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Votre note..." disabled={loading} />
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
