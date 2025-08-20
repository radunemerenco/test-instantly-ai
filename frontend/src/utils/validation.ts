export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface EmailFormErrors {
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string[];
  body: string[];
}

// Email regex pattern - more permissive for various email formats
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function validateEmail(email: string): boolean {
  if (!email.trim()) return true; // Empty is OK for optional fields
  return EMAIL_REGEX.test(email.trim());
}

export function validateEmailList(emails: string): string[] {
  const errors: string[] = [];
  
  if (!emails.trim()) return errors; // Empty is OK
  
  // Split by comma, semicolon, or space and clean up
  const emailList = emails
    .split(/[,;\s]+/)
    .map(email => email.trim())
    .filter(email => email.length > 0);
  
  for (const email of emailList) {
    if (!validateEmail(email)) {
      errors.push(`Invalid email: ${email}`);
    }
  }
  
  return errors;
}

export function validateToField(to: string): string[] {
  const errors: string[] = [];
  
  if (!to.trim()) {
    errors.push('To field is required');
    return errors;
  }
  
  return validateEmailList(to);
}

export function validateSubject(subject: string): string[] {
  const errors: string[] = [];
  
  if (!subject.trim()) {
    errors.push('Subject is required');
  } else if (subject.trim().length > 200) {
    errors.push('Subject must be less than 200 characters');
  }
  
  return errors;
}

export function validateEmailForm(formData: {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
}): EmailFormErrors {
  return {
    to: validateToField(formData.to),
    cc: validateEmailList(formData.cc),
    bcc: validateEmailList(formData.bcc),
    subject: validateSubject(formData.subject),
    body: [], // Body validation can be added if needed
  };
}

export function hasValidationErrors(errors: EmailFormErrors): boolean {
  return Object.values(errors).some(fieldErrors => fieldErrors.length > 0);
}

export function getFirstError(errors: EmailFormErrors): string | null {
  for (const [field, fieldErrors] of Object.entries(errors)) {
    if (fieldErrors.length > 0) {
      return fieldErrors[0];
    }
  }
  return null;
}