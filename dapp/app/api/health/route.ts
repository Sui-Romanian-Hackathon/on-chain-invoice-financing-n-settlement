/**
 * Health Check API
 * GET /api/health
 * 
 * System health status.
 * Monitor service availability.
 */

import { NextRequest } from 'next/server';
import {
  successResponse,
  getCurrentTimestamp,
} from '@/lib/api/utils';
import type { HealthCheckResponse, HealthStatus, ServiceStatus } from '@/lib/api/types';

export async function GET(request: NextRequest) {
  try {
    // Check service health
    // In production, these should be real health checks
    const services = {
      database: 'up' as ServiceStatus, // Would check PostgreSQL connection
      blockchain: 'up' as ServiceStatus, // Would check Sui RPC availability
      ipfs: 'up' as ServiceStatus, // Would check IPFS gateway
    };

    // Determine overall health status
    const allServicesUp = Object.values(services).every((status) => status === 'up');
    const someServicesDown = Object.values(services).some((status) => status === 'down');
    
    let healthStatus: HealthStatus;
    let httpStatus: number;

    if (allServicesUp) {
      healthStatus = 'healthy';
      httpStatus = 200;
    } else if (someServicesDown) {
      healthStatus = 'unhealthy';
      httpStatus = 503;
    } else {
      healthStatus = 'degraded';
      httpStatus = 200;
    }

    const response: HealthCheckResponse = {
      status: healthStatus,
      timestamp: getCurrentTimestamp(),
      services,
    };

    console.log('✅ Health check:', {
      status: healthStatus,
      services,
    });

    return successResponse(response, httpStatus);
  } catch (error) {
    console.error('❌ Error during health check:', error);
    
    // Return unhealthy status on error
    const response: HealthCheckResponse = {
      status: 'unhealthy',
      timestamp: getCurrentTimestamp(),
      services: {
        database: 'down',
        blockchain: 'down',
        ipfs: 'down',
      },
    };

    return successResponse(response, 503);
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
