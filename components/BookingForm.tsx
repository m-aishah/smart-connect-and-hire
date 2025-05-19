'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface BookingFormProps {
  providerId: string;
  serviceId: string;
  providerName: string;
  serviceName: string;
  availabilitySettings?: {
    bookingNotice: number;
    appointmentDuration: number;
    breakBetweenAppointments: number;
  };
}

interface Availability {
  _id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  recurringWeekly: boolean;
  specificDate?: string;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  formattedStartTime: string;
  formattedEndTime: string;
  available: boolean;
}

const BookingForm = ({
  providerId,
  serviceId,
  providerName,
  serviceName,
  availabilitySettings,
}: BookingFormProps) => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Fetch provider's availability when component loads
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response = await fetch(`/api/availability/${providerId}`);
        if (!response.ok) throw new Error('Failed to fetch availability');
        const data = await response.json();
        setAvailability(data);
      } catch (error) {
        console.error('Error fetching availability:', error);
        setError('Could not load provider availability. Please try again later.');
      }
    };

    fetchAvailability();
  }, [providerId]);

  // Generate time slots when date is selected
  useEffect(() => {
    if (!selectedDate || !availability.length || !availabilitySettings) return;

    const fetchAvailableTimeSlots = async () => {
      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        const dayOfWeek = format(selectedDate, 'EEEE').toLowerCase();
        
        // Find available hours for the selected day
        const dayAvailability = availability.filter(slot => {
          // Check if it's a recurring weekly slot for this day
          if (slot.recurringWeekly && slot.dayOfWeek.toLowerCase() === dayOfWeek && slot.isAvailable) {
            return true;
          }
          
          // Or check if it's a specific date slot
          if (!slot.recurringWeekly && slot.specificDate === formattedDate && slot.isAvailable) {
            return true;
          }
          
          return false;
        });

        if (dayAvailability.length === 0) {
          setTimeSlots([]);
          return;
        }

        // Fetch existing bookings for this date to check conflicts
        const bookingsResponse = await fetch(`/api/bookings/check-availability?providerId=${providerId}&date=${formattedDate}`);
        if (!bookingsResponse.ok) throw new Error('Failed to check availability');
        const existingBookings = await bookingsResponse.json();
        
        // Generate time slots
        const slots: TimeSlot[] = [];
        const { appointmentDuration, breakBetweenAppointments } = availabilitySettings;
        const slotDuration = appointmentDuration + breakBetweenAppointments;

        dayAvailability.forEach(slot => {
          const [startHour, startMinute] = slot.startTime.split(':').map(Number);
          const [endHour, endMinute] = slot.endTime.split(':').map(Number);
          
          const startTimeMinutes = startHour * 60 + startMinute;
          const endTimeMinutes = endHour * 60 + endMinute;
          
          // Create slots every slotDuration minutes
          for (let timeMinutes = startTimeMinutes; timeMinutes + appointmentDuration <= endTimeMinutes; timeMinutes += slotDuration) {
            const slotStartHour = Math.floor(timeMinutes / 60);
            const slotStartMinute = timeMinutes % 60;
            
            const slotEndHour = Math.floor((timeMinutes + appointmentDuration) / 60);
            const slotEndMinute = (timeMinutes + appointmentDuration) % 60;
            
            const startTime = `${slotStartHour.toString().padStart(2, '0')}:${slotStartMinute.toString().padStart(2, '0')}`;
            const endTime = `${slotEndHour.toString().padStart(2, '0')}:${slotEndMinute.toString().padStart(2, '0')}`;
            
            // Check if this slot conflicts with existing bookings
            const isAvailable = !existingBookings.some((booking: { startTime: string; endTime: string }) => {
              const [bookingStartHour, bookingStartMinute] = booking.startTime.split(':').map(Number);
              const [bookingEndHour, bookingEndMinute] = booking.endTime.split(':').map(Number);
              
              const bookingStartMinutes = bookingStartHour * 60 + bookingStartMinute;
              const bookingEndMinutes = bookingEndHour * 60 + bookingEndMinute;
              
              const slotStartMinutes = slotStartHour * 60 + slotStartMinute;
              const slotEndMinutes = slotEndHour * 60 + slotEndMinute;
              
              // Check for overlap
              return (
                (slotStartMinutes < bookingEndMinutes && slotEndMinutes > bookingStartMinutes) ||
                (bookingStartMinutes < slotEndMinutes && bookingEndMinutes > slotStartMinutes)
              );
            });
            
            // Format times for display (12h format)
            const formattedStartTime = formatTime(startTime);
            const formattedEndTime = formatTime(endTime);
            
            slots.push({
              startTime,
              endTime,
              formattedStartTime,
              formattedEndTime,
              available: isAvailable,
            });
          }
        });
        
        setTimeSlots(slots);
      } catch (error) {
        console.error('Error generating time slots:', error);
        setError('Could not load available time slots. Please try again later.');
        setTimeSlots([]);
      }
    };

    fetchAvailableTimeSlots();
  }, [selectedDate, availability, providerId, availabilitySettings]);

  // Format time for display
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}${minutes > 0 ? `:${minutes.toString().padStart(2, '0')}` : ':00'} ${period}`;
  };

  // Get available dates (disable dates that have no availability)
  const isDateAvailable = (date: Date) => {
    const dayOfWeek = format(date, 'EEEE').toLowerCase();
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    // Check if there's recurring availability for this day
    const hasRecurringAvailability = availability.some(
      slot => slot.recurringWeekly && slot.dayOfWeek.toLowerCase() === dayOfWeek && slot.isAvailable
    );
    
    // Or if there's specific availability for this date
    const hasSpecificAvailability = availability.some(
      slot => !slot.recurringWeekly && slot.specificDate === formattedDate && slot.isAvailable
    );
    
    return hasRecurringAvailability || hasSpecificAvailability;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTimeSlot) {
      setError('Please select both a date and time slot for your booking.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          providerId,
          serviceId,
          bookingDate: formattedDate,
          startTime: selectedTimeSlot.startTime,
          endTime: selectedTimeSlot.endTime,
          notes,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }
      
      setBookingSuccess(true);
      
      // Redirect to bookings page after short delay
      setTimeout(() => {
        router.push('/bookings');
      }, 2000);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      setError(error.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (bookingSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-xl shadow-md border border-green-200 max-w-md mx-auto text-center"
      >
        <div className="w-16 h-16 rounded-full bg-green-100 mx-auto flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-green-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-green-800 mb-2">Booking Successful!</h2>
        <p className="text-green-700 mb-4">
          Your booking has been submitted successfully. You will be redirected to your bookings page.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-md p-6 border border-purple-200 max-w-2xl mx-auto"
    >
      <h2 className="text-2xl font-bold text-purple-900 mb-6">Book Service</h2>
      
      <div className="bg-purple-50 rounded-lg p-4 mb-6">
        <p className="text-purple-800 font-medium">
          You are booking: <span className="font-bold">{serviceName}</span>
        </p>
        <p className="text-purple-700">
          Provider: <span className="font-medium">{providerName}</span>
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="text-red-500 w-5 h-5 mt-0.5 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-600" />
            Select Date
          </label>
          
          <div className="date-picker-container">
            {/* Here you'll need to add your date picker component */}
            {/* For simplicity, I'm using a date input, but you might want to use a more sophisticated component */}
            <input
              type="date"
              className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : null)}
              min={new Date().toISOString().split('T')[0]} // Can't select dates in the past
              required
            />
          </div>
        </div>
        
        {/* Time Slot Selection */}
        {selectedDate && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              Select Time Slot
            </label>
            
            {timeSlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {timeSlots.map((slot, index) => (
                  <button
                    key={`${slot.startTime}-${index}`}
                    type="button"
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      selectedTimeSlot === slot
                        ? 'bg-purple-600 text-white border-purple-700'
                        : slot.available
                        ? 'bg-white border-purple-200 text-purple-800 hover:bg-purple-50'
                        : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    }`}
                    onClick={() => slot.available && setSelectedTimeSlot(slot)}
                    disabled={!slot.available}
                  >
                    <div className="font-medium">{slot.formattedStartTime}</div>
                    <div className="text-xs opacity-80">to {slot.formattedEndTime}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500">No available time slots for the selected date.</p>
              </div>
            )}
          </div>
        )}
        
        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            id="notes"
            rows={4}
            className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            placeholder="Any specific requirements or questions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full py-3 rounded-lg font-medium transition-colors ${
            loading
              ? 'bg-purple-400 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
          disabled={loading || !selectedDate || !selectedTimeSlot}
        >
          {loading ? 'Processing...' : 'Book Appointment'}
        </button>
      </form>
    </motion.div>
  );
};

export default BookingForm;