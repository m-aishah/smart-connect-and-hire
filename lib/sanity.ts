import { writeClient } from "@/sanity/lib/write-client";

export async function uploadImageToSanity(file: File) {
  try {
    const asset = await writeClient.assets.upload("image", file);
    return asset._id;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}