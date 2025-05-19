import { notFound } from "next/navigation";
import { SERVICE_BY_ID_QUERY, PLAYLIST_BY_SLUG_QUERY } from "@/sanity/lib/queries";
import { client } from "@/sanity/lib/client";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from 'next/dynamic';

const ServiceClient = dynamic(() => import('@/components/ServiceClient'), {
  loading: () => <div className="flex justify-center py-10"><Skeleton className="h-96 w-full max-w-6xl" /></div>
});

export default async function ServicePage(props: { params: { id: string } }) {
  const { id } = await props.params;

  const [service, playlistResult] = await Promise.all([
    client.fetch(SERVICE_BY_ID_QUERY, { id }),
    client.fetch(PLAYLIST_BY_SLUG_QUERY, { slug: "related-services" }).catch(() => null),
  ]);

  if (!service) return notFound();

  const relatedServices = playlistResult?.select || [];

  const serializedService = JSON.parse(JSON.stringify(service));
  const serializedRelatedServices = JSON.parse(JSON.stringify(relatedServices));

  return (
    <ServiceClient
      service={serializedService}
      relatedServices={serializedRelatedServices}
      id={id}
    />
  );
}
