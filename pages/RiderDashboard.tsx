
import React, { useMemo } from 'react';
import { Booking, BookingStatus } from '../types';
import BookingCard from '../components/BookingCard';

interface RiderDashboardProps {
  allBookings: Booking[];
  updateBookingStatus: (id: string, status: BookingStatus) => void;
}

const RiderDashboard: React.FC<RiderDashboardProps> = ({ allBookings, updateBookingStatus }) => {
  const assignedBookings = useMemo(() => {
    return allBookings.filter(b => ['Accepted', 'Picked Up', 'Refilled', 'Out for Delivery'].includes(b.status));
  }, [allBookings]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Assigned Deliveries</h1>
        <p className="mt-1 text-gray-600">Here are the active jobs you need to complete.</p>
      </div>

      <div>
        {assignedBookings.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {assignedBookings.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                isAdminView={true}
                onStatusChange={updateBookingStatus}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg shadow-sm">
            <h3 className="text-xl font-medium text-gray-800">No active assignments</h3>
            <p className="text-gray-500 mt-2">Check back later for new jobs.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiderDashboard;