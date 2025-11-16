import React, { useState } from 'react';
import { Page, Booking, GallonType, TimeSlot, PaymentMethod } from '../types';

interface CreateBookingPageProps {
    addBooking: (booking: Omit<Booking, 'id' | 'status' | 'userId'>) => void;
    navigateTo: (page: Page) => void;
    gallonTypes: GallonType[];
    timeSlots: TimeSlot[];
    gallonPrice: number;
    newGallonPrice: number;
}

const CreateBookingPage: React.FC<CreateBookingPageProps> = ({ addBooking, navigateTo, gallonTypes, timeSlots, gallonPrice, newGallonPrice }) => {
    const [totalGallons, setTotalGallons] = useState(1);
    const [newGallonPurchaseCount, setNewGallonPurchaseCount] = useState(0);
    const [gallonType, setGallonType] = useState<GallonType>(gallonTypes[0] || '');
    const [pickupAddress, setPickupAddress] = useState('');
    const [pickupDate, setPickupDate] = useState(new Date().toISOString().split('T')[0]);
    const [timeSlot, setTimeSlot] = useState<TimeSlot>(timeSlots[0] || '');
    const [deliveryOption, setDeliveryOption] = useState(true);
    const [notes, setNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash on Delivery');

    const handleTotalGallonsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTotal = Math.max(1, parseInt(e.target.value) || 1);
        setTotalGallons(newTotal);
        if (newGallonPurchaseCount > newTotal) {
            setNewGallonPurchaseCount(newTotal);
        }
    };
    
    const handleNewGallonsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPurchaseCount = Math.max(0, parseInt(e.target.value) || 0);
        setNewGallonPurchaseCount(Math.min(newPurchaseCount, totalGallons));
    };

    const refillCount = totalGallons - newGallonPurchaseCount;
    const totalAmount = (refillCount * gallonPrice) + (newGallonPurchaseCount * newGallonPrice);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!pickupAddress) {
            alert("Please enter a pickup address.");
            return;
        }
        if (!gallonType || !timeSlot) {
            alert("Service options are not available. Please contact support.");
            return;
        }
        addBooking({
            gallonCount: refillCount,
            newGallonPurchaseCount,
            gallonType,
            pickupAddress,
            pickupDate,
            timeSlot,
            deliveryOption,
            notes,
            createdAt: new Date(),
            paymentMethod,
        });
    };

    return (
        <div className="bg-secondary min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Create a New Booking</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Gallon Type</label>
                        <div className="mt-1 grid grid-cols-3 gap-3">
                            {gallonTypes.map(type => (
                                <button key={type} type="button" onClick={() => setGallonType(type)} className={`px-4 py-2 rounded-md text-sm font-semibold border-2 transition-colors ${gallonType === type ? 'bg-primary text-white border-primary-dark' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="totalGallons" className="block text-sm font-medium text-gray-700">Total Gallons of Water Needed</label>
                        <input type="number" id="totalGallons" value={totalGallons} onChange={handleTotalGallonsChange} min="1" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                    </div>

                    <div>
                        <label htmlFor="newGallonPurchaseCount" className="block text-sm font-medium text-gray-700">Of which, how many are new gallons?</label>
                        <input type="number" id="newGallonPurchaseCount" value={newGallonPurchaseCount} onChange={handleNewGallonsChange} min="0" max={totalGallons} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                        <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                            <p>Refilling your containers: <span className="font-semibold">{refillCount} gallon(s)</span></p>
                            <p>Purchasing new gallons: <span className="font-semibold">{newGallonPurchaseCount} gallon(s)</span></p>
                            <p className="text-xs text-gray-500 mt-1">Price per new gallon: {newGallonPrice.toLocaleString('en-US', { style: 'currency', currency: 'PHP' })}</p>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="pickupAddress" className="block text-sm font-medium text-gray-700">Pickup Address</label>
                        <input type="text" id="pickupAddress" value={pickupAddress} onChange={e => setPickupAddress(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="123 Water St, Clean City" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700">Pickup Date</label>
                            <input type="date" id="pickupDate" value={pickupDate} onChange={e => setPickupDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Time Slot</label>
                            <select value={timeSlot} onChange={e => setTimeSlot(e.target.value as TimeSlot)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                                {timeSlots.map(slot => <option key={slot}>{slot}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Service Option</label>
                         <div className="flex items-center space-x-4">
                            <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50 flex-1">
                                <input type="radio" name="deliveryOption" checked={deliveryOption} onChange={() => setDeliveryOption(true)} className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"/>
                                <span className="ml-3 text-sm text-gray-700">Pickup & Return Delivery</span>
                            </label>
                             <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50 flex-1">
                                <input type="radio" name="deliveryOption" checked={!deliveryOption} onChange={() => setDeliveryOption(false)} className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"/>
                                <span className="ml-3 text-sm text-gray-700">Pickup Only</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mode of Payment</label>
                        <div className="mt-2 grid grid-cols-3 gap-3">
                            {(['Cash on Delivery', 'Cash', 'GCash'] as PaymentMethod[]).map(method => (
                                <button key={method} type="button" onClick={() => setPaymentMethod(method)} className={`px-4 py-2 rounded-md text-sm font-semibold border-2 transition-colors text-center ${paymentMethod === method ? 'bg-primary text-white border-primary-dark' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                                    {method}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                        <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="e.g., Please ring the bell."></textarea>
                    </div>

                    <div className="pt-6 border-t">
                        <div className="flex justify-between items-center text-lg font-semibold text-gray-800">
                            <span>Total Amount:</span>
                            <span>{totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'PHP' })}</span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                         <button type="button" onClick={() => navigateTo(Page.USER_DASHBOARD)} className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Cancel
                        </button>
                        <button type="submit" className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark">
                            Confirm Booking
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateBookingPage;