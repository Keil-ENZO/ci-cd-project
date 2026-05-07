import { useState } from 'react'
import { Hero } from '../../components/Hero/Hero'
import { Counter } from '../../components/Counter/Counter'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { checkAge } from '../../utils/age'
import { checkMail } from '../../utils/mail'
import { checkName, checkCP } from '../../utils/form'

export const HomePage = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    mail: '',
    birth: '',
    ville: '',
    cp: '',
  })

  // Global validation state
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
      // Sauvegarde dans le localStorage
      localStorage.setItem('user_registration', JSON.stringify(formData))
      console.log("Données enregistrées dans localStorage :", formData)
      setIsOpen(true)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  return (
    <>
      <section id="center">
        <Hero />
        <div>
          <h1 className="text-4xl font-bold mb-4">Bienvenue</h1>
          <p className="text-muted-foreground">
            Inscrivez-vous dès maintenant pour accéder à votre espace.
          </p>
        </div>
        <Counter />
      </section>

      <div className="max-w-2xl mx-auto w-full mt-8 mb-12 p-8 border rounded-2xl bg-card shadow-lg">
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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-card border-accent/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <span className="text-green-500">✅</span> Inscription réussie
            </DialogTitle>
            <DialogDescription className="text-lg pt-2">
              L'utilisateur <strong className="text-foreground">{formData.prenom} {formData.nom}</strong> a été bien enregistré avec succès dans le localStorage.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => setIsOpen(false)} className="px-8">
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
