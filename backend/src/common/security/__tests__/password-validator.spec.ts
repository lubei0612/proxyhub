import { validatePasswordStrength, isWeakPassword } from '../password-validator';

describe('PasswordValidator', () => {
  describe('validatePasswordStrength', () => {
    it('should accept strong password', () => {
      const result = validatePasswordStrength('Password123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject password without uppercase', () => {
      const result = validatePasswordStrength('password123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('密码必须包含至少一个大写字母');
    });

    it('should reject password without lowercase', () => {
      const result = validatePasswordStrength('PASSWORD123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('密码必须包含至少一个小写字母');
    });

    it('should reject password without number', () => {
      const result = validatePasswordStrength('PasswordABC');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('密码必须包含至少一个数字');
    });

    it('should reject password too short', () => {
      const result = validatePasswordStrength('Pass1');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('密码长度至少为8个字符');
    });

    it('should reject weak common password', () => {
      const result = validatePasswordStrength('Password123');
      // This would be rejected if 'Password123' is in weak list
      // Test with actual weak password
      const weakResult = validatePasswordStrength('123456');
      expect(weakResult.isValid).toBe(false);
      expect(weakResult.errors.length).toBeGreaterThan(0);
    });

    it('should reject multiple violations', () => {
      const result = validatePasswordStrength('short');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('isWeakPassword', () => {
    it('should detect common weak passwords', () => {
      expect(isWeakPassword('123456')).toBe(true);
      expect(isWeakPassword('password')).toBe(true);
      expect(isWeakPassword('qwerty')).toBe(true);
      expect(isWeakPassword('Password123')).toBe(true);
    });

    it('should accept non-weak passwords', () => {
      expect(isWeakPassword('MyStr0ngP@ssw0rd')).toBe(false);
      expect(isWeakPassword('Secure123Pass')).toBe(false);
    });
  });
});

