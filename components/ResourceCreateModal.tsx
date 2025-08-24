"use client"

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Plus } from 'lucide-react'

export default function ResourceCreateModal({ projectId, onCreated }: { projectId: string, onCreated?: () => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<'lien'|'fichier'|'note'|'contact'>('note')
  const [content, setContent] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  const onSubmit = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      toast({ title: 'Nom requis', description: 'Veuillez saisir un nom.', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.from('resources').insert({
        project_id: projectId,
        name: trimmed,
        type,
        content: content.trim() || null,
        url: url.trim() || null,
      })
      if (error) throw error
      toast({ title: 'Ressource ajoutée' })
      setOpen(false)
      setName(''); setContent(''); setUrl('')
      onCreated?.()
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.message || 'Impossible d\'ajouter la ressource', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button className="button-glow" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> Ajouter une ressource
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => !loading && setOpen(false)} />
          <div className="relative z-10 w-[95vw] max-w-md rounded-xl border bg-background p-6 shadow-2xl">
            <div className="text-lg font-semibold mb-4">Nouvelle ressource</div>
            <div className="space-y-3">
              <div>
                <label className="text-sm mb-1 block">Nom</label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Cahier des charges" disabled={loading} />
              </div>
              <div>
                <label className="text-sm mb-1 block">Type</label>
                <Select value={type} onValueChange={(v: any) => setType(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lien">Lien</SelectItem>
                    <SelectItem value="fichier">Fichier</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                    <SelectItem value="contact">Contact</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm mb-1 block">Contenu</label>
                <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Texte libre" disabled={loading} />
              </div>
              <div>
                <label className="text-sm mb-1 block">URL</label>
                <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." disabled={loading} />
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
