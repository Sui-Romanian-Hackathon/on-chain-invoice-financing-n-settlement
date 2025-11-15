/**
 * KYC API: Submit KYC Information
 * POST /api/kyc/submit
 * 
 * Submit KYC information.
 * Upload KYC data for verification (mocked for MVP - auto-approves).
 */

import { NextRequest } from 'next/server';
import {
  successResponse,
  errorResponse,
  isValidSuiAddress,
  checkRateLimit,
  getClientIP,
} from '@/lib/api/utils';
import { submitKYC } from '@/lib/api/mock-data';
import type { KYCSubmitRequest, KYCStatus } from '@/lib/api/types';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 requests per minute per IP
    const clientIP = getClientIP(request);
    const rateLimitKey = `kyc-submit:${clientIP}`;
    const rateLimit = checkRateLimit(rateLimitKey, 5, 60 * 1000);

    if (!rateLimit.allowed) {
      return errorResponse(
        'RATE_LIMIT_EXCEEDED',
        'Too many requests. Please try again later.',
        429
      );
    }

    // Parse request body
    const body: KYCSubmitRequest = await request.json();
    const { address, full_name, email, documents } = body;

    // Validation
    const errors: Record<string, string> = {};

    if (!address || !isValidSuiAddress(address)) {
      errors.address = 'Invalid Sui address format (must be 0x + 64 hex characters)';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Invalid email format';
    }

    if (Object.keys(errors).length > 0) {
      return errorResponse('VALIDATION_ERROR', 'Invalid parameters', 400, errors);
    }

    // Submit KYC (auto-approved for MVP)
    const kycStatus: KYCStatus = submitKYC(address, { full_name, email, documents });

    console.log('✅ KYC submitted:', {
      address: address.substring(0, 10) + '...',
      status: kycStatus.status,
      full_name,
      email,
    });

    return successResponse(kycStatus, 200);
  } catch (error) {
    console.error('❌ Error submitting KYC:', error);
    return errorResponse(
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : 'Failed to submit KYC',
      500
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
