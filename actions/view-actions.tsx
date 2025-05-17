'use server';

import { writeClient } from "@/sanity/lib/write-client";
import { revalidatePath } from "next/cache";

export async function incrementViewCount(id: string) {
  try {
    await writeClient
      .patch(id)
      .setIfMissing({ views: 0 })
      .inc({ views: 1 })
      .commit();
    
    revalidatePath(`/service/${id}`);
    return true;
  } catch (error) {
    console.error("Failed to update view count:", error);
    return false;
  }
}