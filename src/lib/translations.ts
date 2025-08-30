interface Translations {
  [key: string]: {
    gr: string;
    en: string;
  };
}

export const translations: Translations = {
  // Navigation
  'nav.home': { gr: 'Αρχική', en: 'Home' },
  'nav.bookings': { gr: 'Κρατήσεις', en: 'Bookings' },
  'nav.subscriptions': { gr: 'Συνδρομές', en: 'Subscriptions' },
  'nav.profile': { gr: 'Προφίλ', en: 'Profile' },
  'nav.admin': { gr: 'Διαχείριση', en: 'Admin' },
  'nav.trainer': { gr: 'Εκπαιδευτής', en: 'Trainer' },
  'nav.signOut': { gr: 'Αποσύνδεση', en: 'Sign Out' },

  // Authentication
  'auth.signIn': { gr: 'Σύνδεση', en: 'Sign In' },
  'auth.signUp': { gr: 'Εγγραφή', en: 'Sign Up' },
  'auth.email': { gr: 'Email', en: 'Email' },
  'auth.password': { gr: 'Κωδικός', en: 'Password' },
  'auth.phone': { gr: 'Τηλέφωνο', en: 'Phone' },
  'auth.firstName': { gr: 'Όνομα', en: 'First Name' },
  'auth.lastName': { gr: 'Επώνυμο', en: 'Last Name' },
  'auth.idNumber': { gr: 'Αριθμός Ταυτότητας', en: 'ID Number' },
  'auth.referralCode': { gr: 'Κωδικός Παραπομπής', en: 'Referral Code' },
  'auth.optional': { gr: '(προαιρετικό)', en: '(optional)' },
  'auth.alreadyHaveAccount': { gr: 'Έχετε ήδη λογαριασμό;', en: 'Already have an account?' },
  'auth.dontHaveAccount': { gr: 'Δεν έχετε λογαριασμό;', en: "Don't have an account?" },

  // Subscriptions
  'subscription.title': { gr: 'Επιλέξτε Συνδρομή', en: 'Choose Subscription' },
  'subscription.monthly': { gr: 'Μηνιαία', en: 'Monthly' },
  'subscription.3month': { gr: '3 Μήνες', en: '3 Months' },
  'subscription.6month': { gr: '6 Μήνες', en: '6 Months' },
  'subscription.sessionsPerWeek': { gr: 'συνεδρίες/εβδομάδα', en: 'sessions/week' },
  'subscription.totalCredits': { gr: 'Συνολικά Credits', en: 'Total Credits' },
  'subscription.select': { gr: 'Επιλογή', en: 'Select' },
  'subscription.pending': { gr: 'Εκκρεμεί Έγκριση', en: 'Pending Approval' },
  'subscription.paymentDue': { gr: 'Πληρωμή μέχρι:', en: 'Payment due by:' },

  // Bookings
  'booking.title': { gr: 'Κρατήσεις Μαθημάτων', en: 'Class Bookings' },
  'booking.selectClass': { gr: 'Επιλέξτε Μάθημα', en: 'Select Class' },
  'booking.availableSpots': { gr: 'Διαθέσιμες Θέσεις', en: 'Available Spots' },
  'booking.book': { gr: 'Κράτηση', en: 'Book' },
  'booking.cancel': { gr: 'Ακύρωση', en: 'Cancel' },
  'booking.myBookings': { gr: 'Οι Κρατήσεις μου', en: 'My Bookings' },
  'booking.qrCode': { gr: 'QR Κώδικας', en: 'QR Code' },

  // Classes
  'class.pilates': { gr: 'Pilates', en: 'Pilates' },
  'class.personalTraining': { gr: 'Προσωπική Προπόνηση', en: 'Personal Training' },
  'class.freeGym': { gr: 'Ελεύθερη Χρήση', en: 'Free Gym' },

  // Profile
  'profile.title': { gr: 'Προφίλ Χρήστη', en: 'User Profile' },
  'profile.uploadPhoto': { gr: 'Ανέβασμα Φωτογραφίας', en: 'Upload Photo' },
  'profile.takePhoto': { gr: 'Λήψη Φωτογραφίας', en: 'Take Photo' },
  'profile.save': { gr: 'Αποθήκευση', en: 'Save' },
  'profile.referralCode': { gr: 'Κωδικός Παραπομπής σας', en: 'Your Referral Code' },
  'profile.shareLink': { gr: 'Μοιραστείτε τον Σύνδεσμο', en: 'Share Link' },

  // Admin
  'admin.dashboard': { gr: 'Πίνακας Ελέγχου', en: 'Dashboard' },
  'admin.revenue': { gr: 'Έσοδα', en: 'Revenue' },
  'admin.pendingApprovals': { gr: 'Εκκρεμείς Εγκρίσεις', en: 'Pending Approvals' },
  'admin.approve': { gr: 'Έγκριση', en: 'Approve' },
  'admin.reject': { gr: 'Απόρριψη', en: 'Reject' },
  'admin.scheduleManagement': { gr: 'Διαχείριση Προγράμματος', en: 'Schedule Management' },
  'admin.saveSchedule': { gr: 'Αποθήκευση Προγράμματος', en: 'Save Schedule' },

  // Trainer
  'trainer.schedule': { gr: 'Το Πρόγραμμά μου', en: 'My Schedule' },
  'trainer.todayClasses': { gr: 'Σημερινά Μαθήματα', en: "Today's Classes" },
  'trainer.participants': { gr: 'Συμμετέχοντες', en: 'Participants' },

  // Common
  'common.loading': { gr: 'Φόρτωση...', en: 'Loading...' },
  'common.error': { gr: 'Σφάλμα', en: 'Error' },
  'common.success': { gr: 'Επιτυχία', en: 'Success' },
  'common.date': { gr: 'Ημερομηνία', en: 'Date' },
  'common.time': { gr: 'Ώρα', en: 'Time' },
  'common.status': { gr: 'Κατάσταση', en: 'Status' },
  'common.price': { gr: 'Τιμή', en: 'Price' },
  'common.credits': { gr: 'Credits', en: 'Credits' },
};

export function useTranslation(language: 'gr' | 'en' = 'gr') {
  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return { t };
}