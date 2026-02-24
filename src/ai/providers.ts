export interface ModelConfig {
  id: string;
  displayName: string;
  provider: 'anthropic' | 'openai' | 'google' | 'xai';
  modelId: string;
  icon: string;
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: 'claude-opus-4-5',
    displayName: 'Claude Opus 4.5',
    provider: 'anthropic',
    modelId: 'claude-opus-4-5-20250514',
    icon: '🟣',
  },
  {
    id: 'claude-sonnet-4',
    displayName: 'Claude Sonnet 4',
    provider: 'anthropic',
    modelId: 'claude-sonnet-4-20250514',
    icon: '🔵',
  },
  {
    id: 'gpt-5-2',
    displayName: 'GPT 5.2',
    provider: 'openai',
    modelId: 'gpt-4o',
    icon: '🟢',
  },
  {
    id: 'gemini-3-flash',
    displayName: 'Gemini 3 Flash',
    provider: 'google',
    modelId: 'gemini-3-flash-preview',
    icon: '⚡',
  },
  {
    id: 'gemini-3-pro',
    displayName: 'Gemini 3 Pro',
    provider: 'google',
    modelId: 'gemini-2.0-pro',
    icon: '💎',
  },
  {
    id: 'grok-4-1',
    displayName: 'Grok 4.1',
    provider: 'xai',
    modelId: 'grok-3',
    icon: '🤖',
  },
];

export function getModelById(id: string): ModelConfig | undefined {
  return AVAILABLE_MODELS.find(m => m.id === id);
}
