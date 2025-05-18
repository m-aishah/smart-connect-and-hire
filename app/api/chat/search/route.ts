import { NextRequest, NextResponse } from 'next/server';
import openai from '@/lib/openrouter'; // Using your existing OpenAI client

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  try {
    // Use the OpenAI API to analyze the conversational query
    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-3.5-turbo', // Using your configured model
      messages: [
        {
          role: 'system',
          content: `You are a search assistant for "Smart Connect & Hire", a service marketplace in Northern Cyprus (TRNC).
          
          Available service categories:
          - Design & Creative
          - Development & IT
          - Marketing
          - Business
          - Lifestyle
          - Other
          
          Your task is to convert conversational queries about service needs into structured search parameters.
          
          Return a JSON object with these fields:
          - searchTerms: key words for general search (comma-separated)
          - category: one of the service categories listed above (or leave empty if unclear)
          
          Example outputs:
          For "I need someone to build me a website by next week":
          {"searchTerms": "website, web development, fast delivery", "category": "Development & IT"}
          
          For "Looking for a graphic designer who can create a logo":
          {"searchTerms": "logo, graphic design", "category": "Design & Creative"}
          
          Respond ONLY with the JSON object. No additional text.`
        },
        {
          role: 'user',
          content: `Extract search parameters from this request: "${query}"`
        }
      ],
      temperature: 0.3,
      max_tokens: 150,
      response_format: { type: "json_object" } // Ensure JSON response
    });

    // Parse the structured response
    const aiResponse = completion.choices[0].message.content?.trim();
    
    try {
      // Parse the JSON response
      const parsedResponse = JSON.parse(aiResponse || '{}');
      const { searchTerms, category } = parsedResponse;
      
      // Construct the search URL with parameters
      const params = new URLSearchParams();
      
      if (searchTerms) {
        params.set('query', searchTerms);
      }
      
      if (category) {
        // Convert the category name to the value used in your system
        const categoryValue = getCategoryValue(category);
        if (categoryValue) {
          params.set('category', categoryValue);
        }
      }
      
      return NextResponse.json({ 
        searchQuery: searchTerms || query,
        category,
        urlParams: params.toString()
      });
    } catch (error) {
      console.error('Error parsing AI response:', error);
      // Fallback to using the original query
      return NextResponse.json({ searchQuery: query });
    }
  } catch (error) {
    console.error('Error processing conversational search:', error);
    return NextResponse.json({ error: 'Failed to process search query' }, { status: 500 });
  }
}

// Helper function to map user-friendly category names to category values
function getCategoryValue(categoryName: string): string | null {
  const categoryMap: Record<string, string> = {
    'Design & Creative': 'design',
    'Development & IT': 'development',
    'Marketing': 'marketing',
    'Business': 'business',
    'Lifestyle': 'lifestyle',
    'Other': 'other'
  };
  
  // Try exact match first
  if (categoryMap[categoryName]) {
    return categoryMap[categoryName];
  }
  
  // Try case-insensitive partial match
  const lowerCaseName = categoryName.toLowerCase();
  for (const [key, value] of Object.entries(categoryMap)) {
    if (key.toLowerCase().includes(lowerCaseName) || 
        lowerCaseName.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return null;
}