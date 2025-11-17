import React, { useState } from 'react';
import { GallonType, TimeSlot } from '../types';
import { CogIcon, XCircleIcon } from './Icons';

interface SettingsPanelProps {
  gallonTypes: GallonType[];
  timeSlots: TimeSlot[];
  newGallonPrice: number;
  onAddGallonType: (type: GallonType) => void;
  onRemoveGallonType: (typeName: string) => void;
  onAddTimeSlot: (slot: TimeSlot) => void;
  onRemoveTimeSlot: (slot: TimeSlot) => void;
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
  newGallonPrice,
  onAddGallonType,
  onRemoveGallonType,
  onAddTimeSlot,
  onRemoveTimeSlot,
  onUpdateNewGallonPrice,
}) => {
  const [newGallonTypeName, setNewGallonTypeName] = useState('');
  const [newGallonTypePrice, setNewGallonTypePrice] = useState(0);
  const [newTimeSlot, setNewTimeSlot] = useState('');
  const [newEmptyGallonPrice, setNewEmptyGallonPrice] = useState(newGallonPrice);

  const handleAddGallonType = () => {
    if (newGallonTypeName.trim() && newGallonTypePrice > 0) {
        onAddGallonType({ name: newGallonTypeName.trim(), price: newGallonTypePrice });
        setNewGallonTypeName('');
        setNewGallonTypePrice(0);
    } else {
        alert("Please provide a valid name and a price greater than 0.");
    }
  };

  const handleAddTimeSlot = () => {
    onAddTimeSlot(newTimeSlot.trim());
    setNewTimeSlot('');
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
            <SettingsCard title="Manage Gallon Types & Refill Price">
                <div className="space-y-2">
                    {gallonTypes.map(type => (
                        <div key={type.name} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                            <span className="text-gray-700 font-medium">{type.name}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">{type.price.toLocaleString('en-US', { style: 'currency', currency: 'PHP'})}</span>
                                <button onClick={() => onRemoveGallonType(type.name)} className="text-red-400 hover:text-red-600">
                                    <XCircleIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="pt-4 border-t mt-4 space-y-2">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Add New Gallon Type</label>
                     <input
                        type="text"
                        value={newGallonTypeName}
                        onChange={(e) => setNewGallonTypeName(e.target.value)}
                        placeholder="Gallon Name (e.g., 5G)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={newGallonTypePrice}
                            onChange={(e) => setNewGallonTypePrice(Number(e.target.value))}
                            placeholder="Price"
                            min="0"
                            step="0.01"
                            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        />
                        <button onClick={handleAddGallonType} className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark">Add</button>
                    </div>
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
            
            <SettingsCard title="Manage New Gallon Price">
                 <div>
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