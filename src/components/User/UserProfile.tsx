import React, { useState, useRef } from 'react';
import { Camera, Upload, Share2, Copy } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useLanguage } from '../../hooks/useLanguage';
import { useTranslation } from '../../lib/translations';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export function UserProfile() {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const { profile, updateProfile } = useAuth();
  const { language } = useLanguage();
  const { t } = useTranslation(language);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      await updateProfile({ avatar_url: data.publicUrl });
      toast.success(language === 'gr' ? 'Φωτογραφία ενημερώθηκε!' : 'Photo updated!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCopyReferralLink = () => {
    if (!profile) return;
    
    const referralLink = `${window.location.origin}?ref=${profile.referral_code}`;
    navigator.clipboard.writeText(referralLink);
    toast.success(language === 'gr' ? 'Σύνδεσμος αντιγράφηκε!' : 'Link copied!');
  };

  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {t('profile.title')}
        </h2>
      </div>

      {/* Profile Photo Section */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={`${profile.first_name} ${profile.last_name}`}
                className="h-32 w-32 rounded-full object-cover mx-auto border-4 border-gray-200"
              />
            ) : (
              <div className="h-32 w-32 bg-gray-300 rounded-full flex items-center justify-center mx-auto border-4 border-gray-200">
                <Camera className="h-12 w-12 text-gray-600" />
              </div>
            )}
            
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>

          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              {t('profile.uploadPhoto')}
            </button>

            <button
              onClick={() => cameraInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Camera className="h-4 w-4 mr-2" />
              {t('profile.takePhoto')}
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          {language === 'gr' ? 'Στοιχεία Προφίλ' : 'Profile Information'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.firstName')}
            </label>
            <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
              {profile.first_name}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.lastName')}
            </label>
            <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
              {profile.last_name}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.email')}
            </label>
            <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
              {profile.email}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.phone')}
            </label>
            <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
              {profile.phone}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.idNumber')}
            </label>
            <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
              {profile.id_number}
            </div>
          </div>
        </div>
      </div>

      {/* Referral Section */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          {language === 'gr' ? 'Παραπομπή Φίλων' : 'Refer Friends'}
        </h3>

        <div className="bg-blue-50 rounded-lg p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {profile.referral_code}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {t('profile.referralCode')}
            </p>
            
            <button
              onClick={handleCopyReferralLink}
              className="flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Copy className="h-4 w-4 mr-2" />
              {t('profile.shareLink')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}