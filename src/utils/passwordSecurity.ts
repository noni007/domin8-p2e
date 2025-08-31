/**
 * Check if password has been breached using HaveIBeenPwned API
 */
export const checkPasswordBreach = async (password: string): Promise<boolean> => {
  try {
    // Hash password with SHA-1 (HIBP requirement) using Web Crypto API
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', passwordData);
    
    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const sha1Hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    
    const prefix = sha1Hash.substring(0, 5);
    const suffix = sha1Hash.substring(5);
    
    // Query HIBP API with k-anonymity (only send first 5 chars)
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    const responseText = await response.text();
    
    // Check if our suffix appears in the results
    return responseText.includes(suffix);
  } catch (error) {
    console.warn('Password breach check failed:', error);
    return false; // Fail open - don't block if service is down
  }
};

/**
 * Common password blacklist
 */
const COMMON_PASSWORDS = [
  'password', 'password123', '123456', '123456789', 'qwerty',
  'abc123', 'password1', 'admin', 'welcome', 'letmein',
  'monkey', '1234567890', 'dragon', 'master', 'hello',
  'login', 'pass', 'administrator', 'root', 'toor'
];

/**
 * Validate password strength and security
 */
export const validatePasswordSecurity = async (password: string): Promise<{
  isValid: boolean;
  errors: string[];
}> => {
  const errors: string[] = [];
  
  // Basic strength requirements
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check against common passwords
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a different password');
  }
  
  // Check against breached passwords
  const isBreached = await checkPasswordBreach(password);
  if (isBreached) {
    errors.push('This password has been found in data breaches. Please choose a different password');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};