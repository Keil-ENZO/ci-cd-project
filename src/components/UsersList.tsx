import { useEffect, useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { getUsers, getUsersDetails, deleteUser, type PublicUser, type PrivateUser } from '../lib/api'
import { toast } from 'sonner'

interface UsersListProps {
  token: string | null
  refreshKey: number
  onChange?: () => void
}


export const UsersList = ({ token, refreshKey, onChange }: UsersListProps) => {
  const [users, setUsers] = useState<(PublicUser | PrivateUser)[]>([])
  const [error, setError] = useState(false)
  const isAdmin = Boolean(token)

  const fetchUsers = useCallback(async () => {
    try {
      const data = token ? await getUsersDetails(token) : await getUsers()
      setUsers(Array.isArray(data) ? data : [])
      setError(false)
    } catch {
      setError(true)
    }
  }, [token])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers, refreshKey])

  const handleDelete = async (id: number) => {
    if (!token) return
    try {
      await deleteUser(id, token)
      toast.success('Utilisateur supprimé')
      onChange?.()
      fetchUsers()
    } catch {
      toast.error('Suppression impossible')
    }
  }

  return (
    <div className="w-full p-6 border border-border bg-card rounded-xl">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-bold m-0">
          Utilisateurs inscrits {isAdmin && <span className="text-sm font-normal text-muted-foreground">(vue admin)</span>}
        </h2>
        {!error && users.length > 0 && (
          <span className="shrink-0 rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
            {users.length}
          </span>
        )}
      </div>

      {error && (
        <p data-testid="users-error" className="text-sm text-red-500">
          Impossible de charger la liste des utilisateurs.
        </p>
      )}

      {!error && users.length === 0 && (
        <p className="text-sm text-muted-foreground">Aucun utilisateur inscrit pour le moment.</p>
      )}

      <ul data-testid="users-list" className="divide-y divide-border">
        {users.map((user) => (
          <li key={user.id} data-testid="user-item" className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
            <div className="text-sm">
              <span className="font-medium">{user.prenom} {user.nom}</span>
              <span className="text-muted-foreground"> — {user.ville}</span>
              {isAdmin && 'mail' in user && (
                <div className="text-xs text-muted-foreground mt-1">
                  {(user as PrivateUser).mail} · né(e) le {(user as PrivateUser).birth} · {(user as PrivateUser).cp}
                </div>
              )}
            </div>
            {isAdmin && (
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDelete(user.id)}
                data-testid={`delete-user-${user.id}`}
              >
                Supprimer
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
