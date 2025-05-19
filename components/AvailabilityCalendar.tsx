'use client';

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

interface AvailabilitySettings {
  bookingNotice: number;
  appointmentDuration: number;
  breakBetweenAppointments: number;
}

interface AvailabilityCalendarProps {
  availability: Availability[];
  isOwnProfile: boolean;
  userId: string;
  username: string;
  availabilitySettings?: AvailabilitySettings;
}

const AvailabilityCalendar = ({
  availability,
  isOwnProfile,
  userId,
  username,
  availabilitySettings
}: AvailabilityCalendarProps) => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [focusedDay, setFocusedDay] = useState<number | null>(null);
  const [focusedTime, setFocusedTime] = useState<number | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  
  // Days of week mapping
  const daysMap = {
    'monday': 'Monday',
    'tuesday': 'Tuesday',
    'wednesday': 'Wednesday',
    'thursday': 'Thursday',
    'friday': 'Friday',
    'saturday': 'Saturday', 
    'sunday': 'Sunday'
  };

  const daysShortMap = {
    'monday': 'Mon',
    'tuesday': 'Tue',
    'wednesday': 'Wed',
    'thursday': 'Thu',
    'friday': 'Fri',
    'saturday': 'Sat', 
    'sunday': 'Sun'
  };
  
  // Order days of week
  const daysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // Group availability by day of week
  const availabilityByDay = availability.reduce((acc, slot) => {
    const day = slot.dayOfWeek.toLowerCase();
    if (!acc[day]) acc[day] = [];
    acc[day].push(slot);
    return acc;
  }, {} as Record<string, Availability[]>);

  // Get hours as number from time string
  const getHours = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours + minutes / 60;
  };

  // Get dates for current week
  const getWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const diff = currentDay === 0 ? 6 : currentDay - 1; // Adjust to make Monday the first day
    
    const monday = new Date(today);
    monday.setDate(today.getDate() - diff + (currentWeek * 7));
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push(date);
    }
    
    return weekDates;
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
  const isTimeSlotAvailable = (day: string, time: string) => {
    if (!availabilityByDay[day]) return false;
    
    const [hours, minutes] = time.split(':').map(Number);
    const slotHour = hours + minutes / 60;
    
    return availabilityByDay[day].some(slot => {
      const start = getHours(slot.startTime);
      const end = getHours(slot.endTime);
      return slot.isAvailable && slotHour >= start && slotHour < end;
    });
  };

  // Format time for display (12h format)
  const formatDisplayTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}${minutes > 0 ? `:${minutes.toString().padStart(2, '0')}` : ':00'} ${period}`;
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, dayIndex: number, timeIndex: number) => {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        setFocusedDay(Math.min(dayIndex + 1, 6));
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setFocusedDay(Math.max(dayIndex - 1, 0));
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedTime(Math.min(timeIndex + 1, timeSlots.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedTime(Math.max(timeIndex - 1, 0));
        break;
      default:
        break;
    }
  };

  // Focus the cell when focusedDay or focusedTime changes
  useEffect(() => {
    if (focusedDay !== null && focusedTime !== null) {
      const cellId = `cell-${daysOrder[focusedDay]}-${timeSlots[focusedTime].replace(':', '-')}`;
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
      const date = weekDates[index].toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      const availableSlots = timeSlots.filter(time => isTimeSlotAvailable(day, time));
      
      if (availableSlots.length === 0) {
        return `${date}: Not available`;
      }
      
      // Group consecutive time slots
      const groupedSlots = [];
      let currentGroup: string[] = [];
      
      availableSlots.forEach((slot, i) => {
        if (i === 0 || getHours(slot) !== getHours(availableSlots[i-1]) + 0.5) {
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
      
      const timeRanges = groupedSlots.map(group => {
        return `${formatDisplayTime(group[0])} to ${formatDisplayTime(group[group.length - 1].replace(':30', ':59'))}`;
      });
      
      return `${date}: Available from ${timeRanges.join(', ')}`;
    });
    
    return availabilityDescriptions.join('. ');
  };

  if (availability.length === 0) {
    return (
      <div className="text-center py-8" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-purple-700">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
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
  const weekRangeText = `${weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${weekDates[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;

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
        <h2 className="text-lg font-semibold text-purple-900 order-1 sm:order-2" id="calendar-title" aria-live="polite">
          {weekRangeText}
        </h2>
        
        <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-start order-2 sm:order-1">
          <button
            onClick={() => setCurrentWeek(currentWeek - 1)}
            className="px-3 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg text-purple-800 font-medium flex items-center transition-colors focus:ring-2 focus:ring-purple-500 focus:outline-none"
            aria-label={`Previous week, ${new Date(weekDates[0].getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} to ${new Date(weekDates[6].getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Previous
          </button>
          
          <button
            onClick={() => setCurrentWeek(0)}
            className={`px-3 py-2 rounded-lg font-medium flex items-center transition-colors focus:ring-2 focus:ring-purple-500 focus:outline-none ${currentWeek === 0 ? 'bg-purple-200 text-purple-900 cursor-default' : 'bg-purple-100 hover:bg-purple-200 text-purple-800'}`}
            disabled={currentWeek === 0}
            aria-label="Current week"
            aria-pressed={currentWeek === 0}
          >
            Today
          </button>
          
          <button
            onClick={() => setCurrentWeek(currentWeek + 1)}
            className="px-3 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg text-purple-800 font-medium flex items-center transition-colors focus:ring-2 focus:ring-purple-500 focus:outline-none"
            aria-label={`Next week, ${new Date(weekDates[0].getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} to ${new Date(weekDates[6].getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`}
          >
            Next
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-1" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
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
          <div className="sticky top-0 z-10 grid grid-cols-8 bg-purple-100" role="row">
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
                  ${isCurrentWeek && index === currentDayIndex ? 'bg-purple-200' : ''}`}
                role="columnheader"
                aria-label={`${daysMap[day as keyof typeof daysMap]}, ${weekDates[index].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`}
              >
                <div className="text-purple-900 font-semibold">{daysShortMap[day as keyof typeof daysShortMap]}</div>
                <div className="text-xs text-purple-700 mt-1 font-medium">
                  {weekDates[index].toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                </div>
              </div>
            ))}
          </div>
          
          {/* Time slots rows */}
          {timeSlots.map((time, timeIndex) => {
            const isHourMark = time.endsWith(':00');
            return (
              <div 
                key={time} 
                className={`grid grid-cols-8 ${isHourMark ? 'bg-purple-50/40' : ''}`}
                role="row"
              >
                {/* Time label */}
                <div 
                  className={`border-r border-b border-purple-200 p-2 text-right text-xs ${isHourMark ? 'font-medium text-purple-800' : 'text-purple-600'}`}
                  role="rowheader"
                  aria-label={formatDisplayTime(time)}
                >
                  {formatDisplayTime(time)}
                </div>
                
                {/* Availability slots */}
                {daysOrder.map((day, dayIndex) => {
                  const isAvailable = isTimeSlotAvailable(day, time);
                  const isToday = isCurrentWeek && dayIndex === currentDayIndex;
                  const cellId = `cell-${day}-${time.replace(':', '-')}`;
                  
                  return (
                    <div 
                      key={`${day}-${time}`} 
                      id={cellId}
                      className={`border-r border-b border-purple-200 last:border-r-0 p-1 text-center h-10
                        ${isToday ? 'bg-purple-50/50' : ''}
                        ${isAvailable ? 'relative' : ''}`}
                      role="gridcell"
                      aria-label={`${daysMap[day as keyof typeof daysMap]}, ${weekDates[dayIndex].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} at ${formatDisplayTime(time)}: ${isAvailable ? 'Available' : 'Not available'}`}
                      tabIndex={focusedDay === dayIndex && focusedTime === timeIndex ? 0 : -1}
                      onKeyDown={(e) => handleKeyDown(e, dayIndex, timeIndex)}
                      onFocus={() => {
                        setFocusedDay(dayIndex);
                        setFocusedTime(timeIndex);
                      }}
                    >
                      {isAvailable && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-full bg-green-100 rounded-sm flex items-center justify-center">
                            <div className="text-xs font-medium text-green-800">Available</div>
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
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm" aria-label="Calendar legend">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-sm bg-green-100 border border-green-300 mr-2" aria-hidden="true"></div>
          <span className="text-gray-700">Available</span>
        </div>
        {isCurrentWeek && (
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-sm bg-purple-200 mr-2" aria-hidden="true"></div>
            <span className="text-gray-700">Today</span>
          </div>
        )}
      </div>

      {/* Booking Information */}
      {availabilitySettings && (
        <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-200 shadow-sm" aria-labelledby="booking-info-title">
          <h3 id="booking-info-title" className="font-medium text-purple-800 mb-2">Booking Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-purple-100">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-purple-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-purple-600">Booking Notice</div>
                <div className="font-medium text-purple-900">{availabilitySettings.bookingNotice} hours</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-purple-100">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-purple-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-purple-600">Appointment Duration</div>
                <div className="font-medium text-purple-900">{availabilitySettings.appointmentDuration} minutes</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-purple-100">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-purple-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-purple-600">Break Between</div>
                <div className="font-medium text-purple-900">{availabilitySettings.breakBetweenAppointments} minutes</div>
              </div>
            </div>
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