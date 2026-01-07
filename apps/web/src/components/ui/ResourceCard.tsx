import { Link } from 'react-router-dom';
import { useLanguage } from '../../context';

export interface Resource {
  id: number | string;
  title: string;
  address: string;
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
  showActions?: boolean;
}

export default function ResourceCard({ 
  resource, 
  onFavoriteToggle,
  showActions = true 
}: ResourceCardProps) {
  const { t } = useLanguage();

  return (
    <Link
      to={`/resources/${resource.slug || resource.id}`}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow block"
    >
      <div className="relative">
        {resource.image ? (
          <img 
            src={resource.image} 
            alt={resource.title}
            className="w-full h-48 object-cover"
            loading="lazy"
          />
        ) : (
          <div className="bg-gray-200 h-48 flex items-center justify-center text-gray-400">
            370x240
          </div>
        )}
        
        {resource.isFeatured && (
          <span className="absolute top-3 left-3 bg-[#e85d45] text-white text-xs px-2 py-1 rounded inline-flex items-center gap-1">
            <span>★</span>
            <span>{t.search.featured}</span>
          </span>
        )}
        
        {resource.isFavorite && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              onFavoriteToggle?.(resource.id);
            }}
            className="absolute top-3 right-3 p-2 bg-white rounded-full text-[#e85d45]"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
        )}
        
        <span className="absolute bottom-3 left-3 bg-white text-gray-900 text-sm px-2 py-1 rounded font-medium">
          €{resource.price} / {t.search.perDay}
        </span>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium mb-1">{resource.title}</h3>
        <p className="text-sm text-gray-500 mb-2">{resource.address}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{resource.category}</span>
          
          {showActions && (
            <div className="flex space-x-2 text-gray-400">
              <button 
                onClick={(e) => e.preventDefault()}
                className="hover:text-[#e85d45] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  onFavoriteToggle?.(resource.id);
                }}
                className="hover:text-[#e85d45] transition-colors"
              >
                <svg className="w-5 h-5" fill={resource.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
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
