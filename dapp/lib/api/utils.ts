/**
 * API Utilities for On-Chain Invoice Financing Platform
 * Common helper functions for API routes
 */

import { NextResponse } from 'next/server';
import type { APIError } from './types';

// ============================================================================
// Response Helpers
// ============================================================================

/**
 * Create a successful API response
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

/**
 * Create an error API response
 */
export function errorResponse(
  error: string,
  message: string,
  status: number = 400,
  details?: Record<string, any>
): NextResponse<APIError> {
  return NextResponse.json(
    {
      error,
      message,
      status,
      ...(details && { details }),
    },
    { status }
  );
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate Sui address format (0x + 64 hex characters)
 */
export function isValidSuiAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(address);
}

/**
 * Validate hex hash (64 hex characters)
 */
export function isValidHexHash(hash: string): boolean {
  return /^[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Validate IPFS CID format (simplified)
 */
export function isValidIPFSHash(hash: string): boolean {
  return hash.length >= 10 && (hash.startsWith('Qm') || hash.startsWith('bafy'));
}

/**
 * Validate positive integer
 */
export function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

/**
 * Validate future timestamp
 */
export function isFutureTimestamp(timestamp: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  const fiveYears = 5 * 365 * 24 * 60 * 60;
  return timestamp > now && timestamp < now + fiveYears;
}

/**
 * Validate discount rate in basis points
 */
export function isValidDiscountBps(bps: number): boolean {
  return Number.isInteger(bps) && bps >= 0 && bps <= 10000;
}

// ============================================================================
// Signature Utilities (Mock for MVP)
// ============================================================================

/**
 * Generate a mock Ed25519 signature (128 hex characters)
 * In production, use real cryptographic signing
 */
export function generateMockSignature(): string {
  const chars = '0123456789abcdef';
  let signature = '';
  for (let i = 0; i < 128; i++) {
    signature += chars[Math.floor(Math.random() * 16)];
  }
  return `0x${signature}`;
}

/**
 * Generate a unique nonce (64 hex characters)
 */
export function generateNonce(): string {
  const chars = '0123456789abcdef';
  let nonce = '';
  for (let i = 0; i < 64; i++) {
    nonce += chars[Math.floor(Math.random() * 16)];
  }
  return nonce;
}

/**
 * Mock oracle public key
 */
export const MOCK_ORACLE_PUBKEY = '0x' + 'a'.repeat(64);

// ============================================================================
// Rate Limiting
// ============================================================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Simple in-memory rate limiter
 * In production, use Redis or similar distributed cache
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // New window
    const resetTime = now + windowMs;
    rateLimitStore.set(key, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }

  if (entry.count >= maxRequests) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);
  return { allowed: true, remaining: maxRequests - entry.count, resetTime: entry.resetTime };
}

/**
 * Get client IP from request headers (for rate limiting)
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return ip;
}

// ============================================================================
// Data Formatting
// ============================================================================

/**
 * Calculate purchase price from face value and discount
 */
export function calculatePurchasePrice(faceValue: bigint, discountBps: number): bigint {
  const discount = BigInt(discountBps);
  const bps = BigInt(10000);
  return (faceValue * (bps - discount)) / bps;
}

/**
 * Calculate APY from discount and time period
 */
export function calculateAPY(
  faceValue: bigint,
  purchasePrice: bigint,
  daysToMaturity: number
): number {
  if (daysToMaturity <= 0 || purchasePrice === BigInt(0)) return 0;

  const profit = Number(faceValue - purchasePrice);
  const investment = Number(purchasePrice);
  const periodReturn = profit / investment;
  const periodsPerYear = 365 / daysToMaturity;

  return periodReturn * periodsPerYear * 100;
}

/**
 * Format BigInt as string for JSON serialization
 */
export function bigIntToString(value: bigint): string {
  return value.toString();
}

/**
 * Parse string to BigInt safely
 */
export function stringToBigInt(value: string): bigint {
  return BigInt(value);
}

// ============================================================================
// Date/Time Utilities
// ============================================================================

/**
 * Convert Unix timestamp to ISO 8601 string
 */
export function timestampToISO(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString();
}

/**
 * Convert ISO 8601 string to Unix timestamp
 */
export function isoToTimestamp(iso: string): number {
  return Math.floor(new Date(iso).getTime() / 1000);
}

/**
 * Get current Unix timestamp
 */
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Calculate days between two timestamps
 */
export function daysBetween(timestamp1: number, timestamp2: number): number {
  const seconds = Math.abs(timestamp2 - timestamp1);
  return Math.floor(seconds / (60 * 60 * 24));
}

// ============================================================================
// File Validation
// ============================================================================

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Validate uploaded file
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_FILE_TYPES.join(', ')}`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)} MB`,
    };
  }

  return { valid: true };
}

// ============================================================================
// CORS Headers
// ============================================================================

/**
 * Get CORS headers for API responses
 * In production, restrict to specific origins
 */
export function getCORSHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}
