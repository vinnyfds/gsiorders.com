// Claude API helper with environment-based model selection
export const getClaudeModel = (): string => {
  return process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307';
};

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeRequest {
  model: string;
  max_tokens: number;
  temperature: number;
  system: string;
  messages: ClaudeMessage[];
  stream?: boolean;
}

export interface ClaudeContent {
  type: string;
  text: string;
}

export interface ClaudeResponse {
  id: string;
  type: string;
  role: string;
  content: ClaudeContent[];
  model: string;
  stop_reason: string;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export async function askClaude(
  messages: ClaudeMessage[],
  systemPrompt: string,
  shouldStream: boolean = false
): Promise<Response> {
  const body: ClaudeRequest = {
    model: getClaudeModel(),
    max_tokens: 500,
    temperature: 0.7,
    system: systemPrompt,
    messages,
    stream: shouldStream,
  };

  return fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
} 