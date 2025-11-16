
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Page, User, UserType, Booking, GallonType, TimeSlot } from './types';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import RiderDashboard from './pages/RiderDashboard';
import CreateBookingPage from './pages/CreateBookingPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Header from './components/Header';

// The URL for the Google Apps Script Web App
const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxxRTMd3Lls97b4_XJf1fOoaSF8_J4V_VwCpMuaVUQ2PiHpxNIk96YVTs1Idv1hPk7D/exec';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.LANDING);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // --- State is now managed by fetching from Google Sheets ---
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Password reset state
  const [passwordResetState, setPasswordResetState] = useState<{ email: string | null; code: string | null; }>({ email: null, code: null });

  // Service configuration state
  const [gallonTypes, setGallonTypes] = useState<GallonType[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [gallonPrice, setGallonPrice] = useState<number>(0);
  const [newGallonPrice, setNewGallonPrice] = useState<number>(0);

  useEffect(() => {
    const fetchDataFromSheet = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${APP_SCRIPT_URL}?action=getAllData`);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            const data = await response.json();
            
            setUsers(data.users && Array.isArray(data.users) ? data.users : []);

            if (data.bookings && Array.isArray(data.bookings)) {
                 const formattedBookings = data.bookings.map((b: any) => ({
                    ...b,
                    createdAt: new Date(b.createdAt),
                    completedAt: b.completedAt ? new Date(b.completedAt) : undefined,
                }));
                setBookings(formattedBookings);
            } else {
                setBookings([]);
            }
            
            if (data.settings) {
                setGallonTypes(data.settings.gallonTypes || []);
                setTimeSlots(data.settings.timeSlots || []);
                setGallonPrice(data.settings.gallonPrice || 25);
                setNewGallonPrice(data.settings.newGallonPrice || 150);
            } else {
                 console.warn("No 'settings' object in fetched data, using default settings.");
                 setGallonTypes(['Slim', 'Round', '5G']);
                 setTimeSlots(['9am–12pm', '1pm–5pm']);
                 setGallonPrice(25);
                 setNewGallonPrice(150);
            }

        } catch (error) {
            console.error("Failed to fetch data from Google Sheets. Using empty data and default settings.", error);
            setUsers([]);
            setBookings([]);
            setGallonTypes(['Slim', 'Round', '5G']);
            setTimeSlots(['9am–12pm', '1pm–5pm']);
            setGallonPrice(25);
            setNewGallonPrice(150);
        } finally {
            setIsLoading(false);
        }
    };

    fetchDataFromSheet();
  }, []); // Empty dependency array ensures this runs only once on mount

  const navigateTo = useCallback((page: Page) => {
    setCurrentPage(page);
  }, []);
  
  const sendDataToSheet = async (payload: any, dataType: 'booking' | 'user' | 'settings') => {
    try {
      await fetch(APP_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataType, payload }),
        mode: 'no-cors',
      });
      console.log(`${dataType} data sent to Google Sheets.`);
    } catch (error) {
      console.error(`Failed to send ${dataType} data to Google Sheets:`, error);
    }
  };

  const handleRegister = (newUser: Omit<User, 'id'>) => {
    const user: User = {
      ...newUser,
      id: `U${Date.now().toString(36)}`,
    };
    setUsers(prev => [...prev, user]);
    sendDataToSheet(user, 'user');
    alert('Registration successful! Please log in.');
    navigateTo(Page.LOGIN);
  };

  const handleLogin = useCallback((usernameOrEmail: string, password: string): boolean => {
    const normalizedInput = usernameOrEmail.toLowerCase();
    
    // Special case for hardcoded admin login
    if (normalizedInput === 'admin' && password === 'admin') {
        const adminUser: User = {
            id: 'admin-user',
            fullName: 'Administrator',
            email: 'admin@aquaflow.com',
            mobile: '0000000000',
            password: 'admin',
            type: UserType.ADMIN,
        };
        setCurrentUser(adminUser);
        navigateTo(Page.ADMIN_DASHBOARD);
        return true;
    }

    // Logic for regular users from Google Sheets
    const foundUser = users.find(user =>
        user.email?.toLowerCase() === normalizedInput || user.mobile === normalizedInput
    );

    if (foundUser && foundUser.password === password) {
        setCurrentUser(foundUser);
        if (foundUser.type === UserType.RIDER) navigateTo(Page.RIDER_DASHBOARD);
        else navigateTo(Page.USER_DASHBOARD);
        return true;
    }

    return false;
  }, [navigateTo, users]);
  
  const handleForgotPasswordRequest = (email: string): boolean => {
    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (user) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setPasswordResetState({ email, code });
      alert(`Password reset code for ${email}: ${code}\n(This is a simulation. In a real app, this would be emailed.)`);
      navigateTo(Page.RESET_PASSWORD);
      return true;
    }
    return false;
  };

  const handleResetPassword = async (email: string, code: string, newPassword: string): Promise<boolean> => {
    if (passwordResetState.email === email && passwordResetState.code === code) {
      const userIndex = users.findIndex(u => u.email?.toLowerCase() === email.toLowerCase());
      if (userIndex !== -1) {
        const updatedUser = {
          ...users[userIndex],
          password: newPassword,
        };
        
        const updatedUsers = [...users];
        updatedUsers[userIndex] = updatedUser;
        setUsers(updatedUsers);
        sendDataToSheet(updatedUser, 'user');
        
        alert("Password has been reset successfully. Please log in with your new password.");
        setPasswordResetState({ email: null, code: null });
        navigateTo(Page.LOGIN);
        return true;
      }
    }
    return false;
  };

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    navigateTo(Page.LANDING);
  }, [navigateTo]);

  const addBooking = (newBooking: Omit<Booking, 'id' | 'status' | 'userId'>) => {
    if (!currentUser) return;
    const booking: Booking = {
      id: `B${Date.now().toString(36)}`,
      ...newBooking,
      userId: currentUser.id,
      status: 'Pending',
      price: (newBooking.gallonCount * gallonPrice) + ((newBooking.newGallonPurchaseCount || 0) * newGallonPrice),
    };
    setBookings(prev => [booking, ...prev]);
    sendDataToSheet(booking, 'booking');
    navigateTo(Page.USER_DASHBOARD);
  };
  
  const updateBookingStatus = (bookingId: string, status: Booking['status']) => {
    const bookingToUpdate = bookings.find(b => b.id === bookingId);
    if (!bookingToUpdate) return;
    
    const updatedBooking: Booking = {
      ...bookingToUpdate,
      status,
      ...(status === 'Completed' && { completedAt: new Date() })
    };
    
    setBookings(prev => prev.map(b => (b.id === bookingId ? updatedBooking : b)));
    sendDataToSheet(updatedBooking, 'booking');
  };

  const updateUserType = (userId: string, type: UserType) => {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return;

    const updatedUser = { ...users[userIndex], type };
    const updatedUsers = [...users];
    updatedUsers[userIndex] = updatedUser;

    setUsers(updatedUsers);
    sendDataToSheet(updatedUser, 'user');
  };

  const addGallonType = (type: GallonType) => {
    if (type && !gallonTypes.includes(type)) {
      const newGallonTypes = [...gallonTypes, type];
      setGallonTypes(newGallonTypes);
      sendDataToSheet({ gallonTypes: newGallonTypes, timeSlots, gallonPrice, newGallonPrice }, 'settings');
    }
  };
  const removeGallonType = (type: GallonType) => {
      const newGallonTypes = gallonTypes.filter(t => t !== type);
      setGallonTypes(newGallonTypes);
      sendDataToSheet({ gallonTypes: newGallonTypes, timeSlots, gallonPrice, newGallonPrice }, 'settings');
  };
  const addTimeSlot = (slot: TimeSlot) => {
      if (slot && !timeSlots.includes(slot)) {
          const newTimeSlots = [...timeSlots, slot];
          setTimeSlots(newTimeSlots);
          sendDataToSheet({ gallonTypes, timeSlots: newTimeSlots, gallonPrice, newGallonPrice }, 'settings');
      }
  };
  const removeTimeSlot = (slot: TimeSlot) => {
      const newTimeSlots = timeSlots.filter(s => s !== slot);
      setTimeSlots(newTimeSlots);
      sendDataToSheet({ gallonTypes, timeSlots: newTimeSlots, gallonPrice, newGallonPrice }, 'settings');
  };
  const updateGallonPrice = (newPrice: number) => {
      if (newPrice >= 0) {
          setGallonPrice(newPrice);
          sendDataToSheet({ gallonTypes, timeSlots, gallonPrice: newPrice, newGallonPrice }, 'settings');
      }
  };
  const updateNewGallonPrice = (newPrice: number) => {
      if (newPrice >= 0) {
          setNewGallonPrice(newPrice);
          sendDataToSheet({ gallonTypes, timeSlots, gallonPrice, newGallonPrice: newPrice }, 'settings');
      }
  };

  const userBookings = useMemo(() => currentUser ? bookings.filter(b => b.userId === currentUser.id) : [], [currentUser, bookings]);

  const renderPage = () => {
    switch (currentPage) {
      case Page.LANDING: return <LandingPage navigateTo={navigateTo} />;
      case Page.LOGIN: return <LoginPage navigateTo={navigateTo} onLogin={handleLogin} />;
      case Page.REGISTER: return <RegisterPage navigateTo={navigateTo} onRegister={handleRegister} />;
      case Page.FORGOT_PASSWORD: return <ForgotPasswordPage navigateTo={navigateTo} onForgotPasswordRequest={handleForgotPasswordRequest} />;
      case Page.RESET_PASSWORD: return <ResetPasswordPage navigateTo={navigateTo} onResetPassword={handleResetPassword} initialEmail={passwordResetState.email || ''} />;
      case Page.USER_DASHBOARD: return currentUser && <UserDashboard bookings={userBookings} navigateTo={navigateTo} />;
      case Page.RIDER_DASHBOARD: return currentUser && <RiderDashboard allBookings={bookings} updateBookingStatus={updateBookingStatus} />;
      case Page.ADMIN_DASHBOARD: return <AdminDashboard allBookings={bookings} users={users} updateBookingStatus={updateBookingStatus} updateUserType={updateUserType} gallonTypes={gallonTypes} timeSlots={timeSlots} gallonPrice={gallonPrice} newGallonPrice={newGallonPrice} onAddGallonType={addGallonType} onRemoveGallonType={removeGallonType} onAddTimeSlot={addTimeSlot} onRemoveTimeSlot={removeTimeSlot} onUpdateGallonPrice={updateGallonPrice} onUpdateNewGallonPrice={updateNewGallonPrice} />;
      case Page.CREATE_BOOKING: return <CreateBookingPage addBooking={addBooking} navigateTo={navigateTo} gallonTypes={gallonTypes} timeSlots={timeSlots} gallonPrice={gallonPrice} newGallonPrice={newGallonPrice} />;
      default: return <LandingPage navigateTo={navigateTo} />;
    }
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-secondary">
            <div className="text-center">
                 <svg className="mx-auto h-12 w-12 text-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <h2 className="mt-6 text-2xl font-semibold text-gray-700">Loading Your Data...</h2>
                <p className="mt-2 text-gray-500">Please wait a moment.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Header isLoggedIn={!!currentUser} userType={currentUser?.type} onLogout={handleLogout} navigateTo={navigateTo} />
      <main className="pt-16">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
