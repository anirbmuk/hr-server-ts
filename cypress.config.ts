import { defineConfig } from 'cypress';

export default defineConfig({
  viewportWidth: 1024,
  viewportHeight: 800,
  video: false,
  screenshotOnRunFailure: false,
  defaultCommandTimeout: 5000,
  env: {
    version: '/api/v1',
  },
  e2e: {
    supportFile: false,
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require('./cypress/plugins/index.ts').default(on, config);
    },
    baseUrl: 'http://localhost:3000',
    specPattern:
      'cypress/e2e/*.cy.ts',
  },
});
