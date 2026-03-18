import { createServer } from 'node:http';
import { handler } from './src/index.mjs';

const PORT = 3001;

/**
 * Local development server that wraps the Lambda handler.
 * Translates plain HTTP requests into API Gateway proxy event format,
 * invokes the handler, and writes the Lambda response back to the client.
 */
const server = createServer(async (req, res) => {
  // Build a minimal API Gateway proxy event from the incoming HTTP request
  const url = new URL(req.url, `http://localhost:${PORT}`);

  const event = {
    httpMethod: req.method,
    path: url.pathname,
    queryStringParameters: Object.fromEntries(url.searchParams),
    headers: req.headers,
    pathParameters: extractPathParameters(url.pathname),
    body: null,
  };

  try {
    const result = await handler(event);

    // Write response headers
    const responseHeaders = result.headers || {};
    for (const [key, value] of Object.entries(responseHeaders)) {
      res.setHeader(key, value);
    }

    res.writeHead(result.statusCode);
    res.end(result.body || '');
  } catch (err) {
    console.error('Handler error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

/**
 * Extracts pathParameters from the URL path to mimic API Gateway behavior.
 * Matches /api/deployments/{serviceId}
 */
function extractPathParameters(pathname) {
  const match = pathname.match(/^\/api\/deployments\/([^/]+)$/);
  if (match) {
    return { serviceId: match[1] };
  }
  return null;
}

server.listen(PORT, () => {
  console.log(`🚀 Dev server running at http://localhost:${PORT}`);
  console.log(`   GET http://localhost:${PORT}/api/health`);
  console.log(`   GET http://localhost:${PORT}/api/deployments`);
  console.log(`   GET http://localhost:${PORT}/api/deployments/{serviceId}`);
});
