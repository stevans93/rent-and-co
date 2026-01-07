import { Link } from 'react-router-dom';
import { useLanguage } from '../context';
import { ResourceCard, Button, Resource } from '../components';

export default function FavoritesPage() {
  const { t } = useLanguage();
  
  const favorites: Resource[] = [
    { id: 1, title: 'Resurs 1', address: 'Adresa, Grad', price: 140, category: `${t.common.category} 1`, isFavorite: true },
    { id: 2, title: 'Resurs 2', address: 'Adresa, Grad', price: 140, category: `${t.common.category} 1`, isFavorite: true },
    { id: 3, title: 'Resurs 3', address: 'Adresa, Grad', price: 140, category: `${t.common.category} 1`, isFavorite: true },
  ];

  const handleFavoriteToggle = (id: number | string) => {
    console.log('Toggle favorite:', id);
    // TODO: Implement with API
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{t.favorites.title}</h1>
      <p className="text-gray-500 mb-8">{t.favorites.breadcrumb}</p>

      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">💔</div>
          <h2 className="text-2xl font-bold mb-2">{t.favorites.empty}</h2>
          <p className="text-gray-500 mb-6">{t.favorites.emptyDescription}</p>
          <Link to="/search">
            <Button size="lg">{t.favorites.searchResources}</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(resource => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
