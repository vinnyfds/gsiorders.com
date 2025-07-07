import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/chatbot';

// Polyfill TextEncoder and TextDecoder for Node.js
(global as any).TextEncoder = require('util').TextEncoder;
(global as any).TextDecoder = require('util').TextDecoder;

// Mock node-fetch
jest.mock('node-fetch', () => {
  return jest.fn();
});

const mockFetch = require('node-fetch');

describe('/api/chatbot', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock environment variable
    process.env.ANTHROPIC_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
  });

  it('returns chatbot response for valid request', async () => {
    const mockResponse = 'Hello! I can help you with Liquid Heaven products.';
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ type: 'text', text: mockResponse }]
      })
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        brand: 'liquidheaven',
        userQuestion: 'What CBD products do you recommend?'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.response).toBe(mockResponse);
    expect(data.brand).toBe('liquidheaven');
    expect(data.timestamp).toBeDefined();
    
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.anthropic.com/v1/messages',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'x-api-key': 'test-api-key',
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        }),
        body: expect.stringContaining('claude-3-sonnet-20240229')
      })
    );
  });

  it('handles streaming requests correctly', async () => {
    // Mock streaming response
    const mockStream = {
      ok: true,
      body: {
        getReader: jest.fn().mockReturnValue({
          read: jest.fn()
            .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('{"content":[{"type":"text","text":"Hello"}]}\n') })
            .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('{"content":[{"type":"text","text":" there"}]}\n') })
            .mockResolvedValueOnce({ done: true, value: new TextEncoder().encode('') })
        })
      }
    };

    mockFetch.mockResolvedValue(mockStream);

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        accept: 'text/event-stream'
      },
      body: {
        brand: 'motaquila',
        userQuestion: 'Tell me about your beverages'
      }
    });

    // Mock res.write, res.end, and res.setHeader
    res.write = jest.fn();
    res.end = jest.fn();
    res.setHeader = jest.fn();

    await handler(req, res);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.anthropic.com/v1/messages',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'x-api-key': 'test-api-key',
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        }),
        body: expect.stringContaining('"stream":true')
      })
    );

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache');
    expect(res.setHeader).toHaveBeenCalledWith('Connection', 'keep-alive');
  });

  it('handles streaming with empty chunks', async () => {
    const mockStream = {
      ok: true,
      body: {
        getReader: jest.fn().mockReturnValue({
          read: jest.fn()
            .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('{"content":[]}\n') })
            .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('{"content":[{"type":"text","text":"Hello"}]}\n') })
            .mockResolvedValueOnce({ done: true, value: new TextEncoder().encode('') })
        })
      }
    };

    mockFetch.mockResolvedValue(mockStream);

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        accept: 'text/event-stream'
      },
      body: {
        userQuestion: 'Hello'
      }
    });

    res.write = jest.fn();
    res.end = jest.fn();
    res.setHeader = jest.fn();

    await handler(req, res);

    expect(res.write).toHaveBeenCalledWith(
      expect.stringContaining('"content":"Hello"')
    );
  });

  it('defaults to liquidheaven brand when not specified', async () => {
    const mockResponse = 'Default response';
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ type: 'text', text: mockResponse }]
      })
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        userQuestion: 'Hello'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.brand).toBe('liquidheaven');
  });

  it('includes page context in system prompt', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ type: 'text', text: 'Response' }]
      })
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        brand: 'motaquila',
        pageContext: 'Product page for premium tequila',
        userQuestion: 'Tell me about this product'
      }
    });

    await handler(req, res);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.anthropic.com/v1/messages',
      expect.objectContaining({
        body: expect.stringContaining('Product page for premium tequila')
      })
    );
  });

  it('rejects invalid method', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      body: { userQuestion: 'Hello' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Method not allowed'
    });
  });

  it('rejects missing userQuestion', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { brand: 'liquidheaven' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Invalid request');
    expect(data.details).toBe('userQuestion cannot be empty');
  });

  it('rejects empty userQuestion', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { userQuestion: '' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Invalid request');
    expect(data.details).toBe('userQuestion cannot be empty');
  });

  it('rejects userQuestion that is too long', async () => {
    const longQuestion = 'a'.repeat(1001);
    const { req, res } = createMocks({
      method: 'POST',
      body: { userQuestion: longQuestion }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Invalid request');
    expect(data.details).toBe('userQuestion must be 1000 characters or less');
  });

  it('rejects invalid brand type', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { 
        userQuestion: 'Hello',
        brand: 123 // Invalid type
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Invalid request');
    expect(data.details).toBe('brand must be a string');
  });

  it('rejects invalid pageContext type', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { 
        userQuestion: 'Hello',
        pageContext: 456 // Invalid type
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Invalid request');
    expect(data.details).toBe('pageContext must be a string');
  });

  it('handles missing API key', async () => {
    delete process.env.ANTHROPIC_API_KEY;

    const { req, res } = createMocks({
      method: 'POST',
      body: { userQuestion: 'Hello' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Chatbot service not configured');
    expect(data.details).toBe('Anthropic Claude API key missing');
  });

  it('handles Anthropic API errors', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      statusText: 'Rate limit exceeded',
      text: async () => 'Rate limit exceeded'
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: { userQuestion: 'Hello' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Failed to process chatbot request');
  });

  it('handles network errors', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { req, res } = createMocks({
      method: 'POST',
      body: { userQuestion: 'Hello' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Failed to process chatbot request');
  });

  it('handles malformed streaming data', async () => {
    const mockStream = {
      ok: true,
      body: {
        getReader: jest.fn().mockReturnValue({
          read: jest.fn()
            .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('invalid json\n') })
            .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('{"content":[{"type":"text","text":"Hello"}]}\n') })
            .mockResolvedValueOnce({ done: true, value: new TextEncoder().encode('') })
        })
      }
    };

    mockFetch.mockResolvedValue(mockStream);

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        accept: 'text/event-stream'
      },
      body: {
        userQuestion: 'Hello'
      }
    });

    res.write = jest.fn();
    res.end = jest.fn();
    res.setHeader = jest.fn();

    await handler(req, res);

    // Should still process valid chunks
    expect(res.write).toHaveBeenCalledWith(
      expect.stringContaining('"content":"Hello"')
    );
  });

  it('handles streaming response with no body', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      statusText: 'No response body',
      text: async () => 'No response body'
    });

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        accept: 'text/event-stream'
      },
      body: {
        userQuestion: 'Hello'
      }
    });

    res.write = jest.fn();
    res.end = jest.fn();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
  });
}); 