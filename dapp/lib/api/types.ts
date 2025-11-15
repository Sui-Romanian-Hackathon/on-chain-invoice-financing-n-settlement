/**
 * API Types for On-Chain Invoice Financing Platform
 * Based on API Documentation v1.0
 */

// ============================================================================
// Invoice Types
// ============================================================================

export type InvoiceStatus = 'ISSUED' | 'FINANCED' | 'PAID' | 'DISPUTED' | 'CANCELED';

export interface Invoice {
  invoice_id: string;
  issuer: string;
  buyer_hash: string;
  face_value: string; // BigInt as string
  due_date: string; // ISO 8601
  status: InvoiceStatus;
  financier?: string;
  discount_bps: number;
  doc_hash: string;
  issued_at: string; // ISO 8601
  financed_at?: string; // ISO 8601
  paid_at?: string; // ISO 8601
}

export interface InvoiceWithHistory extends Invoice {
  history: InvoiceEvent[];
  transitions: InvoiceTransition[];
}

export interface InvoiceEvent {
  id: number;
  event_type: string;
  invoice_id: string;
  transaction_digest: string;
  sender: string;
  data: Record<string, any>;
  timestamp: string; // ISO 8601
  block_height: number;
}

export interface InvoiceTransition {
  from: InvoiceStatus;
  to: InvoiceStatus;
  timestamp: string; // ISO 8601
  transaction_digest: string;
}

export interface InvoiceFilters {
  status?: InvoiceStatus;
  issuer?: string;
  financier?: string;
  min_amount?: number;
  max_amount?: number;
  sort?: 'due_date' | 'created_at' | 'face_value';
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface InvoiceListResponse {
  invoices: Invoice[];
  total: number;
  page: number;
  limit: number;
}

// ============================================================================
// Oracle Types
// ============================================================================

export interface SignIssuanceRequest {
  issuer: string;
  buyer_hash: string;
  amount: number;
  due_date: number; // Unix timestamp
  doc_hash: string;
  discount_bps: number;
}

export interface SignIssuanceResponse {
  signature: string; // 128-char hex
  nonce: string; // 64-char hex
  timestamp: number; // Unix timestamp
  oracle_pubkey: string;
}

export interface SignPaymentRequest {
  invoice_id: string;
  amount: number;
  payment_proof?: string;
}

export interface SignPaymentResponse {
  signature: string; // 128-char hex
  timestamp: number; // Unix timestamp
  nonce: string; // 64-char hex
}

// ============================================================================
// Document Types
// ============================================================================

export interface DocumentUploadResponse {
  ipfs_hash: string;
  url: string;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface AnalyticsSummary {
  total_invoices: number;
  total_financed: number;
  total_settled: number;
  total_volume: string; // BigInt as string
  avg_time_to_finance: number; // Seconds
  avg_time_to_settlement: number; // Seconds
  active_suppliers: number;
  active_financiers: number;
}

export interface PortfolioMetrics {
  total_invested: string; // BigInt as string
  total_returns: string; // BigInt as string
  active_investments: number;
  completed_investments: number;
  average_apy: number; // Percentage
  success_rate: number; // Percentage
}

// ============================================================================
// KYC Types
// ============================================================================

export type KYCStatusType = 'approved' | 'pending' | 'rejected';

export interface KYCStatus {
  address: string;
  status: KYCStatusType;
  timestamp: number; // Unix timestamp
  verified_at?: number; // Unix timestamp
}

export interface KYCSubmitRequest {
  address: string;
  full_name?: string;
  email?: string;
  documents?: string[]; // IPFS hashes
}

// ============================================================================
// Health Check Types
// ============================================================================

export type ServiceStatus = 'up' | 'down';
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface HealthCheckResponse {
  status: HealthStatus;
  timestamp: number; // Unix timestamp
  services: {
    database: ServiceStatus;
    blockchain: ServiceStatus;
    ipfs: ServiceStatus;
  };
}

// ============================================================================
// Error Types
// ============================================================================

export interface APIError {
  error: string;
  message: string;
  status: number;
  details?: Record<string, any>;
}

// ============================================================================
// Rate Limiting Types
// ============================================================================

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitState {
  count: number;
  resetTime: number;
}
