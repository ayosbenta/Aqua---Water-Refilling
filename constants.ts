
import { User, Booking, UserType, Rider } from './types';

// Note: Passwords are saved in plain text for demonstration purposes.
// In a real application, passwords should always be securely hashed.

export const MOCK_USERS: User[] = [
  {
    id: 'U1',
    fullName: 'Ryan Zkey',
    mobile: '09171234567',
    email: 'ryanzkey@gmail.com',
    password: 'M@y191992',
    type: UserType.CUSTOMER,
  },
  {
    id: 'U2',
    fullName: 'Jane Smith',
    mobile: '09187654321',
    email: 'jane.smith@email.com',
    password: 'password123',
    type: UserType.CUSTOMER,
  },
  {
    id: 'A1',
    fullName: 'Admin User',
    mobile: '09201112222',
    email: 'admin@aquaflow.com',
    password: 'admin',
    type: UserType.ADMIN,
  },
];

export const MOCK_RIDERS: Rider[] = [
    { id: 'R1', name: 'Mike Ross', mobile: '09991234567' },
    { id: 'R2', name: 'Harvey Specter', mobile: '09998765432' },
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'B001',
    userId: 'U1',
    gallonCount: 5,
    gallonType: 'Slim',
    pickupAddress: '123 Maple St, Quezon City',
    pickupDate: '2024-08-01',
    timeSlot: '9am–12pm',
    notes: 'Please call upon arrival.',
    status: 'Completed',
    deliveryOption: true,
    createdAt: new Date('2024-07-30T10:00:00Z'),
    completedAt: new Date('2024-08-01T11:00:00Z'),
    price: 5 * 25,
    paymentMethod: 'Cash on Delivery',
  },
  {
    id: 'B002',
    userId: 'U2',
    gallonCount: 3,
    gallonType: 'Round',
    pickupAddress: '456 Oak Ave, Taguig City',
    pickupDate: '2024-08-02',
    timeSlot: '1pm–5pm',
    status: 'Accepted',
    deliveryOption: true,
    createdAt: new Date('2024-08-01T11:30:00Z'),
    price: 3 * 25,
    paymentMethod: 'GCash',
  },
  {
    id: 'B003',
    userId: 'U1',
    gallonCount: 2,
    gallonType: '5G',
    pickupAddress: '123 Maple St, Quezon City',
    pickupDate: '2024-08-03',
    timeSlot: '9am–12pm',
    status: 'Pending',
    deliveryOption: false,
    createdAt: new Date('2024-08-02T09:00:00Z'),
    price: 2 * 25,
    paymentMethod: 'Cash',
  },
   {
    id: 'B004',
    userId: 'U2',
    gallonCount: 10,
    gallonType: 'Slim',
    pickupAddress: '789 Pine Ln, Makati City',
    pickupDate: '2024-08-03',
    timeSlot: '1pm–5pm',
    status: 'Pending',
    deliveryOption: true,
    createdAt: new Date('2024-08-02T14:00:00Z'),
    price: 10 * 25,
    paymentMethod: 'GCash',
  },
  {
    id: 'B005',
    userId: 'U1',
    gallonCount: 1,
    gallonType: 'Round',
    pickupAddress: '321 Elm Rd, Pasig City',
    pickupDate: '2024-07-28',
    timeSlot: '9am–12pm',
    notes: 'Leave at the guard house.',
    status: 'Cancelled',
    deliveryOption: true,
    createdAt: new Date('2024-07-27T16:00:00Z'),
    price: 1 * 25,
    paymentMethod: 'Cash on Delivery',
  },
];
