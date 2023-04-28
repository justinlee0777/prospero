const { defaults } = require('jest-config');

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts'],
};
