import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/write-client";
import { client } from "@/sanity/lib/client";

interface AvailabilitySlot {
  _id?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  recurringWeekly: boolean;
  specificDate?: string;
}

interface AvailabilitySettings {
  bookingNotice: number;
  appointmentDuration: number;
  breakBetweenAppointments: number;
}

interface RequestBody {
  slots: AvailabilitySlot[];
  settings: AvailabilitySettings;
}

// GET handler to fetch availability
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const providerId = context.params.id;

  try {
    // Fetch availability slots for this provider
    const slots = await client.fetch(
      `*[_type == "availability" && provider._ref == $providerId]{
        _id,
        dayOfWeek,
        startTime,
        endTime,
        isAvailable,
        recurringWeekly,
        specificDate
      }`,
      { providerId }
    );

    // Fetch provider's availability settings
    const settings = await client.fetch(
      `*[_type == "author" && _id == $providerId][0].availabilitySettings`,
      { providerId }
    );

    return NextResponse.json({
      slots,
      settings: settings || {
        bookingNotice: 24,
        appointmentDuration: 60,
        breakBetweenAppointments: 15,
      },
    });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}

// POST handler to update availability
export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  const userId = context.params.id;

  try {
    // Get the request body data
    const body: RequestBody = await request.json();
    const { slots, settings } = body;

    // Update user's availability settings
    await writeClient
      .patch(userId)
      .set({
        availabilitySettings: settings,
      })
      .commit();

    // Get existing availability slots for this provider
    const existingSlots = await writeClient.fetch(
      `*[_type == "availability" && provider._ref == $userId]._id`,
      { userId }
    );

    // Delete existing slots (we'll replace them with new ones)
    const deleteTransaction = writeClient.transaction();
    existingSlots.forEach((id: string) => {
      deleteTransaction.delete(id);
    });
    await deleteTransaction.commit();

    // Create new availability slots
    const createTransaction = writeClient.transaction();
    for (const slot of slots) {
      // Remove _id if it exists since we're creating new documents
      const { _id, ...slotData } = slot;

      createTransaction.create({
        _type: "availability",
        provider: {
          _type: "reference",
          _ref: userId,
        },
        ...slotData,
      });
    }
    await createTransaction.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating availability:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update availability" },
      { status: 500 }
    );
  }
}
