/// <reference types="Cypress" />

import {
  newDepartment,
  existingDepartment,
  existingEmployee,
} from './../fixtures'

context('DEPARTMENT API', () => {
  const version = Cypress.env('version')

  const cleanup = () => {
    cy.request('POST', `${version}/users/login`, {
      email: Cypress.env('admin_username'),
      password: Cypress.env('admin_password'),
    }).then(response => {
      const newToken = response.body.token

      cy.request({
        url: `${version}/departments/${newDepartment.DepartmentId}`,
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

    it('should create a new department', () => {
      cy.request({
        url: `${version}/departments`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'POST',
        body: newDepartment,
      }).then(response => {
        cy.wrap(response).its('status').should('equal', 201)
        cy.wrap(response)
          .its('body.DepartmentId')
          .should('equal', newDepartment.DepartmentId)
      })
    })

    it('should fetch the new department', () => {
      cy.request({
        url: `${version}/departments/${newDepartment.DepartmentId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'GET',
      }).then(response => {
        cy.wrap(response).its('status').should('equal', 200)
        cy.wrap(response)
          .its('body.DepartmentId')
          .should('equal', newDepartment.DepartmentId)
      })
    })

    it('should fetch an existing department with employees', () => {
      cy.request({
        url: `${version}/departments/${existingDepartment.DepartmentId}?children=employees`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'GET',
      }).then(response => {
        cy.wrap(response).its('body').should('have.property', 'employees')
        cy.wrap(response)
          .its('body')
          .its('DepartmentId')
          .should('equal', existingDepartment.DepartmentId)
        cy.wrap(response)
          .its('body')
          .its('DepartmentName')
          .should('equal', existingDepartment.DepartmentName)
        cy.wrap(response)
          .its('body.employees.0')
          .its('DepartmentId')
          .should('equal', existingDepartment.DepartmentId)
        cy.wrap(response)
          .its('body.employees.0')
          .its('EmployeeId')
          .should('equal', existingEmployee.EmployeeId)
        cy.wrap(response)
          .its('body.employees.0')
          .its('Email')
          .should('equal', existingEmployee.Email)
      })
    })

    it('should update the new department', () => {
      const newDepartmentName = 'New Department'
      cy.request({
        url: `${version}/departments/${newDepartment.DepartmentId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'PATCH',
        body: {
          DepartmentName: newDepartmentName,
        },
      }).then(response => {
        cy.wrap(response).its('status').should('equal', 200)
        cy.wrap(response)
          .its('body.DepartmentName')
          .should('equal', newDepartmentName)
      })
    })

    it('should delete the new department', () => {
      cy.request({
        url: `${version}/departments/${newDepartment.DepartmentId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'DELETE',
      }).then(response => {
        cy.wrap(response).its('status').should('equal', 200)
        cy.wrap(response)
          .its('body.DepartmentId')
          .should('equal', newDepartment.DepartmentId)
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
    it('should create a new department', () => {
      cy.request({
        url: `${version}/departments`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'POST',
        body: newDepartment,
      }).then(response => {
        cy.wrap(response).its('status').should('equal', 201)
        cy.wrap(response)
          .its('body.DepartmentId')
          .should('equal', newDepartment.DepartmentId)
      })
    })

    it('should fetch the new department', () => {
      cy.request({
        url: `${version}/departments/${newDepartment.DepartmentId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'GET',
      }).then(response => {
        cy.wrap(response).its('status').should('equal', 200)
        cy.wrap(response)
          .its('body.DepartmentId')
          .should('equal', newDepartment.DepartmentId)
      })
    })

    it('should update the new department', () => {
      const newDepartmentName = 'New Department'
      cy.request({
        url: `${version}/departments/${newDepartment.DepartmentId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'PATCH',
        body: {
          DepartmentName: newDepartmentName,
        },
      }).then(response => {
        cy.wrap(response).its('status').should('equal', 200)
        cy.wrap(response)
          .its('body.DepartmentName')
          .should('equal', newDepartmentName)
      })
    })

    it('should not be able to delete the new department', () => {
      cy.request({
        url: `${version}/departments/${newDepartment.DepartmentId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'DELETE',
        failOnStatusCode: false,
      })
        .its('status')
        .should('equal', 401)
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
    it('should not be able to create a new department', () => {
      cy.request({
        url: `${version}/departments`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'POST',
        body: newDepartment,
        failOnStatusCode: false,
      })
        .its('status')
        .should('equal', 401)
    })

    it('should fetch an existing department', () => {
      cy.request({
        url: `${version}/departments/${existingDepartment.DepartmentId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'GET',
      }).then(response => {
        cy.wrap(response).its('status').should('equal', 200)
        cy.wrap(response)
          .its('body.DepartmentId')
          .should('equal', existingDepartment.DepartmentId)
      })
    })

    it('should not be able to update an existing department', () => {
      const newDepartmentName = 'New Department'
      cy.request({
        url: `${version}/departments/${newDepartment.DepartmentId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'PATCH',
        body: {
          DepartmentName: newDepartmentName,
        },
        failOnStatusCode: false,
      })
        .its('status')
        .should('equal', 401)
    })

    it('should not be able to delete an existing department', () => {
      cy.request({
        url: `${version}/departments/${existingDepartment.DepartmentId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'DELETE',
        failOnStatusCode: false,
      })
        .its('status')
        .should('equal', 401)
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
