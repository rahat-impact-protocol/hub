import axios from 'axios';
import * as http from 'http';
import * as https from 'https';

/**
 * HTTP Agent with KeepAlive enabled
 * 
 * Why KeepAlive?
 * - Reuses TCP connections instead of creating new ones for each request
 * - Reduces connection overhead (3-way handshake, ~30-50ms saved per request)
 * - Improves performance for high-volume requests to the same hosts
 * - Reduces CPU usage from connection setup/teardown
 * - Better network resource utilization
 * 
 * Benefits for routing service:
 * - Multiple requests to same service reuse connections
 * - Health checks benefit from connection pooling
 * - Async queue processing is more efficient
 */
const httpAgent = new http.Agent({
  keepAlive: true, // Reuse connections instead of closing after each request
  maxSockets: 100, // Maximum number of sockets per host
  maxFreeSockets: 10, // Maximum number of free sockets to keep open per host
  keepAliveMsecs: 30000, // Keep connections alive for 30 seconds
});

const httpsAgent = new https.Agent({
  keepAlive: true, // Reuse connections instead of closing after each request
  maxSockets: 100, // Maximum number of sockets per host
  maxFreeSockets: 10, // Maximum number of free sockets to keep open per host
  keepAliveMsecs: 30000, // Keep connections alive for 30 seconds
});

/**
 * Shared HTTP client with connection pooling
 * 
 * This client is used across the application for all HTTP requests
 * to benefit from connection reuse and improved performance.
 */
export const httpClient = axios.create({
  timeout: 30000,
  httpAgent,
  httpsAgent,
});