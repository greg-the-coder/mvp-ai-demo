import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { handler } from '../src/index.mjs';

/**
 * Helper – build a minimal API Gateway proxy event.
 */
function makeEvent(method, path, pathParameters = null) {
  return { httpMethod: method, path, pathParameters, headers: {}, queryStringParameters: {} };
}

// ────────────────────────────────────────────
// Health endpoint
// ────────────────────────────────────────────
describe('GET /api/health', () => {
  it('returns 200 with status "ok"', async () => {
    const res = await handler(makeEvent('GET', '/api/health'));
    assert.equal(res.statusCode, 200);

    const body = JSON.parse(res.body);
    assert.equal(body.status, 'ok');
    assert.ok(body.timestamp, 'should have a timestamp');
    assert.equal(body.version, '1.0.0');
  });
});

// ────────────────────────────────────────────
// Deployments list
// ────────────────────────────────────────────
describe('GET /api/deployments', () => {
  it('returns 200 with 6 services', async () => {
    const res = await handler(makeEvent('GET', '/api/deployments'));
    assert.equal(res.statusCode, 200);

    const body = JSON.parse(res.body);
    assert.ok(Array.isArray(body.services), 'services should be an array');
    assert.equal(body.services.length, 6);
    assert.ok(body.updatedAt, 'should have updatedAt');
  });

  it('contains the expected service ids', async () => {
    const res = await handler(makeEvent('GET', '/api/deployments'));
    const body = JSON.parse(res.body);
    const ids = body.services.map(s => s.id);

    const expected = [
      'api-gateway', 'auth-service', 'user-service',
      'payment-service', 'notification-service', 'search-service'
    ];
    assert.deepStrictEqual(ids, expected);
  });
});

// ────────────────────────────────────────────
// Single deployment by id
// ────────────────────────────────────────────
describe('GET /api/deployments/{serviceId}', () => {
  it('returns 200 with the correct service when using pathParameters', async () => {
    const res = await handler(makeEvent('GET', '/api/deployments/api-gateway', { serviceId: 'api-gateway' }));
    assert.equal(res.statusCode, 200);

    const body = JSON.parse(res.body);
    assert.equal(body.id, 'api-gateway');
    assert.equal(body.name, 'API Gateway');
    assert.ok(body.deployments.development, 'should have development deployment');
    assert.ok(body.deployments.staging, 'should have staging deployment');
    assert.ok(body.deployments.production, 'should have production deployment');
  });

  it('returns 200 parsing serviceId from the path when pathParameters is null', async () => {
    const res = await handler(makeEvent('GET', '/api/deployments/auth-service'));
    assert.equal(res.statusCode, 200);

    const body = JSON.parse(res.body);
    assert.equal(body.id, 'auth-service');
  });

  it('returns 404 for a nonexistent service', async () => {
    const res = await handler(makeEvent('GET', '/api/deployments/nonexistent', { serviceId: 'nonexistent' }));
    assert.equal(res.statusCode, 404);

    const body = JSON.parse(res.body);
    assert.ok(body.error, 'should have an error message');
  });
});

// ────────────────────────────────────────────
// CORS preflight
// ────────────────────────────────────────────
describe('OPTIONS (CORS preflight)', () => {
  it('returns 200 with CORS headers', async () => {
    const res = await handler(makeEvent('OPTIONS', '/api/deployments'));
    assert.equal(res.statusCode, 200);
    assert.equal(res.headers['Access-Control-Allow-Origin'], '*');
    assert.equal(res.headers['Access-Control-Allow-Methods'], 'GET, OPTIONS');
    assert.equal(res.headers['Access-Control-Allow-Headers'], 'Content-Type');
  });
});

// ────────────────────────────────────────────
// Unknown routes
// ────────────────────────────────────────────
describe('Unknown routes', () => {
  it('returns 404 for an unknown path', async () => {
    const res = await handler(makeEvent('GET', '/api/unknown'));
    assert.equal(res.statusCode, 404);

    const body = JSON.parse(res.body);
    assert.equal(body.error, 'Not found');
  });

  it('returns 404 for POST to a known path', async () => {
    const res = await handler(makeEvent('POST', '/api/deployments'));
    assert.equal(res.statusCode, 404);
  });
});

// ────────────────────────────────────────────
// Response header validation
// ────────────────────────────────────────────
describe('Response headers', () => {
  it('includes required headers on every response', async () => {
    const paths = ['/api/health', '/api/deployments', '/api/deployments/api-gateway', '/api/nope'];
    for (const p of paths) {
      const res = await handler(makeEvent('GET', p));
      assert.equal(res.headers['Content-Type'], 'application/json', `Content-Type header for ${p}`);
      assert.equal(res.headers['Access-Control-Allow-Origin'], '*', `CORS origin header for ${p}`);
    }
  });
});
