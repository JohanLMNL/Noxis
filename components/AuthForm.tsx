'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Lock } from 'lucide-react'

export function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleResetPassword = async () => {
    setError('')
    setSuccess('')
    if (!email) {
      setError('Veuillez renseigner votre email pour réinitialiser le mot de passe.')
      return
    }
    try {
      setLoading(true)
      const redirectTo = `${window.location.origin}/auth/update-password`
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
      if (error) {
        setError(error.message)
      } else {
        setSuccess('Email de réinitialisation envoyé. Vérifiez votre boîte mail.')
      }
    } catch (err) {
      setError('Impossible d\'envoyer l\'email de réinitialisation')
    } finally {
      setLoading(false)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) {
          setError(error.message)
        } else {
          setSuccess('Compte créé avec succès ! Vous pouvez maintenant vous connecter.')
          setIsSignUp(false)
          setEmail('')
          setPassword('')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          setError(error.message)
        } else {
          router.push('/today')
          router.refresh()
        }
      }
    } catch (err) {
      setError('Une erreur inattendue s\'est produite')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleAuth} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
            disabled={loading}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10"
            required
            disabled={loading}
          />
        </div>
        {!isSignUp && (
          <div>
            <button
              type="button"
              onClick={handleResetPassword}
              className="text-xs text-muted-foreground hover:text-primary transition-colors underline"
              disabled={loading}
            >
              Mot de passe oublié ?
            </button>
          </div>
        )}
      </div>
      
      <Button
        type="submit"
        className="w-full button-glow"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isSignUp ? 'Création...' : 'Connexion...'}
          </>
        ) : (
          isSignUp ? 'Créer un compte' : 'Se connecter'
        )}
      </Button>
      
      <div className="text-center">
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp)
            setError('')
            setSuccess('')
          }}
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          {isSignUp 
            ? 'Déjà un compte ? Se connecter' 
            : 'Pas de compte ? Créer un compte'
          }
        </button>
      </div>
    </form>
  )
}
