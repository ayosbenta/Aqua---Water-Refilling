
import React from 'react';
import { Page, UserType } from '../types';
import { WaterDropIcon } from './Icons';

interface HeaderProps {
  isLoggedIn: boolean;
  userType?: UserType;
  onLogout: () => void;
  navigateTo: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, userType, onLogout, navigateTo }) => {

  const getDashboardPage = () => {
    if (!isLoggedIn) return Page.LANDING;
    switch (userType) {
      case UserType.ADMIN: return Page.ADMIN_DASHBOARD;
      case UserType.RIDER: return Page.RIDER_DASHBOARD;
      case UserType.CUSTOMER: return Page.USER_DASHBOARD;
      default: return Page.LANDING;
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-lg shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigateTo(getDashboardPage())}
          >
            <WaterDropIcon className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary-dark">AquaFlow</span>
          </div>
          <nav className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                {userType === UserType.CUSTOMER && (
                   <button
                    onClick={() => navigateTo(Page.USER_DASHBOARD)}
                    className="text-gray-600 hover:text-primary-dark font-medium transition-colors"
                  >
                    Dashboard
                  </button>
                )}
                 {userType === UserType.ADMIN && (
                   <button
                    onClick={() => navigateTo(Page.ADMIN_DASHBOARD)}
                    className="text-gray-600 hover:text-primary-dark font-medium transition-colors"
                  >
                    Admin Panel
                  </button>
                )}
                 {userType === UserType.RIDER && (
                   <button
                    onClick={() => navigateTo(Page.RIDER_DASHBOARD)}
                    className="text-gray-600 hover:text-primary-dark font-medium transition-colors"
                  >
                    Rider Dashboard
                  </button>
                )}
                <button
                  onClick={onLogout}
                  className="bg-primary-dark text-white px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigateTo(Page.LOGIN)}
                  className="text-gray-600 hover:text-primary-dark font-medium transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigateTo(Page.REGISTER)}
                  className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-all shadow-sm"
                >
                  Sign Up
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;