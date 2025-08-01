// jest.setup.js
// Setup file for Jest tests

// Global test timeout
jest.setTimeout(30000);

// Suppress console.log during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn()
// };