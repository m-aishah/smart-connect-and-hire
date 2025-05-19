"use server";

import { revalidatePath } from "next/cache";
import { writeClient } from "@/sanity/lib/write-client";

interface UpdateUserParams {
  userId: string;
  name?: string;
  username?: string;
  bio?: string;
  image?: string;
}

export async function updateUser({
  userId,
  name,
  username,
  bio,
  image,
}: UpdateUserParams) {
  try {
    // Prepare the update object with only defined values
    const updates: Record<string, any> = {};
    
    if (name) updates.name = name;
    if (username) updates.username = username;
    if (bio) updates.bio = bio;
    if (image) updates.image = image;
    
    // Only update if there are changes
    if (Object.keys(updates).length === 0) {
      return { success: true, message: "No changes to update" };
    }
    
    // Perform the update in Sanity
    await writeClient
      .patch(userId)
      .set(updates)
      .commit();
    
    // Revalidate the path to refresh data
    revalidatePath(`/user/${userId}`);
    
    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, message: "Failed to update profile" };
  }
}