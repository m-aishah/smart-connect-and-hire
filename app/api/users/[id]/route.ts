import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { getSession } from "@/lib/actions/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = (await params).id;
    const session = await getSession();
    // Check if the user is authorized (only fetch their own data)
    if (!session || session.id !== userId) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 401 }
      );
    }

    // Fetch user data from Sanity
    const user = await client.fetch(
      `*[_type == "author" && _id == $id][0]{
        _id,
        name,
        username,
        email,
        image,
        bio,
        userType
      }`,
      { id: userId }
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}