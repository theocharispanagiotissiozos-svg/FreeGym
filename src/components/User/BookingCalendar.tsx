import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Users, QrCode, X } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay, getMonth } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useLanguage } from '../../hooks/useLanguage';
import { useTranslation } from '../../lib/translations';
import type { Tables } from '../../lib/supabase';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';

interface SessionWithDetails extends Tables<'class_sessions'> {
  room: Tables<'rooms'> & {
    class_type: Tables<'class_types'>;
  };
  trainer?: Tables<'profiles'>;
}

interface BookingWithDetails extends Tables<'bookings'> {
  session: SessionWithDetails;
}

export function BookingCalendar() {
  const [sessions, setSessions] = useState<SessionWithDetails[]>([]);
  const [userBookings, setUserBookings] = useState<BookingWithDetails[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<string | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedQr, setSelectedQr] = useState<{ code: string; session: string } | null>(null);

  const { profile } = useAuth();
  const { language } = useLanguage();
  const { t } = useTranslation(language);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    if (!profile) return;

    try {
      const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const endDate = addDays(startDate, 6);

      // Fetch sessions for the week
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('class_sessions')
        .select(`
          *,
          room:rooms!inner(
            *,
            class_type:class_types!inner(*)
          ),
          trainer:profiles(first_name, last_name)
        `)
        .gte('session_date', format(startDate, 'yyyy-MM-dd'))
        .lte('session_date', format(endDate, 'yyyy-MM-dd'))
        .eq('status', 'available')
        .order('session_date')
        .order('start_time');

      if (sessionsError) throw sessionsError;

      // Fetch user bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          session:class_sessions!inner(
            *,
            room:rooms!inner(
              *,
              class_type:class_types!inner(*)
            )
          )
        `)
        .eq('user_id', profile.id)
        .eq('status', 'active');

      if (bookingsError) throw bookingsError;

      setSessions(sessionsData as SessionWithDetails[] || []);
      setUserBookings(bookingsData as BookingWithDetails[] || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = async (sessionId: string) => {
    if (!profile) return;

    // Check if user has active subscription with credits
    const { data: activeSubscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', profile.id)
      .eq('status', 'active')
      .gt('credits_remaining', 0)
      .single();

    if (!activeSubscription) {
      toast.error(language === 'gr' 
        ? 'Δεν έχετε ενεργή συνδρομή με διαθέσιμα credits.' 
        : 'You do not have an active subscription with available credits.'
      );
      return;
    }

    setBooking(sessionId);
    try {
      const { error } = await supabase
        .from('bookings')
        .insert({
          user_id: profile.id,
          session_id: sessionId,
          subscription_id: activeSubscription.id,
          status: 'active',
        });

      if (error) throw error;

      // Update subscription credits
      await supabase
        .from('user_subscriptions')
        .update({ credits_remaining: activeSubscription.credits_remaining - 1 })
        .eq('id', activeSubscription.id);

      toast.success(language === 'gr' ? 'Κράτηση επιτυχής!' : 'Booking successful!');
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setBooking(null);
    }
  };

  const showQrCode = async (booking: BookingWithDetails) => {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(booking.qr_code, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff',
        },
      });

      setSelectedQr({
        code: qrCodeDataUrl,
        session: language === 'gr' 
          ? booking.session.room.class_type.name_gr 
          : booking.session.room.class_type.name_en,
      });
      setQrModalOpen(true);
    } catch (error) {
      toast.error('Failed to generate QR code');
    }
  };

  const isAugust = getMonth(selectedDate) === 7; // August is month 7 (0-indexed)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {t('booking.title')}
        </h2>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <button
          onClick={() => setSelectedDate(addDays(selectedDate, -7))}
          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          ← {language === 'gr' ? 'Προηγούμενη' : 'Previous'}
        </button>
        
        <div className="text-lg font-semibold text-gray-900">
          {format(selectedDate, 'MMMM yyyy')}
        </div>
        
        <button
          onClick={() => setSelectedDate(addDays(selectedDate, 7))}
          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          {language === 'gr' ? 'Επόμενη' : 'Next'} →
        </button>
      </div>

      {/* August Notice */}
      {isAugust && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800 font-medium">
            {language === 'gr' 
              ? 'Το γυμναστήριο είναι κλειστό τον Αύγουστο.' 
              : 'The gym is closed in August.'
            }
          </p>
        </div>
      )}

      {/* Sessions Grid */}
      {!isAugust && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => {
            const isBooked = userBookings.some(b => b.session_id === session.id);
            const availableSpots = session.max_capacity - session.current_bookings;
            
            return (
              <div key={session.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: session.room.class_type.color }}
                  />
                  <span className="text-sm text-gray-500">
                    {format(new Date(session.session_date), 'EEE, MMM d')}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {language === 'gr' 
                    ? session.room.class_type.name_gr 
                    : session.room.class_type.name_en
                  }
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {session.start_time} - {session.end_time}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    {availableSpots} {t('booking.availableSpots')}
                  </div>

                  <div className="text-sm text-gray-600">
                    {language === 'gr' ? session.room.name_gr : session.room.name_en}
                  </div>

                  {session.trainer && (
                    <div className="text-sm text-gray-600">
                      {session.trainer.first_name} {session.trainer.last_name}
                    </div>
                  )}
                </div>

                {isBooked ? (
                  <button
                    onClick={() => {
                      const booking = userBookings.find(b => b.session_id === session.id);
                      if (booking) showQrCode(booking);
                    }}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    {t('booking.qrCode')}
                  </button>
                ) : (
                  <button
                    onClick={() => handleBookSession(session.id)}
                    disabled={availableSpots === 0 || booking === session.id}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {booking === session.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t('common.loading')}
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        {t('booking.book')}
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Modal */}
      {qrModalOpen && selectedQr && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('booking.qrCode')}
              </h3>
              <button
                onClick={() => setQrModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-center">
              <div className="mb-4">
                <img
                  src={selectedQr.code}
                  alt="QR Code"
                  className="mx-auto rounded-lg"
                />
              </div>
              <p className="text-sm text-gray-600">
                {selectedQr.session}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {language === 'gr' 
                  ? 'Δείξτε αυτόν τον κώδικα στην είσοδο'
                  : 'Show this code at the entrance'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}