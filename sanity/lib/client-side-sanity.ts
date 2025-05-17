import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion, token } from "@/sanity/env";

// Create a write client that can be used in client components
export const clientSideWriteClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});

if (!clientSideWriteClient.config().token) {
  throw new Error("Write token not found");
}

// Export a function to handle image uploads from the client side
export async function uploadImageToSanity(file: File) {
  try {
    const asset = await clientSideWriteClient.assets.upload("image", file);
    return asset._id;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}