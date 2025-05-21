import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/write-client";
import { getSession } from "@/lib/actions/auth";

interface BookingRequest {
  providerId: string;
  serviceId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const currentUser = session?.id;

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse the request body
    const body: BookingRequest = await request.json();
    const { providerId, serviceId, bookingDate, startTime, endTime, notes } =
      body;

    // Validate required fields
    if (!providerId || !serviceId || !bookingDate || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the booking document in Sanity
    const booking = await writeClient.create({
      _type: "booking",
      seeker: { _type: "reference", _ref: currentUser },
      provider: { _type: "reference", _ref: providerId },
      service: { _type: "reference", _ref: serviceId },
      bookingDate,
      startTime,
      endTime,
      status: "pending",
      notes: notes || "",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
