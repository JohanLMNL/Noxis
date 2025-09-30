import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { DollarSign, PieChart } from "lucide-react"
import { cn } from "@/lib/utils"
import { PersonalExpensesPanel } from "@/components/PersonalExpensesPanel"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function BudgetPage() {
  try {
    const supabase = createClient()
    const { data: auth } = await supabase.auth.getUser()
    const userId = auth?.user?.id

    if (!userId) {
      return (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Budget</h1>
          <p className="text-muted-foreground">Vous devez être connecté pour voir vos budgets.</p>
        </div>
      )
    }

    // Compute current month range
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const fmt = (d: Date) => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }
    const monthStartStr = fmt(monthStart)
    const monthEndStr = fmt(monthEnd)

    const { data: projects, error: projErr } = await supabase
      .from('projects')
      .select('id, name, color, budget_total, budget_spent, status')
      .eq('user_id', userId)
      .order('name')
    if (projErr) throw projErr

    const totalBudget = (projects || []).reduce((s, p) => s + Number(p.budget_total || 0), 0)
    const totalSpent = (projects || []).reduce((s, p) => s + Number(p.budget_spent || 0), 0)
    const remaining = Math.max(totalBudget - totalSpent, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Budget</h1>
          <p className="text-muted-foreground">Suivi des budgets par projet</p>
        </div>
      </div>

      {/* Personal monthly budget (client) */}
      <PersonalExpensesPanel monthlyBudget={500} />

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Budget total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBudget.toLocaleString('fr-FR')}€</div>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Dépensé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-400">{totalSpent.toLocaleString('fr-FR')}€</div>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Restant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{remaining.toLocaleString('fr-FR')}€</div>
          </CardContent>
        </Card>
      </div>

      {/* Projects list */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChart className="h-5 w-5" />
            <span>Budgets par projet</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {projects && projects.length > 0 ? (
            <div className="space-y-4">
              {projects.map((p) => {
                const total = p.budget_total || 0
                const spent = Math.min(p.budget_spent || 0, total > 0 ? total * 1.5 : p.budget_spent || 0)
                const progress = total > 0 ? Math.min((spent / total) * 100, 100) : 0
                const over = total > 0 && spent > total
                return (
                  <div key={p.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="font-medium">{p.name}</span>
                        <Badge
                          variant="outline"
                          className={cn("text-xs", over && "border-red-500 text-red-400")}
                        >
                          {total.toLocaleString('fr-FR')}€
                        </Badge>
                      </div>
                      <div className={cn("text-sm", over && "text-red-400")}>{(p.budget_spent || 0).toLocaleString('fr-FR')}€</div>
                    </div>
                    <Progress
                      value={progress}
                      className={cn(
                        "h-2",
                        over && "[&>div]:bg-red-500"
                      )}
                    />
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Aucun projet avec budget pour le moment
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
  } catch (err: any) {
    console.error('[BudgetPage] Error:', err)
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Budget</h1>
        <div className="card-glow border border-red-500/30 rounded-md p-6">
          <div className="text-red-400 font-medium mb-2">Une erreur s'est produite</div>
          <div className="text-sm text-muted-foreground break-all">
            {err?.message || String(err)}
          </div>
        </div>
      </div>
    )
  }
}
