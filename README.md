# FitBooking - Gym Management System

A comprehensive gym booking and subscription management system built with React, TypeScript, and Supabase.

## Features

### User Features
- **Authentication**: Secure sign up/sign in with email and password
- **Profile Management**: Upload profile photos, manage personal information
- **Subscription Packages**: Choose from Monthly, 3-Month, or 6-Month plans with 1-3 sessions per week
- **Class Booking**: Book Pilates, Personal Training, or Free Gym sessions
- **QR Codes**: Unique QR codes for each booking for gym entry/exit
- **Referral System**: Refer friends with unique referral codes
- **Multilingual**: Full Greek and English language support

### Trainer Features
- **Schedule View**: See assigned classes and participants
- **Participant Management**: View booked participants for each session

### Admin Features
- **Dashboard**: Overview of users, revenue, and pending approvals
- **Payment Approval**: 48-hour approval window for subscription payments
- **Schedule Management**: Set weekly class schedules
- **User Management**: View and manage all user accounts
- **Revenue Tracking**: Automatic calculation of gym revenue

## Technical Specifications

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for responsive design
- **React Router** for navigation
- **React Hook Form** with Zod validation
- **QR Code generation** for bookings
- **Responsive design** optimized for desktop, tablet, and mobile
- **WebView compatible** for Android and iOS apps

### Backend
- **Supabase** for database and authentication
- **Row Level Security** for data protection
- **Real-time updates** for booking availability
- **File storage** for profile photos

### Database Schema
- User profiles with role-based access (User, Trainer, Admin)
- Subscription packages and user subscriptions
- Class types, rooms, and capacity management
- Booking system with QR code generation
- Payment tracking and approval workflow
- Referral system

## Business Logic

### Subscription Flow
1. User selects subscription package
2. Credits are allocated but not activated
3. 48-hour payment window starts
4. Admin must approve payment at gym
5. Credits activate upon approval
6. Automatic expiration of unpaid subscriptions

### Booking Constraints
- Gym closed in August
- Operating days: Monday to Friday only
- Capacity limits per room type:
  - Pilates: 4 participants
  - Personal Training Room A: 6 participants
  - Personal Training Room B: 8 participants
  - Free Gym: 50 participants

### QR Code System
- Unique QR codes generated for each booking
- Separate codes for different class types
- Secure entry/exit tracking

## Setup Instructions

1. **Supabase Setup**:
   - Click "Connect to Supabase" in the top right
   - Run the provided migrations to set up the database schema
   - Configure storage bucket for profile photos

2. **Environment Variables**:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

3. **Development**:
   ```bash
   npm install
   npm run dev
   ```

4. **Production Build**:
   ```bash
   npm run build
   ```

## Deployment

The application is designed to be:
- Deployed as a web application
- Wrapped in WebView for mobile apps
- Responsive across all device types
- Performance optimized for mobile networks

## Security Features

- Row Level Security on all database tables
- Role-based access control
- Secure authentication with Supabase
- Input validation and sanitization
- HTTPS enforcement for production

## Multilingual Support

Complete Greek and English translations covering:
- All user interface elements
- Form labels and validation messages
- System notifications and alerts
- Admin and trainer interfaces

The application automatically saves language preferences and maintains consistency across all user sessions.