

const ADMIN_MAIL = Cypress.env('ADMIN_EMAIL')
const ADMIN_PASSWORD = Cypress.env('ADMIN_PASSWORD')

describe('E2E - Parcours complet sur la stack Docker', () => {
    const uniqueMail = `e2e_${Date.now()}@test.com`

    it('visiteur : voit le formulaire d\'inscription et la connexion admin, mais pas la liste', () => {
        cy.visit('/')
        cy.contains('user(s) already registered')
        cy.get('[data-testid="registration-form"]').should('be.visible')
        cy.get('[data-testid="login-form"]').should('be.visible')
        cy.get('[data-testid="users-list"]').should('not.exist')
    })

    it('inscrit un nouvel utilisateur en base', () => {
        cy.visit('/')

        cy.get('#prenom').type('Jean')
        cy.get('#nom').type('Dupont')
        cy.get('#mail').type(uniqueMail)
        cy.get('#birth').type('2000-01-15')
        cy.get('#ville').type('Paris')
        cy.get('#cp').type('75001')

        cy.get('[data-testid="registration-form"] button[type="submit"]')
            .should('not.be.disabled')
            .click()

        // Le visiteur reçoit la confirmation ; la présence dans la liste est vérifiée côté admin.
        cy.contains('Inscription réussie').should('be.visible')
    })

    it('bloque l\'inscription avec des données invalides', () => {
        cy.visit('/')

        cy.get('#prenom').type('J')
        cy.get('#mail').type('not-an-email')
        cy.get('#cp').type('123')

        cy.get('[data-testid="error-prenom"]').should('be.visible')
        cy.get('[data-testid="error-mail"]').should('be.visible')
        cy.get('[data-testid="error-cp"]').should('be.visible')
        cy.get('[data-testid="registration-form"] button[type="submit"]').should('be.disabled')
    })

    it('connecte l\'admin, affiche les infos privées puis supprime un inscrit', () => {
        cy.visit('/')

        cy.get('#admin-mail').type(ADMIN_MAIL)
        cy.get('#admin-password').type(ADMIN_PASSWORD, { log: false })
        cy.get('[data-testid="login-button"]').click()

        cy.get('[data-testid="admin-banner"]').should('be.visible')

        // En mode admin, le formulaire d'inscription est masqué et la liste apparaît.
        cy.get('[data-testid="registration-form"]').should('not.exist')
        cy.get('[data-testid="users-list"]').should('be.visible')
        cy.get('[data-testid="users-list"]').contains(uniqueMail)

        cy.get('[data-testid="users-list"]')
            .contains('[data-testid="user-item"]', 'Jean Dupont')
            .find('button')
            .click()

        cy.contains('Utilisateur supprimé').should('be.visible')
        cy.get('[data-testid="users-list"]').should('not.contain', uniqueMail)
    })
})

describe('E2E - Mode offline (réseau coupé)', () => {
    it('affiche une erreur si le chargement du compteur échoue', () => {
        // Coupe le réseau sur le chargement du compteur (GET /users).
        cy.intercept('GET', '**/users', { forceNetworkError: true }).as('usersOffline')
        cy.visit('/')

        cy.get('[data-testid="load-error"]').should('be.visible')
        cy.contains("Impossible de charger le nombre d'utilisateurs").should('be.visible')
    })

    it('affiche un toast d\'erreur serveur si l\'inscription échoue', () => {
        cy.visit('/') // chargement initial normal

        cy.get('#prenom').type('Jean')
        cy.get('#nom').type('Dupont')
        cy.get('#mail').type('offline@test.com')
        cy.get('#birth').type('2000-01-15')
        cy.get('#ville').type('Paris')
        cy.get('#cp').type('75001')

        // Coupe le réseau au moment de l'envoi (POST /users).
        cy.intercept('POST', '**/users', { forceNetworkError: true }).as('addOffline')
        cy.get('[data-testid="registration-form"] button[type="submit"]')
            .should('not.be.disabled')
            .click()

        cy.contains('Erreur serveur').should('be.visible')
    })

    it('affiche un échec de connexion si /login échoue', () => {
        cy.visit('/')

        cy.get('#admin-mail').type('admin@test.com')
        cy.get('#admin-password').type('whatever', { log: false })

        // Coupe le réseau sur la connexion (POST /login).
        cy.intercept('POST', '**/login', { forceNetworkError: true }).as('loginOffline')
        cy.get('[data-testid="login-button"]').click()

        cy.contains('Échec de la connexion').should('be.visible')
        cy.get('[data-testid="admin-banner"]').should('not.exist')
    })
})
