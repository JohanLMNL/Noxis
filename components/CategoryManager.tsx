"use client"

import { useEffect, useState, useTransition } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Trash2, Plus } from "lucide-react"

interface Category {
  id: string
  name: string
}

export function CategoryManager() {
  const supabase = createClient()
  const [categories, setCategories] = useState<Category[]>([])
  const [newName, setNewName] = useState("")
  const [loading, setLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  const load = async () => {
    const { data: auth } = await supabase.auth.getUser()
    const userId = auth?.user?.id
    if (!userId) return
    const { data, error } = await supabase
      .from('expense_categories')
      .select('id, name')
      .eq('user_id', userId)
      .order('name')
    if (!error && data) setCategories(data as Category[])
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setLoading(true)
    try {
      const { data: auth } = await supabase.auth.getUser()
      const userId = auth?.user?.id
      if (!userId) {
        toast({ title: "Non connecté", description: "Veuillez vous connecter.", variant: "destructive" })
        return
      }
      const payload = { name: newName.trim() }
      // Do not send user_id and rely on DEFAULT auth.uid() on the table
      const { error } = await supabase
        .from('expense_categories')
        .insert(payload)
      if (!error) {
        toast({ title: "Catégorie ajoutée" })
        setNewName("")
        startTransition(load)
        return
      }
      if (error.code === '23505') {
        toast({ title: "Déjà existante", description: "Cette catégorie existe déjà.", variant: "destructive" })
      } else {
        throw error
      }
    } catch (err: any) {
      console.error(err)
      toast({ title: "Erreur", description: `Impossible d'ajouter la catégorie (${err?.code || 'inconnue'}): ${err?.message || err}`, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const deleteCategory = async (id: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('expense_categories')
        .delete()
        .eq('id', id)
      if (error) throw error
      toast({ title: "Catégorie supprimée" })
      startTransition(load)
    } catch (err) {
      console.error(err)
      toast({ title: "Erreur", description: "Suppression impossible (catégorie utilisée ?)", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={addCategory} className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="newCat">Nouvelle catégorie</Label>
          <Input id="newCat" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex: Alimentaire" />
        </div>
        <div className="self-end">
          <Button type="submit" disabled={loading}>
            <Plus className="h-4 w-4 mr-2" /> Ajouter
          </Button>
        </div>
      </form>

      <div className="rounded-md border border-border/40 divide-y divide-border/50">
        {categories.length === 0 && (
          <div className="p-3 text-sm text-muted-foreground">Aucune catégorie pour le moment.</div>
        )}
        {categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-3">
            <div className="font-medium">{c.name}</div>
            <Button variant="outline" size="sm" onClick={() => deleteCategory(c.id)} disabled={loading}>
              <Trash2 className="h-4 w-4 mr-2" /> Supprimer
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CategoryManager
