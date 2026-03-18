import { getMockData } from '../data/mockData.mjs';

/**
 * GET /api/deployments — return all services with deployments.
 */
export function getAllDeployments(headers) {
  const data = getMockData();
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      services: data.services,
      updatedAt: data.updatedAt
    })
  };
}

/**
 * GET /api/deployments/{serviceId} — return a single service or 404.
 */
export function getDeploymentById(serviceId, headers) {
  const data = getMockData();
  const service = data.services.find(s => s.id === serviceId);

  if (!service) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: `Service '${serviceId}' not found` })
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(service)
  };
}
