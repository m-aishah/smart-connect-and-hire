"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface Availability {
  _id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  recurringWeekly: boolean;
  specificDate?: string;
}

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
}

interface AvailabilitySettings {
  bookingNotice: number;
  appointmentDuration: number;
  breakBetweenAppointments: number;
}

interface EnhancedAvailabilityCalendarProps {
  availability: Availability[];
  bookings: Booking[];
  isOwnProfile: boolean;
  isProvider: boolean;
  userId: string;
  username: string;
  availabilitySettings?: AvailabilitySettings;
  onBookSlot?: (date: string, startTime: string, endTime: string) => void;
  onUpdateBooking?: (bookingId: string, status: string) => void;
}

const AvailabilityCalendar = ({
  availability,
  bookings,
  isOwnProfile,
  isProvider,
  userId,
  username,
  availabilitySettings,
  onBookSlot,
  onUpdateBooking,
}: EnhancedAvailabilityCalendarProps) => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [focusedDay, setFocusedDay] = useState<number | null>(null);
  const [focusedTime, setFocusedTime] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    date: string;
    time: string;
  } | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Days of week mapping
  const daysMap = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };

  const daysShortMap = {
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun",
  };

  // Order days of week
  const daysOrder = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  // Group availability by day of week
  const availabilityByDay = availability.reduce(
    (acc, slot) => {
      const day = slot.dayOfWeek.toLowerCase();
      if (!acc[day]) acc[day] = [];
      acc[day].push(slot);
      return acc;
    },
    {} as Record<string, Availability[]>
  );

  // Get hours as number from time string
  const getHours = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours + minutes / 60;
  };

  // Get dates for current week
  const getWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const diff = currentDay === 0 ? 6 : currentDay - 1; // Adjust to make Monday the first day

    const monday = new Date(today);
    monday.setDate(today.getDate() - diff + currentWeek * 7);

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push(date);
    }

    return weekDates;
  };

  // Format date to YYYY-MM-DD
  const formatDateToString = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  // Generate time slots for the calendar (30 minute intervals)
  const getTimeSlots = () => {
    const slots = [];
    // Generate hour slots from 7 AM to 10 PM
    for (let hour = 7; hour < 22; hour++) {
      slots.push(`${hour}:00`);
      slots.push(`${hour}:30`);
    }
    return slots;
  };

  // Check if a time slot is available
  const isTimeSlotAvailable = (
    dayOfWeek: string,
    dateString: string,
    time: string
  ) => {
    if (!availabilityByDay[dayOfWeek]) return false;

    const [hours, minutes] = time.split(":").map(Number);
    const slotHour = hours + minutes / 60;

    // Check if the provider has set this time as available
    const timeIsAvailable = availabilityByDay[dayOfWeek].some((slot) => {
      const start = getHours(slot.startTime);
      const end = getHours(slot.endTime);

      // Check if the time falls within available hours
      const withinHours = slotHour >= start && slotHour < end;

      // If it's a specific date availability, check the date matches
      if (!slot.recurringWeekly && slot.specificDate) {
        return (
          slot.specificDate === dateString && withinHours && slot.isAvailable
        );
      }

      return slot.isAvailable && withinHours && slot.recurringWeekly;
    });

    if (!timeIsAvailable) return false;

    // Check booking notice requirement
    if (availabilitySettings?.bookingNotice) {
      const now = new Date();
      const slotDate = new Date(dateString);
      slotDate.setHours(hours, minutes);

      const hoursDiff = (slotDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (hoursDiff < availabilitySettings.bookingNotice) {
        return false;
      }
    }

    // Now check if there are any bookings at this time
    return !hasBookingAtTime(dateString, time);
  };

  // Check if there's a booking at this time
  const hasBookingAtTime = (dateString: string, time: string): boolean => {
    if (!bookings.length) return false;

    const [hours, minutes] = time.split(":").map(Number);
    const slotTime = hours + minutes / 60;

    return bookings.some((booking) => {
      if (booking.bookingDate !== dateString) return false;
      if (booking.status === "cancelled") return false;

      const bookingStart = getHours(booking.startTime);
      const bookingEnd = getHours(booking.endTime);

      // Check if this slot falls within a booking time
      return slotTime >= bookingStart && slotTime < bookingEnd;
    });
  };

  // Get booking at a specific time
  const getBookingAtTime = (
    dateString: string,
    time: string
  ): Booking | null => {
    if (!bookings.length) return null;

    const [hours, minutes] = time.split(":").map(Number);
    const slotTime = hours + minutes / 60;

    const foundBooking = bookings.find((booking) => {
      if (booking.bookingDate !== dateString) return false;
      if (booking.status === "cancelled") return false;

      const bookingStart = getHours(booking.startTime);
      const bookingEnd = getHours(booking.endTime);

      return slotTime >= bookingStart && slotTime < bookingEnd;
    });

    return foundBooking || null;
  };

  // Calculate the end time based on duration
  const calculateEndTime = (startTime: string): string => {
    if (!availabilitySettings) return startTime; // Default to same time if no settings

    const [hours, minutes] = startTime.split(":").map(Number);
    const duration = availabilitySettings.appointmentDuration;

    let endHours = hours;
    let endMinutes = minutes + duration;

    if (endMinutes >= 60) {
      endHours += Math.floor(endMinutes / 60);
      endMinutes = endMinutes % 60;
    }

    return `${endHours}:${endMinutes.toString().padStart(2, "0")}`;
  };

  // Format time for display (12h format)
  const formatDisplayTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    return `${hours12}${minutes > 0 ? `:${minutes.toString().padStart(2, "0")}` : ":00"} ${period}`;
  };

  // Handle slot selection
  const handleSlotSelect = (date: Date, time: string) => {
    const dateString = formatDateToString(date);

    if (
      selectedSlot &&
      selectedSlot.date === dateString &&
      selectedSlot.time === time
    ) {
      // Deselect if already selected
      setSelectedSlot(null);
    } else {
      setSelectedSlot({ date: dateString, time });

      // If there's a booking handler, calculate the end time and call it
      if (onBookSlot) {
        const endTime = calculateEndTime(time);
        onBookSlot(dateString, time, endTime);
      }
    }
  };

  // Handle booking action (for service providers)
  const handleBookingAction = (booking: Booking, action: string) => {
    if (onUpdateBooking && booking) {
      onUpdateBooking(booking._id, action);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (
    e: React.KeyboardEvent,
    dayIndex: number,
    timeIndex: number
  ) => {
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        setFocusedDay(Math.min(dayIndex + 1, 6));
        break;
      case "ArrowLeft":
        e.preventDefault();
        setFocusedDay(Math.max(dayIndex - 1, 0));
        break;
      case "ArrowDown":
        e.preventDefault();
        setFocusedTime(Math.min(timeIndex + 1, timeSlots.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedTime(Math.max(timeIndex - 1, 0));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        const date = weekDates[dayIndex];
        const time = timeSlots[timeIndex];
        const dateString = formatDateToString(date);

        if (isTimeSlotAvailable(daysOrder[dayIndex], dateString, time)) {
          handleSlotSelect(date, time);
        } else {
          const booking = getBookingAtTime(dateString, time);
          if (booking && isProvider && isOwnProfile) {
            if (booking.status === "pending") {
              handleBookingAction(booking, "confirmed");
            } else if (booking.status === "confirmed") {
              handleBookingAction(booking, "completed");
            }
          }
        }
        break;
      default:
        break;
    }
  };

  // Focus the cell when focusedDay or focusedTime changes
  useEffect(() => {
    if (focusedDay !== null && focusedTime !== null) {
      const cellId = `cell-${daysOrder[focusedDay]}-${timeSlots[focusedTime].replace(":", "-")}`;
      const cell = document.getElementById(cellId);
      cell?.focus();
    }
  }, [focusedDay, focusedTime]);

  // Time slots for the calendar
  const timeSlots = getTimeSlots();
  const weekDates = getWeekDates();

  // Get today's date to highlight the current day
  const today = new Date();
  const currentDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1; // Adjust to make Monday index 0
  const isCurrentWeek = currentWeek === 0;

  // For screen readers - create a text description of availability
  const getAvailabilityDescription = () => {
    const availabilityDescriptions = daysOrder.map((day, index) => {
      const date = weekDates[index];
      const dateString = formatDateToString(date);
      const dateDisplay = date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });

      const availableSlots = timeSlots.filter((time) =>
        isTimeSlotAvailable(day, dateString, time)
      );

      if (availableSlots.length === 0) {
        return `${dateDisplay}: Not available`;
      }

      // Group consecutive time slots
      const groupedSlots = [];
      let currentGroup: string[] = [];

      availableSlots.forEach((slot, i) => {
        if (
          i === 0 ||
          getHours(slot) !== getHours(availableSlots[i - 1]) + 0.5
        ) {
          if (currentGroup.length > 0) {
            groupedSlots.push(currentGroup);
          }
          currentGroup = [slot];
        } else {
          currentGroup.push(slot);
        }
      });

      if (currentGroup.length > 0) {
        groupedSlots.push(currentGroup);
      }

      const timeRanges = groupedSlots.map((group) => {
        return `${formatDisplayTime(group[0])} to ${formatDisplayTime(group[group.length - 1].replace(":30", ":59"))}`;
      });

      return `${dateDisplay}: Available from ${timeRanges.join(", ")}`;
    });

    return availabilityDescriptions.join(". ");
  };

  if (availability.length === 0) {
    return (
      <div className="text-center py-8" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center"
            aria-hidden="true"
          >
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
            {isOwnProfile
              ? "You haven't set up your availability yet. Click 'Manage Availability' to get started."
              : `${username} hasn't set up their availability yet.`}
          </p>
        </div>
      </div>
    );
  }

  // Get week range for accessibility
  const weekRangeText = `${weekDates[0].toLocaleDateString("en-US", { month: "long", day: "numeric" })} - ${weekDates[6].toLocaleDateString("en-US", { month: "long", day: "numeric" })}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col"
      ref={calendarRef}
    >
      {/* For screen readers - accessibility description */}
      <div className="sr-only" aria-live="polite">
        <h2>Availability calendar for the week of {weekRangeText}</h2>
        <p>{getAvailabilityDescription()}</p>
      </div>

      {/* Week navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
        <h2
          className="text-lg font-semibold text-purple-900 order-1 sm:order-2"
          id="calendar-title"
          aria-live="polite"
        >
          {weekRangeText}
        </h2>

        <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-start order-2 sm:order-1">
          <button
            onClick={() => setCurrentWeek(currentWeek - 1)}
            className="px-3 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg text-purple-800 font-medium flex items-center transition-colors focus:ring-2 focus:ring-purple-500 focus:outline-none"
            aria-label={`Previous week, ${new Date(weekDates[0].getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric" })} to ${new Date(weekDates[6].getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric" })}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4 mr-1"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
            Previous
          </button>

          <button
            onClick={() => setCurrentWeek(0)}
            className={`px-3 py-2 rounded-lg font-medium flex items-center transition-colors focus:ring-2 focus:ring-purple-500 focus:outline-none ${currentWeek === 0 ? "bg-purple-200 text-purple-900 cursor-default" : "bg-purple-100 hover:bg-purple-200 text-purple-800"}`}
            disabled={currentWeek === 0}
            aria-label="Current week"
            aria-pressed={currentWeek === 0}
          >
            Today
          </button>

          <button
            onClick={() => setCurrentWeek(currentWeek + 1)}
            className="px-3 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg text-purple-800 font-medium flex items-center transition-colors focus:ring-2 focus:ring-purple-500 focus:outline-none"
            aria-label={`Next week, ${new Date(weekDates[0].getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric" })} to ${new Date(weekDates[6].getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric" })}`}
          >
            Next
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4 ml-1"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar view */}
      <div
        className="relative overflow-x-auto rounded-xl border border-purple-200 shadow-sm"
        role="grid"
        aria-labelledby="calendar-title"
      >
        <div className="min-w-full">
          <div
            className="sticky top-0 z-10 grid grid-cols-8 bg-purple-100"
            role="row"
          >
            {/* Empty top-left cell */}
            <div
              className="border-r border-b border-purple-200 w-20 p-3 text-right text-sm font-medium text-purple-800"
              role="columnheader"
              aria-label="Time column"
            >
              Time
            </div>

            {/* Days of the week headers */}
            {daysOrder.map((day, index) => (
              <div
                key={day}
                className={`p-3 text-center font-medium border-b border-r border-purple-200 last:border-r-0 
                  ${isCurrentWeek && index === currentDayIndex ? "bg-purple-200" : ""}`}
                role="columnheader"
                aria-label={`${daysMap[day as keyof typeof daysMap]}, ${weekDates[index].toLocaleDateString("en-US", { month: "long", day: "numeric" })}`}
              >
                <div className="text-purple-900 font-semibold">
                  {daysShortMap[day as keyof typeof daysShortMap]}
                </div>
                <div className="text-xs text-purple-700 mt-1 font-medium">
                  {weekDates[index].toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Time slots rows */}
          {timeSlots.map((time, timeIndex) => {
            const isHourMark = time.endsWith(":00");
            return (
              <div
                key={time}
                className={`grid grid-cols-8 ${isHourMark ? "bg-purple-50/40" : ""}`}
                role="row"
              >
                {/* Time label */}
                <div
                  className={`border-r border-b border-purple-200 p-2 text-right text-xs ${isHourMark ? "font-medium text-purple-800" : "text-purple-600"}`}
                  role="rowheader"
                  aria-label={formatDisplayTime(time)}
                >
                  {formatDisplayTime(time)}
                </div>

                {/* Availability slots */}
                {daysOrder.map((day, dayIndex) => {
                  const date = weekDates[dayIndex];
                  const dateString = formatDateToString(date);
                  const isAvailable = isTimeSlotAvailable(
                    day,
                    dateString,
                    time
                  );
                  const isToday = isCurrentWeek && dayIndex === currentDayIndex;
                  const cellId = `cell-${day}-${time.replace(":", "-")}`;
                  const booking = getBookingAtTime(dateString, time);
                  const isSelected =
                    selectedSlot &&
                    selectedSlot.date === dateString &&
                    selectedSlot.time === time;
                  const hasBooking = Boolean(booking);

                  return (
                    <div
                      key={`${day}-${time}`}
                      id={cellId}
                      className={`border-r border-b border-purple-200 last:border-r-0 p-1 text-center h-12
                        ${isToday ? "bg-purple-50/50" : ""}
                        ${isAvailable || hasBooking ? "relative" : ""}`}
                      role="gridcell"
                      aria-label={`${daysMap[day as keyof typeof daysMap]}, ${date.toLocaleDateString("en-US", { month: "long", day: "numeric" })} at ${formatDisplayTime(time)}: ${isAvailable ? "Available" : hasBooking ? `Booked: ${booking.status}` : "Not available"}`}
                      tabIndex={
                        focusedDay === dayIndex && focusedTime === timeIndex
                          ? 0
                          : -1
                      }
                      onKeyDown={(e) => handleKeyDown(e, dayIndex, timeIndex)}
                      onFocus={() => {
                        setFocusedDay(dayIndex);
                        setFocusedTime(timeIndex);
                      }}
                      onClick={() => {
                        if (isAvailable && !isOwnProfile && !isProvider) {
                          handleSlotSelect(date, time);
                        } else if (hasBooking && isProvider && isOwnProfile) {
                          // For providers, they might want to update booking status
                          // Will be handled by the keyboard handler
                        }
                      }}
                    >
                      {isAvailable && !isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-full bg-green-100 rounded-sm flex items-center justify-center hover:bg-green-200 transition-colors">
                            <div className="text-xs font-medium text-green-800">
                              Available
                            </div>
                          </div>
                        </div>
                      )}

                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-full bg-blue-200 rounded-sm flex items-center justify-center border-2 border-blue-500">
                            <div className="text-xs font-medium text-blue-800">
                              Selected
                            </div>
                          </div>
                        </div>
                      )}

                      {hasBooking && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div
                            className={`w-full h-full ${
                              booking?.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : booking?.status === "confirmed"
                                  ? "bg-green-100 text-green-800"
                                  : booking?.status === "completed"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                            } rounded-sm flex items-center justify-center`}
                          >
                            <div className="text-xs font-medium">
                              {booking
                                ? isProvider &&
                                  booking.seeker &&
                                  booking.seeker.name
                                  ? booking.seeker.name
                                  : !isProvider &&
                                      booking.service &&
                                      booking.service.name
                                    ? booking.service.name
                                    : booking.status
                                      ? booking.status.charAt(0).toUpperCase() +
                                        booking.status.slice(1)
                                      : ""
                                : ""}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div
        className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm"
        aria-label="Calendar legend"
      >
        <div className="flex items-center">
          <div
            className="w-4 h-4 rounded-sm bg-green-100 border border-green-300 mr-2"
            aria-hidden="true"
          ></div>
          <span className="text-gray-700">Available</span>
        </div>

        <div className="flex items-center">
          <div
            className="w-4 h-4 rounded-sm bg-blue-200 border border-blue-500 mr-2"
            aria-hidden="true"
          ></div>
          <span className="text-gray-700">Selected</span>
        </div>

        <div className="flex items-center">
          <div
            className="w-4 h-4 rounded-sm bg-yellow-100 border border-yellow-300 mr-2"
            aria-hidden="true"
          ></div>
          <span className="text-gray-700">Pending</span>
        </div>

        <div className="flex items-center">
          <div
            className="w-4 h-4 rounded-sm bg-green-100 border border-green-300 mr-2"
            aria-hidden="true"
          ></div>
          <span className="text-gray-700">Confirmed</span>
        </div>

        <div className="flex items-center">
          <div
            className="w-4 h-4 rounded-sm bg-blue-100 border border-blue-300 mr-2"
            aria-hidden="true"
          ></div>
          <span className="text-gray-700">Completed</span>
        </div>

        {isCurrentWeek && (
          <div className="flex items-center">
            <div
              className="w-4 h-4 rounded-sm bg-purple-200 mr-2"
              aria-hidden="true"
            ></div>
            <span className="text-gray-700">Today</span>
          </div>
        )}
      </div>

      {/* Booking Selection Summary */}
      {selectedSlot && !isOwnProfile && !isProvider && (
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200 shadow-sm">
          <h3 className="font-medium text-blue-800 mb-2">Selected Time Slot</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">
                {new Date(selectedSlot.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}{" "}
                at {formatDisplayTime(selectedSlot.time)}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Duration: {availabilitySettings?.appointmentDuration || 30}{" "}
                minutes
              </p>
            </div>
            <div>
              <button
                onClick={() => setSelectedSlot(null)}
                className="py-2 px-4 bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 rounded-lg text-sm font-medium transition-colors focus:ring-2 focus:ring-blue-400 focus:outline-none"
              >
                Cancel Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Management for Providers */}
      {isOwnProfile && isProvider && bookings.length > 0 && (
        <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-200 shadow-sm">
          <h3 className="font-medium text-purple-800 mb-4">
            Upcoming Bookings
          </h3>
          <div className="space-y-3">
            {bookings
              .filter((booking) =>
                ["pending", "confirmed"].includes(booking.status)
              )
              .sort((a, b) => {
                // Sort by date and then by time
                if (a.bookingDate !== b.bookingDate) {
                  return a.bookingDate > b.bookingDate ? 1 : -1;
                }
                return getHours(a.startTime) - getHours(b.startTime);
              })
              .slice(0, 3) // Show only the next 3 upcoming bookings
              .map((booking) => (
                <div
                  key={booking._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-3 rounded-lg border border-purple-100"
                >
                  <div className="mb-2 sm:mb-0">
                    <div className="font-medium text-purple-900">
                      {booking.seeker.name || "Client"}
                    </div>
                    <div className="text-sm text-purple-700">
                      {new Date(booking.bookingDate).toLocaleDateString(
                        "en-US",
                        { weekday: "short", month: "short", day: "numeric" }
                      )}{" "}
                      • {formatDisplayTime(booking.startTime)} -{" "}
                      {formatDisplayTime(booking.endTime)}
                    </div>
                    <div className="text-xs text-purple-600 mt-1">
                      {booking.service.name || "Service"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    {booking.status === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            handleBookingAction(booking, "confirmed")
                          }
                          className="py-1.5 px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors focus:ring-2 focus:ring-green-500 focus:outline-none flex-1 sm:flex-none"
                          aria-label="Confirm booking"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() =>
                            handleBookingAction(booking, "cancelled")
                          }
                          className="py-1.5 px-3 bg-white hover:bg-red-50 text-red-600 border border-red-300 rounded-lg text-sm font-medium transition-colors focus:ring-2 focus:ring-red-400 focus:outline-none flex-1 sm:flex-none"
                          aria-label="Cancel booking"
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {booking.status === "confirmed" && (
                      <>
                        <button
                          onClick={() =>
                            handleBookingAction(booking, "completed")
                          }
                          className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none flex-1 sm:flex-none"
                          aria-label="Mark as completed"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() =>
                            handleBookingAction(booking, "cancelled")
                          }
                          className="py-1.5 px-3 bg-white hover:bg-red-50 text-red-600 border border-red-300 rounded-lg text-sm font-medium transition-colors focus:ring-2 focus:ring-red-400 focus:outline-none flex-1 sm:flex-none"
                          aria-label="Cancel booking"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}

            {bookings.filter((booking) =>
              ["pending", "confirmed"].includes(booking.status)
            ).length > 3 && (
              <div className="text-center mt-2">
                <button
                  className="text-purple-700 hover:text-purple-900 font-medium text-sm underline focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-2 py-1"
                  aria-label="View all bookings"
                >
                  View all bookings
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Client bookings view */}
      {!isProvider && bookings.length > 0 && (
        <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-200 shadow-sm">
          <h3 className="font-medium text-purple-800 mb-4">
            Your Bookings with {username}
          </h3>
          <div className="space-y-3">
            {bookings
              .filter((booking) =>
                ["pending", "confirmed"].includes(booking.status)
              )
              .sort((a, b) => {
                // Sort by date and then by time
                if (a.bookingDate !== b.bookingDate) {
                  return a.bookingDate > b.bookingDate ? 1 : -1;
                }
                return getHours(a.startTime) - getHours(b.startTime);
              })
              .map((booking) => (
                <div
                  key={booking._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-3 rounded-lg border border-purple-100"
                >
                  <div>
                    <div className="font-medium text-purple-900">
                      {booking.service.name || "Appointment"}
                    </div>
                    <div className="text-sm text-purple-700">
                      {new Date(booking.bookingDate).toLocaleDateString(
                        "en-US",
                        { weekday: "short", month: "short", day: "numeric" }
                      )}{" "}
                      • {formatDisplayTime(booking.startTime)} -{" "}
                      {formatDisplayTime(booking.endTime)}
                    </div>
                    <div
                      className={`text-xs font-medium mt-1 inline-block px-2 py-0.5 rounded-full ${
                        booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : booking.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)}
                    </div>
                  </div>

                  <div className="mt-2 sm:mt-0">
                    <button
                      onClick={() => handleBookingAction(booking, "cancelled")}
                      className="py-1.5 px-3 bg-white hover:bg-red-50 text-red-600 border border-red-300 rounded-lg text-sm font-medium transition-colors focus:ring-2 focus:ring-red-400 focus:outline-none flex-1 sm:flex-none"
                      aria-label="Cancel booking"
                    >
                      Cancel Booking
                    </button>
                  </div>
                </div>
              ))}

            {bookings.filter((booking) => booking.status === "completed")
              .length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-purple-700 mb-2 text-sm">
                  Past Appointments
                </h4>
                <div className="space-y-2">
                  {bookings
                    .filter((booking) => booking.status === "completed")
                    .sort(
                      (a, b) =>
                        new Date(b.bookingDate).getTime() -
                        new Date(a.bookingDate).getTime()
                    )
                    .slice(0, 2) // Show only the 2 most recent completed bookings
                    .map((booking) => (
                      <div
                        key={booking._id}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
                      >
                        <div>
                          <div className="font-medium text-gray-700">
                            {booking.service.name || "Appointment"}
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(booking.bookingDate).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              }
                            )}{" "}
                            • {formatDisplayTime(booking.startTime)} -{" "}
                            {formatDisplayTime(booking.endTime)}
                          </div>
                        </div>
                        <div className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          Completed
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Responsive instructions for small screens */}
      <div className="mt-4 text-xs text-purple-600 sm:hidden text-center">
        Scroll horizontally to view the full calendar
      </div>
    </motion.div>
  );
};

export default AvailabilityCalendar;
