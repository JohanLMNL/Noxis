import { AuthForm } from '@/components/AuthForm'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SignInPage() {
  const supabase = createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/today')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-violet bg-clip-text text-transparent">
            JMNL Productivity
          </h1>
          <p className="text-muted-foreground mt-2">
            Connectez-vous à votre espace personnel
          </p>
        </div>
        
        <div className="card-glow p-6">
          <AuthForm />
        </div>
      </div>
    </div>
  )
}
