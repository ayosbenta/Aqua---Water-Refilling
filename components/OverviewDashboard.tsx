import React, { useMemo, useState } from 'react';
import { Booking, User, BookingStatus } from '../types';
import { ClipboardListIcon, CheckCircleIcon, ClockIcon, CurrencyDollarIcon } from './Icons';
import Pagination from './Pagination';

interface OverviewDashboardProps {
  bookings: Booking[];
  users: User[];
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm flex items-center space-x-4">
    <div className={`p-3 rounded-full ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

const statusBadge: { [key in BookingStatus]: string } = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Accepted: 'bg-blue-100 text-blue-800',
    'Picked Up': 'bg-indigo-100 text-indigo-800',
    Refilled: 'bg-cyan-100 text-cyan-800',
    'Out for Delivery': 'bg-purple-100 text-purple-800',
    Completed: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-800',
};

const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ bookings, users }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const stats = useMemo(() => {
    const completedBookings = bookings.filter(b => b.status === 'Completed');
    const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.price || 0), 0);
    return {
      totalBookings: bookings.length,
      completed: completedBookings.length,
      pending: bookings.filter(b => b.status === 'Pending').length,
      revenue: totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'PHP' }),
    };
  }, [bookings]);
  
  const sortedBookings = useMemo(() => 
    [...bookings].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    [bookings]
  );
  
  const totalPages = Math.ceil(sortedBookings.length / itemsPerPage);
  const currentTransactions = sortedBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  const usersMap = useMemo(() => new Map(users.map(user => [user.id, user.fullName])), [users]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Bookings" value={stats.totalBookings} icon={<ClipboardListIcon className="h-6 w-6 text-blue-600" />} color="bg-blue-100" />
        <StatCard title="Completed Orders" value={stats.completed} icon={<CheckCircleIcon className="h-6 w-6 text-green-600" />} color="bg-green-100" />
        <StatCard title="Pending Requests" value={stats.pending} icon={<ClockIcon className="h-6 w-6 text-yellow-600" />} color="bg-yellow-100" />
        <StatCard title="Total Revenue" value={stats.revenue} icon={<CurrencyDollarIcon className="h-6 w-6 text-indigo-600" />} color="bg-indigo-100" />
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
         <h2 className="text-xl font-semibold text-gray-800 mb-4">Latest Transactions</h2>
         <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gallons</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentTransactions.map(booking => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usersMap.get(booking.userId) || 'Unknown User'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(booking.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.gallonCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(booking.price || 0).toLocaleString('en-US', { style: 'currency', currency: 'PHP' })}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge[booking.status]}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
         </div>
         {totalPages > 1 && (
            <div className="mt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
         )}
      </div>
    </div>
  );
};

export default OverviewDashboard;