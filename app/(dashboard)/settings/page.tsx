import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DeleteCompletedTasksButton } from "@/components/DeleteCompletedTasksButton"
import { CategoryManager } from "@/components/CategoryManager"
import { ExpenseSettings } from "@/components/ExpenseSettings"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground">Gérez quelques actions globales de votre espace.</p>
      </div>

      <Card className="card-glow">
        <CardHeader>
          <CardTitle>Nettoyage des tâches</CardTitle>
          <CardDescription>
            Supprimer toutes les tâches marquées comme terminées de la base de données.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteCompletedTasksButton />
        </CardContent>
      </Card>

      <Card className="card-glow">
        <CardHeader>
          <CardTitle>Catégories de dépenses</CardTitle>
          <CardDescription>
            Ajoutez, listez et supprimez les catégories utilisées pour vos dépenses personnelles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryManager />
        </CardContent>
      </Card>

      <Card className="card-glow">
        <CardHeader>
          <CardTitle>Préférences des dépenses</CardTitle>
          <CardDescription>
            Configurez la confirmation avant la suppression des dépenses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseSettings />
        </CardContent>
      </Card>
    </div>
  )
}
