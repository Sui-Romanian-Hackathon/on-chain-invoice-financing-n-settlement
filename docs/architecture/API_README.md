# Backend API - Quick Start Guide

This backend API provides complete functionality for the On-Chain Invoice Financing platform.

## 🚀 Start the Server

```bash
cd dapp
npm run dev
# or
yarn dev
```

Server runs at: `http://localhost:3000`

## 📡 Available Endpoints

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Oracle Signatures
```bash
# Sign invoice issuance
curl -X POST http://localhost:3000/api/oracle/sign-issuance \
  -H "Content-Type: application/json" \
  -d '{
    "issuer": "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "buyer_hash": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    "amount": 10000,
    "due_date": 1735689600,
    "doc_hash": "QmXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "discount_bps": 320
  }'

# Sign payment confirmation
curl -X POST http://localhost:3000/api/oracle/sign-payment \
  -H "Content-Type: application/json" \
  -d '{
    "invoice_id": "0x1111111111111111111111111111111111111111111111111111111111111111",
    "amount": 10000
  }'
```

### Invoices
```bash
# List all invoices
curl http://localhost:3000/api/invoices

# Filter by status
curl "http://localhost:3000/api/invoices?status=ISSUED&limit=10"

# Get specific invoice
curl http://localhost:3000/api/invoices/0x1111111111111111111111111111111111111111111111111111111111111111
```

### Analytics
```bash
# Platform summary
curl http://localhost:3000/api/analytics/summary

# Portfolio metrics
curl "http://localhost:3000/api/analytics/portfolio?address=0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
```

### Documents
```bash
# Upload document
curl -X POST http://localhost:3000/api/documents/upload \
  -F "file=@invoice.pdf"
```

### KYC
```bash
# Check KYC status
curl http://localhost:3000/api/kyc/status/0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa

# Submit KYC
curl -X POST http://localhost:3000/api/kyc/submit \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "full_name": "John Doe",
    "email": "john@example.com"
  }'
```

## 📚 Documentation

- **Full API Docs**: `/docs/architecture/API_DOCUMENTATION.md`
- **Quick Reference**: `/docs/architecture/API_QUICK_REFERENCE.md`
- **Implementation Summary**: `/docs/project-management/BACKEND_API_IMPLEMENTATION_SUMMARY.md`

## 🛠️ Development

### Import Types
```typescript
import type { Invoice, SignIssuanceRequest, AnalyticsSummary } from '@/lib/api/types';
```

### Use Utilities
```typescript
import { isValidSuiAddress, calculateAPY, errorResponse } from '@/lib/api/utils';
```

### Access Mock Data
```typescript
import { getInvoices, getAnalyticsSummary } from '@/lib/api/mock-data';
```

## ✅ Status

All 10 endpoints fully implemented and tested:
- ✅ Health check
- ✅ Oracle signatures (issuance + payment)
- ✅ Document upload
- ✅ Invoice queries (list + detail)
- ✅ Analytics (summary + portfolio)
- ✅ KYC (status + submit)

## 🔧 Features

- Complete TypeScript type safety
- Comprehensive input validation
- Rate limiting on sensitive endpoints
- Detailed error messages
- CORS support
- Mock data for testing
- Production upgrade paths documented

## 📝 Next Steps

1. Integrate with frontend components
2. Connect to smart contracts
3. Replace mock data with real database
4. Deploy to production

---

**Last Updated**: November 15, 2025  
**Status**: ✅ Ready for Integration
