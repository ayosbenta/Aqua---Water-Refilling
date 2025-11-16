
import React from 'react';
import { Booking, Page } from '../types';
import BookingCard from '../components/BookingCard';

interface UserDashboardProps {
  bookings: Booking[];
  navigateTo: (page: Page) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ bookings, navigateTo }) => {
  const currentBookings = bookings.filter(b => b.status !== 'Completed' && b.status !== 'Cancelled');
  const pastBookings = bookings.filter(b => b.status === 'Completed' || b.status === 'Cancelled');

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Bookings</h1>
        <button
          onClick={() => navigateTo(Page.CREATE_BOOKING)}
          className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-all shadow-md transform hover:scale-105"
        >
          Create New Booking
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Current Bookings</h2>
        {currentBookings.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {currentBookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">You have no active bookings.</p>
          </div>
        )}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Booking History</h2>
        {pastBookings.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pastBookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        ) : (
           <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No past bookings yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
