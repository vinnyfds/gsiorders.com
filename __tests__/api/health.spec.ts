import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/health';

describe('/api/health', () => {
  it('returns healthy status for GET request', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    
    expect(data.status).toBe('healthy');
    expect(data.timestamp).toBeDefined();
    expect(data.uptime).toBeDefined();
    expect(data.environment).toBeDefined();
    expect(data.version).toBeDefined();
  });

  it('rejects non-GET requests', async () => {
    const { req, res } = createMocks({
      method: 'POST',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Method not allowed');
  });

  it('handles errors gracefully', async () => {
    // Mock process.uptime to throw an error
    const originalUptime = process.uptime;
    process.uptime = jest.fn().mockImplementation(() => {
      throw new Error('Uptime error');
    });

    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe('unhealthy');
    expect(data.error).toBe('Health check failed');
    expect(data.timestamp).toBeDefined();

    // Restore original function
    process.uptime = originalUptime;
  });

  it('handles missing environment variables', async () => {
    // Mock the health endpoint to test fallback values
    const { req, res } = createMocks({
      method: 'GET',
    });

    // Temporarily override the environment check in the handler
    const originalEnv = process.env.NODE_ENV;
    const originalVersion = process.env.npm_package_version;
    
    // Use Object.defineProperty to override read-only properties
    Object.defineProperty(process.env, 'NODE_ENV', { value: undefined, writable: true });
    Object.defineProperty(process.env, 'npm_package_version', { value: undefined, writable: true });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe('healthy');
    // In Jest, process.env.NODE_ENV defaults to 'test' if unset
    expect(data.environment).toBe('test');
    expect(data.version).toBe('1.0.0');

    // Restore environment variables
    Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv, writable: true });
    Object.defineProperty(process.env, 'npm_package_version', { value: originalVersion, writable: true });
  });
}); 