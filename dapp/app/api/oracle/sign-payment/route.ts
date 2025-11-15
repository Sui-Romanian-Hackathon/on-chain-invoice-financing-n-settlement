/**
 * Oracle API: Sign Payment Confirmation
 * POST /api/oracle/sign-payment
 * 
 * Signs payment confirmation attestation.
 * Generates cryptographic proof that invoice payment was observed off-chain.
 */

import { NextRequest } from 'next/server';
import {
  successResponse,
  errorResponse,
  isPositiveInteger,
  generateMockSignature,
  generateNonce,
  checkRateLimit,
  getClientIP,
  getCurrentTimestamp,
} from '@/lib/api/utils';
import type { SignPaymentRequest, SignPaymentResponse } from '@/lib/api/types';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 requests per minute per IP
    const clientIP = getClientIP(request);
    const rateLimitKey = `sign-payment:${clientIP}`;
    const rateLimit = checkRateLimit(rateLimitKey, 10, 60 * 1000);

    if (!rateLimit.allowed) {
      return errorResponse(
        'RATE_LIMIT_EXCEEDED',
        'Too many requests. Please try again later.',
        429
      );
    }

    // Parse request body
    const body: SignPaymentRequest = await request.json();
    const { invoice_id, amount, payment_proof } = body;

    // Validation
    const errors: Record<string, string> = {};

    if (!invoice_id || !invoice_id.startsWith('0x')) {
      errors.invoice_id = 'Invoice ID must start with "0x"';
    }

    if (!amount || !isPositiveInteger(amount)) {
      errors.amount = 'Amount must be a positive integer';
    }

    if (Object.keys(errors).length > 0) {
      return errorResponse('VALIDATION_ERROR', 'Invalid parameters', 400, errors);
    }

    // Generate signature (mock for MVP)
    // In production, this should:
    // 1. Verify the payment actually occurred off-chain
    // 2. Sign with oracle private key using Ed25519
    const signature = generateMockSignature();
    const nonce = generateNonce();
    const timestamp = getCurrentTimestamp();

    const response: SignPaymentResponse = {
      signature,
      timestamp,
      nonce,
    };

    // Log for debugging
    console.log('✅ Oracle signature generated for payment:', {
      invoice_id: invoice_id.substring(0, 10) + '...',
      amount,
      payment_proof: payment_proof || 'none',
      nonce: nonce.substring(0, 16) + '...',
    });

    return successResponse(response, 200);
  } catch (error) {
    console.error('❌ Error signing payment:', error);
    return errorResponse(
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : 'Signature generation failed',
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
