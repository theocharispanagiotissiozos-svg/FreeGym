import React, { useEffect, useState } from 'react';
import { Calendar, CreditCard, Clock, QrCode, Users } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useLanguage } from '../../hooks/useLanguage';
import { useTranslation } from '../../lib/translations';
import type { Tables } from '../../lib/supabase';

interface UserStats {
  activeSubscription: Tables<'user_subscriptions'> | null;
  creditsRemaining: number;
  upcomingBookings: number;
  totalBookings: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<UserStats>({
    activeSubscription: null,
    creditsRemaining: 0,
    upcomingBookings: 0,
    totalBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  const { profile } = useAuth();
  const { language } = useLanguage();
  const { t } = useTranslation(language);

  useEffect(() => {
    fetchUserStats();
  }, [profile]);

  const fetchUserStats = async () => {
    if (!profile) return;

    try {
      // Fetch active subscription
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', profile.id)
        .eq('status', 'active')
        .single();

      // Fetch booking stats
      const [upcomingResponse, totalResponse] = await Promise.all([
        supabase
          .from('bookings')
          .select('id', { count: 'exact' })
          .eq('user_id', profile.id)
          .eq('status', 'active')
          .gte('created_at', new Date().toISOString()),
        supabase
          .from('bookings')
          .select('id', { count: 'exact' })
          .eq('user_id', profile.id),
      ]);

      setStats({
        activeSubscription: subscription,
        creditsRemaining: subscription?.credits_remaining || 0,
        upcomingBookings: upcomingResponse.count || 0,
        totalBookings: totalResponse.count || 0,
      });
    } catch (error: any) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return language === 'gr' ? 'Καλημέρα' : 'Good Morning';
    } else if (hour < 18) {
      return language === 'gr' ? 'Καλησπέρα' : 'Good Afternoon';
    } else {
      return language === 'gr' ? 'Καλησπέρα' : 'Good Evening';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {getGreeting()}, {profile?.first_name}!
        </h1>
        <p className="text-gray-600">
          {language === 'gr' 
            ? 'Καλώς ήρθες στο FitBooking. Ας ξεκινήσουμε την προπόνησή σου!' 
            : 'Welcome to FitBooking. Let\'s start your workout journey!'
          }
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {t('common.credits')}
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.creditsRemaining}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {language === 'gr' ? 'Επόμενες Κρατήσεις' : 'Upcoming Bookings'}
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.upcomingBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {language === 'gr' ? 'Συνολικές Κρατήσεις' : 'Total Bookings'}
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {language === 'gr' ? 'Κατάσταση' : 'Status'}
              </p>
              <p className="text-sm font-bold text-gray-900">
                {stats.activeSubscription 
                  ? (language === 'gr' ? 'Ενεργό' : 'Active')
                  : (language === 'gr' ? 'Ανενεργό' : 'Inactive')
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Status */}
      {stats.activeSubscription ? (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {language === 'gr' ? 'Ενεργή Συνδρομή' : 'Active Subscription'}
          </h3>
          
          <div className="bg-green-50 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-900">
                  {language === 'gr' ? 'Η συνδρομή σας είναι ενεργή' : 'Your subscription is active'}
                </p>
                <p className="text-sm text-green-700">
                  {stats.creditsRemaining} {language === 'gr' ? 'credits διαθέσιμα' : 'credits available'}
                </p>
                {stats.activeSubscription.expires_at && (
                  <p className="text-sm text-green-700">
                    {language === 'gr' ? 'Λήγει στις:' : 'Expires on:'} {format(new Date(stats.activeSubscription.expires_at), 'PPP')}
                  </p>
                )}
              </div>
              <div className="h-12 w-12 bg-green-600 rounded-full flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {language === 'gr' ? 'Συνδρομή' : 'Subscription'}
          </h3>
          
          <div className="bg-yellow-50 rounded-lg p-6 text-center">
            <p className="text-yellow-800 font-medium mb-2">
              {language === 'gr' 
                ? 'Δεν έχετε ενεργή συνδρομή' 
                : 'You don\'t have an active subscription'
              }
            </p>
            <p className="text-sm text-yellow-700 mb-4">
              {language === 'gr' 
                ? 'Επιλέξτε ένα πακέτο για να ξεκινήσετε την προπόνησή σας'
                : 'Choose a package to start your workout journey'
              }
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          {language === 'gr' ? 'Γρήγορες Ενέργειες' : 'Quick Actions'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors">
            <Calendar className="h-6 w-6 text-gray-400 mr-3" />
            <span className="text-gray-600">
              {language === 'gr' ? 'Κάντε Κράτηση' : 'Make Booking'}
            </span>
          </button>

          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors">
            <QrCode className="h-6 w-6 text-gray-400 mr-3" />
            <span className="text-gray-600">
              {language === 'gr' ? 'Οι Κρατήσεις μου' : 'My Bookings'}
            </span>
          </button>

          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors">
            <Users className="h-6 w-6 text-gray-400 mr-3" />
            <span className="text-gray-600">
              {language === 'gr' ? 'Προφίλ' : 'Profile'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}