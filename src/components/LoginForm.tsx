import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { login as loginRequest } from '../lib/api'
import { toast } from 'sonner'

interface LoginFormProps {
  isAuthenticated: boolean
  adminMail?: string
  onLogin: (token: string, mail: string) => void
  onLogout: () => void
}

export const LoginForm = ({ isAuthenticated, adminMail, onLogin, onLogout }: LoginFormProps) => {
  const [mail, setMail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const { token, mail: loggedMail } = await loginRequest(mail, password)
      onLogin(token, loggedMail)
      toast.success('Connexion réussie', { description: `Bienvenue ${loggedMail}` })
      setMail('')
      setPassword('')
    } catch {
      toast.error('Échec de la connexion', { description: 'Identifiants invalides.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isAuthenticated) {
    return (
      <div
        data-testid="admin-banner"
        className="w-full p-4 border border-border bg-card flex items-center justify-between gap-4 rounded-xl"
      >
        <span className="text-sm">
          Connecté en tant qu'admin : <strong>{adminMail}</strong>
        </span>
        <Button type="button" variant="outline" onClick={onLogout} data-testid="logout-button">
          Se déconnecter
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full p-6 border border-border bg-card rounded-xl">
      <form onSubmit={handleSubmit} data-testid="login-form" className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold m-0">Espace administrateur</h2>
          <p className="text-sm text-muted-foreground m-0 mt-1">
            Connectez-vous pour gérer les inscrits.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="admin-mail" className="text-sm">Email administrateur</label>
          <Input
            id="admin-mail"
            type="email"
            placeholder="loise.fenoll@ynov.com"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="admin-password" className="text-sm">Mot de passe</label>
          <Input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={isSubmitting} data-testid="login-button">
          {isSubmitting ? 'Connexion...' : 'Se connecter'}
        </Button>
      </form>
    </div>
  )
}
