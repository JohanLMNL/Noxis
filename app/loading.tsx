import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400 mx-auto" />
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    </div>
  )
}
