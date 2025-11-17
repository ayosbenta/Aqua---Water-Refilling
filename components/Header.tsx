
import React, { useState } from 'react';
import { Page, UserType } from '../types';
import { WaterDropIcon, MenuIcon, XIcon } from './Icons';

interface HeaderProps {
  isLoggedIn: boolean;
  userType?: UserType;
  onLogout: () => void;
  navigateTo: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, userType, onLogout, navigateTo }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getDashboardPage = () => {
    if (!isLoggedIn) return Page.LANDING;
    switch (userType) {
      case UserType.ADMIN: return Page.ADMIN_DASHBOARD;
      case UserType.RIDER: return Page.RIDER_DASHBOARD;
      case UserType.CUSTOMER: return Page.USER_DASHBOARD;
      default: return Page.LANDING;
    }
  };
  
  const handleNav = (page: Page) => {
    navigateTo(page);
    setIsMenuOpen(false);
  }
  
  const handleLogout = () => {
    onLogout();
    setIsMenuOpen(false);
  }

  const renderNavLinks = (isMobile: boolean) => (
    <>
      {isLoggedIn ? (
        <>
          {userType === UserType.CUSTOMER && (
             <button
              onClick={() => handleNav(Page.USER_DASHBOARD)}
              className={isMobile ? "block w-full text-left px-4 py-2 text-base text-gray-700 hover:bg-gray-100" : "text-gray-600 hover:text-primary-dark font-medium transition-colors"}
            >
              Dashboard
            </button>
          )}
           {userType === UserType.ADMIN && (
             <button
              onClick={() => handleNav(Page.ADMIN_DASHBOARD)}
              className={isMobile ? "block w-full text-left px-4 py-2 text-base text-gray-700 hover:bg-gray-100" : "text-gray-600 hover:text-primary-dark font-medium transition-colors"}
            >
              Admin Panel
            </button>
          )}
           {userType === UserType.RIDER && (
             <button
              onClick={() => handleNav(Page.RIDER_DASHBOARD)}
              className={isMobile ? "block w-full text-left px-4 py-2 text-base text-gray-700 hover:bg-gray-100" : "text-gray-600 hover:text-primary-dark font-medium transition-colors"}
            >
              Rider Dashboard
            </button>
          )}
          <button
            onClick={handleLogout}
            className={isMobile ? "block w-full text-left bg-primary-dark text-white px-4 py-3 font-semibold hover:bg-opacity-90" : "bg-primary-dark text-white px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-sm"}
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => handleNav(Page.LOGIN)}
            className={isMobile ? "block w-full text-left px-4 py-2 text-base text-gray-700 hover:bg-gray-100" : "text-gray-600 hover:text-primary-dark font-medium transition-colors"}
          >
            Log In
          </button>
          <button
            onClick={() => handleNav(Page.REGISTER)}
            className={isMobile ? "block w-full text-left bg-primary text-white px-4 py-3 font-semibold hover:bg-primary-dark" : "bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-all shadow-sm"}
          >
            Sign Up
          </button>
        </>
      )}
    </>
  );

  return (
    <header className="bg-white/80 backdrop-blur-lg shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleNav(getDashboardPage())}
          >
            <WaterDropIcon className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary-dark">AquaFlow</span>
          </div>
          <nav className="flex items-center">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              {renderNavLinks(false)}
            </div>
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
                {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
              </button>
            </div>
          </nav>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg py-2">
          <div className="flex flex-col">
            {renderNavLinks(true)}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
