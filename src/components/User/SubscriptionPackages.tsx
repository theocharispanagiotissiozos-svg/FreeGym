import React, { useEffect, useState } from 'react';
import { CreditCard, Check, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useLanguage } from '../../hooks/useLanguage';
import { useTranslation } from '../../lib/translations';
import type { Tables } from '../../lib/supabase';
import toast from 'react-hot-toast';

export function SubscriptionPackages() {
  const [packages, setPackages] = useState<Tables<'subscription_packages'>[]>([]);
  const [userSubscriptions, setUserSubscriptions] = useState<Tables<'user_subscriptions'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const { profile } = useAuth();
  const { language } = useLanguage();
  const { t } = useTranslation(language);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [packagesResponse, subscriptionsResponse] = await Promise.all([
        supabase.from('subscription_packages').select('*').eq('is_active', true),
        supabase.from('user_subscriptions').select('*').eq('user_id', profile?.id || ''),
      ]);

      if (packagesResponse.error) throw packagesResponse.error;
      if (subscriptionsResponse.error) throw subscriptionsResponse.error;

      setPackages(packagesResponse.data || []);
      setUserSubscriptions(subscriptionsResponse.data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageId: string) => {
    if (!profile) return;

    setPurchasing(packageId);
    try {
      const selectedPackage = packages.find(p => p.id === packageId);
      if (!selectedPackage) throw new Error('Package not found');

      const paymentDueDate = new Date();
      paymentDueDate.setHours(paymentDueDate.getHours() + 48);

      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: profile.id,
          package_id: packageId,
          credits_remaining: selectedPackage.total_credits,
          payment_due_date: paymentDueDate.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Create payment record
      await supabase
        .from('payments')
        .insert({
          user_id: profile.id,
          subscription_id: data.id,
          amount: selectedPackage.price,
        });

      toast.success(language === 'gr' 
        ? 'Συνδρομή δημιουργήθηκε! Έχετε 48 ώρες να πληρώσετε στο γυμναστήριο.' 
        : 'Subscription created! You have 48 hours to pay at the gym.'
      );

      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const groupedPackages = packages.reduce((acc, pkg) => {
    const key = `${pkg.duration_months}months`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(pkg);
    return acc;
  }, {} as Record<string, Tables<'subscription_packages'>[]>);

  const getDurationLabel = (months: number) => {
    switch (months) {
      case 1: return t('subscription.monthly');
      case 3: return t('subscription.3month');
      case 6: return t('subscription.6month');
      default: return `${months} months`;
    }
  };

  const hasActiveSubscription = userSubscriptions.some(sub => 
    sub.status === 'active' || sub.status === 'pending'
  );

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {t('subscription.title')}
        </h2>
      </div>

      {/* Active/Pending Subscriptions */}
      {userSubscriptions.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            {language === 'gr' ? 'Οι Συνδρομές σας' : 'Your Subscriptions'}
          </h3>
          <div className="space-y-3">
            {userSubscriptions.map((subscription) => {
              const pkg = packages.find(p => p.id === subscription.package_id);
              if (!pkg) return null;

              return (
                <div key={subscription.id} className="bg-white rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {language === 'gr' ? pkg.name_gr : pkg.name_en}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {t('common.credits')}: {subscription.credits_remaining}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      subscription.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : subscription.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {subscription.status === 'pending' && subscription.payment_status === 'pending' 
                        ? t('subscription.pending')
                        : subscription.status
                      }
                    </span>
                    {subscription.payment_due_date && subscription.payment_status === 'pending' && (
                      <p className="text-xs text-red-600 mt-1">
                        {t('subscription.paymentDue')} {new Date(subscription.payment_due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Package Selection */}
      {Object.entries(groupedPackages).map(([duration, durationPackages]) => (
        <div key={duration} className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {getDurationLabel(durationPackages[0].duration_months)}
          </h3>
          
          <div className="grid gap-6 md:grid-cols-3">
            {durationPackages.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {pkg.sessions_per_week}x
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {language === 'gr' ? pkg.name_gr : pkg.name_en}
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    {language === 'gr' ? pkg.description_gr : pkg.description_en}
                  </p>
                  
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-gray-900">
                      €{pkg.price}
                    </div>
                    <div className="text-sm text-gray-600">
                      {pkg.total_credits} {t('common.credits')}
                    </div>
                  </div>

                  <button
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={hasActiveSubscription || purchasing === pkg.id}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {purchasing === pkg.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t('common.loading')}
                      </>
                    ) : hasActiveSubscription ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        {language === 'gr' ? 'Ενεργή Συνδρομή' : 'Active Subscription'}
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        {t('subscription.select')}
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}