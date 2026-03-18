import { getHealth } from './routes/health.mjs';
import { getAllDeployments, getDeploymentById } from './routes/deployments.mjs';

/**
 * AWS Lambda handler for API Gateway proxy events.
 * Routes requests to the appropriate handler based on httpMethod and path.
 */
export const handler = async (event) => {
  const { httpMethod, path } = event;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // CORS preflight
  if (httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Health check
  if (httpMethod === 'GET' && path === '/api/health') {
    return getHealth(headers);
  }

  // All deployments
  if (httpMethod === 'GET' && path === '/api/deployments') {
    return getAllDeployments(headers);
  }

  // Single deployment by serviceId
  if (httpMethod === 'GET' && path.startsWith('/api/deployments/')) {
    // Prefer pathParameters from API Gateway, fall back to parsing the path
    const serviceId = event.pathParameters?.serviceId || path.split('/api/deployments/')[1];
    return getDeploymentById(serviceId, headers);
  }

  // Fallback — 404
  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({ error: 'Not found' })
  };
};
