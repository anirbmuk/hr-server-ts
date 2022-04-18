/// <reference types="Cypress" />

import { newLocation, existingLocation } from './../fixtures/location.fixture'

context('LOCATION API', () => {
  const version = Cypress.env('version')

  const cleanup = () => {
    cy.request('POST', `${version}/users/login`, {
      email: Cypress.env('admin_username'),
      password: Cypress.env('admin_password'),
    }).then(response => {
      const newToken = response.body.token

      cy.request({
        url: `${version}/locations/${newLocation.LocationId}`,
        headers: {
          Authorization: `Bearer ${newToken}`,
        },
        method: 'DELETE',
      })

      cy.request({
        url: `${version}/users/logout`,
        headers: {
          Authorization: `Bearer ${newToken}`,
        },
        method: 'POST',
      })
    })
  }

  describe('Tests for HR_ADMIN role', () => {
    let token: string

    before(() => {
      cy.request('POST', `${version}/users/login`, {
        email: Cypress.env('admin_username'),
        password: Cypress.env('admin_password'),
      }).then(response => {
        token = response.body.token
      })
    })
    it('should create a new location', () => {
      cy.request({
        url: `${version}/locations`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'POST',
        body: newLocation,
      }).then(response => {
        expect(response.status).to.equal(201)
        expect(response.body).have.property(
          'LocationId',
          newLocation.LocationId,
        )
      })
    })

    it('should fetch the new location', () => {
      cy.request({
        url: `${version}/locations/${newLocation.LocationId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'GET',
      }).then(response => {
        expect(response.status).to.equal(200)
        expect(response.body).have.property(
          'LocationId',
          newLocation.LocationId,
        )
      })
    })

    it('should update the new location', () => {
      const newStreetAddress = 'New StreetAddress'
      cy.request({
        url: `${version}/locations/${newLocation.LocationId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'PATCH',
        body: {
          StreetAddress: newStreetAddress,
        },
      }).then(response => {
        expect(response.status).to.equal(200)
        expect(response.body).have.property('StreetAddress', newStreetAddress)
      })
    })

    it('should delete the newly created location', () => {
      cy.request({
        url: `${version}/locations/${newLocation.LocationId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'DELETE',
      }).then(response => {
        expect(response.status).to.equal(200)
        expect(response.body).have.property(
          'LocationId',
          newLocation.LocationId,
        )
      })
    })

    after(() => {
      cy.request({
        url: `${version}/users/logout`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'POST',
      })
    })
  })

  describe('Tests for HR_MANAGER role', () => {
    let token: string

    before(() => {
      cy.request('POST', `${version}/users/login`, {
        email: Cypress.env('manager_username'),
        password: Cypress.env('manager_password'),
      }).then(response => {
        token = response.body.token
      })
    })
    it('should create a new location', () => {
      cy.request({
        url: `${version}/locations`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'POST',
        body: newLocation,
      }).then(response => {
        expect(response.status).to.equal(201)
        expect(response.body).have.property(
          'LocationId',
          newLocation.LocationId,
        )
      })
    })

    it('should fetch the new location', () => {
      cy.request({
        url: `${version}/locations/${newLocation.LocationId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'GET',
      }).then(response => {
        expect(response.status).to.equal(200)
        expect(response.body).have.property(
          'LocationId',
          newLocation.LocationId,
        )
      })
    })

    it('should update the new location', () => {
      const newStreetAddress = 'New StreetAddress'
      cy.request({
        url: `${version}/locations/${newLocation.LocationId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'PATCH',
        body: {
          StreetAddress: newStreetAddress,
        },
      }).then(response => {
        expect(response.status).to.equal(200)
        expect(response.body).have.property('StreetAddress', newStreetAddress)
      })
    })

    it('should not be able to delete the newly created location', () => {
      cy.request({
        url: `${version}/locations/${newLocation.LocationId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'DELETE',
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.equal(401)
      })
    })

    after(() => {
      cy.request({
        url: `${version}/users/logout`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'POST',
      })

      cleanup()
    })
  })

  describe('Tests for HR_EMPLOYEE role', () => {
    let token: string

    before(() => {
      cy.request('POST', `${version}/users/login`, {
        email: Cypress.env('employee_username'),
        password: Cypress.env('employee_password'),
      }).then(response => {
        token = response.body.token
      })
    })
    it('should not be able to create a new location', () => {
      cy.request({
        url: `${version}/locations`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'POST',
        body: newLocation,
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.equal(401)
      })
    })

    it('should fetch an existing location', () => {
      cy.request({
        url: `${version}/locations/${existingLocation.LocationId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'GET',
      }).then(response => {
        expect(response.status).to.equal(200)
        expect(response.body).have.property(
          'LocationId',
          existingLocation.LocationId,
        )
      })
    })

    it('should not be able to update an existing location', () => {
      const newStreetAddress = 'New StreetAddress'
      cy.request({
        url: `${version}/locations/${existingLocation.LocationId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'PATCH',
        body: {
          StreetAddress: newStreetAddress,
        },
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.equal(401)
      })
    })

    it('should not be able to delete an existing location', () => {
      cy.request({
        url: `${version}/locations/${existingLocation.LocationId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'DELETE',
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.equal(401)
      })
    })

    after(() => {
      cy.request({
        url: `${version}/users/logout`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'POST',
      })
    })
  })
})
