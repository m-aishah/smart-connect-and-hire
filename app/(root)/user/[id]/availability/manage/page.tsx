import { notFound, redirect } from 'next/navigation';
import { client } from "@/sanity/lib/client";
import ManageAvailability from '@/components/ManageAvailability';
import { getSession } from "@/lib/actions/auth";


async function getUser(userId: string) {
  return await client.fetch(
    `*[_type == "author" && _id == $userId][0]{
      _id,
      name,
      userType,
      availabilitySettings
    }`,
    { userId }
  );
}

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

async function getCurrentUserId() {
  const session = await getSession();
  if (session)
    return session?.id;
  return null; 
}

export default async function ManageAvailabilityPage({ params }: { params: { id: string } }) {
  const { id } = params;
  
  // Get user data
  const user = await getUser(id);
  console.log(user, id)
  
  // Check if user exists
  if (!user) {
    notFound();
  }
  
  // Get current user ID to check if viewing own profile
  const currentUserId = await getCurrentUserId();
  const isOwnProfile = currentUserId === id;
  
  // Only allow users to manage their own availability
  if (!isOwnProfile) {
    redirect(`/user/${id}`);
  }
  
  // Check if user is a service provider
  if (user.userType !== 'provider') {
    redirect(`/user/${id}`);
  }
  
  // Get availability data
  const availabilitySlots = await getAvailability(id);
  
  return (
    <ManageAvailability
      userId={id}
      availabilitySlots={availabilitySlots}
      availabilitySettings={user.availabilitySettings}
    />
  );
}