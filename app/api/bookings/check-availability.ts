import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { getSession } from "@/lib/actions/auth";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get("providerId");
    const date = searchParams.get("date");

    if (!providerId || !date) {
      return NextResponse.json(
        { error: "Provider ID and date are required" },
        { status: 400 }
      );
    }

    // Fetch existing bookings for the specific date
    const bookings = await client.fetch(
      `*[_type == "booking" && provider._ref == $providerId && bookingDate == $date && status != "cancelled"] {
        startTime,
        endTime
      }`,
      { providerId, date }
    );

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error checking availability:", error);
    return NextResponse.json(
      { error: "Failed to check availability" },
      { status: 500 }
    );
  }
}