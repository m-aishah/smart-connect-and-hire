
'use client';

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ReactNode, useState } from "react";
import EditProfileButton from "@/components/EditProfileButton";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";

interface User {
  _id: string;
  name: string;
  username?: string;
  email: string;
  image?: string;
  bio?: string;
  userType: string;
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

interface ProfileComponentProps {
  user: User;
  isOwnProfile: boolean;
  isServiceProvider: boolean;
  userId: string;
  availability?: Availability[];
  children?: ReactNode;
}

const ProfileComponent = ({ 
  user, 
  isOwnProfile, 
  isServiceProvider, 
  userId,
  availability = [],
  children 
}: ProfileComponentProps) => {
  const [activeTab, setActiveTab] = useState('services');
  
  return (
    <section className="bg-purple-50 py-16 px-4 md:px-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="rounded-3xl bg-purple-100/70 shadow-xl border border-purple-200 px-6 py-10 max-w-6xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center border border-purple-200"
          >
            
            <div className="relative w-48 h-48 mb-4">
              <Image
                src={user.image || "/placeholder-profile.png"}
                alt={`${user.name}'s profile`}
                fill
                className="rounded-full object-cover border-4 border-purple-200"
                sizes="(max-width: 768px) 100vw, 192px"
                priority
              />
            </div>

            <p className="text-xl font-bold text-purple-700 mb-4">
              @{user.username || user.name.toLowerCase().replace(/\s+/g, "_")}
            </p>
            
            <div className="bg-purple-50 rounded-xl p-4 w-full mb-4">
              <p className="text-gray-700">
                {user.bio || "No bio available"}
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-2 w-full">
              <div className="flex items-center gap-2 text-sm text-purple-900">
                <span className="font-semibold">User Type:</span> 
                <span className="px-3 py-1 bg-purple-100 rounded-full text-purple-800">
                  {user.userType === "provider" ? "Service Provider" : "Service Seeker"}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold">Email:</span> 
                <span className="text-purple-700">{user.email}</span>
              </div>
            </div>

            {isOwnProfile && (
              <div className="mt-6 w-full">
                <EditProfileButton userId={userId} />
              </div>
            )}
          </motion.div>

          {/* Services & Availability Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2 flex flex-col gap-5"
          >
            {/* Tabs */}
            {isServiceProvider && (
              <div className="flex border-b border-purple-200">
                <button 
                  onClick={() => setActiveTab('services')}
                  className={`px-6 py-3 font-medium text-sm transition-colors ${
                    activeTab === 'services' 
                      ? 'border-b-2 border-purple-700 text-purple-800' 
                      : 'text-gray-600 hover:text-purple-700'
                  }`}
                >
                  Services
                </button>
                <button 
                  onClick={() => setActiveTab('availability')}
                  className={`px-6 py-3 font-medium text-sm transition-colors ${
                    activeTab === 'availability' 
                      ? 'border-b-2 border-purple-700 text-purple-800' 
                      : 'text-gray-600 hover:text-purple-700'
                  }`}
                >
                  Availability Calendar
                </button>
              </div>
            )}

            {/* Services Tab */}
            {(activeTab === 'services' || !isServiceProvider) && (
              <>
                <div className="flex justify-between items-center rounded-xl p-4 border border-purple-200 shadow-sm">
                  <h2 className="text-2xl font-bold text-purple-900">
                    {isOwnProfile ? "Your" : `${user.name}'s`} Services
                  </h2>
                  
                  {isOwnProfile && isServiceProvider && (
                    <Link 
                      href="/service/create" 
                      className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-medium rounded-xl transition-colors"
                    >
                      Add New Service
                    </Link>
                  )}
                </div>

                {isServiceProvider ? (
                  <div className="bg-white rounded-xl p-6 border border-purple-200 shadow-sm">
                    {children}
                  </div>
                ) : (
                  <div className="bg-white p-10 rounded-xl text-center border border-purple-200 shadow-sm">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-purple-700">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </div>
                      <p className="text-lg font-medium text-purple-900">
                        This user is a service seeker and does not provide any services.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Availability Tab */}
            {activeTab === 'availability' && isServiceProvider && (
              <>
                <div className="flex justify-between items-center rounded-xl p-4 border border-purple-200 shadow-sm">
                  <h2 className="text-2xl font-bold text-purple-900">
                    {isOwnProfile ? "Your" : `${user.name}'s`} Availability
                  </h2>
                  
                  {isOwnProfile && (
                    <Link 
                      href={`/user/${userId}/availability/manage`}
                      className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-medium rounded-xl transition-colors"
                    >
                      Manage Availability
                    </Link>
                  )}
                </div>

                <div className="bg-white rounded-xl p-6 border border-purple-200 shadow-sm">
                  <AvailabilityCalendar 
                    availability={availability} 
                    isOwnProfile={isOwnProfile} 
                    userId={userId}
                    username={user.name}
                    availabilitySettings={user.availabilitySettings}
                  />
                </div>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default ProfileComponent;