import { formSchema } from './login.schema';

const validInput = {
  emailOrPhone: 'jane@example.com',
  password: 'Password123!',
  deviceId: 'device-123',
  deviceName: 'iPhone',
};

describe('login.schema', () => {
  it('accepts a valid login payload with an email', () => {
    const result = formSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('accepts a valid login payload with a phone number', () => {
    const result = formSchema.safeParse({ ...validInput, emailOrPhone: '+2348012345678' });
    expect(result.success).toBe(true);
  });

  it('rejects an empty emailOrPhone', () => {
    const result = formSchema.safeParse({ ...validInput, emailOrPhone: '' });
    expect(result.success).toBe(false);
  });

  it('rejects an uppercase email address', () => {
    const result = formSchema.safeParse({ ...validInput, emailOrPhone: 'Jane@Example.com' });
    expect(result.success).toBe(false);
  });

  it('does not lowercase-check values that are not emails', () => {
    // A phone number containing no "@" should never trigger the lowercase-email rule.
    const result = formSchema.safeParse({ ...validInput, emailOrPhone: '+2348012345678' });
    expect(result.success).toBe(true);
  });

  it('rejects an empty password', () => {
    const result = formSchema.safeParse({ ...validInput, password: '' });
    expect(result.success).toBe(false);
  });
});
