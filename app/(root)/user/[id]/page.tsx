import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getSession } from "@/lib/actions/auth";
import { client } from "@/sanity/lib/client";
import { AUTHOR_BY_ID_QUERY } from "@/sanity/lib/queries";

import { ServiceCardSkeleton } from "@/components/ServiceCard";
import ProfileComponent from "@/components/ProfileComponent";
import UserServices from "@/components/UserServices";

export const dynamic = "force-dynamic";

async function getAvailability(userId: string) {
  return await client.fetch(
    `*[_type == "availability" && provider._ref == $userId]{
      _id,
      dayOfWeek,
      startTime,
      endTime,
      isAvailable,
      recurringWeekly,
      specificDate
    }`,
    { userId }
  );
}

async function Page({ params }: { params: { id: string } }) {
  const id = (await params).id;
  const session = await getSession();

  const user = await client.fetch(AUTHOR_BY_ID_QUERY, { id });
  if (!user) return notFound();

  // Fetch availability data
  const availability = await getAvailability(id);

  const isOwnProfile = session?.id === id;
  const isServiceProvider = user.userType === "provider";

  return (
    <ProfileComponent 
      user={user}
      isOwnProfile={isOwnProfile}
      isServiceProvider={isServiceProvider}
      userId={id}
      availability={availability}
    >
      {isServiceProvider && (
        <Suspense fallback={<ServiceCardSkeleton count={3} />}>
          {/* @ts-ignore */}
          {/* UserServices is a server component that will be passed as children */}
          <UserServices id={id} />
        </Suspense>
      )}
    </ProfileComponent>
  );
}

export default Page;