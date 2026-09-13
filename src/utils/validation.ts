/**
 * Form validation utilities for Gustoso Pizza Co. (Saudi Arabia Market)
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates a Saudi Mobile phone number.
 * Valid formats include:
 * - 05XXXXXXXX (10 digits)
 * - +9665XXXXXXXX or 009665XXXXXXXX
 * - 5XXXXXXXX (9 digits)
 * - formatted with spaces or dashes: +966 50 123 4567, 050-123-4567
 */
export function validateSaudiPhone(phone: string): ValidationResult & { normalized?: string } {
  if (!phone || !phone.trim()) {
    return {
      isValid: false,
      error: 'Saudi mobile number is required',
    };
  }

  // Strip all non-digit characters except leading plus
  const cleaned = phone.trim().replace(/[\s\-\(\)\.]/g, '');

  // Regex matches:
  // ^05\d{8}$  => 0501234567
  // ^(\+966|00966)5\d{8}$ => +966501234567 or 00966501234567
  // ^5\d{8}$   => 501234567
  const saudiRegex = /^(?:\+966|00966|0)?5[0-9]{8}$/;

  if (!saudiRegex.test(cleaned)) {
    return {
      isValid: false,
      error: 'Please enter a valid Saudi mobile number (e.g. 050 123 4567 or +966 50 123 4567)',
    };
  }

  // Normalize to standard international format: +966 5X XXX XXXX
  let digits = cleaned;
  if (digits.startsWith('+966')) {
    digits = digits.slice(4);
  } else if (digits.startsWith('00966')) {
    digits = digits.slice(5);
  } else if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  // digits now starts with 5 and has 9 digits total
  const part1 = digits.slice(0, 2); // 50
  const part2 = digits.slice(2, 5); // 123
  const part3 = digits.slice(5);    // 4567
  const normalized = `+966 ${part1} ${part2} ${part3}`;

  return {
    isValid: true,
    normalized,
  };
}

/**
 * Validates email address format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || !email.trim()) {
    return {
      isValid: false,
      error: 'Email address is required',
    };
  }

  const trimmed = email.trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address (e.g. name@example.com)',
    };
  }

  return { isValid: true };
}

/**
 * Validates full name
 */
export function validateFullName(name: string): ValidationResult {
  if (!name || !name.trim()) {
    return {
      isValid: false,
      error: 'Full name is required',
    };
  }

  if (name.trim().length < 2) {
    return {
      isValid: false,
      error: 'Full name must be at least 2 characters',
    };
  }

  return { isValid: true };
}

/**
 * Validates address fields for delivery in Saudi Arabia
 */
export function validateDeliveryAddress(address: {
  city?: string;
  district?: string;
  street?: string;
  buildingNumber?: string;
}): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!address.city || !address.city.trim()) {
    errors.city = 'City is required';
  }

  if (!address.district || !address.district.trim()) {
    errors.district = 'District (حي) is required';
  }

  if (!address.street || !address.street.trim()) {
    errors.street = 'Street name is required';
  }

  if (!address.buildingNumber || !address.buildingNumber.trim()) {
    errors.buildingNumber = 'Building number is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
