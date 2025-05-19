import { client } from "@/sanity/lib/client";
import { SERVICES_BY_PROVIDER_QUERY } from "@/sanity/lib/queries";

import ServiceCard, { ServiceCardType } from "@/components/ServiceCard";

const UserServices = async ({ id }: { id: string }) => {
  const posts = await client.fetch(SERVICES_BY_PROVIDER_QUERY, { id: id });

  return (
    <>
      {posts.length > 0 ? (
        posts.map((post: ServiceCardType) => (
          <ServiceCard key={post._id} post={post} />
        ))
      ) : (
        <p className="no-result">No posts yet</p>
      )}
    </>
  );
};

export default UserServices;
