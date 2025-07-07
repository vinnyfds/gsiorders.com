import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/chatbot';

// Mock OpenAI
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn()
      }
    }
  }));
});

const mockOpenAI = require('openai');
const mockCreate = mockOpenAI().chat.completions.create;

describe('/api/chatbot', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock environment variable
    process.env.OPENAI_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
  });

  it('returns chatbot response for valid request', async () => {
    const mockResponse = 'Hello! I can help you with Liquid Heaven products.';
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: mockResponse } }]
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
    expect(mockCreate).toHaveBeenCalledWith({
      model: 'gpt-3.5-turbo',
      messages: expect.arrayContaining([
        { role: 'system', content: expect.stringContaining('Liquid Heaven') },
        { role: 'user', content: 'What CBD products do you recommend?' }
      ]),
      max_tokens: 500,
      temperature: 0.7,
      stream: false
    });
  });

  it('handles streaming requests correctly', async () => {
    const mockStream = (async function* () {
      yield { choices: [{ delta: { content: 'Hello' } }] };
      yield { choices: [{ delta: { content: ' there' } }] };
      yield { choices: [{ delta: { content: '!' } }] };
    })();

    mockCreate.mockResolvedValue(mockStream);

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

    // Mock res.write and res.end
    res.write = jest.fn();
    res.end = jest.fn();

    await handler(req, res);

    expect(mockCreate).toHaveBeenCalledWith({
      model: 'gpt-3.5-turbo',
      messages: expect.arrayContaining([
        { role: 'system', content: expect.stringContaining('Motaquila') },
        { role: 'user', content: 'Tell me about your beverages' }
      ]),
      max_tokens: 500,
      temperature: 0.7,
      stream: true
    });

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache');
    expect(res.setHeader).toHaveBeenCalledWith('Connection', 'keep-alive');
  });

  it('handles streaming with empty chunks', async () => {
    const mockStream = (async function* () {
      yield { choices: [{ delta: {} }] };
      yield { choices: [{ delta: { content: 'Hello' } }] };
      yield { choices: [{ delta: {} }] };
    })();

    mockCreate.mockResolvedValue(mockStream);

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

    expect(res.write).toHaveBeenCalledWith(
      expect.stringContaining('"content":"Hello"')
    );
  });

  it('defaults to liquidheaven brand when not specified', async () => {
    const mockResponse = 'Default response';
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: mockResponse } }]
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
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'Response' } }]
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

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          {
            role: 'system',
            content: expect.stringContaining('Product page for premium tequila')
          }
        ])
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
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Invalid request',
      details: 'userQuestion is required and must be a string'
    });
  });

  it('rejects empty userQuestion', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { userQuestion: '' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Invalid request',
      details: 'userQuestion cannot be empty'
    });
  });

  it('rejects userQuestion that is too long', async () => {
    const longQuestion = 'a'.repeat(1001);
    const { req, res } = createMocks({
      method: 'POST',
      body: { userQuestion: longQuestion }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Invalid request',
      details: 'userQuestion must be 1000 characters or less'
    });
  });

  it('rejects invalid brand type', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { 
        brand: 123,
        userQuestion: 'Hello'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Invalid request',
      details: 'brand must be a string'
    });
  });

  it('rejects invalid pageContext type', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { 
        pageContext: 456,
        userQuestion: 'Hello'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Invalid request',
      details: 'pageContext type must be a string'
    });
  });

  it('handles missing OpenAI API key', async () => {
    delete process.env.OPENAI_API_KEY;

    const { req, res } = createMocks({
      method: 'POST',
      body: { userQuestion: 'Hello' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Chatbot service not configured',
      details: 'OpenAI API key missing'
    });
  });

  it('handles OpenAI rate limit error', async () => {
    mockCreate.mockRejectedValue({
      status: 429,
      message: 'Rate limit exceeded'
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: { userQuestion: 'Hello' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(429);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Rate limit exceeded',
      details: 'Please try again in a few moments'
    });
  });

  it('handles OpenAI authentication error', async () => {
    mockCreate.mockRejectedValue({
      status: 401,
      message: 'Invalid API key'
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: { userQuestion: 'Hello' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Authentication error',
      details: 'OpenAI API key may be invalid'
    });
  });

  it('handles OpenAI bad request error', async () => {
    mockCreate.mockRejectedValue({
      status: 400,
      message: 'Invalid request'
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: { userQuestion: 'Hello' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Invalid request to AI service',
      details: 'Invalid request'
    });
  });

  it('handles OpenAI response without content', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: {} }]
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: { userQuestion: 'Hello' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.response).toBe('I apologize, but I was unable to generate a response. Please try again.');
  });

  it('handles generic OpenAI error', async () => {
    mockCreate.mockRejectedValue(new Error('Network error'));

    const { req, res } = createMocks({
      method: 'POST',
      body: { userQuestion: 'Hello' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Failed to process chatbot request',
      details: 'Network error'
    });
  });

  it('uses correct brand prompt for motaquila', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'Response' } }]
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        brand: 'motaquila',
        userQuestion: 'Tell me about your beverages'
      }
    });

    await handler(req, res);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          {
            role: 'system',
            content: expect.stringContaining('Motaquila')
          }
        ])
      })
    );
  });

  it('uses correct brand prompt for lastgenie', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'Response' } }]
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        brand: 'lastgenie',
        userQuestion: 'Tell me about your products'
      }
    });

    await handler(req, res);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          {
            role: 'system',
            content: expect.stringContaining('Last Genie')
          }
        ])
      })
    );
  });

  it('handles streaming error gracefully', async () => {
    mockCreate.mockRejectedValue(new Error('Streaming error'));

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

    expect(res.write).not.toHaveBeenCalled();
    expect(res.end).not.toHaveBeenCalled();
  });

  it('validates brand parameter correctly', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'Response' } }]
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        brand: 'invalidbrand',
        userQuestion: 'Hello'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.brand).toBe('invalidbrand');
    // Should default to liquidheaven prompt
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          {
            role: 'system',
            content: expect.stringContaining('Liquid Heaven')
          }
        ])
      })
    );
  });
}); 