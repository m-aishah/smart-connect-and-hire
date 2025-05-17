import { NextRequest, NextResponse } from 'next/server';
import openai from '@/lib/openrouter';
import { sanityClient } from '@/sanity/lib/client';

export async function POST(req: NextRequest) {
  const body = await req.json();

  // If it's a chat request (has `messages`), handle chat
  if ('messages' in body) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant on a website called "Smart Connect & Hire" that connects people in Northern Cyprus (TRNC) with local service providers such as plumbers, cleaners, electricians, and more.`,
          },
          ...body.messages,
        ],
      });

      return NextResponse.json({ reply: completion.choices[0].message });
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
  }

  // Otherwise assume it's a Sanity update request
  try {
    const updated = await sanityClient.patch(body._id).set(body).commit();
    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update Sanity' }, { status: 500 });
  }
}
