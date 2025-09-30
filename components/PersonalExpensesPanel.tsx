"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PlusCircle, Wallet } from "lucide-react"
import { PersonalExpenseForm } from "@/components/PersonalExpenseForm"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type ExpenseRow = {
  id: string
  description: string
  amount: number
  category: string | null
  date: string
}

function monthBounds(d: Date) {
  const start = new Date(d.getFullYear(), d.getMonth(), 1)
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  const fmt = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
  return { start: fmt(start), end: fmt(end) }
}

export function PersonalExpensesPanel({ monthlyBudget = 500 }: { monthlyBudget?: number }) {
  const supabase = createClient()
  const [{ start, end }] = useState(() => monthBounds(new Date()))
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<ExpenseRow[]>([])
  const [confirmDeletePref, setConfirmDeletePref] = useState<boolean>(true)

  const monthlySpent = useMemo(() => rows.reduce((s, e) => s + Number(e.amount || 0), 0), [rows])
  const monthlyRemaining = Math.max(monthlyBudget - monthlySpent, 0)

  const load = async () => {
    setLoading(true)
    try {
      const { data: auth } = await supabase.auth.getUser()
      const userId = auth?.user?.id
      if (!userId) return
      const { data, error } = await supabase
        .from('expenses')
        .select('id, description, amount, category, date')
        .eq('user_id', userId)
        .is('project_id', null)
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: false })
      if (error) throw error
      setRows((data as ExpenseRow[]) || [])
    } finally {
      setLoading(false)
    }
  }

  const deleteExpense = async (id: string) => {
    const prev = rows
    setRows((curr) => curr.filter((r) => r.id !== id))
    try {
      const { data: auth } = await supabase.auth.getUser()
      const userId = auth?.user?.id
      if (!userId) throw new Error('Non connecté')
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .is('project_id', null)
        .eq('user_id', userId)
      if (error) throw error
      toast({ title: 'Dépense supprimée' })
    } catch (err: any) {
      console.error(err)
      toast({ title: 'Erreur', description: `Suppression impossible: ${err?.message || err}`, variant: 'destructive' })
      // revert
      setRows(prev)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, end])

  // Load preference from localStorage and keep in sync across tabs
  useEffect(() => {
    try {
      const raw = localStorage.getItem('expense_confirm_delete')
      if (raw != null) setConfirmDeletePref(raw === 'true')
    } catch {}
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'expense_confirm_delete' && e.newValue != null) {
        setConfirmDeletePref(e.newValue === 'true')
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wallet className="h-5 w-5" />
          <span>Budget personnel (mois courant)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Budget mensuel</div>
            <div className="text-2xl font-bold">{monthlyBudget.toLocaleString('fr-FR')}€</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Dépensé ce mois</div>
            <div className="text-2xl font-bold text-violet-400">{monthlySpent.toLocaleString('fr-FR')}€</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Restant</div>
            <div className="text-2xl font-bold">{monthlyRemaining.toLocaleString('fr-FR')}€</div>
          </div>
        </div>

        <Progress value={Math.min((monthlySpent / monthlyBudget) * 100, 100)} className={cn("h-2", monthlySpent > monthlyBudget && "[&>div]:bg-red-500")} />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium flex items-center space-x-2">
              <PlusCircle className="h-4 w-4" />
              <span>Ajouter une dépense</span>
            </h3>
          </div>
          {/* Use a typed handler to avoid implicit any */}
          <PersonalExpenseForm onAdded={(e: ExpenseRow) => setRows((prev) => [e, ...prev])} />
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Dépenses du mois</h3>
          {rows && rows.length > 0 ? (
            <div className="divide-y divide-border/50 rounded-md border border-border/40">
              {rows.map((e) => (
                <div key={e.id} className="flex items-center justify-between p-3">
                  <div className="space-y-0.5">
                    <div className="font-medium">{e.description}</div>
                    <div className="text-xs text-muted-foreground">{e.category || 'Non catégorisé'} • {new Date(e.date).toLocaleDateString('fr-FR')}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="font-semibold">{Number(e.amount).toLocaleString('fr-FR')}€</div>
                    {confirmDeletePref ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            aria-label="Supprimer la dépense"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer cette dépense ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. La dépense « {e.description} » sera supprimée définitivement.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteExpense(e.id)}>Confirmer</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <Button
                        variant="destructive"
                        size="sm"
                        aria-label="Supprimer la dépense"
                        onClick={() => deleteExpense(e.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">{loading ? 'Chargement...' : 'Aucune dépense enregistrée ce mois-ci.'}</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default PersonalExpensesPanel
