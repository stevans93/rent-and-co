import { Link } from 'react-router-dom';
import { useLanguage } from '../../context';

export interface Resource {
  id: number | string;
  title: string;
  address: string;
  city?: string;
  category: string;
  price: number;
  image?: string;
  isFeatured?: boolean;
  isFavorite?: boolean;
  slug?: string;
}

interface ResourceCardProps {
  resource: Resource;
  onFavoriteToggle?: (id: number | string) => void;
  onShare?: (resource: Resource) => void;
  showActions?: boolean;
}

export default function ResourceCard({ 
  resource, 
  onFavoriteToggle,
  onShare,
  showActions = true 
}: ResourceCardProps) {
  const { t } = useLanguage();

  // SEO-friendly alt text
  const imageAlt = `${resource.title} — ${resource.city || resource.address} — iznajmljivanje po danu`;

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onShare) {
      onShare(resource);
    } else {
      // Default share behavior
      if (navigator.share) {
        navigator.share({
          title: resource.title,
          text: `${resource.title} - €${resource.price}/dan`,
          url: window.location.origin + `/resources/${resource.slug || resource.id}`,
        });
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(
          window.location.origin + `/resources/${resource.slug || resource.id}`
        );
      }
    }
  };

  return (
    <Link
      to={`/resources/${resource.slug || resource.id}`}
      className="bg-white dark:bg-[#1e1e1e] rounded-xl overflow-hidden shadow-sm hover:shadow-lg dark:shadow-black/20 transition-all duration-300 block border border-transparent dark:border-white/5"
    >
      <div className="relative">
        {resource.image ? (
          <img 
            src={resource.image} 
            alt={imageAlt}
            className="w-full h-48 object-cover dark-image"
            loading="lazy"
          />
        ) : (
          <div className="bg-gray-200 dark:bg-[#252525] h-48 flex items-center justify-center text-gray-400 dark:text-gray-600">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {resource.isFeatured && (
          <span className="absolute top-3 left-3 bg-[#e85d45] text-white text-xs px-2 py-1 rounded inline-flex items-center gap-1">
            <span aria-hidden="true">★</span>
            <span>{t.search.featured}</span>
          </span>
        )}
        
        <span className="absolute bottom-3 left-3 bg-white dark:bg-black/70 text-gray-900 dark:text-white text-sm px-2 py-1 rounded font-medium">
          €{resource.price} / {t.search.perDay}
        </span>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{resource.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {resource.address}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#e85d45] font-medium bg-[#e85d45]/10 px-2 py-1 rounded">{resource.category}</span>
          
          {showActions && (
            <div className="flex space-x-1 text-gray-400">
              <button 
                onClick={handleShare}
                className="p-2 hover:text-[#e85d45] hover:bg-[#e85d45]/10 rounded-full transition-colors"
                aria-label="Podeli oglas"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  onFavoriteToggle?.(resource.id);
                }}
                className={`p-2 rounded-full transition-colors ${
                  resource.isFavorite 
                    ? 'text-[#e85d45] bg-[#e85d45]/10' 
                    : 'hover:text-[#e85d45] hover:bg-[#e85d45]/10'
                }`}
                aria-label="Dodaj oglas u omiljene"
              >
                <svg className="w-5 h-5" fill={resource.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
