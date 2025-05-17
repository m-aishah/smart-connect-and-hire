import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.NEXT_OPENROUTER_API_KEY,
  defaultHeaders: {

    'X-Title': 'Smart Connect & Hire',
  },
});

export default openai;
