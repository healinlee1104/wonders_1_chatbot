import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envVars = {
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      openAIKeyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
      sunnyAssistant: process.env.SUNNY_ASSISTANT_ID || 'NOT_SET',
      sageAssistant: process.env.SAGE_ASSISTANT_ID || 'NOT_SET',
      sparkAssistant: process.env.SPARK_ASSISTANT_ID || 'NOT_SET',
      calmAssistant: process.env.CALM_ASSISTANT_ID || 'NOT_SET',
      buddyAssistant: process.env.BUDDY_ASSISTANT_ID || 'NOT_SET',
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
    };

    return NextResponse.json(envVars);
  } catch (error) {
    return NextResponse.json({ error: 'Debug API error' }, { status: 500 });
  }
} 