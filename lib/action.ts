"use server";

import { revalidatePath } from "next/cache";
import { writeClient } from "@/sanity/lib/write-client";
import { getSession } from "@/lib/actions/auth";

async function uploadImageToSanity(imageFile: File) {
  try {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const asset = await writeClient.assets.upload('image', buffer, {
      filename: imageFile.name,
      contentType: imageFile.type,
    });

    return { success: true, assetId: asset._id };
  } catch (error) {
    console.error("Error uploading image to Sanity:", error);
    return { success: false, error: "Failed to upload image" };
  }
}

export async function createService(prevState: any, formData: FormData, description: string) {
  try {
    const session = await getSession();

    if (!session) {
      return {
        ...prevState,
        error: "Not authenticated",
        status: "ERROR",
      };
    }

    const title = formData.get("title") as string;
    const shortDescription = formData.get("shortDescription") as string;
    const category = formData.get("category") as string;
    const pricing = formData.get("pricing") as string;
    const imageFile = formData.get("image") as File;
    const views = formData.get("views") as string;

    if (!title || !shortDescription || !category || !pricing || !imageFile) {
      return {
        ...prevState,
        error: "Please fill in all required fields",
        status: "ERROR",
      };
    }

    const imageUploadResult = await uploadImageToSanity(imageFile);
    
    if (!imageUploadResult.success) {
      return {
        ...prevState,
        error: "Failed to upload image",
        status: "ERROR",
      };
    }

    console.log("Creating service for provider ID:", session.id);

    const service = await writeClient.create({
      _type: "service",
      title,
      shortDescription,
      category,
      pricing,
      views,
      image: {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: imageUploadResult.assetId
        }
      },
      description,
      provider: {
        _type: "reference",
        _ref: session.id,
      },
      createdAt: new Date().toISOString(),
    });

    revalidatePath("/");

    return {
      ...prevState,
      status: "SUCCESS",
      _id: service._id,
    };
  } catch (error) {
    console.error("Error creating service:", error);
    return {
      ...prevState,
      error: "Failed to create service",
      status: "ERROR",
    };
  }
}