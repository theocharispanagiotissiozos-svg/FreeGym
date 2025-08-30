import React from 'react';
import { Menu, Globe, User, LogOut } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useLanguage } from '../../hooks/useLanguage';
import { useTranslation } from '../../lib/translations';

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { profile, signOut } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation(language);

  const handleLanguageToggle = () => {
    changeLanguage(language === 'gr' ? 'en' : 'gr');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center">
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="flex items-center ml-2 lg:ml-0">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">GYM</span>
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">
                FitBooking
              </h1>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={handleLanguageToggle}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Globe className="h-4 w-4 mr-1" />
              {language.toUpperCase()}
            </button>

            {/* User Menu */}
            {profile && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={`${profile.first_name} ${profile.last_name}`}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                  <span className="ml-2 text-sm font-medium text-gray-900 hidden sm:block">
                    {profile.first_name}
                  </span>
                </div>

                <button
                  onClick={signOut}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  title={t('nav.signOut')}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}