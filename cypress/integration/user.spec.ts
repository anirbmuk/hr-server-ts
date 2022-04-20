/// <reference types="Cypress" />

context('USER API', () => {
  const version = Cypress.env('version')
  describe('Test new and existing users', () => {
    let token: string

    it('should create a new user', () => {
      cy.request('POST', `${version}/users`, {
        email: Cypress.env('test_username'),
        password: Cypress.env('test_password'),
        role: Cypress.env('test_role'),
      }).then(response => {
        cy.wrap(response).its('status').should('equal', 201)
        cy.wrap(response).its('body').should('have.property', 'items')
        cy.wrap(response)
          .its('body.items.0')
          .its('email')
          .should('equal', Cypress.env('test_username'))
        cy.wrap(response)
          .its('body.items.0')
          .its('role')
          .should('equal', Cypress.env('test_role'))
        cy.wrap(response)
          .its('body.items.0')
          .its('locale')
          .should('equal', 'en-US')

        cy.log('Successfully created a new user')
      })
    })

    it('should delete the new user', () => {
      cy.request('DELETE', `${version}/users/${Cypress.env('test_username')}`)
        .its('status')
        .should('equal', 200)
    })

    it('should login and logout an existing user', () => {
      cy.request('POST', `${version}/users/login`, {
        email: Cypress.env('employee_username'),
        password: Cypress.env('employee_password'),
      }).then(response => {
        cy.wrap(response).its('status').should('equal', 200)
        cy.wrap(response).its('body.auth').should('equal', true)
        cy.wrap(response).its('body').should('have.property', 'user')
        cy.wrap(response).its('body').should('have.property', 'token')
        cy.log('Successfully logged in')

        token = response.body.token

        cy.request({
          url: `${version}/users/logout`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          method: 'POST',
        })
          .its('status')
          .should('equal', 200)
      })
    })

    it('should not login using wrong username/password', () => {
      cy.request({
        method: 'POST',
        url: `${version}/users/login`,
        body: {
          email: 'unknown@unknown.com',
          password: 'password',
        },
        failOnStatusCode: false,
      })
        .its('status')
        .should('equal', 400)
    })

    it('should not login without username/password', () => {
      cy.request({
        method: 'POST',
        url: `${version}/users/login`,
        body: {
          email: null,
          password: '',
        },
        failOnStatusCode: false,
      })
        .its('status')
        .should('equal', 400)
    })
  })
})
