import { normalizeEmail } from './utils';

describe('normalizeEmail', () => {
  it('lowercases an email address', () => {
    expect(normalizeEmail('Jane@Example.com')).toBe('jane@example.com');
  });

  it('strips surrounding whitespace', () => {
    expect(normalizeEmail('  jane@example.com ')).toBe('jane@example.com');
  });

  it('leaves a phone number unchanged', () => {
    expect(normalizeEmail('+2348012345678')).toBe('+2348012345678');
  });
});
