import { formSchema } from './register.schema';

const validInput = {
  fullName: 'Jane Doe',
  phoneNumber: '+2348012345678',
  email: 'jane@example.com',
  password: 'Password123!',
  confirmPassword: 'Password123!',
  role: 'user' as const,
  referralCode: '',
  deviceId: 'device-123',
  deviceName: 'iPhone',
};

describe('register.schema', () => {
  it('accepts a fully valid registration payload', () => {
    const result = formSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('rejects an empty fullName', () => {
    const result = formSchema.safeParse({ ...validInput, fullName: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a fullName containing emojis', () => {
    const result = formSchema.safeParse({ ...validInput, fullName: 'Jane 😀' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid email address', () => {
    const result = formSchema.safeParse({ ...validInput, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects an uppercase email address', () => {
    const result = formSchema.safeParse({ ...validInput, email: 'Jane@Example.com' });
    expect(result.success).toBe(false);
  });

  it('rejects a password containing spaces', () => {
    const result = formSchema.safeParse({
      ...validInput,
      password: 'Pass word123',
      confirmPassword: 'Pass word123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a password containing emojis', () => {
    const result = formSchema.safeParse({
      ...validInput,
      password: 'Password123😀',
      confirmPassword: 'Password123😀',
    });
    expect(result.success).toBe(false);
  });

  it('rejects mismatched password confirmation', () => {
    const result = formSchema.safeParse({ ...validInput, confirmPassword: 'Different123!' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['confirmPassword']);
    }
  });

  it('rejects a role other than "user"', () => {
    const result = formSchema.safeParse({ ...validInput, role: 'artisan' });
    expect(result.success).toBe(false);
  });
});
