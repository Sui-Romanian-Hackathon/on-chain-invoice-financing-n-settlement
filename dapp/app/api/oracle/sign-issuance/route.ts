/**
 * Oracle API: Sign Issuance Attestation
 * POST /api/oracle/sign-issuance
 * 
 * Signs invoice issuance attestation with oracle private key.
 * Generates cryptographic proof for invoice creation on-chain.
 */

import { NextRequest } from 'next/server';
import {
  successResponse,
  errorResponse,
  isValidSuiAddress,
  isValidHexHash,
  isPositiveInteger,
  isFutureTimestamp,
  isValidDiscountBps,
  isValidIPFSHash,
  generateMockSignature,
  generateNonce,
  MOCK_ORACLE_PUBKEY,
  checkRateLimit,
  getClientIP,
  getCurrentTimestamp,
} from '@/lib/api/utils';
import type { SignIssuanceRequest, SignIssuanceResponse } from '@/lib/api/types';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 requests per minute per IP
    const clientIP = getClientIP(request);
    const rateLimitKey = `sign-issuance:${clientIP}`;
    const rateLimit = checkRateLimit(rateLimitKey, 10, 60 * 1000);

    if (!rateLimit.allowed) {
      return errorResponse(
        'RATE_LIMIT_EXCEEDED',
        'Too many requests. Please try again later.',
        429
      );
    }

    // Parse request body
    const body: SignIssuanceRequest = await request.json();
    const { issuer, buyer_hash, amount, due_date, doc_hash, discount_bps } = body;

    // Validation
    const errors: Record<string, string> = {};

    if (!issuer || !isValidSuiAddress(issuer)) {
      errors.issuer = 'Invalid Sui address (must be 0x + 64 hex characters)';
    }

    if (!buyer_hash || !isValidHexHash(buyer_hash)) {
      errors.buyer_hash = 'Invalid buyer hash (must be 64 hex characters)';
    }

    if (!amount || !isPositiveInteger(amount)) {
      errors.amount = 'Amount must be a positive integer';
    }

    if (!due_date || !isFutureTimestamp(due_date)) {
      errors.due_date = 'Due date must be a future timestamp within 5 years';
    }

    if (!doc_hash || !isValidIPFSHash(doc_hash)) {
      errors.doc_hash = 'Invalid document hash (must be valid IPFS CID, min 10 chars)';
    }

    if (discount_bps === undefined || !isValidDiscountBps(discount_bps)) {
      errors.discount_bps = 'Discount rate must be an integer between 0 and 10000';
    }

    if (Object.keys(errors).length > 0) {
      return errorResponse('VALIDATION_ERROR', 'Invalid parameters', 400, errors);
    }

    // Generate signature (mock for MVP)
    // In production, this should use real Ed25519 signing with oracle private key
    const signature = generateMockSignature();
    const nonce = generateNonce();
    const timestamp = getCurrentTimestamp();

    const response: SignIssuanceResponse = {
      signature,
      nonce,
      timestamp,
      oracle_pubkey: MOCK_ORACLE_PUBKEY,
    };

    // Log for debugging
    console.log('✅ Oracle signature generated for issuance:', {
      issuer: issuer.substring(0, 10) + '...',
      amount,
      due_date,
      nonce: nonce.substring(0, 16) + '...',
    });

    return successResponse(response, 200);
  } catch (error) {
    console.error('❌ Error signing issuance:', error);
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
