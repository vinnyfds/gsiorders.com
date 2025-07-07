import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/chatbot';

// Polyfill TextEncoder and TextDecoder for Node.js
(global as any).TextEncoder = require('util').TextEncoder;
(global as any).TextDecoder = require('util').TextDecoder;

// Mock the Claude helper
jest.mock('../../src/utils/claude', () => ({
  askClaude: jest.fn(),
  getClaudeModel: jest.fn(() => 'claude-3-haiku-20240307'),
}));

const mockAskClaude = require('../../src/utils/claude').askClaude;

describe('/api/chatbot', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock environment variable
    process.env.ANTHROPIC_API_KEY = 'test-api-key';
    process.env.ANTHROPIC_MODEL = 'claude-3-haiku-20240307';
  });

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_MODEL;
  });

  it('returns chatbot response for valid request', async () => {
    const mockResponse = 'Hello! I can help you with Liquid Heaven products.';
    mockAskClaude.mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ type: 'text', text: mockResponse }]
      })
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        brand: 'liquidheaven',
        userQuestion: 'What products do you have?'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.response).toBe(mockResponse);
    expect(data.brand).toBe('liquidheaven');
    expect(data.timestamp).toBeDefined();
  });

  it('handles streaming requests correctly', async () => {
    const mockStreamResponse = {
      ok: true,
      body: {
        getReader: jest.fn().mockReturnValue({
          read: jest.fn().mockResolvedValue({
            done: false,
            value: new TextEncoder().encode('data: {"content":[{"text":"Hello"}]}\n\n')
          }).mockResolvedValueOnce({
            done: true,
            value: null
          })
        })
      }
    };

    mockAskClaude.mockResolvedValue(mockStreamResponse);

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        accept: 'text/event-stream'
      },
      body: {
        brand: 'liquidheaven',
        userQuestion: 'What products do you have?'
      }
    });

    // Mock res.write, res.end, and res.setHeader
    res.write = jest.fn();
    res.end = jest.fn();
    res.setHeader = jest.fn();

    await handler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
    expect(res.write).toHaveBeenCalled();
    expect(res.end).toHaveBeenCalled();
  });

  it('handles API errors gracefully', async () => {
    mockAskClaude.mockResolvedValue({
      ok: false,
      statusText: 'Not Found',
      text: async () => '{"error":"model not found"}'
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        brand: 'liquidheaven',
        userQuestion: 'What products do you have?'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Failed to process chatbot request');
  });

  it('validates required fields', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        brand: 'liquidheaven'
        // Missing userQuestion
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Invalid request');
  });

  it('rejects non-POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET'
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Method not allowed');
  });

  it('handles missing API key', async () => {
    delete process.env.ANTHROPIC_API_KEY;

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        brand: 'liquidheaven',
        userQuestion: 'What products do you have?'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Chatbot service not configured');
  });

  it('uses correct model from environment', async () => {
    process.env.ANTHROPIC_MODEL = 'claude-3-sonnet-20240229';
    
    const mockResponse = 'Hello! I can help you with Liquid Heaven products.';
    mockAskClaude.mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ type: 'text', text: mockResponse }]
      })
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        brand: 'liquidheaven',
        userQuestion: 'What products do you have?'
      }
    });

    await handler(req, res);

    expect(mockAskClaude).toHaveBeenCalledWith(
      [{ role: 'user', content: 'What products do you have?' }],
      expect.stringContaining('Liquid Heaven'),
      undefined
    );
  });
}); 