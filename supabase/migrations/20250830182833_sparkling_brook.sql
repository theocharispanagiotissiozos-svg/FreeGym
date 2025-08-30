/*
  # Gym Booking System Database Schema

  ## Overview
  Complete database schema for a gym booking application with user authentication, subscription packages, class bookings, and QR code management.

  ## 1. New Tables

  ### Authentication & Users
  - `profiles` - Extended user profiles with gym-specific information
  - `referrals` - Referral system for friend invitations

  ### Subscription System
  - `subscription_packages` - Available subscription plans
  - `user_subscriptions` - User's active subscriptions with payment status
  - `subscription_credits` - Session credits from subscriptions

  ### Class Management
  - `class_types` - Available class types (Pilates, Personal Training, Free Gym)
  - `rooms` - Physical rooms with capacity limits
  - `class_schedules` - Weekly recurring schedule template
  - `class_sessions` - Actual bookable time slots
  - `bookings` - User bookings with QR codes

  ### Administrative
  - `payments` - Payment tracking and approval system
  - `system_settings` - Application configuration

  ## 2. Security
  - Row Level Security enabled on all tables
  - Policies for authenticated users, trainers, and admins
  - Secure handling of payment and booking data

  ## 3. Features
  - Automatic QR code generation for bookings
  - 48-hour payment approval window
  - Referral system with unique codes
  - Multi-language support
  - Revenue tracking and analytics
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  id_number text UNIQUE NOT NULL,
  avatar_url text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'trainer', 'admin')),
  language text NOT NULL DEFAULT 'gr' CHECK (language IN ('gr', 'en')),
  referral_code text UNIQUE NOT NULL DEFAULT CONCAT('REF', UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8))),
  referred_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Referrals tracking
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  reward_applied boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(referrer_id, referee_id)
);

-- Subscription Packages
CREATE TABLE IF NOT EXISTS subscription_packages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_gr text NOT NULL,
  name_en text NOT NULL,
  duration_months integer NOT NULL CHECK (duration_months IN (1, 3, 6)),
  sessions_per_week integer NOT NULL CHECK (sessions_per_week IN (1, 2, 3)),
  total_credits integer NOT NULL,
  price decimal(10,2) NOT NULL,
  description_gr text,
  description_en text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- User Subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES subscription_packages(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
  credits_remaining integer NOT NULL DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'approved', 'rejected')),
  payment_due_date timestamptz,
  approved_by uuid REFERENCES profiles(id),
  approved_at timestamptz,
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Class Types
CREATE TABLE IF NOT EXISTS class_types (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_gr text NOT NULL,
  name_en text NOT NULL,
  description_gr text,
  description_en text,
  icon text NOT NULL,
  color text NOT NULL DEFAULT '#3b82f6',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Rooms
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_gr text NOT NULL,
  name_en text NOT NULL,
  class_type_id uuid NOT NULL REFERENCES class_types(id),
  max_capacity integer NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Class Schedules (recurring weekly template)
CREATE TABLE IF NOT EXISTS class_schedules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id uuid NOT NULL REFERENCES rooms(id),
  trainer_id uuid REFERENCES profiles(id),
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 1 AND 5), -- 1=Monday, 5=Friday
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Actual Class Sessions (generated from schedules)
CREATE TABLE IF NOT EXISTS class_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id uuid NOT NULL REFERENCES class_schedules(id),
  room_id uuid NOT NULL REFERENCES rooms(id),
  trainer_id uuid REFERENCES profiles(id),
  session_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  current_bookings integer DEFAULT 0,
  max_capacity integer NOT NULL,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'full', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(room_id, session_date, start_time)
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES class_sessions(id),
  subscription_id uuid NOT NULL REFERENCES user_subscriptions(id),
  qr_code text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed', 'no_show')),
  checked_in_at timestamptz,
  checked_out_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, session_id)
);

-- Payments tracking
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  subscription_id uuid NOT NULL REFERENCES user_subscriptions(id),
  amount decimal(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  payment_method text DEFAULT 'cash',
  processed_by uuid REFERENCES profiles(id),
  processed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- System Settings
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  description text,
  updated_by uuid REFERENCES profiles(id),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for Referrals
CREATE POLICY "Users can view their referrals" ON referrals
  FOR SELECT TO authenticated
  USING (referrer_id = auth.uid() OR referee_id = auth.uid());

CREATE POLICY "Users can create referrals" ON referrals
  FOR INSERT TO authenticated
  WITH CHECK (referee_id = auth.uid());

-- RLS Policies for Subscription Packages
CREATE POLICY "Everyone can view active packages" ON subscription_packages
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage packages" ON subscription_packages
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for User Subscriptions
CREATE POLICY "Users can view their subscriptions" ON user_subscriptions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their subscriptions" ON user_subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all subscriptions" ON user_subscriptions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for Class Types
CREATE POLICY "Everyone can view active class types" ON class_types
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage class types" ON class_types
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for Rooms
CREATE POLICY "Everyone can view active rooms" ON rooms
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage rooms" ON rooms
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for Class Schedules
CREATE POLICY "Everyone can view active schedules" ON class_schedules
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Trainers can view their schedules" ON class_schedules
  FOR SELECT TO authenticated
  USING (trainer_id = auth.uid());

CREATE POLICY "Admins can manage schedules" ON class_schedules
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for Class Sessions
CREATE POLICY "Everyone can view available sessions" ON class_sessions
  FOR SELECT TO authenticated
  USING (status = 'available');

CREATE POLICY "Admins can manage sessions" ON class_sessions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for Bookings
CREATE POLICY "Users can view their bookings" ON bookings
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their bookings" ON bookings
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Trainers can view bookings for their sessions" ON bookings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM class_sessions cs
      JOIN class_schedules sch ON cs.schedule_id = sch.id
      WHERE cs.id = session_id AND sch.trainer_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all bookings" ON bookings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for Payments
CREATE POLICY "Users can view their payments" ON payments
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage payments" ON payments
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for System Settings
CREATE POLICY "Admins can manage system settings" ON system_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_class_sessions_date ON class_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_session_id ON bookings(session_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);

-- Functions for automatic QR code generation
CREATE OR REPLACE FUNCTION generate_booking_qr_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.qr_code := CONCAT('GYM-', UPPER(SUBSTRING(NEW.id::text, 1, 8)), '-', TO_CHAR(NOW(), 'YYYYMMDD'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for QR code generation
DROP TRIGGER IF EXISTS generate_qr_code_trigger ON bookings;
CREATE TRIGGER generate_qr_code_trigger
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION generate_booking_qr_code();

-- Function to update session booking count
CREATE OR REPLACE FUNCTION update_session_booking_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE class_sessions 
    SET current_bookings = current_bookings + 1,
        status = CASE 
          WHEN current_bookings + 1 >= max_capacity THEN 'full' 
          ELSE 'available' 
        END
    WHERE id = NEW.session_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE class_sessions 
    SET current_bookings = current_bookings - 1,
        status = 'available'
    WHERE id = OLD.session_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers for booking count updates
DROP TRIGGER IF EXISTS booking_count_trigger ON bookings;
CREATE TRIGGER booking_count_trigger
  AFTER INSERT OR DELETE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_session_booking_count();

-- Function to automatically expire unpaid subscriptions
CREATE OR REPLACE FUNCTION expire_unpaid_subscriptions()
RETURNS void AS $$
BEGIN
  UPDATE user_subscriptions 
  SET status = 'cancelled'
  WHERE payment_status = 'pending' 
    AND payment_due_date < NOW() 
    AND status = 'pending';
END;
$$ LANGUAGE plpgsql;