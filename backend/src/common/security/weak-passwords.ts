/**
 * Common weak passwords that should be rejected
 * This list includes the most commonly used passwords from various data breaches
 */
export const WEAK_PASSWORDS = new Set([
  // Most common passwords
  '123456',
  '12345678',
  '123456789',
  '1234567890',
  'password',
  'Password',
  'password123',
  'Password123',
  'qwerty',
  'qwerty123',
  'abc123',
  'Abc123',
  '111111',
  '000000',
  '123123',
  '654321',
  
  // Common patterns
  'admin',
  'Admin123',
  'administrator',
  'root',
  'Root123',
  'user',
  'User123',
  'guest',
  'Guest123',
  
  // Keyboard patterns
  'asdfgh',
  'asdfghjkl',
  'zxcvbn',
  'qwertyuiop',
  '1qaz2wsx',
  '1q2w3e4r',
  
  // Common names + numbers
  'charlie',
  'welcome',
  'Welcome1',
  'monkey',
  'dragon',
  'master',
  'sunshine',
  'princess',
  'football',
  'baseball',
  
  // Service-specific weak patterns
  'test',
  'Test123',
  'testing',
  'Testing123',
  'demo',
  'Demo123',
  'sample',
  'Sample123',
  'default',
  'Default123',
  
  // Date patterns
  '12345',
  '123321',
  '112233',
  '121212',
  '123654',
  
  // Simple words
  'letmein',
  'trustno1',
  'superman',
  'batman',
  'iloveyou',
  'starwars',
  'pokemon',
  'qazwsx',
  'mustang',
  'michael',
  'shadow',
  'master',
  'jordan',
  'harley',
  'ranger',
  'buster',
  'thomas',
  'robert',
  'soccer',
  'killer',
  'hockey',
  'george',
  'computer',
  'michelle',
  'jessica',
  'pepper',
  '1111',
  'zxcvbnm',
  '555555',
  '11111111',
  '131313',
  'freedom',
  '777777',
  'pass',
  'maggie',
  '159753',
  'aaaaaa',
  'ginger',
  'princess',
  'joshua',
  'cheese',
  'amanda',
  'summer',
  'love',
  'ashley',
  'nicole',
  'chelsea',
  'biteme',
  'matthew',
  'access',
  'yankees',
  '987654321',
  'dallas',
  'austin',
  'thunder',
  'taylor',
  'matrix',
]);

/**
 * Check if a password is in the weak password list
 * @param password Password to check
 * @returns true if password is weak, false otherwise
 */
export function isWeakPassword(password: string): boolean {
  return WEAK_PASSWORDS.has(password);
}

