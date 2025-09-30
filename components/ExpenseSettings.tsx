"use client"

import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

const LS_KEY_CONFIRM_DELETE = "expense_confirm_delete"

export function ExpenseSettings() {
  const [confirmDelete, setConfirmDelete] = useState<boolean>(true)

  useEffect(() => {
    // Load preference from localStorage
    try {
      const raw = localStorage.getItem(LS_KEY_CONFIRM_DELETE)
      if (raw != null) setConfirmDelete(raw === "true")
    } catch {}

    // Keep in sync across tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_KEY_CONFIRM_DELETE && e.newValue != null) {
        setConfirmDelete(e.newValue === "true")
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const toggle = (checked: boolean) => {
    setConfirmDelete(checked)
    try {
      localStorage.setItem(LS_KEY_CONFIRM_DELETE, String(checked))
    } catch {}
  }

  return (
    <div className="flex items-center justify-between py-1">
      <div className="space-y-1">
        <Label htmlFor="confirm-delete">Confirmer avant suppression</Label>
        <p className="text-xs text-muted-foreground">Affiche une boîte de dialogue avant de supprimer une dépense.</p>
      </div>
      <Switch id="confirm-delete" checked={confirmDelete} onCheckedChange={toggle} />
    </div>
  )
}

export default ExpenseSettings
