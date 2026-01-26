// Input validation utilities

import { ValidationResult } from './types';

/**
 * Sanitize string input to prevent XSS attacks
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate player name
 */
export function validatePlayerName(name: string): ValidationResult {
  const errors: string[] = [];
  const sanitized = sanitizeString(name);

  if (!sanitized || sanitized.length === 0) {
    errors.push('Player name is required');
  }

  if (sanitized.length > 100) {
    errors.push('Player name must be less than 100 characters');
  }

  if (!/^[\p{L}\p{N}\s.-]+$/u.test(sanitized)) {
    errors.push('Player name contains invalid characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate email address
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  const sanitized = sanitizeString(email);

  if (!sanitized || sanitized.length === 0) {
    errors.push('Email is required');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    errors.push('Invalid email format');
  }

  if (sanitized.length > 255) {
    errors.push('Email must be less than 255 characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];

  if (!password || password.length === 0) {
    errors.push('Password is required');
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate golf score
 */
export function validateScore(score: number, minScore: number = 1, maxScore: number = 20): ValidationResult {
  const errors: string[] = [];

  if (!Number.isInteger(score)) {
    errors.push('Score must be an integer');
  }

  if (score < minScore || score > maxScore) {
    errors.push(`Score must be between ${minScore} and ${maxScore}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate array of 18 golf scores
 */
export function validateScoreArray(scores: number[]): ValidationResult {
  const errors: string[] = [];

  if (!Array.isArray(scores)) {
    errors.push('Scores must be an array');
    return { valid: false, errors };
  }

  if (scores.length !== 18) {
    errors.push('Exactly 18 scores are required');
  }

  scores.forEach((score, index) => {
    const validation = validateScore(score);
    if (!validation.valid) {
      errors.push(`Hole ${index + 1}: ${validation.errors.join(', ')}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate par value
 */
export function validatePar(par: number): ValidationResult {
  const errors: string[] = [];

  if (!Number.isInteger(par)) {
    errors.push('Par must be an integer');
  }

  if (par < 3 || par > 6) {
    errors.push('Par must be between 3 and 6');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate course name
 */
export function validateCourseName(name: string): ValidationResult {
  const errors: string[] = [];
  const sanitized = sanitizeString(name);

  if (!sanitized || sanitized.length === 0) {
    errors.push('Course name is required');
  }

  if (sanitized.length > 200) {
    errors.push('Course name must be less than 200 characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate location
 */
export function validateLocation(location: string, allowedLocations?: string[]): ValidationResult {
  const errors: string[] = [];
  const sanitized = sanitizeString(location);

  if (!sanitized || sanitized.length === 0) {
    errors.push('Location is required');
  }

  if (allowedLocations && !allowedLocations.includes(sanitized)) {
    errors.push('Invalid location');
  }

  if (sanitized.length > 100) {
    errors.push('Location must be less than 100 characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
