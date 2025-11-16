import React, { useState, useCallback, useMemo } from 'react';
import { Page, User, UserType, Booking, GallonType, TimeSlot } from './types';
import { MOCK_USERS, MOCK_BOOKINGS } from './constants';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CreateBookingPage from './pages/CreateBookingPage';
import Header from './components/Header';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.LANDING);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);

  // Service configuration state
  const [gallonTypes, setGallonTypes] = useState<GallonType[]>(['Slim', 'Round', '5G']);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(['9am–12pm', '1pm–5pm']);
  const [gallonPrice, setGallonPrice] = useState<number>(25);

  const navigateTo = useCallback((page: Page) => {
    setCurrentPage(page);
  }, []);

  const handleLogin = useCallback((usernameOrEmail: string, password: string): boolean => {
    const normalizedInput = usernameOrEmail.toLowerCase();
    
    // Admin Login
    if (normalizedInput === 'admin' && password === 'admin') {
      const adminUser = MOCK_USERS.find(u => u.type === UserType.ADMIN);
      if (adminUser) {
        setCurrentUser(adminUser);
        navigateTo(Page.ADMIN_DASHBOARD);
        return true;
      }
    }

    // User Login
    if (normalizedInput === 'ryanzkey@gmail.com' && password === 'M@y191992') {
      const customerUser = MOCK_USERS.find(u => u.email.toLowerCase() === 'ryanzkey@gmail.com');
      if (customerUser) {
        setCurrentUser(customerUser);
        navigateTo(Page.USER_DASHBOARD);
        return true;
      }
    }
    
    return false; // Login failed
  }, [navigateTo]);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    navigateTo(Page.LANDING);
  }, [navigateTo]);

  const addBooking = (newBooking: Omit<Booking, 'id' | 'status' | 'userId'>) => {
    if (!currentUser) return;
    const booking: Booking = {
      id: `B${Math.random().toString(36).substr(2, 9)}`,
      ...newBooking,
      userId: currentUser.id,
      status: 'Pending',
      price: newBooking.gallonCount * gallonPrice,
    };
    setBookings(prev => [booking, ...prev]);
    navigateTo(Page.USER_DASHBOARD);
  };
  
  const updateBookingStatus = (bookingId: string, status: Booking['status']) => {
    setBookings(prev => prev.map(b => 
        b.id === bookingId 
            ? { 
                ...b, 
                status,
                ...(status === 'Completed' && { completedAt: new Date() })
              } 
            : b
    ));
  };

  // --- Settings Handlers ---
  const addGallonType = (type: GallonType) => {
    if (type && !gallonTypes.includes(type)) {
      setGallonTypes(prev => [...prev, type]);
    }
  };

  const removeGallonType = (type: GallonType) => {
    setGallonTypes(prev => prev.filter(t => t !== type));
  };
  
  const addTimeSlot = (slot: TimeSlot) => {
    if (slot && !timeSlots.includes(slot)) {
      setTimeSlots(prev => [...prev, slot]);
    }
  };

  const removeTimeSlot = (slot: TimeSlot) => {
    setTimeSlots(prev => prev.filter(s => s !== slot));
  };

  const updateGallonPrice = (newPrice: number) => {
    if (newPrice >= 0) {
      setGallonPrice(newPrice);
    }
  };

  const userBookings = useMemo(() => {
    return currentUser ? bookings.filter(b => b.userId === currentUser.id) : [];
  }, [currentUser, bookings]);

  const renderPage = () => {
    switch (currentPage) {
      case Page.LANDING:
        return <LandingPage navigateTo={navigateTo} />;
      case Page.LOGIN:
        return <LoginPage navigateTo={navigateTo} onLogin={handleLogin} />;
      case Page.REGISTER:
        return <RegisterPage navigateTo={navigateTo} />;
      case Page.USER_DASHBOARD:
        return currentUser && <UserDashboard bookings={userBookings} navigateTo={navigateTo} />;
      case Page.ADMIN_DASHBOARD:
        return (
          <AdminDashboard 
            allBookings={bookings} 
            updateBookingStatus={updateBookingStatus} 
            gallonTypes={gallonTypes}
            timeSlots={timeSlots}
            gallonPrice={gallonPrice}
            onAddGallonType={addGallonType}
            onRemoveGallonType={removeGallonType}
            onAddTimeSlot={addTimeSlot}
            onRemoveTimeSlot={removeTimeSlot}
            onUpdateGallonPrice={updateGallonPrice}
          />
        );
      case Page.CREATE_BOOKING:
        return (
          <CreateBookingPage 
            addBooking={addBooking} 
            navigateTo={navigateTo} 
            gallonTypes={gallonTypes}
            timeSlots={timeSlots}
            gallonPrice={gallonPrice}
          />
        );
      default:
        return <LandingPage navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Header
        isLoggedIn={!!currentUser}
        userType={currentUser?.type}
        onLogout={handleLogout}
        navigateTo={navigateTo}
      />
      <main className="pt-16">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;