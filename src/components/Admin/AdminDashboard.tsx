import React, { useEffect, useState } from 'react';
import { Users, DollarSign, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../hooks/useLanguage';
import { useTranslation } from '../../lib/translations';
import type { Tables } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalUsers: number;
  totalRevenue: number;
  pendingApprovals: number;
  todayBookings: number;
}

interface PendingApproval extends Tables<'user_subscriptions'> {
  user: Tables<'profiles'>;
  package: Tables<'subscription_packages'>;
  payment: Tables<'payments'>;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    todayBookings: 0,
  });
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const { language } = useLanguage();
  const { t } = useTranslation(language);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const [usersResponse, paymentsResponse, bookingsResponse] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('payments').select('amount').eq('status', 'approved'),
        supabase.from('bookings').select('id', { count: 'exact' }).gte('created_at', new Date().toISOString().split('T')[0]),
      ]);

      const totalRevenue = paymentsResponse.data?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

      // Fetch pending approvals
      const { data: pendingData, error: pendingError } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          user:profiles!inner(*),
          package:subscription_packages!inner(*),
          payment:payments!inner(*)
        `)
        .eq('payment_status', 'pending');

      if (pendingError) throw pendingError;

      setStats({
        totalUsers: usersResponse.count || 0,
        totalRevenue,
        pendingApprovals: pendingData?.length || 0,
        todayBookings: bookingsResponse.count || 0,
      });

      setPendingApprovals(pendingData as PendingApproval[] || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (subscriptionId: string, approved: boolean) => {
    setProcessing(subscriptionId);
    try {
      const now = new Date().toISOString();
      
      if (approved) {
        // Get subscription details
        const { data: subscription } = await supabase
          .from('user_subscriptions')
          .select('*, package:subscription_packages(*)')
          .eq('id', subscriptionId)
          .single();

        if (!subscription) throw new Error('Subscription not found');

        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + subscription.package.duration_months);

        // Update subscription
        await supabase
          .from('user_subscriptions')
          .update({
            payment_status: 'approved',
            status: 'active',
            approved_at: now,
            starts_at: startDate.toISOString(),
            expires_at: endDate.toISOString(),
          })
          .eq('id', subscriptionId);

        // Update payment
        await supabase
          .from('payments')
          .update({
            status: 'approved',
            processed_at: now,
          })
          .eq('subscription_id', subscriptionId);

        toast.success(language === 'gr' ? 'Συνδρομή εγκρίθηκε!' : 'Subscription approved!');
      } else {
        // Reject subscription and payment
        await Promise.all([
          supabase
            .from('user_subscriptions')
            .update({ payment_status: 'rejected', status: 'cancelled' })
            .eq('id', subscriptionId),
          supabase
            .from('payments')
            .update({ status: 'rejected', processed_at: now })
            .eq('subscription_id', subscriptionId),
        ]);

        toast.success(language === 'gr' ? 'Συνδρομή απορρίφθηκε!' : 'Subscription rejected!');
      }

      fetchDashboardData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setProcessing(null);
    }
  };

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
          {t('admin.dashboard')}
        </h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {language === 'gr' ? 'Συνολικοί Χρήστες' : 'Total Users'}
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {t('admin.revenue')}
              </p>
              <p className="text-2xl font-bold text-gray-900">€{stats.totalRevenue}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {t('admin.pendingApprovals')}
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {language === 'gr' ? 'Σημερινές Κρατήσεις' : 'Today\'s Bookings'}
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayBookings}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          {t('admin.pendingApprovals')}
        </h3>

        {pendingApprovals.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            {language === 'gr' ? 'Δεν υπάρχουν εκκρεμείς εγκρίσεις.' : 'No pending approvals.'}
          </p>
        ) : (
          <div className="space-y-4">
            {pendingApprovals.map((approval) => (
              <div key={approval.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {approval.user.first_name} {approval.user.last_name}
                        </h4>
                        <p className="text-sm text-gray-600">{approval.user.email}</p>
                      </div>
                      <div className="h-8 w-px bg-gray-300" />
                      <div>
                        <h5 className="font-medium text-gray-900">
                          {language === 'gr' ? approval.package.name_gr : approval.package.name_en}
                        </h5>
                        <p className="text-sm text-gray-600">€{approval.package.price}</p>
                      </div>
                    </div>
                    
                    {approval.payment_due_date && (
                      <p className="text-sm text-red-600 mt-2">
                        {t('subscription.paymentDue')} {new Date(approval.payment_due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleApproval(approval.id, true)}
                      disabled={processing === approval.id}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {t('admin.approve')}
                    </button>

                    <button
                      onClick={() => handleApproval(approval.id, false)}
                      disabled={processing === approval.id}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {t('admin.reject')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}