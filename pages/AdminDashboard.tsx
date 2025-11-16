import React, { useState, useMemo } from 'react';
import { Booking, BookingStatus, GallonType, TimeSlot, User } from '../types';
import BookingCard from '../components/BookingCard';
import OverviewDashboard from '../components/OverviewDashboard';
import SettingsPanel from '../components/SettingsPanel';
import PaymentsDashboard from '../components/PaymentsDashboard';

interface AdminDashboardProps {
  allBookings: Booking[];
  users: User[];
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  gallonTypes: GallonType[];
  timeSlots: TimeSlot[];
  gallonPrice: number;
  newGallonPrice: number;
  onAddGallonType: (type: GallonType) => void;
  onRemoveGallonType: (type: GallonType) => void;
  onAddTimeSlot: (slot: TimeSlot) => void;
  onRemoveTimeSlot: (slot: TimeSlot) => void;
  onUpdateGallonPrice: (price: number) => void;
  onUpdateNewGallonPrice: (price: number) => void;
}

type MainTab = 'overview' | 'manage' | 'payments' | 'settings';
type ManageTab = 'Pending' | 'Active' | 'Completed' | 'Cancelled';

const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
  const { allBookings, updateBookingStatus, users } = props;
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('overview');
  const [activeManageTab, setActiveManageTab] = useState<ManageTab>('Pending');

  const filteredBookings = useMemo(() => {
    switch (activeManageTab) {
      case 'Pending':
        return allBookings.filter(b => b.status === 'Pending');
      case 'Active':
        return allBookings.filter(b => !['Pending', 'Completed', 'Cancelled'].includes(b.status));
      case 'Completed':
        return allBookings.filter(b => b.status === 'Completed');
      case 'Cancelled':
         return allBookings.filter(b => b.status === 'Cancelled');
      default:
        return [];
    }
  }, [allBookings, activeManageTab]);
  
  const MainTabButton: React.FC<{ tabName: MainTab, label: string }> = ({ tabName, label }) => (
    <button
      onClick={() => setActiveMainTab(tabName)}
      className={`px-4 py-2 text-md font-semibold border-b-2 transition-colors ${
        activeMainTab === tabName
          ? 'border-primary text-primary'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
    </button>
  );

  const ManageTabButton: React.FC<{ tabName: ManageTab; count: number }> = ({ tabName, count }) => (
    <button
      onClick={() => setActiveManageTab(tabName)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeManageTab === tabName
          ? 'bg-primary text-white shadow'
          : 'text-gray-600 hover:bg-primary-light hover:text-primary-dark'
      }`}
    >
      {tabName} <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeManageTab === tabName ? 'bg-white text-primary' : 'bg-gray-200 text-gray-700'}`}>{count}</span>
    </button>
  );
  
  const renderManageBookings = () => (
    <>
      <div className="bg-white p-2 rounded-lg shadow-sm mb-8 flex items-center gap-2">
        <ManageTabButton tabName="Pending" count={allBookings.filter(b => b.status === 'Pending').length} />
        <ManageTabButton tabName="Active" count={allBookings.filter(b => !['Pending', 'Completed', 'Cancelled'].includes(b.status)).length} />
        <ManageTabButton tabName="Completed" count={allBookings.filter(b => b.status === 'Completed').length} />
        <ManageTabButton tabName="Cancelled" count={allBookings.filter(b => b.status === 'Cancelled').length} />
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">{activeManageTab} Bookings</h2>
        {filteredBookings.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBookings.map(booking => (
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
            <h3 className="text-xl font-medium text-gray-800">No {activeManageTab.toLowerCase()} bookings</h3>
            <p className="text-gray-500 mt-2">Check back later or switch to another tab.</p>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <MainTabButton tabName="overview" label="Overview" />
            <MainTabButton tabName="manage" label="Manage Bookings" />
            <MainTabButton tabName="payments" label="Payments" />
            <MainTabButton tabName="settings" label="Settings" />
        </nav>
      </div>

      <div className="mt-8">
        {activeMainTab === 'overview' && <OverviewDashboard bookings={allBookings} users={users} />}
        {activeMainTab === 'manage' && renderManageBookings()}
        {activeMainTab === 'payments' && <PaymentsDashboard allBookings={allBookings} users={users} />}
        {activeMainTab === 'settings' && <SettingsPanel {...props} />}
      </div>
    </div>
  );
};

export default AdminDashboard;