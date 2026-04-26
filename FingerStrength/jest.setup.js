// Polyfills and global mocks for Jest
global.Buffer = require('buffer').Buffer;

// Mock AsyncStorage using the package-provided mock
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Silence native module warnings commonly emitted during tests
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
