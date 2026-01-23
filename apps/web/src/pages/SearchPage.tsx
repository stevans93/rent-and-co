import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useLanguage, useToast } from '../context';
import { useResources, useCategories, useDebounce, useMinimumLoading } from '../hooks';
import { SearchBar, ResourceCard, Pagination, Button, Input, Select, Resource } from '../components';
import CustomSelect from '../components/ui/CustomSelect';
import { SEO, SEOConfigs } from '../components/SEO';

// ============ Skeleton Components ============

function ResourceCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#1e1e1e] rounded-xl overflow-hidden shadow-sm animate-pulse">
      <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700"></div>
      <div className="p-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
      </div>
    </div>
  );
}

function FiltersSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  );
}

// ============ Mobile Filter Drawer ============

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function FilterDrawer({ isOpen, onClose, children }: FilterDrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <div 
        className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white dark:bg-[#1e1e1e] z-50 lg:hidden shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-drawer-title"
      >
        <div className="sticky top-0 bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          <h2 id="filter-drawer-title" className="text-lg font-semibold text-gray-900 dark:text-white">Filteri</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Zatvori filtere"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </>
  );
}

// ============ Saved Searches Types ============

interface SavedSearch {
  id: number;
  filters: SearchFilters;
  name: string;
  date: string;
}

// ============ Filters Sidebar Content ============

interface FiltersContentProps {
  filters: SearchFilters;
  onFilterChange: (key: string, value: string) => void;
  onSearch: () => void;
  onReset: () => void;
  onSaveSearch: () => void;
  onLoadSearch: (savedFilters: SearchFilters) => void;
  categories: Array<{ id?: string | number; _id?: string; name: string; slug: string }>;
  isLoadingCategories: boolean;
  t: any;
  language: string;
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  savedSearchesVersion: number; // Trigger refresh when this changes
}

// ============ City/Country Configuration by Language ============

interface CountryWithCities {
  country: string;
  countryLabel: string;
  cities: { value: string; label: string }[];
}

const locationsByLanguage: Record<string, CountryWithCities[]> = {
  sr: [
    {
      country: 'RS',
      countryLabel: 'Srbija',
      cities: [
        { value: 'Beograd', label: 'Beograd' },
        { value: 'Novi Sad', label: 'Novi Sad' },
        { value: 'Niš', label: 'Niš' },
        { value: 'Kragujevac', label: 'Kragujevac' },
        { value: 'Subotica', label: 'Subotica' },
        { value: 'Zrenjanin', label: 'Zrenjanin' },
        { value: 'Pančevo', label: 'Pančevo' },
        { value: 'Čačak', label: 'Čačak' },
        { value: 'Leskovac', label: 'Leskovac' },
        { value: 'Valjevo', label: 'Valjevo' },
        { value: 'Kruševac', label: 'Kruševac' },
        { value: 'Vranje', label: 'Vranje' },
        { value: 'Šabac', label: 'Šabac' },
        { value: 'Užice', label: 'Užice' },
        { value: 'Sombor', label: 'Sombor' },
        { value: 'Smederevo', label: 'Smederevo' },
        { value: 'Novi Pazar', label: 'Novi Pazar' },
        { value: 'Kraljevo', label: 'Kraljevo' },
        { value: 'Jagodina', label: 'Jagodina' },
        { value: 'Pirot', label: 'Pirot' },
        { value: 'Zaječar', label: 'Zaječar' },
        { value: 'Kikinda', label: 'Kikinda' },
        { value: 'Sremska Mitrovica', label: 'Sremska Mitrovica' },
        { value: 'Požarevac', label: 'Požarevac' },
        { value: 'Bor', label: 'Bor' },
        { value: 'Prokuplje', label: 'Prokuplje' },
        { value: 'Loznica', label: 'Loznica' },
        { value: 'Vršac', label: 'Vršac' },
        { value: 'Bačka Palanka', label: 'Bačka Palanka' },
        { value: 'Inđija', label: 'Inđija' },
        { value: 'Stara Pazova', label: 'Stara Pazova' },
        { value: 'Ruma', label: 'Ruma' },
        { value: 'Aranđelovac', label: 'Aranđelovac' },
        { value: 'Paraćin', label: 'Paraćin' },
        { value: 'Bečej', label: 'Bečej' },
        { value: 'Aleksinac', label: 'Aleksinac' },
        { value: 'Lazarevac', label: 'Lazarevac' },
        { value: 'Trstenik', label: 'Trstenik' },
        { value: 'Obrenovac', label: 'Obrenovac' },
        { value: 'Negotin', label: 'Negotin' },
        { value: 'Ćuprija', label: 'Ćuprija' },
        { value: 'Temerin', label: 'Temerin' },
        { value: 'Priboj', label: 'Priboj' },
        { value: 'Senta', label: 'Senta' },
        { value: 'Apatin', label: 'Apatin' },
        { value: 'Gornji Milanovac', label: 'Gornji Milanovac' },
        { value: 'Ivanjica', label: 'Ivanjica' },
        { value: 'Knjaževac', label: 'Knjaževac' },
        { value: 'Petrovac na Mlavi', label: 'Petrovac na Mlavi' },
        { value: 'Kuršumlija', label: 'Kuršumlija' },
      ],
    },
  ],
  en: [
    {
      country: 'RS',
      countryLabel: 'Serbia',
      cities: [
        { value: 'Belgrade', label: 'Belgrade' },
        { value: 'Novi Sad', label: 'Novi Sad' },
        { value: 'Niš', label: 'Niš' },
        { value: 'Kragujevac', label: 'Kragujevac' },
        { value: 'Subotica', label: 'Subotica' },
        { value: 'Zrenjanin', label: 'Zrenjanin' },
        { value: 'Pančevo', label: 'Pančevo' },
        { value: 'Čačak', label: 'Čačak' },
        { value: 'Leskovac', label: 'Leskovac' },
        { value: 'Valjevo', label: 'Valjevo' },
        { value: 'Kruševac', label: 'Kruševac' },
        { value: 'Vranje', label: 'Vranje' },
        { value: 'Šabac', label: 'Šabac' },
        { value: 'Užice', label: 'Užice' },
        { value: 'Sombor', label: 'Sombor' },
        { value: 'Smederevo', label: 'Smederevo' },
        { value: 'Novi Pazar', label: 'Novi Pazar' },
        { value: 'Kraljevo', label: 'Kraljevo' },
        { value: 'Jagodina', label: 'Jagodina' },
        { value: 'Pirot', label: 'Pirot' },
        { value: 'Zaječar', label: 'Zaječar' },
        { value: 'Kikinda', label: 'Kikinda' },
        { value: 'Sremska Mitrovica', label: 'Sremska Mitrovica' },
        { value: 'Požarevac', label: 'Požarevac' },
        { value: 'Bor', label: 'Bor' },
      ],
    },
    {
      country: 'DE',
      countryLabel: 'Germany',
      cities: [
        { value: 'Berlin', label: 'Berlin' },
        { value: 'Munich', label: 'Munich' },
        { value: 'Frankfurt', label: 'Frankfurt' },
        { value: 'Hamburg', label: 'Hamburg' },
        { value: 'Cologne', label: 'Cologne' },
        { value: 'Düsseldorf', label: 'Düsseldorf' },
        { value: 'Stuttgart', label: 'Stuttgart' },
        { value: 'Dortmund', label: 'Dortmund' },
        { value: 'Essen', label: 'Essen' },
        { value: 'Leipzig', label: 'Leipzig' },
        { value: 'Bremen', label: 'Bremen' },
        { value: 'Dresden', label: 'Dresden' },
        { value: 'Hanover', label: 'Hanover' },
        { value: 'Nuremberg', label: 'Nuremberg' },
        { value: 'Duisburg', label: 'Duisburg' },
        { value: 'Bochum', label: 'Bochum' },
        { value: 'Wuppertal', label: 'Wuppertal' },
        { value: 'Bielefeld', label: 'Bielefeld' },
        { value: 'Bonn', label: 'Bonn' },
        { value: 'Mannheim', label: 'Mannheim' },
      ],
    },
    {
      country: 'AT',
      countryLabel: 'Austria',
      cities: [
        { value: 'Vienna', label: 'Vienna' },
        { value: 'Graz', label: 'Graz' },
        { value: 'Linz', label: 'Linz' },
        { value: 'Salzburg', label: 'Salzburg' },
        { value: 'Innsbruck', label: 'Innsbruck' },
        { value: 'Klagenfurt', label: 'Klagenfurt' },
        { value: 'Villach', label: 'Villach' },
        { value: 'Wels', label: 'Wels' },
        { value: 'Sankt Pölten', label: 'Sankt Pölten' },
        { value: 'Dornbirn', label: 'Dornbirn' },
      ],
    },
    {
      country: 'CH',
      countryLabel: 'Switzerland',
      cities: [
        { value: 'Zurich', label: 'Zurich' },
        { value: 'Geneva', label: 'Geneva' },
        { value: 'Basel', label: 'Basel' },
        { value: 'Bern', label: 'Bern' },
        { value: 'Lausanne', label: 'Lausanne' },
        { value: 'Winterthur', label: 'Winterthur' },
        { value: 'Lucerne', label: 'Lucerne' },
        { value: 'St. Gallen', label: 'St. Gallen' },
        { value: 'Lugano', label: 'Lugano' },
        { value: 'Biel', label: 'Biel' },
      ],
    },
    {
      country: 'FR',
      countryLabel: 'France',
      cities: [
        { value: 'Paris', label: 'Paris' },
        { value: 'Marseille', label: 'Marseille' },
        { value: 'Lyon', label: 'Lyon' },
        { value: 'Toulouse', label: 'Toulouse' },
        { value: 'Nice', label: 'Nice' },
        { value: 'Nantes', label: 'Nantes' },
        { value: 'Strasbourg', label: 'Strasbourg' },
        { value: 'Montpellier', label: 'Montpellier' },
        { value: 'Bordeaux', label: 'Bordeaux' },
        { value: 'Lille', label: 'Lille' },
        { value: 'Rennes', label: 'Rennes' },
        { value: 'Reims', label: 'Reims' },
        { value: 'Le Havre', label: 'Le Havre' },
        { value: 'Saint-Étienne', label: 'Saint-Étienne' },
        { value: 'Toulon', label: 'Toulon' },
        { value: 'Grenoble', label: 'Grenoble' },
        { value: 'Dijon', label: 'Dijon' },
        { value: 'Angers', label: 'Angers' },
        { value: 'Nîmes', label: 'Nîmes' },
        { value: 'Aix-en-Provence', label: 'Aix-en-Provence' },
      ],
    },
    {
      country: 'IT',
      countryLabel: 'Italy',
      cities: [
        { value: 'Rome', label: 'Rome' },
        { value: 'Milan', label: 'Milan' },
        { value: 'Naples', label: 'Naples' },
        { value: 'Turin', label: 'Turin' },
        { value: 'Palermo', label: 'Palermo' },
        { value: 'Genoa', label: 'Genoa' },
        { value: 'Bologna', label: 'Bologna' },
        { value: 'Florence', label: 'Florence' },
        { value: 'Bari', label: 'Bari' },
        { value: 'Catania', label: 'Catania' },
        { value: 'Venice', label: 'Venice' },
        { value: 'Verona', label: 'Verona' },
        { value: 'Messina', label: 'Messina' },
        { value: 'Padua', label: 'Padua' },
        { value: 'Trieste', label: 'Trieste' },
        { value: 'Brescia', label: 'Brescia' },
        { value: 'Parma', label: 'Parma' },
        { value: 'Taranto', label: 'Taranto' },
        { value: 'Modena', label: 'Modena' },
        { value: 'Reggio Calabria', label: 'Reggio Calabria' },
      ],
    },
    {
      country: 'RO',
      countryLabel: 'Romania',
      cities: [
        { value: 'Bucharest', label: 'Bucharest' },
        { value: 'Cluj-Napoca', label: 'Cluj-Napoca' },
        { value: 'Timișoara', label: 'Timișoara' },
        { value: 'Iași', label: 'Iași' },
        { value: 'Constanța', label: 'Constanța' },
        { value: 'Craiova', label: 'Craiova' },
        { value: 'Brașov', label: 'Brașov' },
        { value: 'Galați', label: 'Galați' },
        { value: 'Ploiești', label: 'Ploiești' },
        { value: 'Oradea', label: 'Oradea' },
        { value: 'Brăila', label: 'Brăila' },
        { value: 'Arad', label: 'Arad' },
        { value: 'Pitești', label: 'Pitești' },
        { value: 'Sibiu', label: 'Sibiu' },
        { value: 'Bacău', label: 'Bacău' },
        { value: 'Târgu Mureș', label: 'Târgu Mureș' },
        { value: 'Baia Mare', label: 'Baia Mare' },
        { value: 'Buzău', label: 'Buzău' },
        { value: 'Botoșani', label: 'Botoșani' },
        { value: 'Satu Mare', label: 'Satu Mare' },
      ],
    },
  ],
  ro: [
    {
      country: 'RO',
      countryLabel: 'România',
      cities: [
        { value: 'București', label: 'București' },
        { value: 'Cluj-Napoca', label: 'Cluj-Napoca' },
        { value: 'Timișoara', label: 'Timișoara' },
        { value: 'Iași', label: 'Iași' },
        { value: 'Constanța', label: 'Constanța' },
        { value: 'Craiova', label: 'Craiova' },
        { value: 'Brașov', label: 'Brașov' },
        { value: 'Galați', label: 'Galați' },
        { value: 'Ploiești', label: 'Ploiești' },
        { value: 'Oradea', label: 'Oradea' },
        { value: 'Brăila', label: 'Brăila' },
        { value: 'Arad', label: 'Arad' },
        { value: 'Pitești', label: 'Pitești' },
        { value: 'Sibiu', label: 'Sibiu' },
        { value: 'Bacău', label: 'Bacău' },
        { value: 'Târgu Mureș', label: 'Târgu Mureș' },
        { value: 'Baia Mare', label: 'Baia Mare' },
        { value: 'Buzău', label: 'Buzău' },
        { value: 'Botoșani', label: 'Botoșani' },
        { value: 'Satu Mare', label: 'Satu Mare' },
        { value: 'Râmnicu Vâlcea', label: 'Râmnicu Vâlcea' },
        { value: 'Drobeta-Turnu Severin', label: 'Drobeta-Turnu Severin' },
        { value: 'Suceava', label: 'Suceava' },
        { value: 'Piatra Neamț', label: 'Piatra Neamț' },
        { value: 'Târgu Jiu', label: 'Târgu Jiu' },
        { value: 'Târgoviște', label: 'Târgoviște' },
        { value: 'Focșani', label: 'Focșani' },
        { value: 'Bistrița', label: 'Bistrița' },
        { value: 'Reșița', label: 'Reșița' },
        { value: 'Tulcea', label: 'Tulcea' },
      ],
    },
  ],
  de: [
    {
      country: 'DE',
      countryLabel: 'Deutschland',
      cities: [
        { value: 'Berlin', label: 'Berlin' },
        { value: 'München', label: 'München' },
        { value: 'Frankfurt', label: 'Frankfurt' },
        { value: 'Hamburg', label: 'Hamburg' },
        { value: 'Köln', label: 'Köln' },
        { value: 'Düsseldorf', label: 'Düsseldorf' },
        { value: 'Stuttgart', label: 'Stuttgart' },
        { value: 'Dortmund', label: 'Dortmund' },
        { value: 'Essen', label: 'Essen' },
        { value: 'Leipzig', label: 'Leipzig' },
        { value: 'Bremen', label: 'Bremen' },
        { value: 'Dresden', label: 'Dresden' },
        { value: 'Hannover', label: 'Hannover' },
        { value: 'Nürnberg', label: 'Nürnberg' },
        { value: 'Duisburg', label: 'Duisburg' },
        { value: 'Bochum', label: 'Bochum' },
        { value: 'Wuppertal', label: 'Wuppertal' },
        { value: 'Bielefeld', label: 'Bielefeld' },
        { value: 'Bonn', label: 'Bonn' },
        { value: 'Mannheim', label: 'Mannheim' },
        { value: 'Karlsruhe', label: 'Karlsruhe' },
        { value: 'Augsburg', label: 'Augsburg' },
        { value: 'Wiesbaden', label: 'Wiesbaden' },
        { value: 'Münster', label: 'Münster' },
        { value: 'Gelsenkirchen', label: 'Gelsenkirchen' },
        { value: 'Aachen', label: 'Aachen' },
        { value: 'Mönchengladbach', label: 'Mönchengladbach' },
        { value: 'Braunschweig', label: 'Braunschweig' },
        { value: 'Kiel', label: 'Kiel' },
        { value: 'Chemnitz', label: 'Chemnitz' },
      ],
    },
    {
      country: 'AT',
      countryLabel: 'Österreich',
      cities: [
        { value: 'Wien', label: 'Wien' },
        { value: 'Graz', label: 'Graz' },
        { value: 'Linz', label: 'Linz' },
        { value: 'Salzburg', label: 'Salzburg' },
        { value: 'Innsbruck', label: 'Innsbruck' },
        { value: 'Klagenfurt', label: 'Klagenfurt' },
        { value: 'Villach', label: 'Villach' },
        { value: 'Wels', label: 'Wels' },
        { value: 'Sankt Pölten', label: 'Sankt Pölten' },
        { value: 'Dornbirn', label: 'Dornbirn' },
        { value: 'Wiener Neustadt', label: 'Wiener Neustadt' },
        { value: 'Steyr', label: 'Steyr' },
        { value: 'Feldkirch', label: 'Feldkirch' },
        { value: 'Bregenz', label: 'Bregenz' },
        { value: 'Leonding', label: 'Leonding' },
      ],
    },
    {
      country: 'CH',
      countryLabel: 'Schweiz',
      cities: [
        { value: 'Zürich', label: 'Zürich' },
        { value: 'Genf', label: 'Genf' },
        { value: 'Basel', label: 'Basel' },
        { value: 'Bern', label: 'Bern' },
        { value: 'Lausanne', label: 'Lausanne' },
        { value: 'Winterthur', label: 'Winterthur' },
        { value: 'Luzern', label: 'Luzern' },
        { value: 'St. Gallen', label: 'St. Gallen' },
        { value: 'Lugano', label: 'Lugano' },
        { value: 'Biel', label: 'Biel' },
      ],
    },
  ],
  fr: [
    {
      country: 'FR',
      countryLabel: 'France',
      cities: [
        { value: 'Paris', label: 'Paris' },
        { value: 'Marseille', label: 'Marseille' },
        { value: 'Lyon', label: 'Lyon' },
        { value: 'Toulouse', label: 'Toulouse' },
        { value: 'Nice', label: 'Nice' },
        { value: 'Nantes', label: 'Nantes' },
        { value: 'Strasbourg', label: 'Strasbourg' },
        { value: 'Montpellier', label: 'Montpellier' },
        { value: 'Bordeaux', label: 'Bordeaux' },
        { value: 'Lille', label: 'Lille' },
        { value: 'Rennes', label: 'Rennes' },
        { value: 'Reims', label: 'Reims' },
        { value: 'Le Havre', label: 'Le Havre' },
        { value: 'Saint-Étienne', label: 'Saint-Étienne' },
        { value: 'Toulon', label: 'Toulon' },
        { value: 'Grenoble', label: 'Grenoble' },
        { value: 'Dijon', label: 'Dijon' },
        { value: 'Angers', label: 'Angers' },
        { value: 'Nîmes', label: 'Nîmes' },
        { value: 'Aix-en-Provence', label: 'Aix-en-Provence' },
        { value: 'Brest', label: 'Brest' },
        { value: 'Le Mans', label: 'Le Mans' },
        { value: 'Amiens', label: 'Amiens' },
        { value: 'Tours', label: 'Tours' },
        { value: 'Limoges', label: 'Limoges' },
        { value: 'Clermont-Ferrand', label: 'Clermont-Ferrand' },
        { value: 'Villeurbanne', label: 'Villeurbanne' },
        { value: 'Besançon', label: 'Besançon' },
        { value: 'Orléans', label: 'Orléans' },
        { value: 'Metz', label: 'Metz' },
      ],
    },
    {
      country: 'CH',
      countryLabel: 'Suisse',
      cities: [
        { value: 'Genève', label: 'Genève' },
        { value: 'Lausanne', label: 'Lausanne' },
        { value: 'Neuchâtel', label: 'Neuchâtel' },
        { value: 'Fribourg', label: 'Fribourg' },
        { value: 'Sion', label: 'Sion' },
        { value: 'Montreux', label: 'Montreux' },
        { value: 'La Chaux-de-Fonds', label: 'La Chaux-de-Fonds' },
        { value: 'Vevey', label: 'Vevey' },
        { value: 'Yverdon-les-Bains', label: 'Yverdon-les-Bains' },
        { value: 'Bienne', label: 'Bienne' },
      ],
    },
    {
      country: 'BE',
      countryLabel: 'Belgique',
      cities: [
        { value: 'Bruxelles', label: 'Bruxelles' },
        { value: 'Liège', label: 'Liège' },
        { value: 'Charleroi', label: 'Charleroi' },
        { value: 'Namur', label: 'Namur' },
        { value: 'Mons', label: 'Mons' },
        { value: 'Tournai', label: 'Tournai' },
        { value: 'Arlon', label: 'Arlon' },
        { value: 'La Louvière', label: 'La Louvière' },
      ],
    },
  ],
  it: [
    {
      country: 'IT',
      countryLabel: 'Italia',
      cities: [
        { value: 'Roma', label: 'Roma' },
        { value: 'Milano', label: 'Milano' },
        { value: 'Napoli', label: 'Napoli' },
        { value: 'Torino', label: 'Torino' },
        { value: 'Palermo', label: 'Palermo' },
        { value: 'Genova', label: 'Genova' },
        { value: 'Bologna', label: 'Bologna' },
        { value: 'Firenze', label: 'Firenze' },
        { value: 'Bari', label: 'Bari' },
        { value: 'Catania', label: 'Catania' },
        { value: 'Venezia', label: 'Venezia' },
        { value: 'Verona', label: 'Verona' },
        { value: 'Messina', label: 'Messina' },
        { value: 'Padova', label: 'Padova' },
        { value: 'Trieste', label: 'Trieste' },
        { value: 'Brescia', label: 'Brescia' },
        { value: 'Parma', label: 'Parma' },
        { value: 'Taranto', label: 'Taranto' },
        { value: 'Modena', label: 'Modena' },
        { value: 'Reggio Calabria', label: 'Reggio Calabria' },
        { value: 'Reggio Emilia', label: 'Reggio Emilia' },
        { value: 'Perugia', label: 'Perugia' },
        { value: 'Livorno', label: 'Livorno' },
        { value: 'Ravenna', label: 'Ravenna' },
        { value: 'Cagliari', label: 'Cagliari' },
        { value: 'Foggia', label: 'Foggia' },
        { value: 'Rimini', label: 'Rimini' },
        { value: 'Salerno', label: 'Salerno' },
        { value: 'Ferrara', label: 'Ferrara' },
        { value: 'Sassari', label: 'Sassari' },
      ],
    },
    {
      country: 'CH',
      countryLabel: 'Svizzera',
      cities: [
        { value: 'Lugano', label: 'Lugano' },
        { value: 'Bellinzona', label: 'Bellinzona' },
        { value: 'Locarno', label: 'Locarno' },
        { value: 'Mendrisio', label: 'Mendrisio' },
        { value: 'Chiasso', label: 'Chiasso' },
        { value: 'Ascona', label: 'Ascona' },
      ],
    },
  ],
};

// ============ Types ============

interface SearchFilters {
  q: string;
  category: string;
  city: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
}

function FiltersContent({ 
  filters, 
  onFilterChange, 
  onSearch, 
  onReset, 
  onSaveSearch,
  onLoadSearch,
  categories,
  isLoadingCategories,
  t,
  language,
  selectedCountry,
  onCountryChange,
  savedSearchesVersion
}: FiltersContentProps) {
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  // Load saved searches from localStorage - refresh when panel opens or version changes
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedSearches') || '[]');
    setSavedSearches(saved);
  }, [showSavedSearches, savedSearchesVersion]);

  const handleDeleteSearch = (id: number) => {
    const updated = savedSearches.filter(s => s.id !== id);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
    setSavedSearches(updated);
  };

  const handleLoadSearch = (search: SavedSearch) => {
    onLoadSearch(search.filters);
    setShowSavedSearches(false);
  };

  // Get locations for current language
  const locations = locationsByLanguage[language] || locationsByLanguage['en'];
  const hasMultipleCountries = locations.length > 1;
  
  // Build country options
  const countryOptions = [
    { value: '', label: t.search.allCountries || 'Sve države' },
    ...locations.map(loc => ({ value: loc.country, label: loc.countryLabel }))
  ];
  
  // Build city options based on selected country
  const cityOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [
      { value: '', label: t.search.allCities }
    ];
    
    if (selectedCountry) {
      // Show only cities from selected country
      const countryData = locations.find(loc => loc.country === selectedCountry);
      if (countryData) {
        options.push(...countryData.cities);
      }
    } else {
      // Show all cities grouped (or flat for single country)
      if (hasMultipleCountries) {
        // For multiple countries, show country as group header
        locations.forEach(loc => {
          loc.cities.forEach(city => {
            options.push({ value: city.value, label: `${city.label} (${loc.countryLabel})` });
          });
        });
      } else {
        // Single country - just show cities
        locations.forEach(loc => {
          options.push(...loc.cities);
        });
      }
    }
    
    return options;
  }, [locations, selectedCountry, hasMultipleCountries, t.search.allCities]);

  const categoryOptions = [
    { value: '', label: t.search.allCategories || 'Sve kategorije' },
    ...categories.map(cat => {
      const categoryNames = t.categories as Record<string, string>;
      return { value: cat.slug, label: categoryNames[cat.slug] || cat.name };
    }),
  ];

  if (isLoadingCategories) {
    return <FiltersSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div>
        <Input
          label={t.search.searchByName}
          placeholder={t.home.searchPlaceholder}
          value={filters.q}
          onChange={(e) => onFilterChange('q', e.target.value)}
          className="text-sm"
        />
      </div>

      {/* Category Filter */}
      <div>
        <CustomSelect
          label={t.common.category}
          options={categoryOptions}
          value={filters.category}
          onChange={(value) => onFilterChange('category', value)}
          placeholder={t.search.allCategories || 'Sve kategorije'}
          searchable
        />
      </div>

      {/* Country Filter - only show if multiple countries */}
      {hasMultipleCountries && (
        <div>
          <CustomSelect
            label={t.search.country || 'Država'}
            options={countryOptions}
            value={selectedCountry}
            onChange={(value) => {
              onCountryChange(value);
              // Clear city when country changes
              onFilterChange('city', '');
            }}
            placeholder={t.search.allCountries || 'Sve države'}
          />
        </div>
      )}

      {/* City Filter */}
      <div>
        <CustomSelect
          label={t.search.location}
          options={cityOptions}
          value={filters.city}
          onChange={(value) => onFilterChange('city', value)}
          placeholder={t.search.allCities}
          searchable
        />
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">{t.search.price}</h3>
        <div className="flex items-center gap-2">
          <Input 
            placeholder="€0" 
            value={filters.minPrice}
            onChange={(e) => onFilterChange('minPrice', e.target.value)}
            className="!py-2 text-sm" 
            type="number"
          />
          <span className="text-gray-400">–</span>
          <Input 
            placeholder="€1000" 
            value={filters.maxPrice}
            onChange={(e) => onFilterChange('maxPrice', e.target.value)}
            className="!py-2 text-sm" 
            type="number"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <Button fullWidth onClick={onSearch}>{t.search.search}</Button>
        <Button fullWidth variant="outline" onClick={onReset}>
          {t.search.resetFilters || 'Resetuj izabrano'}
        </Button>
      </div>

      {/* Save & Load Searches */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between gap-2">
          {/* Save Search Button */}
          <button 
            onClick={onSaveSearch}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#e85d45] dark:hover:text-[#e85d45] transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            {t.search.saveSearch}
          </button>

          {/* Toggle Saved Searches */}
          <button 
            onClick={() => setShowSavedSearches(!showSavedSearches)}
            className={`text-sm transition-colors flex items-center gap-1.5 ${
              showSavedSearches 
                ? 'text-[#e85d45]' 
                : 'text-gray-500 dark:text-gray-400 hover:text-[#e85d45] dark:hover:text-[#e85d45]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Sačuvane ({savedSearches.length})
          </button>
        </div>

        {/* Saved Searches List */}
        {showSavedSearches && (
          <div className="mt-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
            {savedSearches.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-2">
                Nemate sačuvanih pretraga
              </p>
            ) : (
              savedSearches.map((search) => (
                <div 
                  key={search.id}
                  className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 group hover:border-[#e85d45] transition-colors"
                >
                  <button
                    onClick={() => handleLoadSearch(search)}
                    className="flex-1 text-left"
                  >
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate group-hover:text-[#e85d45] transition-colors">
                      {search.name}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(search.date).toLocaleDateString('sr-Latn-RS', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSearch(search.id);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    title="Obriši"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ Main SearchPage Component ============

export default function SearchPage() {
  const { t, language } = useLanguage();
  const { success } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're on /category/:slug route
  const isCategoryRoute = location.pathname.startsWith('/category/');
  
  // Mobile drawer state
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  
  // Saved searches version - increment to trigger refresh
  const [savedSearchesVersion, setSavedSearchesVersion] = useState(0);
  
  // Initialize filters from URL - use categorySlug from path if on category route
  const [filters, setFilters] = useState<SearchFilters>(() => ({
    q: searchParams.get('q') || '',
    category: isCategoryRoute && categorySlug ? categorySlug : (searchParams.get('category') || ''),
    city: searchParams.get('city') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'default',
  }));
  
  // Country selection state (for languages with multiple countries)
  const [selectedCountry, setSelectedCountry] = useState('');
  
  const [currentPage, setCurrentPageState] = useState(() => {
    return parseInt(searchParams.get('page') || '1', 10);
  });
  
  // Update URL when page or filters change - called explicitly, not via useEffect
  const updateUrl = useCallback((newPage: number, newFilters: SearchFilters) => {
    const params = new URLSearchParams();
    
    if (newFilters.q) params.set('q', newFilters.q);
    if (newFilters.category && !isCategoryRoute) params.set('category', newFilters.category);
    if (newFilters.city) params.set('city', newFilters.city);
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice);
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice);
    if (newFilters.sort && newFilters.sort !== 'default') params.set('sort', newFilters.sort);
    if (newPage > 1) params.set('page', String(newPage));
    
    const queryString = params.toString();
    const newSearch = queryString ? `?${queryString}` : '';
    
    if (location.search === newSearch) return;
    
    if (isCategoryRoute && categorySlug) {
      navigate(`/category/${categorySlug}${newSearch}`, { replace: false });
    } else {
      setSearchParams(params, { replace: false });
    }
  }, [isCategoryRoute, categorySlug, navigate, setSearchParams, location.search]);
  
  // Wrapper for setCurrentPage that also updates URL
  const setCurrentPage = useCallback((page: number) => {
    setCurrentPageState(page);
    updateUrl(page, filters);
  }, [updateUrl, filters]);
  
  // Handle browser back/forward - listen to popstate
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const pageFromUrl = parseInt(params.get('page') || '1', 10);
      setCurrentPageState(pageFromUrl);
      
      const newFilters = {
        q: params.get('q') || '',
        category: isCategoryRoute && categorySlug ? categorySlug : (params.get('category') || ''),
        city: params.get('city') || '',
        minPrice: params.get('minPrice') || '',
        maxPrice: params.get('maxPrice') || '',
        sort: params.get('sort') || 'default',
      };
      setFilters(newFilters);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isCategoryRoute, categorySlug]);
  
  // Grid layout and items per page
  const [gridColumns, setGridColumns] = useState<2 | 3 | 4>(() => {
    const saved = localStorage.getItem('searchGridColumns');
    return (saved ? parseInt(saved, 10) : 3) as 2 | 3 | 4;
  });
  
  const [itemsPerPage, setItemsPerPage] = useState<number>(() => {
    const saved = localStorage.getItem('searchItemsPerPage');
    return saved ? parseInt(saved, 10) : 12;
  });

  // Debounce search query (400ms)
  const debouncedQuery = useDebounce(filters.q, 400);

  // Fetch categories
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories();
  const categories = useMemo(() => categoriesData || [], [categoriesData]);

  // Build API params
  const apiParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: itemsPerPage,
    };
    
    if (debouncedQuery) params.q = debouncedQuery;
    if (filters.category) params.category = filters.category;
    if (filters.city) params.city = filters.city;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.sort && filters.sort !== 'default') params.sort = filters.sort;
    
    return params;
  }, [currentPage, itemsPerPage, debouncedQuery, filters.category, filters.city, filters.minPrice, filters.maxPrice, filters.sort]);

  // Fetch resources with TanStack Query
  const { data: resourcesData, isLoading: isLoadingResources, isError, error } = useResources(apiParams);
  
  // Apply minimum 300ms loading time for smooth UX (reduced from 800ms for faster response)
  const isLoading = useMinimumLoading(isLoadingResources, 300);

  // Transform resources data
  const resources = useMemo(() => {
    if (!resourcesData?.data) return [];
    return resourcesData.data.map((item: any) => ({
      id: item._id || item.id,
      title: item.title,
      address: item.location ? `${item.location.address || ''}, ${item.location.city}` : '',
      category: item.categoryId?.name || t.common.category,
      price: item.pricePerDay,
      currency: item.currency || 'EUR',
      isFeatured: item.isFeatured || false,
      image: item.images?.[0]?.url || '',
      slug: item.slug,
    }));
  }, [resourcesData, t.common.category]);

  // Get total results from various possible response formats
  const totalResults = useMemo(() => {
    if (!resourcesData) return 0;
    // Try different response formats - backend uses 'meta' object
    if (resourcesData.meta?.total) return resourcesData.meta.total;
    if (typeof resourcesData.total === 'number') return resourcesData.total;
    if (resourcesData.pagination?.total) return resourcesData.pagination.total;
    // Check if it's directly an array (some APIs return array directly)
    if (Array.isArray(resourcesData)) return resourcesData.length;
    // Fallback to data length (but this means we can't paginate properly)
    if (resourcesData.data?.length) return resourcesData.data.length;
    return 0;
  }, [resourcesData]);
  
  // Get total pages - prefer from API if available
  const totalPages = useMemo(() => {
    if (!resourcesData) return 1;
    // Try to get from API response - backend uses 'meta' object
    if (resourcesData.meta?.totalPages) return resourcesData.meta.totalPages;
    if (typeof resourcesData.totalPages === 'number') return resourcesData.totalPages;
    if (resourcesData.pagination?.totalPages) return resourcesData.pagination.totalPages;
    // Calculate from total
    if (totalResults > 0) return Math.ceil(totalResults / itemsPerPage);
    return 1;
  }, [resourcesData, totalResults, itemsPerPage]);

  // Handle grid columns change
  const handleGridColumnsChange = useCallback((cols: 2 | 3 | 4) => {
    setGridColumns(cols);
    localStorage.setItem('searchGridColumns', String(cols));
  }, []);

  // Handle items per page change - keep current page
  const handleItemsPerPageChange = useCallback((count: number) => {
    setItemsPerPage(count);
    localStorage.setItem('searchItemsPerPage', String(count));
    // Don't reset page - user wants to stay on current page
  }, []);

  // Get category name for display
  const categoryName = useMemo(() => {
    if (!filters.category) return '';
    const cat = categories.find(c => c.slug === filters.category);
    return cat?.name || '';
  }, [filters.category, categories]);

  // Filter change handler - updates filters and URL
  const handleFilterChange = useCallback((key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPageState(1);
    updateUrl(1, newFilters);
  }, [filters, updateUrl]);

  // Search handler - navigate to /search and clear category if on category route
  const handleSearch = useCallback(() => {
    setCurrentPageState(1);
    setIsFilterDrawerOpen(false);
    
    // If on category route, navigate to clean /search
    if (isCategoryRoute) {
      // Clear all filters and navigate to /search
      setFilters({
        q: '',
        category: '',
        city: '',
        minPrice: '',
        maxPrice: '',
        sort: 'default',
      });
      setSelectedCountry('');
      navigate('/search');
    }
  }, [isCategoryRoute, navigate]);

  // Reset filters
  const handleReset = useCallback(() => {
    const resetFilters = {
      q: '',
      category: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      sort: 'default',
    };
    setFilters(resetFilters);
    setSelectedCountry('');
    setCurrentPageState(1);
    updateUrl(1, resetFilters);
  }, [updateUrl]);

  // Save search (store in localStorage)
  const handleSaveSearch = useCallback(() => {
    const savedSearches = JSON.parse(localStorage.getItem('savedSearches') || '[]');
    const searchToSave = {
      id: Date.now(),
      filters,
      name: filters.q || categoryName || 'Sačuvana pretraga',
      date: new Date().toISOString(),
    };
    savedSearches.push(searchToSave);
    localStorage.setItem('savedSearches', JSON.stringify(savedSearches.slice(-10))); // Keep last 10
    setSavedSearchesVersion(v => v + 1); // Trigger refresh in FiltersContent
    success('Pretraga sačuvana', 'Možete je pronaći u "Sačuvane pretrage"');
  }, [filters, categoryName, success]);

  // Load saved search
  const handleLoadSearch = useCallback((savedFilters: SearchFilters) => {
    setFilters(savedFilters);
    setCurrentPageState(1);
    updateUrl(1, savedFilters);
    setIsFilterDrawerOpen(false);
    success('Pretraga učitana', 'Kliknite "Pretraži" za prikaz rezultata');
  }, [success, updateUrl]);

  const sortOptions = [
    { value: 'default', label: 'Podrazumevano' },
    { value: 'newest', label: t.search.newest },
    { value: 'price_asc', label: t.search.priceLowHigh },
    { value: 'price_desc', label: t.search.priceHighLow },
  ];

  return (
    <div>
      <SEO {...SEOConfigs.search} />
      
      {/* Hero Search */}
      <section className="bg-gradient-to-br from-[#1a1a1a] to-[#2d1f1f] dark:from-[#0f0f1a] dark:to-[#1a0f1a] py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            {categoryName || t.search.title}
          </h1>
          <p className="text-gray-400 mb-8">{t.home.heroSubtitle}</p>
          <SearchBar 
            variant="hero" 
            showQuickLinks={false} 
            enableSuggestions={false}
            className="max-w-3xl mx-auto"
            initialQuery={filters.q}
            onQueryChange={(query) => {
              setFilters(prev => ({ ...prev, q: query }));
              setCurrentPage(1);
            }}
          />
        </div>
      </section>

      {/* Results */}
      <section className="py-12 container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{categoryName || t.search.title}</h2>
            <p className="text-gray-500 dark:text-gray-400">
              {filters.category ? (
                <span className="flex items-center gap-1 flex-wrap">
                  <Link to="/" className="hover:text-[#e85d45] transition-colors">{t.nav.home}</Link>
                  <span>/</span>
                  <Link to="/categories" className="hover:text-[#e85d45] transition-colors">{t.nav.categories}</Link>
                  <span>/</span>
                  <span className="text-gray-700 dark:text-gray-300">{categoryName}</span>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Link to="/" className="hover:text-[#e85d45] transition-colors">{t.nav.home}</Link>
                  <span>/</span>
                  <span className="text-gray-700 dark:text-gray-300">{t.search.title}</span>
                </span>
              )}
            </p>
          </div>
          
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-[#e85d45] text-white rounded-lg hover:bg-[#d54d35] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filteri
            {Object.values(filters).filter(v => v && v !== 'default').length > 0 && (
              <span className="bg-white text-[#e85d45] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {Object.values(filters).filter(v => v && v !== 'default').length}
              </span>
            )}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 shadow-sm dark:shadow-black/20 border border-transparent dark:border-white/5 sticky top-20">
              <FiltersContent
                filters={filters}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                onReset={handleReset}
                onSaveSearch={handleSaveSearch}
                onLoadSearch={handleLoadSearch}
                categories={categories}
                isLoadingCategories={isLoadingCategories}
                t={t}
                language={language}
                selectedCountry={selectedCountry}
                onCountryChange={setSelectedCountry}
                savedSearchesVersion={savedSearchesVersion}
              />
            </div>
          </aside>

          {/* Mobile Filter Drawer */}
          <FilterDrawer 
            isOpen={isFilterDrawerOpen} 
            onClose={() => setIsFilterDrawerOpen(false)}
          >
            <FiltersContent
              filters={filters}
              onFilterChange={handleFilterChange}
              onSearch={handleSearch}
              onReset={handleReset}
              onSaveSearch={handleSaveSearch}
              onLoadSearch={handleLoadSearch}
              categories={categories}
              isLoadingCategories={isLoadingCategories}
              t={t}
              language={language}
              selectedCountry={selectedCountry}
              onCountryChange={setSelectedCountry}
              savedSearchesVersion={savedSearchesVersion}
            />
          </FilterDrawer>

          {/* Results Grid */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-4 mb-6 shadow-sm border border-gray-100 dark:border-gray-800">
              {/* Top row - Results count and Sort */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {isLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-[#e85d45] border-t-transparent rounded-full animate-spin"></span>
                        Učitavanje...
                      </span>
                    ) : totalResults > 0 ? (
                      <>
                        {totalResults} {totalResults === 1 ? 'oglas' : totalResults < 5 ? 'oglasa' : 'oglasa'}
                      </>
                    ) : (
                      'Nema rezultata'
                    )}
                  </span>
                  {!isLoading && totalResults > 0 && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      (stranica {currentPage} od {totalPages})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t.search.sortBy}:</span>
                  <Select 
                    options={sortOptions} 
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    fullWidth={false} 
                    className="w-40" 
                  />
                </div>
              </div>
              
              {/* Bottom row - Grid layout and Items per page */}
              <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                {/* Grid Layout Toggle */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Prikaz:</span>
                  <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1">
                    {[2, 3, 4].map((cols) => (
                      <button
                        key={cols}
                        onClick={() => handleGridColumnsChange(cols as 2 | 3 | 4)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                          gridColumns === cols
                            ? 'bg-white dark:bg-gray-700 text-[#e85d45] shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                        title={`${cols} kolone`}
                        aria-label={`Prikaži ${cols} kolone`}
                      >
                        <div className="flex gap-0.5">
                          {[...Array(cols)].map((_, i) => (
                            <div key={i} className="w-2 h-4 bg-current rounded-sm" />
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Items Per Page */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Po stranici:</span>
                  <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1">
                    {[10, 20, 30, 50].map((count) => (
                      <button
                        key={count}
                        onClick={() => handleItemsPerPageChange(count)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all min-w-[40px] ${
                          itemsPerPage === count
                            ? 'bg-white dark:bg-gray-700 text-[#e85d45] shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Error State */}
            {isError && (
              <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-red-600 dark:text-red-400 font-medium mb-4">{t.common.loadingError}</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  {t.common.tryAgain}
                </Button>
              </div>
            )}

            {/* Loading State - Skeleton */}
            {isLoading && (
              <div className={`grid grid-cols-1 gap-6 ${
                gridColumns === 2 ? 'md:grid-cols-2' :
                gridColumns === 3 ? 'md:grid-cols-2 xl:grid-cols-3' :
                'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              }`}>
                {[...Array(itemsPerPage > 12 ? 12 : itemsPerPage)].map((_, i) => (
                  <ResourceCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Results Grid */}
            {!isLoading && !isError && resources.length > 0 && (
              <div className={`grid grid-cols-1 gap-6 ${
                gridColumns === 2 ? 'md:grid-cols-2' :
                gridColumns === 3 ? 'md:grid-cols-2 xl:grid-cols-3' :
                'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              }`}>
                {resources.map((resource: Resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            )}

            {/* Pagination - Always show when there are results */}
            {!isLoading && !isError && resources.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalResults={totalResults}
                resultsPerPage={itemsPerPage}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

