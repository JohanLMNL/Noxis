"use client"

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Plus } from 'lucide-react'

export default function ProjectCreateButton() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const onCreate = async () => {
    const name = window.prompt('Nom du projet ?')?.trim()
    if (!name) return

    try {
      const { error } = await supabase
        .from('projects')
        .insert({
          name,
          type: 'personnel',
          color: '#7c3aed',
        })
      if (error) throw error

      toast({ title: 'Projet créé', description: `"${name}" a été ajouté.` })
      router.refresh()
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.message || 'Impossible de créer le projet', variant: 'destructive' })
    }
  }

  return (
    <Button onClick={onCreate} className="button-glow">
      <Plus className="mr-2 h-4 w-4" />
      Nouveau projet
    </Button>
  )
}
