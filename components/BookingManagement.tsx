"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface Booking {
  _id: string;
  seeker: {
    _ref: string;
    name?: string;
  };
  provider: {
    _ref: string;
  };
  service: {
    _ref: string;
    name?: string;
  };
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes?: string;
  createdAt: string;
}

interface BookingManagementProps {
  userId: string;
  isProvider: boolean;
}

const BookingManagement = ({ userId, isProvider }: BookingManagementProps) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch bookings data
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/bookings/${isProvider ? "provider" : "seeker"}/${userId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }

        const data = await response.json();
        setBookings(data.bookings);
      } catch (err) {
        setError("Error loading bookings. Please try again.");
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userId, isProvider]);

  // Update booking status
  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update booking");
      }

      // Update local state
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking._id === bookingId
            ? {
                ...booking,
                status: newStatus as
                  | "pending"
                  | "confirmed"
                  | "completed"
                  | "cancelled",
              }
            : booking
        )
      );

      // Refresh the page data to update the calendar
      router.refresh();

      return true;
    } catch (err) {
      console.error("Error updating booking:", err);
      return false;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Group bookings by date
  const bookingsByDate = bookings.reduce(
    (acc, booking) => {
      const date = booking.bookingDate;
      if (!acc[date]) acc[date] = [];
      acc[date].push(booking);
      return acc;
    },
    {} as Record<string, Booking[]>
  );

  // Sort dates
  const sortedDates = Object.keys(bookingsByDate).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-800 p-4 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto rounded-full bg-purple-100 flex items-center justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8 text-purple-700"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
            />
          </svg>
        </div>
        <p className="text-lg font-medium text-purple-900">
          {isProvider
            ? "You don't have any bookings yet."
            : "You haven't made any bookings yet."}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-semibold text-purple-900">
        {isProvider ? "Your Appointment Requests" : "Your Bookings"}
      </h2>

      {sortedDates.map((date) => (
        <div
          key={date}
          className="rounded-xl border border-purple-200 overflow-hidden"
        >
          <div className="bg-purple-100 px-4 py-3 border-b border-purple-200">
            <h3 className="font-medium text-purple-800">{formatDate(date)}</h3>
          </div>

          <div className="divide-y divide-purple-100">
            {bookingsByDate[date].map((booking) => (
              <div key={booking._id} className="p-4 bg-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : booking.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "completed"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                        }`}
                      >
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </span>
                      <span className="text-sm text-purple-600">
                        {booking.startTime} - {booking.endTime}
                      </span>
                    </div>

                    <h4 className="font-medium text-purple-900">
                      {isProvider
                        ? booking.seeker.name || "Client"
                        : booking.service.name || "Service"}
                    </h4>

                    {booking.notes && (
                      <p className="text-sm text-gray-600 mt-1">
                        {booking.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {isProvider && booking.status === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            updateBookingStatus(booking._id, "confirmed")
                          }
                          className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg text-sm font-medium transition-colors focus:ring-2 focus:ring-green-500 focus:outline-none"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() =>
                            updateBookingStatus(booking._id, "cancelled")
                          }
                          className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm font-medium transition-colors focus:ring-2 focus:ring-red-500 focus:outline-none"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {isProvider && booking.status === "confirmed" && (
                      <button
                        onClick={() =>
                          updateBookingStatus(booking._id, "completed")
                        }
                        className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-sm font-medium transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        Mark Completed
                      </button>
                    )}

                    {!isProvider && booking.status === "pending" && (
                      <button
                        onClick={() =>
                          updateBookingStatus(booking._id, "cancelled")
                        }
                        className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm font-medium transition-colors focus:ring-2 focus:ring-red-500 focus:outline-none"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
};

export default BookingManagement;
