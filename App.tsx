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

// --- Password Hashing Simulation ---
const hashPassword = (password: string): string => btoa(password);
const verifyPassword = (password: string, hash: string): boolean => hashPassword(password) === hash;


const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.LANDING);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // --- State Persistence with localStorage ---
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const localData = localStorage.getItem('aquaFlowUsers');
      if (localData) {
        return JSON.parse(localData);
      }
      localStorage.setItem('aquaFlowUsers', JSON.stringify(MOCK_USERS));
      return MOCK_USERS;
    } catch (error) {
      console.error("Error reading users from localStorage", error);
      return MOCK_USERS;
    }
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const localData = localStorage.getItem('aquaFlowBookings');
      if (localData) {
        const parsedBookings = JSON.parse(localData) as Booking[];
        return parsedBookings.map(b => ({
          ...b,
          createdAt: new Date(b.createdAt),
          completedAt: b.completedAt ? new Date(b.completedAt) : undefined,
        }));
      }
      localStorage.setItem('aquaFlowBookings', JSON.stringify(MOCK_BOOKINGS));
      return MOCK_BOOKINGS;
    } catch (error) {
      console.error("Error reading bookings from localStorage", error);
      return MOCK_BOOKINGS;
    }
  });
  
  // Effect to save users to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('aquaFlowUsers', JSON.stringify(users));
    } catch (error) {
      console.error("Error saving users to localStorage", error);
    }
  }, [users]);
  
  // Effect to save bookings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('aquaFlowBookings', JSON.stringify(bookings));
    } catch (error) {
      console.error("Error saving bookings to localStorage", error);
    }
  }, [bookings]);


  // Password reset state
  const [passwordResetState, setPasswordResetState] = useState<{ email: string | null; code: string | null; }>({ email: null, code: null });

  // Service configuration state
  const [gallonTypes, setGallonTypes] = useState<GallonType[]>(['Slim', 'Round', '5G']);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(['9am–12pm', '1pm–5pm']);
  const [gallonPrice, setGallonPrice] = useState<number>(25);

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

  const handleRegister = async (newUser: Omit<User, 'id' | 'type'>) => {
    const user: User = {
      ...newUser,
      id: `U${Date.now().toString(36)}`,
      type: UserType.CUSTOMER,
      password: hashPassword(newUser.password), // Hash the password
    };
    await sendDataToSheet(user, 'user');
    setUsers(prev => [...prev, user]);
    alert('Registration successful! Please log in.');
    navigateTo(Page.LOGIN);
  };

  const handleLogin = useCallback((usernameOrEmail: string, password: string): boolean => {
    const normalizedInput = usernameOrEmail.toLowerCase();
    
    // Admin Login
    if (normalizedInput === 'admin@aquaflow.com' && password === 'admin123') {
       const adminUser = users.find(u => u.type === UserType.ADMIN);
       if(adminUser) {
           setCurrentUser(adminUser);
           navigateTo(Page.ADMIN_DASHBOARD);
           return true;
       }
    }

    // Customer Login
    const foundUser = users.find(
      u => (u.email?.toLowerCase() === normalizedInput || u.mobile === normalizedInput) && u.type === UserType.CUSTOMER
    );
    
    if (foundUser && verifyPassword(password, foundUser.password)) {
      setCurrentUser(foundUser);
      navigateTo(Page.USER_DASHBOARD);
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
          password: hashPassword(newPassword),
        };
        
        // Send updated user data to sheet
        await sendDataToSheet(updatedUser, 'user');

        // Update local state
        const updatedUsers = [...users];
        updatedUsers[userIndex] = updatedUser;
        setUsers(updatedUsers);
        
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

  const addBooking = async (newBooking: Omit<Booking, 'id' | 'status' | 'userId'>) => {
    if (!currentUser) return;
    const booking: Booking = {
      id: `B${Date.now().toString(36)}`,
      ...newBooking,
      userId: currentUser.id,
      status: 'Pending',
      price: newBooking.gallonCount * gallonPrice,
    };
    await sendDataToSheet(booking, 'booking');
    setBookings(prev => [booking, ...prev]);
    navigateTo(Page.USER_DASHBOARD);
  };
  
  const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    const bookingToUpdate = bookings.find(b => b.id === bookingId);
    if (!bookingToUpdate) return;
    
    const updatedBooking: Booking = {
      ...bookingToUpdate,
      status,
      ...(status === 'Completed' && { completedAt: new Date() })
    };
    
    await sendDataToSheet(updatedBooking, 'booking');
    setBookings(prev => prev.map(b => (b.id === bookingId ? updatedBooking : b)));
  };

  const addGallonType = (type: GallonType) => { if (type && !gallonTypes.includes(type)) setGallonTypes(prev => [...prev, type]); };
  const removeGallonType = (type: GallonType) => setGallonTypes(prev => prev.filter(t => t !== type));
  const addTimeSlot = (slot: TimeSlot) => { if (slot && !timeSlots.includes(slot)) setTimeSlots(prev => [...prev, slot]); };
  const removeTimeSlot = (slot: TimeSlot) => setTimeSlots(prev => prev.filter(s => s !== slot));
  const updateGallonPrice = (newPrice: number) => { if (newPrice >= 0) setGallonPrice(newPrice); };

  const userBookings = useMemo(() => currentUser ? bookings.filter(b => b.userId === currentUser.id) : [], [currentUser, bookings]);

  const renderPage = () => {
    switch (currentPage) {
      case Page.LANDING: return <LandingPage navigateTo={navigateTo} />;
      case Page.LOGIN: return <LoginPage navigateTo={navigateTo} onLogin={handleLogin} />;
      case Page.REGISTER: return <RegisterPage navigateTo={navigateTo} onRegister={handleRegister} />;
      case Page.FORGOT_PASSWORD: return <ForgotPasswordPage navigateTo={navigateTo} onForgotPasswordRequest={handleForgotPasswordRequest} />;
      case Page.RESET_PASSWORD: return <ResetPasswordPage navigateTo={navigateTo} onResetPassword={handleResetPassword} initialEmail={passwordResetState.email || ''} />;
      case Page.USER_DASHBOARD: return currentUser && <UserDashboard bookings={userBookings} navigateTo={navigateTo} />;
      case Page.ADMIN_DASHBOARD: return <AdminDashboard allBookings={bookings} users={users} updateBookingStatus={updateBookingStatus} gallonTypes={gallonTypes} timeSlots={timeSlots} gallonPrice={gallonPrice} onAddGallonType={addGallonType} onRemoveGallonType={removeGallonType} onAddTimeSlot={addTimeSlot} onRemoveTimeSlot={removeTimeSlot} onUpdateGallonPrice={updateGallonPrice} />;
      case Page.CREATE_BOOKING: return <CreateBookingPage addBooking={addBooking} navigateTo={navigateTo} gallonTypes={gallonTypes} timeSlots={timeSlots} gallonPrice={gallonPrice} />;
      default: return <LandingPage navigateTo={navigateTo} />;
    }
  };

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