
import React, { useState, useMemo } from 'react';
import { Page, Booking, GallonType, TimeSlot, PaymentMethod, BookingItem } from '../types';
import { XCircleIcon } from '../components/Icons';

interface CreateBookingPageProps {
    addBooking: (booking: Omit<Booking, 'id' | 'status' | 'userId'>) => void;
    navigateTo: (page: Page) => void;
    gallonTypes: GallonType[];
    timeSlots: TimeSlot[];
    newGallonPrice: number;
}

const QuantityInput: React.FC<{ value: number; onChange: (value: number) => void; }> = ({ value, onChange }) => (
    <div className="flex items-center justify-center gap-2">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))} className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 font-bold">-</button>
        <span className="w-10 text-center font-semibold">{value}</span>
        <button type="button" onClick={() => onChange(value + 1)} className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 font-bold">+</button>
    </div>
);


const CreateBookingPage: React.FC<CreateBookingPageProps> = ({ addBooking, navigateTo, gallonTypes, timeSlots, newGallonPrice }) => {
    const [cart, setCart] = useState<BookingItem[]>([]);
    const [pickupAddress, setPickupAddress] = useState('');
    const [pickupDate, setPickupDate] = useState(new Date().toISOString().split('T')[0]);
    const [timeSlot, setTimeSlot] = useState<TimeSlot>(timeSlots[0] || '');
    const [deliveryOption, setDeliveryOption] = useState(true);
    const [notes, setNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash on Delivery');
    
    const handleAddItem = (name: string) => {
        if (cart.some(item => item.name === name)) return;
        setCart(prevCart => [...prevCart, { name, refill: 1, new: 0 }]);
    };

    const handleRemoveItem = (name: string) => {
        setCart(prevCart => prevCart.filter(item => item.name !== name));
    };

    const handleQuantityChange = (name: string, type: 'refill' | 'new', value: number) => {
        setCart(prevCart => prevCart.map(item =>
            item.name === name ? { ...item, [type]: value } : item
        ));
    };

    const isTypeInCart = (name: string): boolean => {
        return cart.some(item => item.name === name);
    };

    const { totalAmount, totalItems } = useMemo(() => {
        let amount = 0;
        let itemsCount = 0;
        cart.forEach(item => {
            const gallonType = gallonTypes.find(g => g.name === item.name);
            if (gallonType) {
                // Regular refills are charged at their standard price.
                const refillCost = item.refill * gallonType.price;

                // The cost of a new gallon is for the container only. The initial water is free.
                const newCost = item.new * newGallonPrice;
                
                amount += refillCost + newCost;
                itemsCount += item.refill + item.new;
            }
        });
        return { totalAmount: amount, totalItems: itemsCount };
    }, [cart, gallonTypes, newGallonPrice]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!pickupAddress) {
            alert("Please enter a pickup address.");
            return;
        }

        const itemsToBook = cart.filter(item => item.refill > 0 || item.new > 0);

        if (itemsToBook.length === 0) {
            alert("Your order is empty. Please add items and set quantities.");
            return;
        }

        // For backward compatibility with Google Sheets, summarize cart data into the old fields.
        const totalRefills = itemsToBook.reduce((sum, item) => sum + (item.refill || 0), 0);
        const totalNew = itemsToBook.reduce((sum, item) => sum + (item.new || 0), 0);
        const bookingType = itemsToBook.length === 1 ? itemsToBook[0].name : (itemsToBook.length > 1 ? 'Multiple' : 'N/A');

        addBooking({
            pickupAddress,
            pickupDate,
            timeSlot,
            deliveryOption,
            notes,
            paymentMethod,
            items: JSON.stringify(itemsToBook),
            price: totalAmount,
            createdAt: new Date(),
            // Deprecated fields for sheet compatibility
            gallonCount: totalRefills,
            newGallonPurchaseCount: totalNew,
            gallonType: bookingType,
        });
    };

    return (
        <div className="bg-secondary min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Create a New Booking</h1>
                <form onSubmit={handleSubmit} className="space-y-8">

                    <fieldset>
                        <legend className="block text-lg font-semibold text-gray-800 mb-3">1. Add Gallons to Your Order</legend>
                        <div className="flex flex-wrap gap-3">
                            {gallonTypes.map(type => (
                                <button
                                    key={type.name}
                                    type="button"
                                    onClick={() => handleAddItem(type.name)}
                                    disabled={isTypeInCart(type.name)}
                                    className={`px-4 py-2 text-sm font-semibold border-2 rounded-md transition-all ${
                                        isTypeInCart(type.name)
                                        ? 'bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed'
                                        : 'bg-white text-primary border-primary hover:bg-primary-light'
                                    }`}
                                >
                                    + Add {type.name}
                                </button>
                            ))}
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend className="block text-lg font-semibold text-gray-800 mb-3">2. Configure Your Order</legend>
                        <div className="space-y-4">
                            {cart.length > 0 ? (
                                cart.map(item => {
                                    const typeInfo = gallonTypes.find(g => g.name === item.name);
                                    return (
                                        <div key={item.name} className="bg-gray-50 p-4 rounded-lg border relative animate-fade-in">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(item.name)}
                                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                                                aria-label={`Remove ${item.name}`}
                                            >
                                                <XCircleIcon className="h-6 w-6" />
                                            </button>
                                            <div>
                                                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                                <p className="text-sm text-gray-500">{typeInfo?.price.toLocaleString('en-US', { style: 'currency', currency: 'PHP' })} / refill</p>
                                            </div>
                                            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                                                <div className="text-center">
                                                    <label className="font-medium text-gray-600">Refill Qty</label>
                                                    <div className="mt-1">
                                                        <QuantityInput value={item.refill} onChange={(val) => handleQuantityChange(item.name, 'refill', val)} />
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <label className="font-medium text-gray-600">New Qty</label>
                                                    <div className="mt-1">
                                                        <QuantityInput value={item.new} onChange={(val) => handleQuantityChange(item.name, 'new', val)} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-10 border-2 border-dashed rounded-lg text-gray-400">
                                    <p className="font-medium">Your order is empty</p>
                                    <p className="text-sm mt-1">Select a gallon type above to get started.</p>
                                </div>
                            )}
                        </div>
                         {cart.length > 0 && <p className="text-xs text-gray-500 mt-2 text-right">Price per new empty gallon: {newGallonPrice.toLocaleString('en-US', { style: 'currency', currency: 'PHP' })}</p>}
                    </fieldset>

                    <fieldset>
                        <legend className="block text-lg font-semibold text-gray-800 mb-3">3. Delivery Details</legend>
                        <div className="space-y-6">
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
                        </div>
                    </fieldset>
                    
                    <div className="pt-6 border-t">
                        <div className="flex justify-between items-center text-lg font-semibold text-gray-800">
                            <span>Total Amount:</span>
                            <span>{totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'PHP' })}</span>
                        </div>
                         {totalItems > 0 && <p className="text-right text-sm text-gray-500">{totalItems} item(s)</p>}
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
