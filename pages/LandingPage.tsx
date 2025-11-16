
import React from 'react';
import { Page } from '../types';
import { ClockIcon, CheckCircleIcon, TruckIcon } from '../components/Icons';

interface LandingPageProps {
  navigateTo: (page: Page) => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; }> = ({ icon, title, description }) => (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow text-center">
        <div className="flex justify-center items-center mb-4 text-primary">{icon}</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
    </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ navigateTo }) => {
  return (
    <div className="bg-secondary">
      {/* Hero Section */}
      <section className="relative bg-white">
        <div className="absolute inset-0">
            <img src="https://picsum.photos/1600/900?random=1&blur=2" alt="Water background" className="w-full h-full object-cover opacity-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-primary-dark tracking-tight">
            Pure Water, Delivered Right to Your Door.
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-600">
            Book your water gallon pickup and refilling service online. It's fast, easy, and reliable.
          </p>
          <div className="mt-8">
            <button
              onClick={() => navigateTo(Page.REGISTER)}
              className="bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-primary-dark transition-all shadow-lg transform hover:scale-105"
            >
              Book Now
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-dark">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600">A simple 3-step process to get fresh water.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-4">
              <div className="text-4xl font-extrabold text-primary-light mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Create a Booking</h3>
              <p className="text-gray-600">Choose your gallon type, quantity, and preferred pickup schedule.</p>
            </div>
            <div className="p-4">
              <div className="text-4xl font-extrabold text-primary-light mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">We Pick It Up</h3>
              <p className="text-gray-600">Our rider arrives at your doorstep at the scheduled time to collect your gallons.</p>
            </div>
            <div className="p-4">
              <div className="text-4xl font-extrabold text-primary-light mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Get It Refilled</h3>
              <p className="text-gray-600">We refill your gallons with purified water and can deliver them back to you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-dark">Why Choose AquaFlow?</h2>
            <p className="mt-4 text-lg text-gray-600">We provide a service you can trust.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <FeatureCard 
                icon={<ClockIcon className="h-12 w-12" />} 
                title="Fast Scheduling" 
                description="Book a pickup in under a minute with our easy-to-use platform." />
             <FeatureCard 
                icon={<TruckIcon className="h-12 w-12" />} 
                title="Reliable Service" 
                description="Our dedicated riders ensure your pickups are on time, every time." />
            <FeatureCard 
                icon={<CheckCircleIcon className="h-12 w-12" />} 
                title="Real-time Updates" 
                description="Stay informed about your booking status from pickup to completion." />
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
