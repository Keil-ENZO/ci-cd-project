import { useState } from 'react'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { checkAge } from '../../utils/age'
import { checkMail } from '../../utils/mail'
import { checkName, checkCP } from '../../utils/form'
import { toast, Toaster } from 'sonner'

/**
 * HomePage component.
 * Displays the main registration form with validation and toast notifications.
 * @returns {JSX.Element} The rendered HomePage component.
 */
export const HomePage = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    mail: '',
    birth: '',
    ville: '',
    cp: '',
  })

  const isFormValid =
    checkName(formData.prenom) &&
    checkName(formData.nom) &&
    checkMail(formData.mail) &&
    checkAge(formData.birth) &&
    checkName(formData.ville) &&
    checkCP(formData.cp);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isFormValid) {
      localStorage.setItem('user_registration', JSON.stringify(formData))
      toast.success('Inscription réussie !', {
        description: `Bienvenue ${formData.prenom} ${formData.nom} 🎉`,
      })
      setFormData({ nom: '', prenom: '', mail: '', birth: '', ville: '', cp: '' })
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
    <>
      <section id="center">
        <Toaster />
        <div>
          <h1 className="text-4xl font-bold ">Bienvenue</h1>
          <p className="text-muted-foreground">
            Inscrivez-vous dès maintenant pour accéder à votre espace.
          </p>
          <a
            href="./docs/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            Documentation technique
          </a>
        </div>
      </section>

      <div className="max-w-2xl mx-auto w-full mb-12 p-8 border bg-card shadow-lg">
        <form onSubmit={handleSubmit} data-testid="registration-form">
          <FieldSet>
            <FieldLegend className="text-2xl font-bold mb-6">Informations Personnelles</FieldLegend>
            <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <Field className="md:col-span-2">
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
              <Field>
                <FieldLabel htmlFor="cp">Code Postal</FieldLabel>
                <Input id="cp" placeholder="75000" value={formData.cp} onChange={handleChange} required />
                {formData.cp && (checkCP(formData.cp) ? <span className="text-xs text-green-500">Format valide</span> : <span data-testid="error-cp" className="text-xs text-red-500">Format invalide (5 chiffres)</span>)}
              </Field>
            </FieldGroup>
          </FieldSet>

          <Button type="submit" disabled={!isFormValid} className="w-full mt-8 py-6 text-lg font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
            Valider l'inscription
          </Button>
        </form>
      </div>
    </>
  )
}
