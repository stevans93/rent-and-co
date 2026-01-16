import { Link } from 'react-router-dom';

// Mapiranje ikona za kategorije - SVG ikone
const categoryIcons: Record<string, JSX.Element> = {
  // Turizam i Odmor
  'turizam-i-odmor': (
    <svg className="w-7 h-7 text-[#e85d45]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  // Ugostiteljstvo
  'ugostiteljstvo': (
    <svg className="w-7 h-7 text-[#e85d45]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  // Vozila, Mašine i Alati
  'vozila-masine-i-alati': (
    <svg className="w-7 h-7 text-[#e85d45]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  // Usluge
  'usluge': (
    <svg className="w-7 h-7 text-[#e85d45]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  // Menjam/Poklanjam
  'menjam-poklanjam': (
    <svg className="w-7 h-7 text-[#e85d45]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
    </svg>
  ),
  // Razno
  'razno': (
    <svg className="w-7 h-7 text-[#e85d45]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
};

// Default ikona
const defaultIcon = (
  <svg className="w-7 h-7 text-[#e85d45]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

interface CategoryCardProps {
  id: number | string;
  name: string;
  count: number;
  icon?: string;
}

export default function CategoryCard({ id, name, count, icon }: CategoryCardProps) {
  // Dobij ikonu - ili iz mape po slug-u, ili emoji iz baze, ili default
  const getIcon = () => {
    // Ako je slug u mapi ikona
    if (typeof id === 'string' && categoryIcons[id]) {
      return categoryIcons[id];
    }
    // Ako je emoji iz baze
    if (icon && icon.length <= 4) {
      return <span className="text-3xl">{icon}</span>;
    }
    // Default
    return defaultIcon;
  };

  return (
    <Link
      to={`/search?category=${id}`}
      className="bg-white dark:bg-[#1e1e1e] border border-gray-100 dark:border-white/5 rounded-xl p-6 text-center hover:shadow-lg transition-shadow block"
    >
      <div className="w-14 h-14 bg-[#e85d45]/10 rounded-xl mx-auto mb-4 flex items-center justify-center">
        {getIcon()}
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{name}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{count} resursa</p>
    </Link>
  );
}
