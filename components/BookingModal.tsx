"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Clock, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AvailabilitySlot {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  recurringWeekly: boolean;
  specificDate?: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  serviceName: string;
  providerId: string;
  providerName: string;
}

const days = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
const dayLabel: { [key: string]: string } = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export default function BookingModal({
  isOpen,
  onClose,
  serviceId,
  serviceName,
  providerId,
  providerName,
}: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [availabilitySlots, setAvailabilitySlots] = useState<
    AvailabilitySlot[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [bookingStatus, setBookingStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const fetchExistingBookings = async () => {
    if (!selectedDate || !providerId) return;

    try {
      const bookingDate = selectedDate.toISOString().split("T")[0];
      const response = await fetch(
        `/api/bookings/check-availability?providerId=${providerId}&date=${bookingDate}`
      );

      if (!response.ok) throw new Error("Failed to fetch existing bookings");

      const bookings = await response.json();
      setExistingBookings(bookings);
    } catch (err) {
      console.error("Error fetching existing bookings:", err);
      // If there's an error, just assume no bookings
      setExistingBookings([]);
    }
  };

  // Find available dates (next 7 days)
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  const [existingBookings, setExistingBookings] = useState<
    { startTime: string; endTime: string }[]
  >([]);

  useEffect(() => {
    if (isOpen && providerId) {
      fetchAvailability();
    }
  }, [isOpen, providerId]);

  useEffect(() => {
    if (selectedDate && providerId) {
      fetchExistingBookings();
    }
  }, [selectedDate, providerId]);

  const fetchAvailability = async () => {
    if (!providerId) return;

    setLoading(true);
    setError("");

    try {
      // Fetch the provider's availability
      const response = await fetch(`/api/availability/${providerId}`);

      if (!response.ok) throw new Error("Failed to fetch availability");

      const data = await response.json();
      setAvailabilitySlots(data.slots || []);
    } catch (err) {
      console.error("Error fetching availability:", err);
      setError("Failed to load availability. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setStep(2);
  };

  const handleSlotSelect = (timeSlot: string) => {
    setSelectedSlot(timeSlot);
    setStep(3);
  };

  const handleSubmitBooking = async () => {
    if (!selectedDate || !selectedSlot || !providerId || !serviceId) {
      setError("Please select a date and time slot.");
      return;
    }

    setBookingStatus("loading");

    // Parse the selected time slot
    const [startTime, endTime] = selectedSlot.split(" - ");
    const bookingDate = selectedDate.toISOString().split("T")[0];

    try {
      // Check if the time slot is still available
      const checkResponse = await fetch(
        `/api/bookings/check-availability?providerId=${providerId}&date=${bookingDate}`
      );
      if (!checkResponse.ok) throw new Error("Failed to check availability");

      const existingBookings = await checkResponse.json();

      // Check if the selected time slot overlaps with any existing bookings
      const isSlotTaken = existingBookings.some((booking: any) => {
        const bookingStart = booking.startTime;
        const bookingEnd = booking.endTime;

        // Check for overlap
        return startTime < bookingEnd && endTime > bookingStart;
      });

      if (isSlotTaken) {
        setError(
          "This time slot is no longer available. Please select another time."
        );
        setBookingStatus("error");
        return;
      }

      // Create the booking
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          providerId,
          serviceId,
          bookingDate,
          startTime,
          endTime,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create booking");
      }

      setBookingStatus("success");
      // Reset form after successful submission
      setTimeout(() => {
        setBookingStatus("idle");
        onClose();
        setStep(1);
        setSelectedDate(null);
        setSelectedSlot(null);
        setNotes("");
      }, 2000);
    } catch (err) {
      console.error("Error creating booking:", err);
      setBookingStatus("error");
      setError("Failed to create booking. Please try again.");
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form state
    setTimeout(() => {
      setStep(1);
      setSelectedDate(null);
      setSelectedSlot(null);
      setNotes("");
      setBookingStatus("idle");
    }, 300);
  };

  const getFormattedDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getDayOfWeek = (date: Date) => {
    const dayIndex = date.getDay();
    // Convert 0-6 (Sunday-Saturday) to our day format
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    return dayNames[dayIndex];
  };

  const getAvailableTimeSlots = () => {
    if (!selectedDate) return [];

    const dayOfWeek = getDayOfWeek(selectedDate);
    const dateString = selectedDate.toISOString().split("T")[0];

    // Filter slots that match either the day of week (recurring) or specific date
    const matchingSlots = availabilitySlots.filter((slot) => {
      if (!slot.isAvailable) return false;

      if (slot.recurringWeekly && slot.dayOfWeek === dayOfWeek) {
        return true;
      }

      if (!slot.recurringWeekly && slot.specificDate === dateString) {
        return true;
      }

      return false;
    });

    // Convert slots to time ranges
    const timeSlots = matchingSlots.map(
      (slot) => `${slot.startTime} - ${slot.endTime}`
    );

    // Filter out any slots that conflict with existing bookings
    return timeSlots.filter((timeSlot) => {
      const [slotStart, slotEnd] = timeSlot.split(" - ");

      // Check if this slot overlaps with any existing booking
      return !existingBookings.some((booking) => {
        const bookingStart = booking.startTime;
        const bookingEnd = booking.endTime;

        // Check for overlap
        return slotStart < bookingEnd && slotEnd > bookingStart;
      });
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-purple-900">Book Service</h2>
            <button
              onClick={handleClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>

          {/* Service Info */}
          <div className="mb-6">
            <h3 className="font-medium text-purple-800">{serviceName}</h3>
            <p className="text-sm text-gray-600">Provider: {providerName}</p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-between mb-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-1/3 h-1 rounded-full ${
                  s <= step ? "bg-purple-600" : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading availability...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle size={20} className="text-red-500 mr-2" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Step 1: Select Date */}
          {step === 1 && !loading && (
            <div>
              <h3 className="font-medium mb-4 flex items-center text-purple-800">
                <Calendar size={18} className="mr-2" />
                Select a Date
              </h3>

              <div className="grid grid-cols-3 gap-2">
                {availableDates.map((date) => {
                  const dayOfWeek = getDayOfWeek(date);
                  const hasAvailability = availabilitySlots.some(
                    (slot) => slot.isAvailable && slot.dayOfWeek === dayOfWeek
                  );

                  return (
                    <button
                      key={date.toISOString()}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        hasAvailability
                          ? "border-purple-200 hover:bg-purple-50 cursor-pointer"
                          : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                      }`}
                      onClick={() => hasAvailability && handleDateSelect(date)}
                      disabled={!hasAvailability}
                    >
                      <p className="text-xs text-gray-500">
                        {date.toLocaleDateString("en-US", { weekday: "short" })}
                      </p>
                      <p className="font-medium">{date.getDate()}</p>
                      <p className="text-xs">
                        {date.toLocaleDateString("en-US", { month: "short" })}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Select Time Slot */}
          {step === 2 && selectedDate && (
            <div>
              <button
                onClick={() => setStep(1)}
                className="text-purple-600 hover:text-purple-800 mb-4 flex items-center text-sm"
              >
                ← Back to dates
              </button>

              <h3 className="font-medium mb-2 flex items-center text-purple-800">
                <Clock size={18} className="mr-2" />
                Select a Time Slot
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {getFormattedDate(selectedDate)}
              </p>

              <div className="grid grid-cols-2 gap-2">
                {getAvailableTimeSlots().length > 0 ? (
                  getAvailableTimeSlots().map((slot) => (
                    <button
                      key={slot}
                      className={`p-3 rounded-lg border text-center hover:bg-purple-50 transition-colors ${
                        selectedSlot === slot
                          ? "border-purple-500 bg-purple-50"
                          : "border-purple-200"
                      }`}
                      onClick={() => handleSlotSelect(slot)}
                    >
                      {slot}
                    </button>
                  ))
                ) : (
                  <div className="col-span-2 py-8 text-center text-gray-500">
                    No available time slots for this date.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Confirm Booking */}
          {step === 3 && selectedDate && selectedSlot && (
            <div>
              <button
                onClick={() => setStep(2)}
                className="text-purple-600 hover:text-purple-800 mb-4 flex items-center text-sm"
              >
                ← Back to time slots
              </button>

              <h3 className="font-medium mb-4 text-purple-800">
                Confirm Booking
              </h3>

              <div className="bg-purple-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{serviceName}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Provider:</span>
                  <span className="font-medium">{providerName}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {getFormattedDate(selectedDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{selectedSlot}</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  className="border border-gray-300 rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Any specific requirements or questions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6">
            {step === 3 ? (
              <button
                onClick={handleSubmitBooking}
                disabled={bookingStatus === "loading"}
                className={`w-full py-3 px-4 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors ${
                  bookingStatus === "loading"
                    ? "opacity-70 cursor-not-allowed"
                    : ""
                }`}
              >
                {bookingStatus === "loading"
                  ? "Processing..."
                  : bookingStatus === "success"
                    ? "Booking Confirmed!"
                    : bookingStatus === "error"
                      ? "Try Again"
                      : "Confirm Booking"}
              </button>
            ) : (
              <button
                onClick={handleClose}
                className="w-full py-3 px-4 rounded-lg border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
