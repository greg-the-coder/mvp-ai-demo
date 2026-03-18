/**
 * Health check route.
 * GET /api/health
 */
export function getHealth(headers) {
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    })
  };
}
