import { searchServices } from "@/utils/searchServices";
import HomeClient from "@/components/HomeClient";
import { SanityLive } from "@/sanity/lib/live";

export default async function Home({
  searchParams,
}: {
  searchParams: { 
    query?: string;
    category?: string;
    page?: string;
  };
}) {
  // Extract search parameters
  const query = (await searchParams)?.query ?? "";
  const category = (await searchParams)?.category;
  const page = parseInt((await searchParams)?.page ?? "1");
  
  try {
    // Fetch services using the updated search function
    const { services, pagination } = await searchServices({
      query,
      category,
      page,
      limit: 12
    });

    return (
      <>
        <HomeClient 
          query={query} 
          services={services} 
          pagination={pagination}
          searchParams={{
            category
          }}
        />
        <SanityLive />
      </>
    );
  } catch (error) {
    console.error("Error fetching services:", error);
    // Fallback in case of error
    return (
      <>
        <HomeClient 
          query={query} 
          services={[]} 
          pagination={{
            total: 0,
            page: 1,
            limit: 12,
            pages: 1
          }}
          searchParams={{
            category
          }}
        />
        <SanityLive />
      </>
    );
  }
}