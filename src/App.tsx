import './App.css'
import { useState, useEffect } from 'react'
import { Toaster } from 'sonner'
import { HomePage } from './pages/HomePage/HomePage'
import { LoginForm } from './components/LoginForm'
import { UsersList } from './components/UsersList'
import { countUsers } from './lib/api'

function App() {
  const [usersCount, setUsersCount] = useState(0)
  const [loadError, setLoadError] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [adminMail, setAdminMail] = useState<string>('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    async function fetchCount() {
      try {
        const count = await countUsers()
        setUsersCount(count)
        setLoadError(false)
      } catch {
        setLoadError(true)
      }
    }
    fetchCount()
  }, [refreshKey])

  const handleUserAdded = () => {
    setUsersCount(prev => prev + 1)
    setRefreshKey(prev => prev + 1)
  }

  const handleLogin = (newToken: string, mail: string) => {
    setToken(newToken)
    setAdminMail(mail)
  }

  const handleLogout = () => {
    setToken(null)
    setAdminMail('')
  }

  const handleListChange = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
      <Toaster richColors position="top-right" />

      <header className="flex items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold leading-none m-0">Users manager</h1>
          <p className="text-sm text-muted-foreground m-0 mt-1.5">Gestion des inscriptions</p>
        </div>
        {loadError ? (
          <span data-testid="load-error" className="text-sm text-destructive">
            Impossible de charger le nombre d&apos;utilisateurs
          </span>
        ) : (
          <span className="shrink-0 rounded-full border border-border px-3 py-1 text-sm text-muted-foreground whitespace-nowrap">
            {usersCount} user(s) already registered
          </span>
        )}
      </header>

      {/* Visiteur : on propose l'inscription. Admin : inutile, on la masque. */}
      {!token && <HomePage onUserAdded={handleUserAdded} />}

      <LoginForm
        isAuthenticated={Boolean(token)}
        adminMail={adminMail}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {/* La liste des utilisateurs n'est visible qu'en mode administrateur. */}
      {token && <UsersList token={token} refreshKey={refreshKey} onChange={handleListChange} />}
    </div>
  )
}

export default App
