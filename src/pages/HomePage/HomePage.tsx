import { useState } from 'react'
import {
  Field,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { checkAge } from '../../utils/age'
import { checkMail } from '../../utils/mail'
import { checkName, checkCP } from '../../utils/form'
import { toast } from 'sonner'
import { addUser, type UserFormData } from '../../lib/api'

interface HomePageProps {
  onUserAdded?: () => void
}

/**
 * HomePage component.
 * Displays the main registration form with validation and toast notifications.
 * Calls the backend API to register a new user.
 * @returns {JSX.Element} The rendered HomePage component.
 */
export const HomePage = ({ onUserAdded }: HomePageProps) => {
  const [formData, setFormData] = useState<UserFormData>({
    nom: '',
    prenom: '',
    mail: '',
    birth: '',
    ville: '',
    cp: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const isFormValid =
    checkName(formData.prenom) &&
    checkName(formData.nom) &&
    checkMail(formData.mail) &&
    checkAge(formData.birth) &&
    checkName(formData.ville) &&
    checkCP(formData.cp);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isFormValid) {
      setIsSubmitting(true)
      try {
        await addUser(formData)
        toast.success('Inscription réussie !', {
          description: `Bienvenue ${formData.prenom} ${formData.nom} 🎉`,
        })
        onUserAdded?.()
        setFormData({ nom: '', prenom: '', mail: '', birth: '', ville: '', cp: '' })
      } catch {
        toast.error('Erreur serveur', {
          description: 'Impossible d\'enregistrer votre inscription. Veuillez réessayer.',
        })
      } finally {
        setIsSubmitting(false)
      }
    } else {
      if (!checkName(formData.prenom)) toast.error('Prénom invalide', { description: 'Min 2 lettres, sans chiffres ni caractères spéciaux.' })
      if (!checkName(formData.nom)) toast.error('Nom invalide', { description: 'Min 2 lettres, sans chiffres ni caractères spéciaux.' })
      if (!checkMail(formData.mail)) toast.error('Email invalide', { description: 'Veuillez saisir une adresse email valide.' })
      if (!checkAge(formData.birth)) toast.error('Âge invalide', { description: 'Vous devez avoir au moins 18 ans pour vous inscrire.' })
      if (!checkName(formData.ville)) toast.error('Ville invalide', { description: 'Min 2 lettres, sans chiffres ni caractères spéciaux.' })
      if (!checkCP(formData.cp)) toast.error('Code postal invalide', { description: 'Le code postal doit contenir exactement 5 chiffres.' })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  return (
    <section className="w-full p-8 border border-border bg-card rounded-xl shadow-lg">
      <header className="mb-8">
        <h2 className="text-3xl font-bold leading-tight m-0">Bienvenue</h2>
        <p className="text-muted-foreground m-0 mt-2">
          Inscrivez-vous dès maintenant pour accéder à votre espace.
        </p>
        <a
          href="./docs/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          Documentation technique
        </a>
      </header>

      <form onSubmit={handleSubmit} data-testid="registration-form">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">
          Informations personnelles
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field>
            <FieldLabel htmlFor="prenom">Prénom</FieldLabel>
            <Input id="prenom" placeholder="Jean" value={formData.prenom} onChange={handleChange} required />
            {formData.prenom && !checkName(formData.prenom) && <span data-testid="error-prenom" className="text-xs text-red-500">Prénom invalide (min 2 lettres)</span>}
          </Field>

          <Field>
            <FieldLabel htmlFor="nom">Nom</FieldLabel>
            <Input id="nom" placeholder="Dupont" value={formData.nom} onChange={handleChange} required />
            {formData.nom && !checkName(formData.nom) && <span data-testid="error-nom" className="text-xs text-red-500">Nom invalide (min 2 lettres)</span>}
          </Field>

          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="mail">Email</FieldLabel>
            <Input id="mail" type="email" placeholder="jean.dupont@example.com" value={formData.mail} onChange={handleChange} required />
            {formData.mail && (checkMail(formData.mail) ? <span className="text-xs text-green-500">Email valide</span> : <span data-testid="error-mail" className="text-xs text-red-500">Email non valide</span>)}
          </Field>

          <Field>
            <FieldLabel htmlFor="birth">Date de naissance</FieldLabel>
            <Input id="birth" type="date" value={formData.birth} onChange={handleChange} required />
            {formData.birth && (checkAge(formData.birth) ? <span className="text-xs text-green-500">Majeur</span> : <span data-testid="error-age" className="text-xs text-red-500">Mineur (Inscription bloquée)</span>)}
          </Field>

          <Field>
            <FieldLabel htmlFor="ville">Ville</FieldLabel>
            <Input id="ville" placeholder="Paris" value={formData.ville} onChange={handleChange} required />
            {formData.ville && !checkName(formData.ville) && <span data-testid="error-ville" className="text-xs text-red-500">Ville invalide</span>}
          </Field>

          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="cp">Code Postal</FieldLabel>
            <Input id="cp" placeholder="75000" value={formData.cp} onChange={handleChange} required />
            {formData.cp && (checkCP(formData.cp) ? <span className="text-xs text-green-500">Format valide</span> : <span data-testid="error-cp" className="text-xs text-red-500">Format invalide (5 chiffres)</span>)}
          </Field>
        </div>

        <Button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="w-full mt-8 py-6 text-base font-semibold rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          {isSubmitting ? 'Inscription en cours...' : "Valider l'inscription"}
        </Button>
      </form>
    </section>
  )
}
