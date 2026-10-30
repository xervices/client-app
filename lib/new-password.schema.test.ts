import { formSchema } from './new-password.schema';

const validInput = {
  code: '123456',
  newPassword: 'Password123!',
  confirmPassword: 'Password123!',
};

describe('new-password.schema', () => {
  it('accepts a valid reset payload', () => {
    const result = formSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('rejects an empty OTP code', () => {
    const result = formSchema.safeParse({ ...validInput, code: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a new password containing spaces', () => {
    const result = formSchema.safeParse({
      ...validInput,
      newPassword: 'Pass word123',
      confirmPassword: 'Pass word123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a new password containing emojis', () => {
    const result = formSchema.safeParse({
      ...validInput,
      newPassword: 'Password123😀',
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
});
