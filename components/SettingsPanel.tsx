import React, { useState } from 'react';
import { GallonType, TimeSlot } from '../types';
import { CogIcon, XCircleIcon } from './Icons';

interface SettingsPanelProps {
  gallonTypes: GallonType[];
  timeSlots: TimeSlot[];
  gallonPrice: number;
  newGallonPrice: number;
  onAddGallonType: (type: GallonType) => void;
  onRemoveGallonType: (type: GallonType) => void;
  onAddTimeSlot: (slot: TimeSlot) => void;
  onRemoveTimeSlot: (slot: TimeSlot) => void;
  onUpdateGallonPrice: (price: number) => void;
  onUpdateNewGallonPrice: (price: number) => void;
}

const SettingsCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  gallonTypes,
  timeSlots,
  gallonPrice,
  newGallonPrice,
  onAddGallonType,
  onRemoveGallonType,
  onAddTimeSlot,
  onRemoveTimeSlot,
  onUpdateGallonPrice,
  onUpdateNewGallonPrice,
}) => {
  const [newGallonType, setNewGallonType] = useState('');
  const [newTimeSlot, setNewTimeSlot] = useState('');
  const [price, setPrice] = useState(gallonPrice);
  const [newEmptyGallonPrice, setNewEmptyGallonPrice] = useState(newGallonPrice);

  const handleAddGallonType = () => {
    onAddGallonType(newGallonType.trim());
    setNewGallonType('');
  };

  const handleAddTimeSlot = () => {
    onAddTimeSlot(newTimeSlot.trim());
    setNewTimeSlot('');
  };

  const handlePriceUpdate = () => {
    onUpdateGallonPrice(price);
    alert('Refill price updated!');
  };

  const handleNewGallonPriceUpdate = () => {
    onUpdateNewGallonPrice(newEmptyGallonPrice);
    alert('New gallon price updated!');
  };


  return (
    <div>
        <div className="flex items-center gap-3 mb-6">
            <CogIcon className="h-8 w-8 text-primary-dark" />
            <h2 className="text-2xl font-bold text-gray-800">Service Settings</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SettingsCard title="Manage Gallon Types">
                <div className="space-y-2">
                    {gallonTypes.map(type => (
                        <div key={type} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                            <span className="text-gray-700">{type}</span>
                            <button onClick={() => onRemoveGallonType(type)} className="text-red-400 hover:text-red-600">
                                <XCircleIcon className="h-5 w-5" />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 pt-2">
                    <input
                        type="text"
                        value={newGallonType}
                        onChange={(e) => setNewGallonType(e.target.value)}
                        placeholder="e.g., 10G"
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                    <button onClick={handleAddGallonType} className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark">Add</button>
                </div>
            </SettingsCard>

            <SettingsCard title="Manage Time Slots">
                <div className="space-y-2">
                    {timeSlots.map(slot => (
                        <div key={slot} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                            <span className="text-gray-700">{slot}</span>
                            <button onClick={() => onRemoveTimeSlot(slot)} className="text-red-400 hover:text-red-600">
                                <XCircleIcon className="h-5 w-5" />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 pt-2">
                     <input
                        type="text"
                        value={newTimeSlot}
                        onChange={(e) => setNewTimeSlot(e.target.value)}
                        placeholder="e.g., 5pm-8pm"
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                    <button onClick={handleAddTimeSlot} className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark">Add</button>
                </div>
            </SettingsCard>
            
            <SettingsCard title="Manage Pricing">
                <div>
                    <label htmlFor="gallonPrice" className="block text-sm font-medium text-gray-700 mb-1">Price per Gallon (Refill)</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            id="gallonPrice"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            min="0"
                            step="0.01"
                            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        />
                         <button onClick={handlePriceUpdate} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700">Update</button>
                    </div>
                </div>
                 <div className="pt-4">
                    <label htmlFor="newGallonPrice" className="block text-sm font-medium text-gray-700 mb-1">Price per New Empty Gallon</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            id="newGallonPrice"
                            value={newEmptyGallonPrice}
                            onChange={(e) => setNewEmptyGallonPrice(Number(e.target.value))}
                            min="0"
                            step="1"
                            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        />
                        <button onClick={handleNewGallonPriceUpdate} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700">Update</button>
                    </div>
                </div>
            </SettingsCard>
        </div>
    </div>
  );
};

export default SettingsPanel;