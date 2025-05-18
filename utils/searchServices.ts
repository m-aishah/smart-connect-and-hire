import { client } from '@/sanity/lib/client';

export type SearchParams = {
  query: string;
  category?: string;
  limit?: number;
  page?: number;
};

/**
 * Advanced search function for services
 * Handles both traditional keyword searches and structured parameters
 * Supports comma-separated search terms
 */
export async function searchServices(params: SearchParams) {
  const {
    query,
    category,
    limit = 12,
    page = 1
  } = params;

  // Calculate pagination
  const offset = (page - 1) * limit;
  
  // Start building the GROQ query
  let groqQuery = `*[_type == "service"`;
  const queryParams: Record<string, any> = {};
  
  // Parse search query and handle comma-separated terms
  if (query && query.trim() !== '') {
    // Split the query by commas and clean up each term
    const searchTerms = query.split(',')
      .map(term => term.trim())
      .filter(term => term.length > 0);
    
    // If we have search terms, build a complex OR filter
    if (searchTerms.length > 0) {
      groqQuery += ` && (`;
      
      // Build search conditions for each term
      const searchConditions = searchTerms.map((term, index) => {
        const paramName = `query${index}`;
        queryParams[paramName] = `*${term}*`;
        
        return `(
          title match $${paramName} ||
          shortDescription match $${paramName} ||
          description match $${paramName} ||
          provider->name match $${paramName}
        )`;
      });
      
      // Join all search conditions with OR
      groqQuery += searchConditions.join(' || ');
      groqQuery += `)`;
    }
  }
  
  // Add category filter if provided
  if (category && category !== 'all') {
    groqQuery += ` && category == $category`;
    queryParams.category = category;
  }
  
  // Close the query conditions
  groqQuery += `]`;
  
  // Add sorting - prioritize most relevant results
  groqQuery += ` | order(_createdAt desc)`;
  
  // Add projection to include related document references
  groqQuery += ` {
    _id,
    _createdAt,
    title,
    shortDescription,
    category,
    pricing,
    "image": image.asset->url,
    "provider": provider->{
      _id,
      name,
      "image": image.asset->url
    },
    views
  }`;
  
  try {
    // Query for paginated results
    const paginatedQuery = `${groqQuery} [${offset}...${offset + limit}]`;
    const results = await client.fetch(paginatedQuery, queryParams);
    
    // Query for total count
    const countQuery = `count(${groqQuery})`;
    const totalCount = await client.fetch(countQuery, queryParams);
    
    return {
      services: results,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    };
  } catch (error) {
    console.error('Error searching services:', error);
    throw error;
  }
}