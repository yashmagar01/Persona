// Internationalization (i18n) system for multi-language support

export type Language = 'en' | 'hi' | 'mr' | 'bn';

export const translations = {
  en: {
    // Navigation
    home: 'Home',
    chatboard: 'Chatboard',
    conversations: 'Conversations',
    profile: 'Profile',
    settings: 'Settings',
    signIn: 'Sign In',
    getStarted: 'Get Started',
    
    // Landing Page
    heroTitle: 'Connect with Historical Icons',
    heroSubtitle: 'Experience conversations with India\'s greatest leaders and thinkers',
    explorePersonalities: 'Explore Personalities',
    learnMore: 'Learn More',
    
    // Features
    features: 'Features',
    aiPowered: 'AI-Powered Conversations',
    aiPoweredDesc: 'Engage in realistic dialogues powered by advanced AI technology',
    historicalAccuracy: 'Historical Accuracy',
    historicalAccuracyDesc: 'Responses based on authentic speeches, writings, and philosophies',
    immersiveExperience: 'Immersive Experience',
    immersiveExperienceDesc: 'Beautiful interface that brings history to life',
    
    // Chatboard
    searchPersonalities: 'Search personalities...',
    selectPersonality: 'Select a personality to start chatting',
    noResults: 'No personalities found',
    
    // Chat
    typeMessage: 'Type your message...',
    sendMessage: 'Send message',
    newConversation: 'New Conversation',
    
    // Profile
    guestUser: 'Guest User',
    signInToSave: 'Sign in to save chats',
    editProfile: 'Edit Profile',
    conversationsCount: 'Conversations',
    messagesSent: 'Messages Sent',
    daysActive: 'Days Active',
    accountCreated: 'Account created',
    
    // Settings
    settingsTitle: 'Settings',
    accountSettings: 'Account Settings',
    accountSettingsDesc: 'Manage your account preferences',
    appearance: 'Appearance',
    appearanceDesc: 'Customize how Persona looks',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    language: 'Language',
    notifications: 'Notifications',
    notificationsDesc: 'Manage your notification preferences',
    pushNotifications: 'Push Notifications',
    pushNotificationsDesc: 'Receive notifications in your browser',
    emailNotifications: 'Email Notifications',
    emailNotificationsDesc: 'Receive updates via email',
    security: 'Security',
    securityDesc: 'Manage your password and security settings',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    updatePassword: 'Update Password',
    dangerZone: 'Danger Zone',
    dangerZoneDesc: 'Irreversible actions',
    signOut: 'Sign Out',
    signOutDesc: 'Sign out of your account',
    deleteAccount: 'Delete Account',
    deleteAccountDesc: 'Permanently delete your account and all data',
    saveChanges: 'Save Changes',
    
    // Toast Messages
    settingsSaved: 'Settings saved successfully!',
    settingsFailed: 'Failed to save settings',
    passwordUpdated: 'Password updated successfully!',
    passwordMismatch: 'Passwords do not match',
    passwordTooShort: 'Password must be at least 6 characters',
    accountDeleted: 'Account deleted successfully',
    pleaseSignIn: 'Please sign in to access this feature',
    
    // Personalities
    'Mahatma Gandhi': 'Mahatma Gandhi',
    'Chhatrapati Shivaji Maharaj': 'Chhatrapati Shivaji Maharaj',
    'Dr. B.R. Ambedkar': 'Dr. B.R. Ambedkar',
    'Subhas Chandra Bose': 'Subhas Chandra Bose',
    'Dr. APJ Abdul Kalam': 'Dr. APJ Abdul Kalam',
    'Swami Vivekananda': 'Swami Vivekananda',
    'Bhagat Singh': 'Bhagat Singh',
    'Rani Lakshmibai': 'Rani Lakshmibai',
    'Rani Durgavati': 'Rani Durgavati',
    'Savitribai Phule': 'Savitribai Phule',
    'Chanakya': 'Chanakya',
  },
  
  hi: {
    // Navigation
    home: 'होम',
    chatboard: 'चैटबोर्ड',
    conversations: 'बातचीत',
    profile: 'प्रोफाइल',
    settings: 'सेटिंग्स',
    signIn: 'साइन इन',
    getStarted: 'शुरू करें',
    
    // Landing Page
    heroTitle: 'ऐतिहासिक महापुरुषों से जुड़ें',
    heroSubtitle: 'भारत के महान नेताओं और विचारकों के साथ बातचीत का अनुभव करें',
    explorePersonalities: 'व्यक्तित्वों का अन्वेषण करें',
    learnMore: 'और जानें',
    
    // Features
    features: 'विशेषताएँ',
    aiPowered: 'AI-संचालित बातचीत',
    aiPoweredDesc: 'उन्नत AI तकनीक द्वारा संचालित यथार्थवादी संवादों में संलग्न हों',
    historicalAccuracy: 'ऐतिहासिक सटीकता',
    historicalAccuracyDesc: 'प्रामाणिक भाषणों, लेखन और दर्शन पर आधारित उत्तर',
    immersiveExperience: 'इमर्सिव अनुभव',
    immersiveExperienceDesc: 'सुंदर इंटरफ़ेस जो इतिहास को जीवंत करता है',
    
    // Chatboard
    searchPersonalities: 'व्यक्तित्वों को खोजें...',
    selectPersonality: 'चैट शुरू करने के लिए एक व्यक्तित्व चुनें',
    noResults: 'कोई व्यक्तित्व नहीं मिला',
    
    // Chat
    typeMessage: 'अपना संदेश टाइप करें...',
    sendMessage: 'संदेश भेजें',
    newConversation: 'नई बातचीत',
    
    // Profile
    guestUser: 'अतिथि उपयोगकर्ता',
    signInToSave: 'चैट सहेजने के लिए साइन इन करें',
    editProfile: 'प्रोफाइल संपादित करें',
    conversationsCount: 'बातचीत',
    messagesSent: 'भेजे गए संदेश',
    daysActive: 'सक्रिय दिन',
    accountCreated: 'खाता बनाया गया',
    
    // Settings
    settingsTitle: 'सेटिंग्स',
    accountSettings: 'खाता सेटिंग्स',
    accountSettingsDesc: 'अपनी खाता प्राथमिकताओं को प्रबंधित करें',
    appearance: 'दिखावट',
    appearanceDesc: 'Persona के दिखावट को अनुकूलित करें',
    theme: 'थीम',
    light: 'लाइट',
    dark: 'डार्क',
    system: 'सिस्टम',
    language: 'भाषा',
    notifications: 'सूचनाएं',
    notificationsDesc: 'अपनी सूचना प्राथमिकताओं को प्रबंधित करें',
    pushNotifications: 'पुश सूचनाएं',
    pushNotificationsDesc: 'अपने ब्राउज़र में सूचनाएं प्राप्त करें',
    emailNotifications: 'ईमेल सूचनाएं',
    emailNotificationsDesc: 'ईमेल के माध्यम से अपडेट प्राप्त करें',
    security: 'सुरक्षा',
    securityDesc: 'अपना पासवर्ड और सुरक्षा सेटिंग्स प्रबंधित करें',
    changePassword: 'पासवर्ड बदलें',
    currentPassword: 'वर्तमान पासवर्ड',
    newPassword: 'नया पासवर्ड',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    updatePassword: 'पासवर्ड अपडेट करें',
    dangerZone: 'खतरे का क्षेत्र',
    dangerZoneDesc: 'अपरिवर्तनीय कार्य',
    signOut: 'साइन आउट',
    signOutDesc: 'अपने खाते से साइन आउट करें',
    deleteAccount: 'खाता हटाएं',
    deleteAccountDesc: 'अपने खाते और सभी डेटा को स्थायी रूप से हटाएं',
    saveChanges: 'परिवर्तन सहेजें',
    
    // Toast Messages
    settingsSaved: 'सेटिंग्स सफलतापूर्वक सहेजी गई!',
    settingsFailed: 'सेटिंग्स सहेजने में विफल',
    passwordUpdated: 'पासवर्ड सफलतापूर्वक अपडेट किया गया!',
    passwordMismatch: 'पासवर्ड मेल नहीं खाते',
    passwordTooShort: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए',
    accountDeleted: 'खाता सफलतापूर्वक हटा दिया गया',
    pleaseSignIn: 'इस सुविधा तक पहुंचने के लिए कृपया साइन इन करें',
    
    // Personalities (Keep original names)
    'Mahatma Gandhi': 'महात्मा गांधी',
    'Chhatrapati Shivaji Maharaj': 'छत्रपति शिवाजी महाराज',
    'Dr. B.R. Ambedkar': 'डॉ. बी.आर. अंबेडकर',
    'Subhas Chandra Bose': 'सुभाष चंद्र बोस',
    'Dr. APJ Abdul Kalam': 'डॉ. एपीजे अब्दुल कलाम',
    'Swami Vivekananda': 'स्वामी विवेकानंद',
    'Bhagat Singh': 'भगत सिंह',
    'Rani Lakshmibai': 'रानी लक्ष्मीबाई',
    'Rani Durgavati': 'रानी दुर्गावती',
    'Savitribai Phule': 'सावित्रीबाई फुले',
    'Chanakya': 'चाणक्य',
  },
  
  mr: {
    // Navigation
    home: 'होम',
    chatboard: 'चॅटबोर्ड',
    conversations: 'संभाषणे',
    profile: 'प्रोफाइल',
    settings: 'सेटिंग्ज',
    signIn: 'साइन इन',
    getStarted: 'सुरुवात करा',
    
    // Landing Page
    heroTitle: 'ऐतिहासिक महापुरुषांशी संवाद साधा',
    heroSubtitle: 'भारताच्या महान नेत्यांशी आणि विचारवंतांशी संवादाचा अनुभव घ्या',
    explorePersonalities: 'व्यक्तिमत्त्वांचा शोध घ्या',
    learnMore: 'अधिक जाणून घ्या',
    
    // Features
    features: 'वैशिष्ट्ये',
    aiPowered: 'AI-चालित संवाद',
    aiPoweredDesc: 'प्रगत AI तंत्रज्ञानाद्वारे चालविलेल्या वास्तववादी संवादांमध्ये सहभागी व्हा',
    historicalAccuracy: 'ऐतिहासिक अचूकता',
    historicalAccuracyDesc: 'प्रामाणिक भाषणे, लेखन आणि तत्त्वज्ञानावर आधारित उत्तरे',
    immersiveExperience: 'इमर्सिव्ह अनुभव',
    immersiveExperienceDesc: 'सुंदर इंटरफेस जो इतिहासाला जिवंत करतो',
    
    // Chatboard
    searchPersonalities: 'व्यक्तिमत्त्वे शोधा...',
    selectPersonality: 'चॅट सुरू करण्यासाठी व्यक्तिमत्त्व निवडा',
    noResults: 'व्यक्तिमत्त्वे सापडली नाहीत',
    
    // Chat
    typeMessage: 'तुमचा संदेश टाइप करा...',
    sendMessage: 'संदेश पाठवा',
    newConversation: 'नवीन संभाषण',
    
    // Profile
    guestUser: 'अतिथी वापरकर्ता',
    signInToSave: 'चॅट जतन करण्यासाठी साइन इन करा',
    editProfile: 'प्रोफाइल संपादित करा',
    conversationsCount: 'संभाषणे',
    messagesSent: 'पाठवलेले संदेश',
    daysActive: 'सक्रिय दिवस',
    accountCreated: 'खाते तयार केले',
    
    // Settings
    settingsTitle: 'सेटिंग्ज',
    accountSettings: 'खाते सेटिंग्ज',
    accountSettingsDesc: 'तुमच्या खाते प्राधान्यांचे व्यवस्थापन करा',
    appearance: 'दिसणे',
    appearanceDesc: 'Persona कसे दिसते ते सानुकूलित करा',
    theme: 'थीम',
    light: 'लाइट',
    dark: 'डार्क',
    system: 'सिस्टम',
    language: 'भाषा',
    notifications: 'सूचना',
    notificationsDesc: 'तुमच्या सूचना प्राधान्यांचे व्यवस्थापन करा',
    pushNotifications: 'पुश सूचना',
    pushNotificationsDesc: 'तुमच्या ब्राउझरमध्ये सूचना प्राप्त करा',
    emailNotifications: 'ईमेल सूचना',
    emailNotificationsDesc: 'ईमेलद्वारे अद्यतने प्राप्त करा',
    security: 'सुरक्षा',
    securityDesc: 'तुमचा पासवर्ड आणि सुरक्षा सेटिंग्ज व्यवस्थापित करा',
    changePassword: 'पासवर्ड बदला',
    currentPassword: 'सध्याचा पासवर्ड',
    newPassword: 'नवीन पासवर्ड',
    confirmPassword: 'पासवर्डची पुष्टी करा',
    updatePassword: 'पासवर्ड अद्यतनित करा',
    dangerZone: 'धोक्याचे क्षेत्र',
    dangerZoneDesc: 'अपरिवर्तनीय क्रिया',
    signOut: 'साइन आउट',
    signOutDesc: 'तुमच्या खात्यातून साइन आउट करा',
    deleteAccount: 'खाते हटवा',
    deleteAccountDesc: 'तुमचे खाते आणि सर्व डेटा कायमस्वरूपी हटवा',
    saveChanges: 'बदल जतन करा',
    
    // Toast Messages
    settingsSaved: 'सेटिंग्ज यशस्वीरित्या जतन केल्या!',
    settingsFailed: 'सेटिंग्ज जतन करण्यात अयशस्वी',
    passwordUpdated: 'पासवर्ड यशस्वीरित्या अद्यतनित केला!',
    passwordMismatch: 'पासवर्ड जुळत नाहीत',
    passwordTooShort: 'पासवर्ड किमान 6 अक्षरांचा असणे आवश्यक आहे',
    accountDeleted: 'खाते यशस्वीरित्या हटवले',
    pleaseSignIn: 'या वैशिष्ट्यात प्रवेश करण्यासाठी कृपया साइन इन करा',
    
    // Personalities (Keep original names)
    'Mahatma Gandhi': 'महात्मा गांधी',
    'Chhatrapati Shivaji Maharaj': 'छत्रपती शिवाजी महाराज',
    'Dr. B.R. Ambedkar': 'डॉ. बी.आर. आंबेडकर',
    'Subhas Chandra Bose': 'सुभाषचंद्र बोस',
    'Dr. APJ Abdul Kalam': 'डॉ. एपीजे अब्दुल कलाम',
    'Swami Vivekananda': 'स्वामी विवेकानंद',
    'Bhagat Singh': 'भगतसिंग',
    'Rani Lakshmibai': 'राणी लक्ष्मीबाई',
    'Rani Durgavati': 'राणी दुर्गावती',
    'Savitribai Phule': 'सावित्रीबाई फुले',
    'Chanakya': 'चाणक्य',
  },
  
  bn: {
    // Navigation
    home: 'হোম',
    chatboard: 'চ্যাটবোর্ড',
    conversations: 'কথোপকথন',
    profile: 'প্রোফাইল',
    settings: 'সেটিংস',
    signIn: 'সাইন ইন',
    getStarted: 'শুরু করুন',
    
    // Landing Page
    heroTitle: 'ঐতিহাসিক মহাপুরুষদের সাথে সংযুক্ত হন',
    heroSubtitle: 'ভারতের মহান নেতা এবং চিন্তাবিদদের সাথে কথোপকথনের অভিজ্ঞতা নিন',
    explorePersonalities: 'ব্যক্তিত্ব অন্বেষণ করুন',
    learnMore: 'আরও জানুন',
    
    // Features
    features: 'বৈশিষ্ট্য',
    aiPowered: 'AI-চালিত কথোপকথন',
    aiPoweredDesc: 'উন্নত AI প্রযুক্তি দ্বারা চালিত বাস্তবসম্মত সংলাপে যুক্ত হন',
    historicalAccuracy: 'ঐতিহাসিক নির্ভুলতা',
    historicalAccuracyDesc: 'প্রামাণিক বক্তৃতা, লেখা এবং দর্শনের উপর ভিত্তি করে উত্তর',
    immersiveExperience: 'নিমজ্জিত অভিজ্ঞতা',
    immersiveExperienceDesc: 'সুন্দর ইন্টারফেস যা ইতিহাসকে জীবন্ত করে',
    
    // Chatboard
    searchPersonalities: 'ব্যক্তিত্ব খুঁজুন...',
    selectPersonality: 'চ্যাট শুরু করতে একটি ব্যক্তিত্ব নির্বাচন করুন',
    noResults: 'কোনো ব্যক্তিত্ব পাওয়া যায়নি',
    
    // Chat
    typeMessage: 'আপনার বার্তা টাইপ করুন...',
    sendMessage: 'বার্তা পাঠান',
    newConversation: 'নতুন কথোপকথন',
    
    // Profile
    guestUser: 'অতিথি ব্যবহারকারী',
    signInToSave: 'চ্যাট সংরক্ষণ করতে সাইন ইন করুন',
    editProfile: 'প্রোফাইল সম্পাদনা করুন',
    conversationsCount: 'কথোপকথন',
    messagesSent: 'পাঠানো বার্তা',
    daysActive: 'সক্রিয় দিন',
    accountCreated: 'অ্যাকাউন্ট তৈরি হয়েছে',
    
    // Settings
    settingsTitle: 'সেটিংস',
    accountSettings: 'অ্যাকাউন্ট সেটিংস',
    accountSettingsDesc: 'আপনার অ্যাকাউন্ট পছন্দগুলি পরিচালনা করুন',
    appearance: 'চেহারা',
    appearanceDesc: 'Persona কীভাবে দেখায় তা কাস্টমাইজ করুন',
    theme: 'থিম',
    light: 'লাইট',
    dark: 'ডার্ক',
    system: 'সিস্টেম',
    language: 'ভাষা',
    notifications: 'বিজ্ঞপ্তি',
    notificationsDesc: 'আপনার বিজ্ঞপ্তি পছন্দগুলি পরিচালনা করুন',
    pushNotifications: 'পুশ বিজ্ঞপ্তি',
    pushNotificationsDesc: 'আপনার ব্রাউজারে বিজ্ঞপ্তি গ্রহণ করুন',
    emailNotifications: 'ইমেল বিজ্ঞপ্তি',
    emailNotificationsDesc: 'ইমেলের মাধ্যমে আপডেট গ্রহণ করুন',
    security: 'নিরাপত্তা',
    securityDesc: 'আপনার পাসওয়ার্ড এবং নিরাপত্তা সেটিংস পরিচালনা করুন',
    changePassword: 'পাসওয়ার্ড পরিবর্তন করুন',
    currentPassword: 'বর্তমান পাসওয়ার্ড',
    newPassword: 'নতুন পাসওয়ার্ড',
    confirmPassword: 'পাসওয়ার্ড নিশ্চিত করুন',
    updatePassword: 'পাসওয়ার্ড আপডেট করুন',
    dangerZone: 'বিপদ অঞ্চল',
    dangerZoneDesc: 'অপরিবর্তনীয় ক্রিয়া',
    signOut: 'সাইন আউট',
    signOutDesc: 'আপনার অ্যাকাউন্ট থেকে সাইন আউট করুন',
    deleteAccount: 'অ্যাকাউন্ট মুছুন',
    deleteAccountDesc: 'আপনার অ্যাকাউন্ট এবং সমস্ত ডেটা স্থায়ীভাবে মুছুন',
    saveChanges: 'পরিবর্তনগুলি সংরক্ষণ করুন',
    
    // Toast Messages
    settingsSaved: 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে!',
    settingsFailed: 'সেটিংস সংরক্ষণ করতে ব্যর্থ',
    passwordUpdated: 'পাসওয়ার্ড সফলভাবে আপডেট হয়েছে!',
    passwordMismatch: 'পাসওয়ার্ড মিলছে না',
    passwordTooShort: 'পাসওয়ার্ড কমপক্ষে 6 অক্ষরের হতে হবে',
    accountDeleted: 'অ্যাকাউন্ট সফলভাবে মুছে ফেলা হয়েছে',
    pleaseSignIn: 'এই বৈশিষ্ট্য অ্যাক্সেস করতে দয়া করে সাইন ইন করুন',
    
    // Personalities (Keep original names)
    'Mahatma Gandhi': 'মহাত্মা গান্ধী',
    'Chhatrapati Shivaji Maharaj': 'ছত্রপতি শিবাজী মহারাজ',
    'Dr. B.R. Ambedkar': 'ডক্টর বি.আর. আম্বেদকর',
    'Subhas Chandra Bose': 'সুভাষ চন্দ্র বসু',
    'Dr. APJ Abdul Kalam': 'ডক্টর এপিজে আবদুল কালাম',
    'Swami Vivekananda': 'স্বামী বিবেকানন্দ',
    'Bhagat Singh': 'ভগৎ সিং',
    'Rani Lakshmibai': 'রানী লক্ষ্মীবাঈ',
    'Rani Durgavati': 'রানী দুর্গাবতী',
    'Savitribai Phule': 'সাবিত্রীবাঈ ফুলে',
    'Chanakya': 'চাণক্য',
  },
};

// Get translation function
export function getTranslation(key: string, lang: Language = 'en'): string {
  const langTranslations = translations[lang] as Record<string, string>;
  return langTranslations[key] || translations.en[key as keyof typeof translations.en] || key;
}

// Get current language from localStorage
export function getCurrentLanguage(): Language {
  const saved = localStorage.getItem('language');
  return (saved as Language) || 'en';
}

// Set language to localStorage
export function setLanguage(lang: Language): void {
  localStorage.setItem('language', lang);
  // Dispatch custom event to notify components
  window.dispatchEvent(new CustomEvent('languagechange', { detail: { language: lang } }));
}
