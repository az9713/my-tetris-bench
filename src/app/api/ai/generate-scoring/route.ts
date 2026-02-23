import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { xai } from '@ai-sdk/xai';
import { getModelById } from '@/ai/providers';
import { SYSTEM_PROMPT, buildInterventionPrompt } from '@/ai/prompt';

function getProvider(provider: string, modelId: string) {
  switch (provider) {
    case 'anthropic': return anthropic(modelId);
    case 'openai': return openai(modelId);
    case 'google': return google(modelId);
    case 'xai': return xai(modelId);
    default: throw new Error(`Unknown provider: ${provider}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { modelId, boardState, currentScore, moveCount } = await request.json();

    const model = getModelById(modelId);
    if (!model) {
      return NextResponse.json({ error: 'Unknown model' }, { status: 400 });
    }

    const userPrompt = buildInterventionPrompt(boardState, currentScore, moveCount);
    const providerModel = getProvider(model.provider, model.modelId);

    const { text } = await generateText({
      model: providerModel,
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      maxOutputTokens: 1024,
      temperature: 0.3,
    });

    return NextResponse.json({ code: text });
  } catch (error) {
    console.error('AI scoring generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate scoring function' },
      { status: 500 }
    );
  }
}
