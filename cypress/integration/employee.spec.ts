/// <reference types="Cypress" />

import { newEmployee, existingEmployee, existingDirect } from './../fixtures';

context('EMPLOYEE API', () => {
  const version = Cypress.env('version');

  const cleanup = () => {
    cy.request('POST', `${version}/users/login`, {
      email: Cypress.env('admin_username'),
      password: Cypress.env('admin_password'),
    }).then(response => {
      const newToken = response.body.token;

      cy.request({
        url: `${version}/employees/${newEmployee.EmployeeId}`,
        headers: {
          Authorization: `Bearer ${newToken}`,
        },
        method: 'DELETE',
      });

      cy.request({
        url: `${version}/users/logout`,
        headers: {
          Authorization: `Bearer ${newToken}`,
        },
        method: 'POST',
      });
    });
  };

  describe('Tests for HR_ADMIN role', () => {
    let token: string;

    before(() => {
      cy.request('POST', `${version}/users/login`, {
        email: Cypress.env('admin_username'),
        password: Cypress.env('admin_password'),
      }).then(response => {
        // eslint-disable-next-line prefer-destructuring
        token = response.body.token;
      });
    });
    it('should create a new employee', () => {
      cy.request({
        url: `${version}/employees`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'POST',
        body: newEmployee,
      }).then(response => {
        cy.wrap(response).its('status').should('equal', 201);
        cy.wrap(response)
          .its('body.EmployeeId')
          .should('equal', newEmployee.EmployeeId);
      });
    });

    it('should fetch the new employee', () => {
      cy.request({
        url: `${version}/employees/${newEmployee.EmployeeId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'GET',
      }).then(response => {
        cy.wrap(response).its('status').should('equal', 200);
        cy.wrap(response)
          .its('body.EmployeeId')
          .should('equal', newEmployee.EmployeeId);
      });
    });

    it('should fetch an existing employee with directs', () => {
      cy.request({
        url: `${version}/employees/${existingEmployee.EmployeeId}?children=directs`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'GET',
      }).then(response => {
        cy.wrap(response).its('body').should('have.property', 'directs');
        cy.wrap(response)
          .its('body')
          .its('EmployeeId')
          .should('equal', existingEmployee.EmployeeId);
        cy.wrap(response)
          .its('body')
          .its('Email')
          .should('equal', existingEmployee.Email);
        cy.wrap(response)
          .its('body.directs.0')
          .its('ManagerId')
          .should('equal', existingEmployee.EmployeeId);
        cy.wrap(response)
          .its('body.directs.0')
          .its('EmployeeId')
          .should('equal', existingDirect.EmployeeId);
        cy.wrap(response)
          .its('body.directs.0')
          .its('Email')
          .should('equal', existingDirect.Email);
      });
    });

    it('should update the new employee', () => {
      const newFirstName = 'New FirstName';
      const newLastName = 'New LastName';
      cy.request({
        url: `${version}/employees/${newEmployee.EmployeeId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'PATCH',
        body: {
          FirstName: newFirstName,
          LastName: newLastName,
        },
      }).then(response => {
        cy.wrap(response).its('status').should('equal', 200);
        cy.wrap(response).its('body.FirstName').should('equal', newFirstName);
        cy.wrap(response).its('body.LastName').should('equal', newLastName);
      });
    });

    it('should delete the new employee', () => {
      cy.request({
        url: `${version}/employees/${newEmployee.EmployeeId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'DELETE',
      }).then(response => {
        cy.wrap(response).its('status').should('equal', 200);
        cy.wrap(response)
          .its('body.EmployeeId')
          .should('equal', newEmployee.EmployeeId);
      });
    });

    after(() => {
      cy.request({
        url: `${version}/users/logout`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'POST',
      });
    });
  });

  describe('Tests for HR_MANAGER role', () => {
    let token: string;

    before(() => {
      cy.request('POST', `${version}/users/login`, {
        email: Cypress.env('manager_username'),
        password: Cypress.env('manager_password'),
      }).then(response => {
        // eslint-disable-next-line prefer-destructuring
        token = response.body.token;
      });
    });
    it('should create a new employee', () => {
      cy.request({
        url: `${version}/employees`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'POST',
        body: newEmployee,
      }).then(response => {
        cy.wrap(response).its('status').should('equal', 201);
        cy.wrap(response)
          .its('body.EmployeeId')
          .should('equal', newEmployee.EmployeeId);
      });
    });

    it('should fetch the new employee', () => {
      cy.request({
        url: `${version}/employees/${newEmployee.EmployeeId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'GET',
      }).then(response => {
        cy.wrap(response).its('status').should('equal', 200);
        cy.wrap(response)
          .its('body.EmployeeId')
          .should('equal', newEmployee.EmployeeId);
      });
    });

    it('should update the new employee', () => {
      const newFirstName = 'New FirstName';
      const newLastName = 'New LastName';
      cy.request({
        url: `${version}/employees/${newEmployee.EmployeeId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'PATCH',
        body: {
          FirstName: newFirstName,
          LastName: newLastName,
        },
      }).then(response => {
        cy.wrap(response).its('status').should('equal', 200);
        cy.wrap(response).its('body.FirstName').should('equal', newFirstName);
        cy.wrap(response).its('body.LastName').should('equal', newLastName);
      });
    });

    it('should not be able to delete the new employee', () => {
      cy.request({
        url: `${version}/employees/${newEmployee.EmployeeId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'DELETE',
        failOnStatusCode: false,
      })
        .its('status')
        .should('equal', 401);
    });

    after(() => {
      cy.request({
        url: `${version}/users/logout`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'POST',
      });

      cleanup();
    });
  });

  describe('Tests for HR_EMPLOYEE role', () => {
    let token: string;

    before(() => {
      cy.request('POST', `${version}/users/login`, {
        email: Cypress.env('employee_username'),
        password: Cypress.env('employee_password'),
      }).then(response => {
        // eslint-disable-next-line prefer-destructuring
        token = response.body.token;
      });
    });
    it('should not be able to create a new employee', () => {
      cy.request({
        url: `${version}/employees`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'POST',
        body: newEmployee,
        failOnStatusCode: false,
      })
        .its('status')
        .should('equal', 401);
    });

    it('should fetch an existing employee', () => {
      cy.request({
        url: `${version}/employees/${existingEmployee.EmployeeId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'GET',
      }).then(response => {
        cy.wrap(response).its('status').should('equal', 200);
        cy.wrap(response)
          .its('body.EmployeeId')
          .should('equal', existingEmployee.EmployeeId);
      });
    });

    it('should not be able to update an existing employee', () => {
      const newFirstName = 'New FirstName';
      const newLastName = 'New LastName';
      cy.request({
        url: `${version}/employees/${newEmployee.EmployeeId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'PATCH',
        body: {
          FirstName: newFirstName,
          LastName: newLastName,
        },
        failOnStatusCode: false,
      })
        .its('status')
        .should('equal', 401);
    });

    it('should not be able to delete an existing employee', () => {
      cy.request({
        url: `${version}/employees/${existingEmployee.EmployeeId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'DELETE',
        failOnStatusCode: false,
      })
        .its('status')
        .should('equal', 401);
    });

    after(() => {
      cy.request({
        url: `${version}/users/logout`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'POST',
      });
    });
  });
});
