import { formSchema } from './forgot-password.schema';

describe('forgot-password.schema', () => {
  it('accepts a non-empty email or phone value', () => {
    const result = formSchema.safeParse({ emailOrPhone: 'jane@example.com' });
    expect(result.success).toBe(true);
  });

  it('accepts a phone number value', () => {
    const result = formSchema.safeParse({ emailOrPhone: '08012345678' });
    expect(result.success).toBe(true);
  });

  it('rejects an empty value', () => {
    const result = formSchema.safeParse({ emailOrPhone: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a missing field', () => {
    const result = formSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
