export enum Page {
  LANDING = 'LANDING',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  USER_DASHBOARD = 'USER_DASHBOARD',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  RIDER_DASHBOARD = 'RIDER_DASHBOARD',
  CREATE_BOOKING = 'CREATE_BOOKING',
  BOOKING_DETAILS = 'BOOKING_DETAILS',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
  RESET_PASSWORD = 'RESET_PASSWORD',
}

export enum UserType {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  RIDER = 'RIDER',
}

export interface User {
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  password: string; // Will store the hashed password
  type: UserType;
}

export interface GallonType {
  name: string;
  price: number;
}
export type TimeSlot = string;
export type BookingStatus = 'Pending' | 'Accepted' | 'Picked Up' | 'Refilled' | 'Out for Delivery' | 'Completed' | 'Cancelled';
export type PaymentMethod = 'Cash on Delivery' | 'Cash' | 'GCash';

export interface BookingItem {
  name: string;
  refill: number;
  new: number;
}

export interface Booking {
  id: string;
  userId: string;
  pickupAddress: string;
  pickupDate: string;
  timeSlot: TimeSlot;
  notes?: string;
  status: BookingStatus;
  deliveryOption: boolean;
  createdAt: Date;
  completedAt?: Date;
  price?: number;
  paymentMethod: PaymentMethod;
  items?: string; // JSON string of BookingItem[]

  // For backward compatibility with old data
  gallonCount?: number;
  newGallonPurchaseCount?: number;
  gallonType?: string;
}

export interface Rider {
  id: string;
  name: string;
  mobile: string;
}