// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jsdom has no Web Crypto; the offline API uses it to hash passwords and make codes.
const { webcrypto } = require('crypto');
Object.defineProperty(window, 'crypto', { value: webcrypto, configurable: true });
const { TextEncoder } = require('util');
global.TextEncoder = TextEncoder;
