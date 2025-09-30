"use client"

import { useState, useTransition } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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
import { toast } from "@/components/ui/use-toast"
import { Trash2 } from "lucide-react"

export function DeleteCompletedTasksButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    setLoading(true)
    try {
      const { data: auth } = await supabase.auth.getUser()
      const userId = auth?.user?.id
      if (!userId) {
        toast({ title: "Non connecté", description: "Veuillez vous connecter.", variant: "destructive" })
        return
      }

      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("user_id", userId)
        .eq("status", "terminé")

      if (error) throw error

      toast({
        title: "Tâches terminées supprimées",
        description: "Toutes les tâches marquées comme terminées ont été effacées.",
      })

      // Refresh en arrière-plan
      startTransition(() => {
        router.refresh()
      })

      setOpen(false)
    } catch (e: any) {
      console.error(e)
      toast({ title: "Erreur", description: "La suppression a échoué.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Supprimer toutes les tâches terminées
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action supprimera définitivement toutes vos tâches au statut "terminé". Cette opération est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading}>
            {loading ? "Suppression..." : "Confirmer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteCompletedTasksButton
