
import React, { useState, useMemo } from 'react';
import { Booking, BookingStatus, GallonType, TimeSlot, User, UserType } from '../types';
import BookingCard from '../components/BookingCard';
import OverviewDashboard from '../components/OverviewDashboard';
import SettingsPanel from '../components/SettingsPanel';
import PaymentsDashboard from '../components/PaymentsDashboard';

interface AdminDashboardProps {
  allBookings: Booking[];
  users: User[];
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  updateUserType: (id: string, type: UserType) => void;
  gallonTypes: GallonType[];
  timeSlots: TimeSlot[];
  newGallonPrice: number;
  onAddGallonType: (type: GallonType) => void;
  onRemoveGallonType: (typeName: string) => void;
  onAddTimeSlot: (slot: TimeSlot) => void;
  onRemoveTimeSlot: (slot: TimeSlot) => void;
  onUpdateNewGallonPrice: (price: number) => void;
}

type MainTab = 'overview' | 'manage' | 'payments' | 'settings' | 'users';
type ManageTab = 'Pending' | 'Active' | 'Completed' | 'Cancelled';

const MAIN_TABS: { id: MainTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'manage', label: 'Manage Bookings' },
    { id: 'users', label: 'Manage Users' },
    { id: 'payments', label: 'Payments' },
    { id: 'settings', label: 'Settings' },
];

const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
  const { allBookings, updateBookingStatus, users, updateUserType } = props;
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
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
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
      <div className="bg-white p-2 rounded-lg shadow-sm mb-8 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
            <ManageTabButton tabName="Pending" count={allBookings.filter(b => b.status === 'Pending').length} />
            <ManageTabButton tabName="Active" count={allBookings.filter(b => !['Pending', 'Completed', 'Cancelled'].includes(b.status)).length} />
            <ManageTabButton tabName="Completed" count={allBookings.filter(b => b.status === 'Completed').length} />
            <ManageTabButton tabName="Cancelled" count={allBookings.filter(b => b.status === 'Cancelled').length} />
        </div>
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

  const renderUserManagement = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Manage Users</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.filter(u => u.type !== UserType.ADMIN).map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.mobile}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <select
                    value={user.type}
                    onChange={(e) => updateUserType(user.id, e.target.value as UserType)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                  >
                    <option value={UserType.CUSTOMER}>Customer</option>
                    <option value={UserType.RIDER}>Rider</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      {/* Desktop Tabs */}
      <div className="hidden md:block border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {MAIN_TABS.map(tab => (
                 <MainTabButton key={tab.id} tabName={tab.id} label={tab.label} />
            ))}
        </nav>
      </div>
      
      {/* Mobile Dropdown */}
      <div className="md:hidden mb-4">
        <select
            aria-label="Select a tab"
            value={activeMainTab}
            onChange={e => setActiveMainTab(e.target.value as MainTab)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
        >
           {MAIN_TABS.map(tab => (
               <option key={tab.id} value={tab.id}>{tab.label}</option>
           ))}
        </select>
      </div>


      <div className="mt-8">
        {activeMainTab === 'overview' && <OverviewDashboard bookings={allBookings} users={users} />}
        {activeMainTab === 'manage' && renderManageBookings()}
        {activeMainTab === 'users' && renderUserManagement()}
        {activeMainTab === 'payments' && <PaymentsDashboard allBookings={allBookings} users={users} />}
        {activeMainTab === 'settings' && <SettingsPanel {...props} />}
      </div>
    </div>
  );
};

export default AdminDashboard;