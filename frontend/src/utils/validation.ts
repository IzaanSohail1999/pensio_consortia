import { NextApiRequest } from 'next';

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'email';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => boolean | string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData: Record<string, unknown>;
}

export function validateRequest(
  req: NextApiRequest,
  rules: ValidationRule[]
): ValidationResult {
  const errors: string[] = [];
  const sanitizedData: Record<string, unknown> = {};
  
  for (const rule of rules) {
    const value = req.body[rule.field];
    
    // Check if required
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${rule.field} is required`);
      continue;
    }
    
    // Skip validation if value is not provided and not required
    if (value === undefined || value === null) {
      continue;
    }
    
    // Type validation
    if (rule.type) {
      if (!validateType(value, rule.type)) {
        errors.push(`${rule.field} must be a valid ${rule.type}`);
        continue;
      }
    }
    
    // Length validation for strings
    if (rule.type === 'string' || typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(`${rule.field} must be at least ${rule.minLength} characters long`);
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`${rule.field} must be no more than ${rule.maxLength} characters long`);
      }
    }
    
    // Pattern validation
    if (rule.pattern && !rule.pattern.test(String(value))) {
      errors.push(`${rule.field} format is invalid`);
    }
    
    // Custom validation
    if (rule.custom) {
      const customResult = rule.custom(value);
      if (customResult !== true) {
        errors.push(typeof customResult === 'string' ? customResult : `${rule.field} validation failed`);
      }
    }
    
    // Sanitize the value
    sanitizedData[rule.field] = sanitizeValue(value);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData
  };
}

function validateType(value: unknown, type: string): boolean {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'email':
      return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    default:
      return true;
  }
}

function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    // Remove potential XSS vectors
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }
  return value;
}

// Common validation rules
export const commonValidations = {
  username: {
    field: 'username',
    required: true,
    type: 'string' as const,
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_-]+$/
  },
  
  password: {
    field: 'password',
    required: true,
    type: 'string' as const,
    minLength: 8,
    maxLength: 128,
    custom: (value: unknown) => {
      if (typeof value !== 'string') return 'Password must be a string';
      
      // Require at least one uppercase, one lowercase, one number
      const hasUpper = /[A-Z]/.test(value);
      const hasLower = /[a-z]/.test(value);
      const hasNumber = /\d/.test(value);
      
      if (!hasUpper || !hasLower || !hasNumber) {
        return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      }
      return true;
    }
  },

  // Password for signin (no strict requirements)
  passwordSignin: {
    field: 'password',
    required: true,
    type: 'string' as const,
    minLength: 1,
    maxLength: 128
  },
  
  email: {
    field: 'email',
    required: true,
    type: 'email' as const,
    maxLength: 254
  },
  
  fullName: {
    field: 'fullName',
    required: true,
    type: 'string' as const,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s'-]+$/
  }
};

// Helper function to validate common fields
export function validateCommonFields(req: NextApiRequest, fields: string[]): ValidationResult {
  const rules = fields.map(field => commonValidations[field as keyof typeof commonValidations]);
  return validateRequest(req, rules);
}

// Helper function to validate fields for signin (with relaxed password requirements)
export function validateSigninFields(req: NextApiRequest, fields: string[]): ValidationResult {
  const rules = fields.map(field => {
    if (field === 'password') {
      return commonValidations.passwordSignin;
    }
    return commonValidations[field as keyof typeof commonValidations];
  });
  return validateRequest(req, rules);
}
