import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';

export function useLanguage() {
  const { profile, updateProfile } = useAuth();
  const [language, setLanguage] = useState<'gr' | 'en'>('gr');

  useEffect(() => {
    if (profile?.language) {
      setLanguage(profile.language);
    }
  }, [profile]);

  const changeLanguage = async (newLanguage: 'gr' | 'en') => {
    setLanguage(newLanguage);
    
    if (profile) {
      try {
        await updateProfile({ language: newLanguage });
      } catch (error) {
        console.error('Failed to update language preference:', error);
      }
    }
  };

  return { language, changeLanguage };
}