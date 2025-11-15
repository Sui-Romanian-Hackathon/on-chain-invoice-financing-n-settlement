/**
 * Mock Data for On-Chain Invoice Financing Platform
 * 
 * ⚠️ DEPRECATED: This file contains mock data for testing only.
 * ⚠️ API endpoints now fetch real data from Sui blockchain.
 * ⚠️ Frontend should use React hooks (useInvoices, useMyInvoices) instead.
 * 
 * This file is kept for:
 * - KYC mock functionality (will be replaced with real service)
 * - Testing and development reference
 */

import type {
  Invoice,
  InvoiceStatus,
  InvoiceEvent,
  InvoiceTransition,
  InvoiceFilters,
  AnalyticsSummary,
  PortfolioMetrics,
  KYCStatus,
} from './types';
import { timestampToISO, getCurrentTimestamp } from './utils';

// ============================================================================
// Mock Invoice Data
// ============================================================================

export const mockInvoices: Invoice[] = [
  {
    invoice_id: '0x1111111111111111111111111111111111111111111111111111111111111111',
    issuer: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    buyer_hash: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    face_value: '100000',
    due_date: timestampToISO(getCurrentTimestamp() + 30 * 24 * 60 * 60), // 30 days
    status: 'ISSUED' as InvoiceStatus,
    discount_bps: 320,
    doc_hash: 'QmXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    issued_at: timestampToISO(getCurrentTimestamp() - 2 * 24 * 60 * 60), // 2 days ago
  },
  {
    invoice_id: '0x2222222222222222222222222222222222222222222222222222222222222222',
    issuer: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    buyer_hash: 'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    face_value: '250000',
    due_date: timestampToISO(getCurrentTimestamp() + 45 * 24 * 60 * 60), // 45 days
    status: 'ISSUED' as InvoiceStatus,
    discount_bps: 280,
    doc_hash: 'QmYyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy',
    issued_at: timestampToISO(getCurrentTimestamp() - 1 * 24 * 60 * 60), // 1 day ago
  },
  {
    invoice_id: '0x3333333333333333333333333333333333333333333333333333333333333333',
    issuer: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    buyer_hash: 'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    face_value: '500000',
    due_date: timestampToISO(getCurrentTimestamp() + 60 * 24 * 60 * 60), // 60 days
    status: 'FINANCED' as InvoiceStatus,
    financier: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    discount_bps: 350,
    doc_hash: 'QmZzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz',
    issued_at: timestampToISO(getCurrentTimestamp() - 7 * 24 * 60 * 60), // 7 days ago
    financed_at: timestampToISO(getCurrentTimestamp() - 5 * 24 * 60 * 60), // 5 days ago
  },
  {
    invoice_id: '0x4444444444444444444444444444444444444444444444444444444444444444',
    issuer: '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    buyer_hash: 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    face_value: '150000',
    due_date: timestampToISO(getCurrentTimestamp() - 5 * 24 * 60 * 60), // 5 days ago (overdue)
    status: 'PAID' as InvoiceStatus,
    financier: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    discount_bps: 300,
    doc_hash: 'QmAaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    issued_at: timestampToISO(getCurrentTimestamp() - 40 * 24 * 60 * 60), // 40 days ago
    financed_at: timestampToISO(getCurrentTimestamp() - 38 * 24 * 60 * 60), // 38 days ago
    paid_at: timestampToISO(getCurrentTimestamp() - 6 * 24 * 60 * 60), // 6 days ago
  },
  {
    invoice_id: '0x5555555555555555555555555555555555555555555555555555555555555555',
    issuer: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    buyer_hash: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    face_value: '75000',
    due_date: timestampToISO(getCurrentTimestamp() + 15 * 24 * 60 * 60), // 15 days
    status: 'ISSUED' as InvoiceStatus,
    discount_bps: 250,
    doc_hash: 'QmBbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    issued_at: timestampToISO(getCurrentTimestamp() - 3 * 24 * 60 * 60), // 3 days ago
  },
];

// ============================================================================
// Mock Invoice History
// ============================================================================

export const mockInvoiceHistory: Record<string, InvoiceEvent[]> = {
  '0x3333333333333333333333333333333333333333333333333333333333333333': [
    {
      id: 1,
      event_type: 'InvoiceIssued',
      invoice_id: '0x3333333333333333333333333333333333333333333333333333333333333333',
      transaction_digest: '0xabcd1111111111111111111111111111111111111111111111111111111111111111',
      sender: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      data: { face_value: '500000', discount_bps: 350 },
      timestamp: timestampToISO(getCurrentTimestamp() - 7 * 24 * 60 * 60),
      block_height: 1000,
    },
    {
      id: 2,
      event_type: 'InvoiceFinanced',
      invoice_id: '0x3333333333333333333333333333333333333333333333333333333333333333',
      transaction_digest: '0xabcd2222222222222222222222222222222222222222222222222222222222222222',
      sender: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      data: { purchase_price: '482500' },
      timestamp: timestampToISO(getCurrentTimestamp() - 5 * 24 * 60 * 60),
      block_height: 1050,
    },
  ],
};

export const mockInvoiceTransitions: Record<string, InvoiceTransition[]> = {
  '0x3333333333333333333333333333333333333333333333333333333333333333': [
    {
      from: 'ISSUED' as InvoiceStatus,
      to: 'FINANCED' as InvoiceStatus,
      timestamp: timestampToISO(getCurrentTimestamp() - 5 * 24 * 60 * 60),
      transaction_digest: '0xabcd2222222222222222222222222222222222222222222222222222222222222222',
    },
  ],
};

// ============================================================================
// Query Functions
// ============================================================================

export function getInvoices(filters?: InvoiceFilters): Invoice[] {
  let filtered = [...mockInvoices];

  // Apply status filter
  if (filters?.status) {
    filtered = filtered.filter((inv) => inv.status === filters.status);
  }

  // Apply issuer filter
  if (filters?.issuer) {
    filtered = filtered.filter((inv) => inv.issuer === filters.issuer);
  }

  // Apply financier filter
  if (filters?.financier) {
    filtered = filtered.filter((inv) => inv.financier === filters.financier);
  }

  // Apply amount filters
  if (filters?.min_amount) {
    filtered = filtered.filter((inv) => BigInt(inv.face_value) >= BigInt(filters.min_amount!));
  }
  if (filters?.max_amount) {
    filtered = filtered.filter((inv) => BigInt(inv.face_value) <= BigInt(filters.max_amount!));
  }

  // Apply sorting
  const sortField = filters?.sort || 'created_at';
  const sortOrder = filters?.order || 'desc';

  filtered.sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'face_value':
        comparison = Number(BigInt(a.face_value) - BigInt(b.face_value));
        break;
      case 'due_date':
        comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        break;
      case 'created_at':
      default:
        comparison = new Date(a.issued_at).getTime() - new Date(b.issued_at).getTime();
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Apply pagination
  const offset = filters?.offset || 0;
  const limit = filters?.limit || 50;
  
  return filtered.slice(offset, offset + limit);
}

export function getInvoiceById(id: string): Invoice | undefined {
  return mockInvoices.find((inv) => inv.invoice_id === id);
}

// ============================================================================
// Mock Analytics Data
// ============================================================================

export function getAnalyticsSummary(): AnalyticsSummary {
  const totalInvoices = mockInvoices.length;
  const financedInvoices = mockInvoices.filter((inv) => inv.status === 'FINANCED' || inv.status === 'PAID');
  const settledInvoices = mockInvoices.filter((inv) => inv.status === 'PAID');

  const totalVolume = mockInvoices.reduce((sum, inv) => sum + BigInt(inv.face_value), BigInt(0));

  // Calculate average time to finance (in seconds)
  const financingTimes = financedInvoices
    .filter((inv) => inv.financed_at)
    .map((inv) => {
      const issued = new Date(inv.issued_at).getTime();
      const financed = new Date(inv.financed_at!).getTime();
      return (financed - issued) / 1000;
    });
  const avgTimeToFinance = financingTimes.length > 0
    ? Math.floor(financingTimes.reduce((a, b) => a + b, 0) / financingTimes.length)
    : 0;

  // Calculate average time to settlement (in seconds)
  const settlementTimes = settledInvoices
    .filter((inv) => inv.financed_at && inv.paid_at)
    .map((inv) => {
      const financed = new Date(inv.financed_at!).getTime();
      const paid = new Date(inv.paid_at!).getTime();
      return (paid - financed) / 1000;
    });
  const avgTimeToSettlement = settlementTimes.length > 0
    ? Math.floor(settlementTimes.reduce((a, b) => a + b, 0) / settlementTimes.length)
    : 0;

  const activeSuppliers = new Set(mockInvoices.map((inv) => inv.issuer)).size;
  const activeFinanciers = new Set(
    mockInvoices.filter((inv) => inv.financier).map((inv) => inv.financier!)
  ).size;

  return {
    total_invoices: totalInvoices,
    total_financed: financedInvoices.length,
    total_settled: settledInvoices.length,
    total_volume: totalVolume.toString(),
    avg_time_to_finance: avgTimeToFinance,
    avg_time_to_settlement: avgTimeToSettlement,
    active_suppliers: activeSuppliers,
    active_financiers: activeFinanciers,
  };
}

export function getPortfolioMetrics(address: string): PortfolioMetrics {
  const financierInvoices = mockInvoices.filter((inv) => inv.financier === address);
  const activeInvestments = financierInvoices.filter((inv) => inv.status === 'FINANCED');
  const completedInvestments = financierInvoices.filter((inv) => inv.status === 'PAID');

  // Calculate total invested (purchase prices)
  const totalInvested = financierInvoices.reduce((sum, inv) => {
    const faceValue = BigInt(inv.face_value);
    const discount = BigInt(inv.discount_bps);
    const purchasePrice = (faceValue * (BigInt(10000) - discount)) / BigInt(10000);
    return sum + purchasePrice;
  }, BigInt(0));

  // Calculate total returns (face values of settled invoices)
  const totalReturns = completedInvestments.reduce((sum, inv) => {
    return sum + BigInt(inv.face_value);
  }, BigInt(0));

  // Calculate average APY
  const apys = completedInvestments.map((inv) => {
    const faceValue = BigInt(inv.face_value);
    const discount = BigInt(inv.discount_bps);
    const purchasePrice = (faceValue * (BigInt(10000) - discount)) / BigInt(10000);
    const profit = Number(faceValue - purchasePrice);
    const investment = Number(purchasePrice);

    const financed = new Date(inv.financed_at!).getTime();
    const paid = new Date(inv.paid_at!).getTime();
    const daysHeld = (paid - financed) / (1000 * 60 * 60 * 24);

    const periodReturn = profit / investment;
    const periodsPerYear = 365 / daysHeld;
    return periodReturn * periodsPerYear * 100;
  });

  const averageAPY = apys.length > 0 ? apys.reduce((a, b) => a + b, 0) / apys.length : 0;

  // Calculate success rate
  const totalInvestments = financierInvoices.length;
  const successRate = totalInvestments > 0 ? (completedInvestments.length / totalInvestments) * 100 : 0;

  return {
    total_invested: totalInvested.toString(),
    total_returns: totalReturns.toString(),
    active_investments: activeInvestments.length,
    completed_investments: completedInvestments.length,
    average_apy: parseFloat(averageAPY.toFixed(2)),
    success_rate: parseFloat(successRate.toFixed(2)),
  };
}

// ============================================================================
// Mock KYC Data
// ============================================================================

const mockKYCData = new Map<string, KYCStatus>();

export function getKYCStatus(address: string): KYCStatus {
  if (!mockKYCData.has(address)) {
    // Auto-approve for MVP
    const timestamp = getCurrentTimestamp();
    mockKYCData.set(address, {
      address,
      status: 'approved',
      timestamp,
      verified_at: timestamp,
    });
  }
  return mockKYCData.get(address)!;
}

export function submitKYC(address: string, data: any): KYCStatus {
  const timestamp = getCurrentTimestamp();
  const kycStatus: KYCStatus = {
    address,
    status: 'approved', // Auto-approve for MVP
    timestamp,
    verified_at: timestamp,
  };
  mockKYCData.set(address, kycStatus);
  return kycStatus;
}
