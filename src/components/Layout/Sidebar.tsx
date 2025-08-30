import React from 'react';
import { 
  Home, 
  Calendar, 
  CreditCard, 
  User, 
  Settings, 
  Users,
  DollarSign,
  Clock
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useLanguage } from '../../hooks/useLanguage';
import { useTranslation } from '../../lib/translations';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ currentPage, onPageChange, isOpen, onClose }: SidebarProps) {
  const { profile } = useAuth();
  const { language } = useLanguage();
  const { t } = useTranslation(language);

  const userMenuItems = [
    { id: 'home', icon: Home, label: t('nav.home') },
    { id: 'bookings', icon: Calendar, label: t('nav.bookings') },
    { id: 'subscriptions', icon: CreditCard, label: t('nav.subscriptions') },
    { id: 'profile', icon: User, label: t('nav.profile') },
  ];

  const trainerMenuItems = [
    { id: 'home', icon: Home, label: t('nav.home') },
    { id: 'trainer-schedule', icon: Clock, label: t('trainer.schedule') },
    { id: 'profile', icon: User, label: t('nav.profile') },
  ];

  const adminMenuItems = [
    { id: 'admin-dashboard', icon: Settings, label: t('admin.dashboard') },
    { id: 'admin-users', icon: Users, label: 'Users' },
    { id: 'admin-revenue', icon: DollarSign, label: t('admin.revenue') },
    { id: 'admin-schedule', icon: Calendar, label: t('admin.scheduleManagement') },
    { id: 'profile', icon: User, label: t('nav.profile') },
  ];

  const getMenuItems = () => {
    switch (profile?.role) {
      case 'admin':
        return adminMenuItems;
      case 'trainer':
        return trainerMenuItems;
      default:
        return userMenuItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo area */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">GYM</span>
            </div>
            <span className="ml-3 text-lg font-bold text-gray-900">FitBooking</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    onClose();
                  }}
                  className={`
                    w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User info */}
          {profile && (
            <div className="px-4 py-4 border-t border-gray-200">
              <div className="flex items-center">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={`${profile.first_name} ${profile.last_name}`}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                )}
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {profile.first_name} {profile.last_name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {profile.role}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}