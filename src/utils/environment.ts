/**
 * Environment utilities for handling domain-specific redirects
 */

/**
 * Gets the current domain for environment-aware redirects
 */
export const getCurrentDomain = (): string => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  
  console.log('Environment detection:', { hostname, protocol, port });
  
  // Production domain
  if (hostname === 'domin8.one' || hostname === 'www.domin8.one') {
    console.log('Using production domain: https://domin8.one');
    return 'https://domin8.one';
  }
  
  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const url = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
    console.log('Using local development domain:', url);
    return url;
  }
  
  // Lovable staging or other subdomains
  const url = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
  console.log('Using staging/other domain:', url);
  return url;
};

/**
 * Gets the redirect URL for password reset emails
 */
export const getPasswordResetRedirectUrl = (): string => {
  return `${getCurrentDomain()}/reset-password`;
};

/**
 * Gets the redirect URL for email confirmations
 */
export const getEmailConfirmationRedirectUrl = (): string => {
  return `${getCurrentDomain()}/`;
};

/**
 * Checks if we're in production environment
 */
export const isProduction = (): boolean => {
  const hostname = window.location.hostname;
  return hostname === 'domin8.one' || hostname === 'www.domin8.one';
};