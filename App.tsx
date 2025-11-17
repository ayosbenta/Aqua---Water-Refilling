
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

// IMPORTANT: Replace this URL with the new Web App URL you get after deploying the new `Code.gs` script.
const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxxRTMd3Lls97b4_XJf1fOoaSF8_J4V_VwCpMuaVUQ2PiHpxNIk96YVTs1Idv1hPk7D/exec';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.LANDING);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

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
        setFetchError(null);
        try {
            if (APP_SCRIPT_URL.includes('REPLACE_WITH_YOUR_NEW_WEB_APP_URL')) {
                throw new Error("The `APP_SCRIPT_URL` is a placeholder. Please deploy the `Code.gs` script and paste the new Web App URL into `App.tsx`.");
            }
            
            const cacheBuster = `_=${new Date().getTime()}`;
            const response = await fetch(`${APP_SCRIPT_URL}?action=getAllData&${cacheBuster}`);
            
            if (!response.ok) {
                let errorText = await response.text();
                try {
                    const errorJson = JSON.parse(errorText);
                    errorText = errorJson.message || errorText;
                } catch(e) { /* Not a JSON error, use text */ }
                throw new Error(`Network response was not ok: ${response.statusText} - ${errorText}`);
            }
            const data = await response.json();

            if (data.status === 'error') {
                throw new Error(`Apps Script Error: ${data.message}`);
            }
            
            if (data.users && Array.isArray(data.users)) {
                 const normalizedUsers = data.users.map((user: any) => ({
                    ...user,
                    mobile: user.mobile ? String(user.mobile).trim() : '',
                    fullName: user.fullName ? String(user.fullName).trim() : '',
                    email: user.email ? String(user.email).trim() : '',
                    password: user.password ? String(user.password).trim() : '',
                }));
                setUsers(normalizedUsers);
            } else {
                setUsers([]);
            }

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

        } catch (error: any) {
            console.error("Failed to fetch data from Google Sheets.", error);
            let detailedError = error.message;
            if (error.message.includes("Failed to fetch")) {
                detailedError += " This could be a CORS issue. Please ensure your Google Apps Script is deployed with 'Who has access' set to 'Anyone'. Also, check the browser console for more details.";
            }
            setFetchError(`Failed to connect to the database. ${detailedError}`);
            // Set default empty state
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
  }, []);

  const navigateTo = useCallback((page: Page) => {
    setCurrentPage(page);
  }, []);
  
  const sendDataToSheet = async (payload: any, dataType: 'booking' | 'user' | 'settings'): Promise<boolean> => {
    try {
      const response = await fetch(APP_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ dataType, payload }),
        redirect: 'follow',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed with status ${response.status}. Body: ${errorText}`);
      }
      
      const result = await response.json();
      if(result.status === 'error') {
        throw new Error(`Apps Script POST Error: ${result.message}`);
      }

      console.log(`${dataType} data sent to Google Sheets: ${result.message}`);
      return true;
    } catch (error) {
      console.error(`Failed to send ${dataType} data to Google Sheets:`, error);
      return false;
    }
  };

  const handleRegister = async (newUser: Omit<User, 'id'>) => {
    const user: User = {
      ...newUser,
      id: `U${Date.now().toString(36)}`,
    };

    const success = await sendDataToSheet(user, 'user');

    if (success) {
      setUsers(prev => [...prev, user]);
      alert('Registration successful! Please log in.');
      navigateTo(Page.LOGIN);
    } else {
      alert('Registration failed. Could not save your information. Please try again.');
    }
  };

  const handleLogin = useCallback((usernameOrEmail: string, password: string): boolean => {
    const normalizedInput = usernameOrEmail.toLowerCase().trim();
    const trimmedPassword = password.trim();
    
    if (normalizedInput === 'admin' && trimmedPassword === 'admin') {
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

    const foundUser = users.find(user =>
        user.email?.toLowerCase() === normalizedInput || user.mobile === normalizedInput
    );

    if (foundUser && foundUser.password === trimmedPassword) {
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
        
        const success = await sendDataToSheet(updatedUser, 'user');
        if (success) {
            const updatedUsers = [...users];
            updatedUsers[userIndex] = updatedUser;
            setUsers(updatedUsers);
            
            alert("Password has been reset successfully. Please log in with your new password.");
            setPasswordResetState({ email: null, code: null });
            navigateTo(Page.LOGIN);
            return true;
        } else {
            alert("Failed to update password. Please try again.");
        }
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
      price: (newBooking.gallonCount * gallonPrice) + ((newBooking.newGallonPurchaseCount || 0) * newGallonPrice),
    };
     const success = await sendDataToSheet(booking, 'booking');
     if (success) {
        setBookings(prev => [booking, ...prev]);
        navigateTo(Page.USER_DASHBOARD);
     } else {
        alert("Failed to create booking. Please try again.");
     }
  };
  
  const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    const bookingToUpdate = bookings.find(b => b.id === bookingId);
    if (!bookingToUpdate) return;
    
    const updatedBooking: Booking = {
      ...bookingToUpdate,
      status,
      ...(status === 'Completed' && { completedAt: new Date() })
    };
    
    const success = await sendDataToSheet(updatedBooking, 'booking');
    if (success) {
        setBookings(prev => prev.map(b => (b.id === bookingId ? updatedBooking : b)));
    } else {
        alert(`Failed to update booking status for ${bookingId}. Please try again.`);
    }
  };

  const updateUserType = async (userId: string, type: UserType) => {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return;

    const updatedUser = { ...users[userIndex], type };
    
    const success = await sendDataToSheet(updatedUser, 'user');
    if(success) {
        const updatedUsers = [...users];
        updatedUsers[userIndex] = updatedUser;
        setUsers(updatedUsers);
    } else {
        alert(`Failed to update user type for ${updatedUser.fullName}. Please try again.`);
    }
  };

  const saveSettings = async (settings: any) => {
    const success = await sendDataToSheet(settings, 'settings');
    if (!success) {
        alert("Failed to save settings. Please try again.");
    }
  };

  const addGallonType = (type: GallonType) => {
    if (type && !gallonTypes.includes(type)) {
      const newGallonTypes = [...gallonTypes, type];
      setGallonTypes(newGallonTypes);
      saveSettings({ gallonTypes: newGallonTypes, timeSlots, gallonPrice, newGallonPrice });
    }
  };
  const removeGallonType = (type: GallonType) => {
      const newGallonTypes = gallonTypes.filter(t => t !== type);
      setGallonTypes(newGallonTypes);
      saveSettings({ gallonTypes: newGallonTypes, timeSlots, gallonPrice, newGallonPrice });
  };
  const addTimeSlot = (slot: TimeSlot) => {
      if (slot && !timeSlots.includes(slot)) {
          const newTimeSlots = [...timeSlots, slot];
          setTimeSlots(newTimeSlots);
          saveSettings({ gallonTypes, timeSlots: newTimeSlots, gallonPrice, newGallonPrice });
      }
  };
  const removeTimeSlot = (slot: TimeSlot) => {
      const newTimeSlots = timeSlots.filter(s => s !== slot);
      setTimeSlots(newTimeSlots);
      saveSettings({ gallonTypes, timeSlots: newTimeSlots, gallonPrice, newGallonPrice });
  };
  const updateGallonPrice = (newPrice: number) => {
      if (newPrice >= 0) {
          setGallonPrice(newPrice);
          saveSettings({ gallonTypes, timeSlots, gallonPrice: newPrice, newGallonPrice });
      }
  };
  const updateNewGallonPrice = (newPrice: number) => {
      if (newPrice >= 0) {
          setNewGallonPrice(newPrice);
          saveSettings({ gallonTypes, timeSlots, gallonPrice, newGallonPrice: newPrice });
      }
  };

  const userBookings = useMemo(() => currentUser ? bookings.filter(b => b.userId === currentUser.id).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()) : [], [currentUser, bookings]);

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
  
  if (fetchError) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-red-50">
            <div className="text-center p-8 bg-white shadow-lg rounded-lg max-w-2xl mx-4">
                <svg className="mx-auto h-12 w-12 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <h2 className="mt-6 text-2xl font-semibold text-red-700">Failed to Connect to Google Sheets</h2>
                <p className="mt-2 text-gray-600">The application could not retrieve data from the backend. This is usually due to a configuration issue.</p>
                <div className="mt-4 text-sm text-left text-gray-500 bg-red-50 border border-red-200 p-3 rounded">
                    <p className="font-semibold text-red-600">Error details:</p>
                    <p>{fetchError}</p>
                </div>

                <div className="mt-6 text-left space-y-3">
                    <h3 className="font-semibold text-gray-800">Please check the following:</h3>
                    <ol className="list-decimal list-inside text-gray-600 space-y-2">
                        <li>In the <strong>`Code.gs`</strong> file, make sure the spreadsheet ID and sheet names are correct.</li>
                        <li>You must deploy the `Code.gs` script as a <strong>"Web app"</strong>.</li>
                        <li>In the deployment settings, "Who has access" must be set to <strong>"Anyone"</strong>.</li>
                        <li>In the <strong>`App.tsx`</strong> file, the <strong>`APP_SCRIPT_URL`</strong> constant must be replaced with your unique URL from deploying the Google Apps Script.</li>
                    </ol>
                </div>
                 <p className="mt-6 text-xs text-gray-400">After fixing the configuration, please refresh the page.</p>
            </div>
        </div>
    );
  }

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
