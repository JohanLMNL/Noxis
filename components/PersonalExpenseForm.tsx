"use client"

import { useEffect, useState, useTransition } from "react"
import { createClient } from "@/lib/supabase/client"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function PersonalExpenseForm({ onAdded }: { onAdded?: (row: { id: string; description: string; amount: number; category: string | null; date: string }) => void }) {
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10))
  const [loading, setLoading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  
  useEffect(() => {
    const loadCats = async () => {
      const { data: auth } = await supabase.auth.getUser()
      const userId = auth?.user?.id
      if (!userId) return
      const { data } = await supabase
        .from('expense_categories')
        .select('id, name')
        .eq('user_id', userId)
        .order('name')
      setCategories((data as any[]) || [])
    }
    loadCats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description || !amount) {
      toast({ title: "Champs requis", description: "Description et montant sont obligatoires.", variant: "destructive" })
      return
    }

    const value = parseFloat(amount)
    if (isNaN(value) || value <= 0) {
      toast({ title: "Montant invalide", description: "Entrez un montant positif.", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const { data: auth } = await supabase.auth.getUser()
      const userId = auth?.user?.id
      if (!userId) {
        toast({ title: "Non connecté", description: "Veuillez vous connecter.", variant: "destructive" })
        return
      }

      const { data: inserted, error } = await supabase
        .from("expenses")
        .insert({
          user_id: userId,
          project_id: null,
          description,
          amount: value,
          category: category || null,
          date,
        })
        .select('id, description, amount, category, date')

      if (error) throw error

      toast({ title: "Dépense ajoutée", description: `${value.toLocaleString('fr-FR')}€ - ${description}` })

      // notify parent (SWR-style)
      if (inserted && inserted.length > 0) {
        onAdded?.(inserted[0] as any)
      }

      // reset form
      setDescription("")
      setAmount("")
      setCategory("")
      setDate(new Date().toISOString().slice(0, 10))

      startTransition(() => {
        // Bump URL to ensure server component re-renders in all environments
        try {
          router.replace(`${pathname}?r=${Date.now()}`)
        } catch {}
        router.refresh()
      })
    } catch (err) {
      console.error(err)
      toast({ title: "Erreur", description: "Impossible d'ajouter la dépense.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-3">
      <div className="md:col-span-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Courses" required />
      </div>
      <div>
        <Label>Catégorie</Label>
        <Select value={category || 'none'} onValueChange={(v) => setCategory(v === 'none' ? '' : v)}>
          <SelectTrigger>
            <SelectValue placeholder="Choisir une catégorie (optionnel)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Aucune</SelectItem>
            {(() => {
              const defaults = [
                { id: 'default-alimentaire', name: 'Alimentaire' },
                { id: 'default-loisir', name: 'Loisir' },
              ]
              const byName = new Set(defaults.map(d => d.name.toLowerCase()))
              const merged = [
                ...defaults,
                ...categories.filter(c => !byName.has(c.name.toLowerCase())),
              ]
              return merged.map(c => (
                <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
              ))
            })()}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="amount">Montant (€)</Label>
        <Input id="amount" type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required />
      </div>
      <div>
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>
      <div className="md:self-end">
        <Button type="submit" disabled={loading}>{loading ? "Ajout..." : "Ajouter"}</Button>
      </div>
    </form>
  )
}

export default PersonalExpenseForm
