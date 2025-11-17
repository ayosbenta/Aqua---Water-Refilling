import React from 'react';
import { Booking, BookingStatus } from '../types';
import { CalendarIcon, ClockIcon, LocationMarkerIcon, TagIcon, WaterDropIcon, CheckCircleIcon, XCircleIcon, TruckIcon, CurrencyDollarIcon, CreditCardIcon } from './Icons';

interface BookingCardProps {
  booking: Booking;
  isAdminView?: boolean;
  onStatusChange?: (id: string, status: BookingStatus) => void;
}

const statusConfig: { [key in BookingStatus]: { color: string; icon: React.FC<React.SVGProps<SVGSVGElement>> } } = {
    Pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
    Accepted: { color: 'bg-blue-100 text-blue-800', icon: CheckCircleIcon },
    'Picked Up': { color: 'bg-indigo-100 text-indigo-800', icon: TruckIcon },
    Refilled: { color: 'bg-cyan-100 text-cyan-800', icon: WaterDropIcon },
    'Out for Delivery': { color: 'bg-purple-100 text-purple-800', icon: TruckIcon },
    Completed: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
    Cancelled: { color: 'bg-red-100 text-red-800', icon: XCircleIcon },
};

const formatTimeSlot = (timeSlot: string): string => {
  try {
    const date = new Date(timeSlot);
    // This check handles cases where Google Sheets automatically converts a time
    // (like "8:00am") into a full date-time string with a default date.
    if (!isNaN(date.getTime()) && timeSlot.includes('T')) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).replace(' ', '').toLowerCase();
    }
  } catch (error) {
    // Fallback for non-date strings
  }
  return timeSlot; // Return original string for formats like "9am-12pm"
};

const BookingCard: React.FC<BookingCardProps> = ({ booking, isAdminView = false, onStatusChange }) => {
  const { icon: StatusIcon, color } = statusConfig[booking.status];

  const handleAction = (status: BookingStatus) => {
    if (onStatusChange) {
      onStatusChange(booking.id, status);
    }
  };

  const AdminActions: React.FC = () => {
    switch (booking.status) {
      case 'Pending':
        return <button onClick={() => handleAction('Accepted')} className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600">Accept</button>;
      case 'Accepted':
        return <button onClick={() => handleAction('Picked Up')} className="bg-indigo-500 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-600">Mark Picked Up</button>;
      case 'Picked Up':
         return <button onClick={() => handleAction('Refilled')} className="bg-cyan-500 text-white px-3 py-1 rounded-md text-sm hover:bg-cyan-600">Mark Refilled</button>;
      case 'Refilled':
        return booking.deliveryOption ? <button onClick={() => handleAction('Out for Delivery')} className="bg-purple-500 text-white px-3 py-1 rounded-md text-sm hover:bg-purple-600">Out for Delivery</button> : <button onClick={() => handleAction('Completed')} className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600">Mark Completed</button>;
      case 'Out for Delivery':
         return <button onClick={() => handleAction('Completed')} className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600">Mark Completed</button>;
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-primary-dark">Booking ID: {booking.id}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{booking.gallonCount} x {booking.gallonType} (Refill)</p>
            {booking.newGallonPurchaseCount && booking.newGallonPurchaseCount > 0 && (
                 <p className="text-xl font-bold text-gray-700 mt-1">{booking.newGallonPurchaseCount} x New Gallon(s)</p>
            )}
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${color}`}>
            <StatusIcon className="h-4 w-4" />
            {booking.status}
          </div>
        </div>

        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-600">
            <div className="flex items-center gap-3">
              <LocationMarkerIcon className="h-5 w-5 text-gray-400" />
              <span>{booking.pickupAddress}</span>
            </div>
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <span>{new Date(booking.pickupDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-3">
              <ClockIcon className="h-5 w-5 text-gray-400" />
              <span>{formatTimeSlot(booking.timeSlot)}</span>
            </div>
             <div className="flex items-center gap-3">
              <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
              <span>{(booking.price || 0).toLocaleString('en-US', { style: 'currency', currency: 'PHP' })}</span>
            </div>
            <div className="flex items-center gap-3">
              <CreditCardIcon className="h-5 w-5 text-gray-400" />
              <span>{booking.paymentMethod}</span>
            </div>
             {booking.deliveryOption && (
                <div className="flex items-center gap-3">
                    <TruckIcon className="h-5 w-5 text-gray-400" />
                    <span>Return Delivery Included</span>
                </div>
            )}
          </div>
          {booking.notes && (
            <div className="mt-4 flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
              <TagIcon className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
              <p className="text-gray-600">{booking.notes}</p>
            </div>
          )}
        </div>
        
        {isAdminView && booking.status !== 'Completed' && booking.status !== 'Cancelled' && (
          <div className="mt-4 border-t border-gray-200 pt-4 flex justify-end items-center gap-3">
            <AdminActions />
            {booking.status === 'Pending' && <button onClick={() => handleAction('Cancelled')} className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600">Cancel</button>}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
