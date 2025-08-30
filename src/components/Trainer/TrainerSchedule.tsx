import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Users, MapPin } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useLanguage } from '../../hooks/useLanguage';
import { useTranslation } from '../../lib/translations';
import type { Tables } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface SessionWithDetails extends Tables<'class_sessions'> {
  room: Tables<'rooms'> & {
    class_type: Tables<'class_types'>;
  };
  bookings: Array<{
    user: Tables<'profiles'>;
  }>;
}

export function TrainerSchedule() {
  const [sessions, setSessions] = useState<SessionWithDetails[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const { profile } = useAuth();
  const { language } = useLanguage();
  const { t } = useTranslation(language);

  useEffect(() => {
    fetchTrainerSessions();
  }, [selectedDate, profile]);

  const fetchTrainerSessions = async () => {
    if (!profile) return;

    try {
      const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const endDate = addDays(startDate, 6);

      const { data, error } = await supabase
        .from('class_sessions')
        .select(`
          *,
          room:rooms!inner(
            *,
            class_type:class_types!inner(*)
          ),
          bookings:bookings!inner(
            user:profiles!inner(first_name, last_name, avatar_url)
          )
        `)
        .gte('session_date', format(startDate, 'yyyy-MM-dd'))
        .lte('session_date', format(endDate, 'yyyy-MM-dd'))
        .eq('trainer_id', profile.id)
        .order('session_date')
        .order('start_time');

      if (error) throw error;

      setSessions(data as SessionWithDetails[] || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const todaySessions = sessions.filter(session => 
    format(new Date(session.session_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );

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
          {t('trainer.schedule')}
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

      {/* Today's Sessions Highlight */}
      {todaySessions.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            {t('trainer.todayClasses')}
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {todaySessions.map((session) => (
              <div key={session.id} className="bg-white rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    {session.start_time} - {session.end_time}
                  </span>
                  <span className="text-sm text-gray-600">
                    {session.current_bookings}/{session.max_capacity}
                  </span>
                </div>
                <h4 className="font-medium text-gray-900">
                  {language === 'gr' 
                    ? session.room.class_type.name_gr 
                    : session.room.class_type.name_en
                  }
                </h4>
                <p className="text-sm text-gray-600">
                  {language === 'gr' ? session.room.name_gr : session.room.name_en}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Sessions */}
      <div className="grid gap-6">
        {sessions.map((session) => (
          <div key={session.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <div 
                    className="h-3 w-3 rounded-full mr-3"
                    style={{ backgroundColor: session.room.class_type.color }}
                  />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {language === 'gr' 
                      ? session.room.class_type.name_gr 
                      : session.room.class_type.name_en
                    }
                  </h3>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {format(new Date(session.session_date), 'EEEE, MMMM d, yyyy')}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {session.start_time} - {session.end_time}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {language === 'gr' ? session.room.name_gr : session.room.name_en}
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    {session.current_bookings}/{session.max_capacity} {t('trainer.participants')}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  session.current_bookings === 0 
                    ? 'bg-gray-100 text-gray-600'
                    : session.current_bookings >= session.max_capacity
                    ? 'bg-red-100 text-red-600'
                    : 'bg-green-100 text-green-600'
                }`}>
                  {session.current_bookings === 0 
                    ? (language === 'gr' ? 'Κενό' : 'Empty')
                    : session.current_bookings >= session.max_capacity
                    ? (language === 'gr' ? 'Πλήρες' : 'Full')
                    : (language === 'gr' ? 'Ενεργό' : 'Active')
                  }
                </span>
              </div>
            </div>

            {/* Participants List */}
            {session.bookings && session.bookings.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  {t('trainer.participants')}:
                </h4>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {session.bookings.map((booking, index) => (
                    <div key={index} className="flex items-center p-2 bg-gray-50 rounded-lg">
                      {booking.user.avatar_url ? (
                        <img
                          src={booking.user.avatar_url}
                          alt={`${booking.user.first_name} ${booking.user.last_name}`}
                          className="h-8 w-8 rounded-full object-cover mr-3"
                        />
                      ) : (
                        <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs text-gray-600">
                            {booking.user.first_name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <span className="text-sm text-gray-900">
                        {booking.user.first_name} {booking.user.last_name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {language === 'gr' 
              ? 'Δεν υπάρχουν προγραμματισμένα μαθήματα για αυτή την εβδομάδα.' 
              : 'No scheduled classes for this week.'
            }
          </p>
        </div>
      )}
    </div>
  );
}