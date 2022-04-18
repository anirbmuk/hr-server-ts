/// <reference types="Cypress" />

context('USER API', () => {
  const version = Cypress.env('version')
  describe('Test new and existing users', () => {
    let token: string

    after(() => {
      cy.request('DELETE', `${version}/users/${Cypress.env('test_username')}`)
    })
    it('should successfully create a new user', () => {
      cy.request('POST', `${version}/users`, {
        email: Cypress.env('test_username'),
        password: Cypress.env('test_password'),
        role: Cypress.env('test_role'),
      }).then(response => {
        expect(response.status).to.equal(201)
        expect(response.body).to.have.property('items')

        const item = response.body.items?.[0] || {}
        expect(item).to.have.property('email', Cypress.env('test_username'))
        expect(item).to.have.property('role', Cypress.env('test_role'))
        expect(item).to.have.property('locale', 'en-US')

        cy.log('Successfully created a new user')
      })
    })

    it('should successfully login and logout an existing user', () => {
      cy.request('POST', `${version}/users/login`, {
        email: Cypress.env('employee_username'),
        password: Cypress.env('employee_password'),
      }).then(response => {
        expect(response.status).to.equal(200)
        expect(response.body).to.have.property('auth', true)
        expect(response.body).to.have.property('user')
        expect(response.body).to.have.property('token')
        cy.log('Successfully logged in')

        token = response.body.token

        cy.request({
          url: `${version}/users/logout`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          method: 'POST',
        }).then(response => {
          expect(response.status).to.equal(200)
          cy.log('Successfully logged out')
        })
      })
    })
  })
})
