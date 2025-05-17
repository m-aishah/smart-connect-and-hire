import { SERVICES_QUERY } from "@/sanity/lib/queries";
import { sanityFetch, SanityLive } from "@/sanity/lib/live";
import HomeClient from "@/components/HomeClient"; // client-side component

export default async function Home({
  searchParams,
}: {
  searchParams: { query?: string };
}) {
  const query = searchParams?.query ?? "";
  const params = { search: `*${query}*` };


  const { data: services } = await sanityFetch({ query: SERVICES_QUERY, params });

  return (
    <>
      <HomeClient query={query} services={services} />
      <SanityLive />
    </>
  );
}