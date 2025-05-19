'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

interface ManageAvailabilityProps {
  userId: string;
  availabilitySlots: AvailabilitySlot[];
  availabilitySettings?: AvailabilitySettings;
}

const ManageAvailability = ({ 
  userId, 
  availabilitySlots = [], 
  availabilitySettings 
}: ManageAvailabilityProps) => {
  const router = useRouter();
  const [slots, setSlots] = useState<AvailabilitySlot[]>(availabilitySlots);
  const [settings, setSettings] = useState<AvailabilitySettings>(availabilitySettings || {
    bookingNotice: 24,
    appointmentDuration: 60,
    breakBetweenAppointments: 15
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: string; content: string }>({ type: '', content: '' });

  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ];

  const handleAddSlot = () => {
    const newSlot: AvailabilitySlot = {
      dayOfWeek: 'monday',
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: true,
      recurringWeekly: true
    };
    
    setSlots([...slots, newSlot]);
  };

  const handleRemoveSlot = (index: number) => {
    const newSlots = [...slots];
    newSlots.splice(index, 1);
    setSlots(newSlots);
  };

  const handleSlotChange = (index: number, field: keyof AvailabilitySlot, value: any) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setSlots(newSlots);
  };

  const handleSettingsChange = (field: keyof AvailabilitySettings, value: number) => {
    setSettings({ ...settings, [field]: value });
  };

  const validateSlots = (): boolean => {
    // Check for overlapping time slots on the same day
    const slotsByDay: Record<string, AvailabilitySlot[]> = {};
    
    for (const slot of slots) {
      const key = slot.recurringWeekly 
        ? slot.dayOfWeek 
        : `${slot.dayOfWeek}-${slot.specificDate}`;
        
      if (!slotsByDay[key]) slotsByDay[key] = [];
      slotsByDay[key].push(slot);
    }
    
    for (const day in slotsByDay) {
      const daySlots = slotsByDay[day];
      if (daySlots.length <= 1) continue;
      
      // Sort by start time
      daySlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
      
      // Check for overlaps
      for (let i = 0; i < daySlots.length - 1; i++) {
        if (daySlots[i].endTime > daySlots[i + 1].startTime) {
          return false;
        }
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSlots()) {
      setMessage({
        type: 'error',
        content: 'You have overlapping time slots. Please fix them before saving.'
      });
      return;
    }
    
    setIsLoading(true);
    setMessage({ type: '', content: '' });
    
    try {
      // Make API call to save availability slots and settings
      const response = await fetch(`/api/availability/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slots,
          settings
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save availability');
      }
      
      setMessage({
        type: 'success',
        content: 'Availability saved successfully!'
      });
      
      // Redirect after short delay
      setTimeout(() => {
        router.push(`/user/${userId}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error saving availability:', error);
      setMessage({
        type: 'error',
        content: 'Failed to save availability. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-purple-900">Manage Your Availability</h1>
        <Link 
          href={`/user/${userId}`}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancel
        </Link>
      </div>
      
      {message.content && (
        <div className={`p-4 mb-6 rounded-lg ${
          message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message.content}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Availability Settings */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-200">
          <h2 className="text-xl font-semibold text-purple-800 mb-4">Availability Settings</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Booking Notice (hours)
              </label>
              <input
                type="number"
                value={settings.bookingNotice}
                onChange={(e) => handleSettingsChange('bookingNotice', parseInt(e.target.value))}
                min="0"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <p className="mt-1 text-xs text-gray-500">
                How many hours in advance bookings must be made
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Appointment Duration (minutes)
              </label>
              <select
                value={settings.appointmentDuration}
                onChange={(e) => handleSettingsChange('appointmentDuration', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
                <option value={120}>120 minutes</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Break Between Appointments
              </label>
              <select
                value={settings.breakBetweenAppointments}
                onChange={(e) => handleSettingsChange('breakBetweenAppointments', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value={0}>None</option>
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Availability Slots */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-purple-800">Availability Time Slots</h2>
            <button 
              type="button"
              onClick={handleAddSlot}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              Add Time Slot
            </button>
          </div>
          
          {slots.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No availability slots added yet. Click &quot;Add Time Slot&quot; to begin.
            </div>
          ) : (
            <div className="space-y-6">
              {slots.map((slot, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex justify-between mb-4">
                    <h3 className="font-medium">Slot #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
                      <select
                        value={slot.dayOfWeek}
                        onChange={(e) => handleSlotChange(index, 'dayOfWeek', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        {daysOfWeek.map((day) => (
                          <option key={day.value} value={day.value}>{day.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => handleSlotChange(index, 'startTime', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => handleSlotChange(index, 'endTime', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`recurringWeekly-${index}`}
                        checked={slot.recurringWeekly}
                        onChange={(e) => handleSlotChange(index, 'recurringWeekly', e.target.checked)}
                        className="h-4 w-4 text-purple-600 rounded"
                      />
                      <label htmlFor={`recurringWeekly-${index}`} className="ml-2 text-sm text-gray-700">
                        Recurring Weekly
                      </label>
                    </div>
                    
                    {!slot.recurringWeekly && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Specific Date</label>
                        <input
                          type="date"
                          value={slot.specificDate || ''}
                          onChange={(e) => handleSlotChange(index, 'specificDate', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          min={new Date().toISOString().split('T')[0]}
                          required={!slot.recurringWeekly}
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`isAvailable-${index}`}
                        checked={slot.isAvailable}
                        onChange={(e) => handleSlotChange(index, 'isAvailable', e.target.checked)}
                        className="h-4 w-4 text-purple-600 rounded"
                      />
                      <label htmlFor={`isAvailable-${index}`} className="ml-2 text-sm text-gray-700">
                        Available (uncheck to block this time)
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-4">
          <Link
            href={`/user/${userId}`}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-2 bg-purple-700 text-white rounded-lg transition-colors ${
              isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-purple-800'
            }`}
          >
            {isLoading ? 'Saving...' : 'Save Availability'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManageAvailability;