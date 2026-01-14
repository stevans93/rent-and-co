import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language, TranslationKeys } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Map country codes to languages
const countryToLanguage: Record<string, Language> = {
  // Serbian
  RS: 'sr', // Serbia
  BA: 'sr', // Bosnia and Herzegovina
  ME: 'sr', // Montenegro
  
  // Romanian
  RO: 'ro', // Romania
  MD: 'ro', // Moldova
  
  // French
  FR: 'fr', // France
  BE: 'fr', // Belgium (French-speaking)
  LU: 'fr', // Luxembourg
  MC: 'fr', // Monaco
  
  // German
  DE: 'de', // Germany
  AT: 'de', // Austria
  LI: 'de', // Liechtenstein
  
  // Italian
  IT: 'it', // Italy
  SM: 'it', // San Marino
  VA: 'it', // Vatican City
  
  // Switzerland - default to German
  CH: 'de',
};

// Swiss cantons/regions and their primary languages
const swissRegionLanguages: Record<string, Language> = {
  // German-speaking
  'Zürich': 'de', 'Bern': 'de', 'Luzern': 'de', 'Basel': 'de', 'St. Gallen': 'de',
  'Aargau': 'de', 'Thurgau': 'de', 'Zug': 'de', 'Schaffhausen': 'de', 'Schwyz': 'de',
  
  // French-speaking
  'Genève': 'fr', 'Geneva': 'fr', 'Vaud': 'fr', 'Lausanne': 'fr', 
  'Neuchâtel': 'fr', 'Fribourg': 'fr', 'Jura': 'fr', 'Valais': 'fr',
  
  // Italian-speaking
  'Ticino': 'it', 'Lugano': 'it', 'Bellinzona': 'it',
};

// Cache key for sessionStorage
const GEO_CACHE_KEY = 'geo_language_cache';
const USER_LANG_KEY = 'rent-and-co-language'; // User's manual language selection
const GEO_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

interface GeoCache {
  language: Language;
  timestamp: number;
}

function getCachedGeoLanguage(): Language | null {
  try {
    const cached = sessionStorage.getItem(GEO_CACHE_KEY);
    if (cached) {
      const data: GeoCache = JSON.parse(cached);
      // Check if cache is still valid
      if (Date.now() - data.timestamp < GEO_CACHE_DURATION) {
        return data.language;
      }
    }
  } catch {
    // Ignore cache errors
  }
  return null;
}

function setCachedGeoLanguage(language: Language): void {
  try {
    const data: GeoCache = { language, timestamp: Date.now() };
    sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(data));
  } catch {
    // Ignore cache errors
  }
}

async function detectLanguageFromGeo(skipCache: boolean = false): Promise<Language> {
  // First check cache for instant response (unless skipping)
  if (!skipCache) {
    const cached = getCachedGeoLanguage();
    if (cached) {
      return cached;
    }
  }

  try {
    // Use ip-api.com with minimal fields for faster response
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
    
    const response = await fetch(
      'http://ip-api.com/json/?fields=status,countryCode,regionName,city',
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error('Geolocation API failed');
    }
    
    const data = await response.json();
    
    if (data.status !== 'success') {
      throw new Error('Geolocation lookup failed');
    }
    
    const countryCode = data.countryCode as string;
    const regionName = data.regionName as string;
    const city = data.city as string;
    
    let detectedLanguage: Language = 'en';
    
    // Special handling for Switzerland
    if (countryCode === 'CH') {
      for (const [region, lang] of Object.entries(swissRegionLanguages)) {
        if (regionName?.includes(region) || city?.includes(region)) {
          detectedLanguage = lang;
          break;
        }
      }
      if (detectedLanguage === 'en') {
        detectedLanguage = 'de'; // Default to German for Switzerland
      }
    } else if (countryCode && countryToLanguage[countryCode]) {
      detectedLanguage = countryToLanguage[countryCode];
    }
    
    // Cache the result
    setCachedGeoLanguage(detectedLanguage);
    
    return detectedLanguage;
  } catch (error) {
    console.warn('Could not detect language from geolocation:', error);
    return 'en';
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Initialize with user's saved preference, or cached geo language, or English
  const [language, setLanguageState] = useState<Language>(() => {
    // First check if user has manually selected a language
    const savedLang = localStorage.getItem(USER_LANG_KEY) as Language;
    if (savedLang && ['sr', 'en', 'ro', 'fr', 'de', 'it'].includes(savedLang)) {
      return savedLang;
    }
    // Otherwise use cached geo language or English
    const cachedGeo = getCachedGeoLanguage();
    return cachedGeo || 'en';
  });

  // Detect language from geolocation only if user hasn't set a preference
  useEffect(() => {
    const savedLang = localStorage.getItem(USER_LANG_KEY);
    // Only auto-detect if user hasn't manually selected a language
    if (!savedLang) {
      detectLanguageFromGeo(true).then((detectedLang) => {
        setLanguageState(detectedLang);
      });
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    // Save user's manual selection to localStorage (persists across refreshes)
    localStorage.setItem(USER_LANG_KEY, lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
