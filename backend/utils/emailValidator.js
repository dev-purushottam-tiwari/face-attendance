const dns = require('dns').promises;

// Common disposable email domains
const DISPOSABLE_DOMAINS = [
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'throwaway.email',
  'temp-mail.org',
  'fakeinbox.com',
];

// Validate email format
const validateEmailFormat = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Check if domain is disposable
const isDisposableDomain = (domain) => {
  return DISPOSABLE_DOMAINS.includes(domain.toLowerCase());
};

// Check if domain has valid MX records
const checkDomainExists = async (domain) => {
  try {
    await dns.resolveMx(domain);
    return { exists: true, error: null };
  } catch (err) {
    return { exists: false, error: 'Domain does not exist or has no mail servers' };
  }
};

// Main email validation function
const validateEmail = async (email) => {
  // 1. Check format
  if (!validateEmailFormat(email)) {
    return {
      valid: false,
      reason: 'Invalid email format',
      canSend: false,
    };
  }

  const [localPart, domain] = email.split('@');

  // 2. Check if domain is disposable
  if (isDisposableDomain(domain)) {
    return {
      valid: false,
      reason: 'Disposable email addresses are not allowed',
      canSend: false,
    };
  }

  // 3. Check if domain exists (for Gmail, Yahoo, etc.)
  if (domain === 'gmail.com' || domain === 'yahoo.com' || domain === 'outlook.com') {
    // For major providers, we'll allow but note that we can't verify mailbox existence
    return {
      valid: true,
      reason: 'Valid format (mailbox existence cannot be verified)',
      canSend: true,
      note: 'We will send OTP but cannot verify if mailbox exists',
    };
  }

  // 4. For other domains, check MX records
  const domainCheck = await checkDomainExists(domain);
  
  if (!domainCheck.exists) {
    return {
      valid: false,
      reason: `Email domain "${domain}" does not exist or has no mail servers`,
      canSend: false,
    };
  }

  return {
    valid: true,
    reason: 'Valid email format and domain',
    canSend: true,
  };
};

module.exports = { validateEmail, validateEmailFormat, isDisposableDomain, checkDomainExists };