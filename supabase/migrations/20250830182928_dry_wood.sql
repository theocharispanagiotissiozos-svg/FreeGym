/*
  # Initial Data for Gym Booking System

  ## Overview
  Inserts default data including class types, rooms, subscription packages, and system settings.

  ## 1. Data Inserted
  - Class types: Pilates, Personal Training, Free Gym
  - Rooms with appropriate capacities
  - Subscription packages for different durations and frequencies
  - System settings for operational parameters

  ## 2. Configuration
  - Multilingual content (Greek/English)
  - Proper capacity limits per room type
  - Realistic pricing structure
*/

-- Insert Class Types
INSERT INTO class_types (name_gr, name_en, description_gr, description_en, icon, color) VALUES
('Pilates', 'Pilates', 'Ασκήσεις Pilates για ευελιξία και δύναμη', 'Pilates exercises for flexibility and strength', 'activity', '#16a34a'),
('Προσωπική Προπόνηση', 'Personal Training', 'Εξατομικευμένη προπόνηση με trainer', 'Personalized training with a trainer', 'dumbbell', '#2563eb'),
('Ελεύθερη Χρήση', 'Free Gym', 'Ελεύθερη πρόσβαση στο γυμναστήριο', 'Free access to gym equipment', 'home', '#ea580c');

-- Insert Rooms
INSERT INTO rooms (name_gr, name_en, class_type_id, max_capacity) VALUES
('Αίθουσα Pilates', 'Pilates Room', (SELECT id FROM class_types WHERE name_en = 'Pilates'), 4),
('Studio A', 'Studio A', (SELECT id FROM class_types WHERE name_en = 'Personal Training'), 6),
('Studio B', 'Studio B', (SELECT id FROM class_types WHERE name_en = 'Personal Training'), 8),
('Κύρια Αίθουσα', 'Main Gym', (SELECT id FROM class_types WHERE name_en = 'Free Gym'), 50);

-- Insert Subscription Packages
INSERT INTO subscription_packages (name_gr, name_en, duration_months, sessions_per_week, total_credits, price, description_gr, description_en) VALUES
-- Monthly packages
('Μηνιαίο 1x/εβδομάδα', 'Monthly 1x/week', 1, 1, 4, 40.00, '4 συνεδρίες το μήνα', '4 sessions per month'),
('Μηνιαίο 2x/εβδομάδα', 'Monthly 2x/week', 1, 2, 8, 70.00, '8 συνεδρίες το μήνα', '8 sessions per month'),
('Μηνιαίο 3x/εβδομάδα', 'Monthly 3x/week', 1, 3, 12, 90.00, '12 συνεδρίες το μήνα', '12 sessions per month'),

-- 3-Month packages
('Τριμηνιαίο 1x/εβδομάδα', '3-Month 1x/week', 3, 1, 12, 100.00, '12 συνεδρίες σε 3 μήνες', '12 sessions in 3 months'),
('Τριμηνιαίο 2x/εβδομάδα', '3-Month 2x/week', 3, 2, 24, 180.00, '24 συνεδρίες σε 3 μήνες', '24 sessions in 3 months'),
('Τριμηνιαίο 3x/εβδομάδα', '3-Month 3x/week', 3, 3, 36, 240.00, '36 συνεδρίες σε 3 μήνες', '36 sessions in 3 months'),

-- 6-Month packages
('Εξαμηνιαίο 1x/εβδομάδα', '6-Month 1x/week', 6, 1, 24, 180.00, '24 συνεδρίες σε 6 μήνες', '24 sessions in 6 months'),
('Εξαμηνιαίο 2x/εβδομάδα', '6-Month 2x/week', 6, 2, 48, 320.00, '48 συνεδρίες σε 6 μήνες', '48 sessions in 6 months'),
('Εξαμηνιαίο 3x/εβδομάδα', '6-Month 3x/week', 6, 3, 72, 450.00, '72 συνεδρίες σε 6 μήνες', '72 sessions in 6 months');

-- Insert System Settings
INSERT INTO system_settings (key, value, description) VALUES
('payment_approval_hours', '48', 'Hours to approve payment before cancellation'),
('gym_closed_months', 'August', 'Months when gym is closed'),
('operating_days', '1,2,3,4,5', 'Days of week gym operates (1=Monday, 7=Sunday)'),
('default_session_duration', '60', 'Default session duration in minutes'),
('referral_bonus_credits', '2', 'Bonus credits for successful referrals');