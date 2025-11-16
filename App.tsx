
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Page, User, UserType, Booking, GallonType, TimeSlot } from './types';
import { MOCK_USERS, MOCK_BOOKINGS } from './constants';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
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

  // --- State is now managed in-memory, initialized from Google Sheets ---
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Password reset state
  const [passwordResetState, setPasswordResetState] = useState<{ email: string | null; code: string | null; }>({ email: null, code: null });

  // Service configuration state
  const [gallonTypes, setGallonTypes] = useState<GallonType[]>(['Slim', 'Round', '5G']);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(['9am–12pm', '1pm–5pm']);
  const [gallonPrice, setGallonPrice] = useState<number>(25);
  const [newGallonPrice, setNewGallonPrice] = useState<number>(150);

  useEffect(() => {
    const fetchDataFromSheet = async () => {
        try {
            // Assumes the Apps Script is set up to handle GET requests and has CORS enabled.
            const response = await fetch(`${APP_SCRIPT_URL}?action=getAllData`);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            const data = await response.json();
            
            if (data.users && Array.isArray(data.users)) {
                setUsers(data.users);
            } else {
                 console.warn("No 'users' array in fetched data, using mock users.");
                 setUsers(MOCK_USERS);
            }

            if (data.bookings && Array.isArray(data.bookings)) {
                 const formattedBookings = data.bookings.map((b: any) => ({
                    ...b,
                    createdAt: new Date(b.createdAt),
                    completedAt: b.completedAt ? new Date(b.completedAt) : undefined,
                }));
                setBookings(formattedBookings);
            } else {
                 console.warn("No 'bookings' array in fetched data, using mock bookings.");
                 setBookings(MOCK_BOOKINGS);
            }

        } catch (error) {
            console.error("Failed to fetch data from Google Sheets, using mock data as fallback:", error);
            setUsers(MOCK_USERS);
            setBookings(MOCK_BOOKINGS);
        } finally {
            setIsLoading(false);
        }
    };

    fetchDataFromSheet();
  }, []); // Empty dependency array ensures this runs only once on mount

  const navigateTo = useCallback((page: Page) => {
    setCurrentPage(page);
  }, []);
  
  const sendDataToSheet = async (payload: Booking | User, dataType: 'booking' | 'user') => {
    try {
      await fetch(APP_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataType, payload }),
        mode: 'no-cors',
      });
      console.log(`${dataType} data sent to Google Sheets for ID:`, payload.id);
    } catch (error) {
      console.error(`Failed to send ${dataType} data to Google Sheets:`, error);
    }
  };

  const handleRegister = (newUser: Omit<User, 'id' | 'type'>) => {
    const user: User = {
      ...newUser,
      id: `U${Date.now().toString(36)}`,
      type: UserType.CUSTOMER,
      password: newUser.password, // Store plain text password
    };
    // Optimistically update local state for immediate login capability
    setUsers(prev => [...prev, user]);
    // Send data to sheet in the background
    sendDataToSheet(user, 'user');
    alert('Registration successful! Please log in.');
    navigateTo(Page.LOGIN);
  };

  const handleLogin = useCallback((usernameOrEmail: string, password: string): boolean => {
    const normalizedInput = usernameOrEmail.toLowerCase();
    
    // Find user by email, mobile, or special 'admin' username
    const foundUser = users.find(user => {
        if (user.type === UserType.ADMIN && normalizedInput === 'admin') {
            return true;
        }
        return user.email?.toLowerCase() === normalizedInput || user.mobile === normalizedInput;
    });
    
    if (foundUser && foundUser.password === password) {
        setCurrentUser(foundUser);
        navigateTo(foundUser.type === UserType.ADMIN ? Page.ADMIN_DASHBOARD : Page.USER_DASHBOARD);
        return true;
    }
    
    return false; // Login failed
  }, [navigateTo, users]);
  
  const handleForgotPasswordRequest = (email: string): boolean => {
    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (user) {
      const code = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit code
      setPasswordResetState({ email, code });
      // --- SIMULATE SENDING EMAIL ---
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
          password: newPassword, // Store plain text password
        };
        
        // Update local state first for responsiveness
        const updatedUsers = [...users];
        updatedUsers[userIndex] = updatedUser;
        setUsers(updatedUsers);
        
        // Send updated user data to sheet
        sendDataToSheet(updatedUser, 'user');
        
        alert("Password has been reset successfully. Please log in with your new password.");
        setPasswordResetState({ email: null, code: null }); // Clear reset state
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
    // Optimistically update local state
    setBookings(prev => [booking, ...prev]);
    // Send data to sheet in the background
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
    
    // Optimistic update
    setBookings(prev => prev.map(b => (b.id === bookingId ? updatedBooking : b)));
    // Send to sheet in the background
    sendDataToSheet(updatedBooking, 'booking');
  };

  const addGallonType = (type: GallonType) => { if (type && !gallonTypes.includes(type)) setGallonTypes(prev => [...prev, type]); };
  const removeGallonType = (type: GallonType) => setGallonTypes(prev => prev.filter(t => t !== type));
  const addTimeSlot = (slot: TimeSlot) => { if (slot && !timeSlots.includes(slot)) setTimeSlots(prev => [...prev, slot]); };
  const removeTimeSlot = (slot: TimeSlot) => setTimeSlots(prev => prev.filter(s => s !== slot));
  const updateGallonPrice = (newPrice: number) => { if (newPrice >= 0) setGallonPrice(newPrice); };
  const updateNewGallonPrice = (newPrice: number) => { if (newPrice >= 0) setNewGallonPrice(newPrice); };

  const userBookings = useMemo(() => currentUser ? bookings.filter(b => b.userId === currentUser.id) : [], [currentUser, bookings]);

  const renderPage = () => {
    switch (currentPage) {
      case Page.LANDING: return <LandingPage navigateTo={navigateTo} />;
      case Page.LOGIN: return <LoginPage navigateTo={navigateTo} onLogin={handleLogin} />;
      case Page.REGISTER: return <RegisterPage navigateTo={navigateTo} onRegister={handleRegister} />;
      case Page.FORGOT_PASSWORD: return <ForgotPasswordPage navigateTo={navigateTo} onForgotPasswordRequest={handleForgotPasswordRequest} />;
      case Page.RESET_PASSWORD: return <ResetPasswordPage navigateTo={navigateTo} onResetPassword={handleResetPassword} initialEmail={passwordResetState.email || ''} />;
      case Page.USER_DASHBOARD: return currentUser && <UserDashboard bookings={userBookings} navigateTo={navigateTo} />;
      case Page.ADMIN_DASHBOARD: return <AdminDashboard allBookings={bookings} users={users} updateBookingStatus={updateBookingStatus} gallonTypes={gallonTypes} timeSlots={timeSlots} gallonPrice={gallonPrice} newGallonPrice={newGallonPrice} onAddGallonType={addGallonType} onRemoveGallonType={removeGallonType} onAddTimeSlot={addTimeSlot} onRemoveTimeSlot={removeTimeSlot} onUpdateGallonPrice={updateGallonPrice} onUpdateNewGallonPrice={updateNewGallonPrice} />;
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
