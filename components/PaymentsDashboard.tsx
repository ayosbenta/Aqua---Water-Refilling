import React, { useState, useMemo } from 'react';
import { Booking, User, PaymentMethod } from '../types';
import Pagination from './Pagination';
import { CurrencyDollarIcon, CreditCardIcon, BanknotesIcon } from './Icons';

interface PaymentsDashboardProps {
  allBookings: Booking[];
  users: User[];
}

type TimeFilter = 'Today' | 'Weekly' | 'Monthly';
type PaymentFilter = PaymentMethod | 'All';
const PAYMENT_METHODS: PaymentMethod[] = ['Cash on Delivery', 'Cash', 'GCash'];

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

const PaymentsDashboard: React.FC<PaymentsDashboardProps> = ({ allBookings, users }) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('Today');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const usersMap = useMemo(() => new Map(users.map(user => [user.id, user.fullName])), [users]);

  const timeFilteredBookings = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const weekStart = new Date(todayStart);
    weekStart.setDate(todayStart.getDate() - todayStart.getDay() + (todayStart.getDay() === 0 ? -6 : 1));

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return allBookings.filter(booking => {
      if (booking.status !== 'Completed' || !booking.completedAt) return false;

      const completionDate = new Date(booking.completedAt);
      
      switch (timeFilter) {
        case 'Today':
          return completionDate >= todayStart;
        case 'Weekly':
          return completionDate >= weekStart;
        case 'Monthly':
          return completionDate >= monthStart;
        default:
          return true;
      }
    });
  }, [allBookings, timeFilter]);

  const tableBookings = useMemo(() => {
    if (paymentFilter === 'All') {
      return timeFilteredBookings;
    }
    return timeFilteredBookings.filter(b => b.paymentMethod === paymentFilter);
  }, [timeFilteredBookings, paymentFilter]);

  const stats = useMemo(() => {
    const calculateRevenue = (bookings: Booking[]) => 
      bookings.reduce((sum, b) => sum + (b.price || 0), 0)
        .toLocaleString('en-US', { style: 'currency', currency: 'PHP' });
    
    const paymentStats = PAYMENT_METHODS.map(method => ({
        method,
        revenue: calculateRevenue(timeFilteredBookings.filter(b => b.paymentMethod === method)),
    }));

    return {
      totalRevenue: calculateRevenue(timeFilteredBookings),
      byMethod: paymentStats
    };
  }, [timeFilteredBookings]);

  const totalPages = Math.ceil(tableBookings.length / itemsPerPage);
  const paginatedBookings = tableBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const TimeFilterButton: React.FC<{ label: TimeFilter }> = ({ label }) => (
    <button
      onClick={() => { setTimeFilter(label); setCurrentPage(1); }}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors w-full ${
        timeFilter === label
          ? 'bg-primary text-white shadow'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  const PaymentFilterButton: React.FC<{ label: PaymentFilter }> = ({ label }) => (
    <button
        onClick={() => { setPaymentFilter(label); setCurrentPage(1); }}
        className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
        paymentFilter === label
            ? 'bg-primary-dark text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
    >
        {label}
    </button>
  );

  return (
    <div className="space-y-8">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <BanknotesIcon className="h-8 w-8 text-primary-dark" />
                <h2 className="text-2xl font-bold text-gray-800">Payments Overview</h2>
            </div>
            <div className="bg-gray-100 p-1 rounded-lg flex items-center gap-1 max-w-xs w-full">
                <TimeFilterButton label="Today" />
                <TimeFilterButton label="Weekly" />
                <TimeFilterButton label="Monthly" />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title={`Total Revenue (${timeFilter})`} value={stats.totalRevenue} icon={<CurrencyDollarIcon className="h-6 w-6 text-green-600" />} color="bg-green-100" />
            {stats.byMethod.map(stat => (
                <StatCard 
                    key={stat.method}
                    title={`${stat.method} Revenue`} 
                    value={stat.revenue} 
                    icon={<CreditCardIcon className="h-6 w-6 text-indigo-600" />} 
                    color="bg-indigo-100" 
                />
            ))}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                    {paymentFilter === 'All' ? 'All' : paymentFilter} Transactions ({tableBookings.length})
                </h3>
                <div className="flex items-center gap-2">
                    <PaymentFilterButton label="All" />
                    {PAYMENT_METHODS.map(method => <PaymentFilterButton key={method} label={method} />)}
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedBookings.length > 0 ? paginatedBookings.map(booking => (
                        <tr key={booking.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usersMap.get(booking.userId) || 'Unknown User'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.completedAt ? new Date(booking.completedAt).toLocaleString() : 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{(booking.price || 0).toLocaleString('en-US', { style: 'currency', currency: 'PHP' })}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800`}>
                                {booking.paymentMethod}
                            </span>
                            </td>
                        </tr>
                        )) : (
                          <tr>
                            <td colSpan={5} className="text-center py-10 text-gray-500">
                              No completed transactions match the current filters.
                            </td>
                          </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="mt-4 border-t pt-4">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            )}
        </div>
    </div>
  );
};

export default PaymentsDashboard;