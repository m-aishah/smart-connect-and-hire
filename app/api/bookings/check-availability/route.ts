import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

export async function GET(request: Request) {
  // Get the URL from the request
  const url = new URL(request.url);

  // Extract query parameters
  const providerId = url.searchParams.get("providerId");
  const date = url.searchParams.get("date");

  if (!providerId || !date) {
    return NextResponse.json(
      { error: "Provider ID and date are required" },
      { status: 400 }
    );
  }

  try {
    // Fetch existing bookings for this provider on this date
    const bookings = await client.fetch(
      `*[_type == "booking" && provider._ref == $providerId && bookingDate == $date]{
        startTime,
        endTime,
        status
      }`,
      { providerId, date }
    );

    // Filter out canceled bookings
    const activeBookings = bookings.filter(
      (booking: any) => booking.status !== "cancelled"
    );

    return NextResponse.json(activeBookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
