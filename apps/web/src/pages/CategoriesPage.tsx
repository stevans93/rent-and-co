import { useState, useEffect } from 'react';
import { useLanguage } from '../context';
import type { Category } from '../types';

// Kategorije slike - fallback ako nema coverImage
const categoryImages: Record<string, string> = {
  'turizam-i-odmor': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
  'ugostiteljstvo': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
  'vozila-masine-i-alati': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
  'usluge': 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800',
  'menjam-poklanjam': 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800',
  'razno': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
};

// Fallback kategorije kada backend nije dostupan
const fallbackCategories: Category[] = [
  { id: '1', name: 'Turizam i Odmor', slug: 'turizam-i-odmor', icon: '🏖️', count: 0 },
  { id: '2', name: 'Ugostiteljstvo', slug: 'ugostiteljstvo', icon: '🍽️', count: 0 },
  { id: '3', name: 'Vozila, Mašine i Alati', slug: 'vozila-masine-i-alati', icon: '🚗', count: 0 },
  { id: '4', name: 'Usluge', slug: 'usluge', icon: '🔧', count: 0 },
  { id: '5', name: 'Menjam/Poklanjam', slug: 'menjam-poklanjam', icon: '🎁', count: 0 },
  { id: '6', name: 'Razno', slug: 'razno', icon: '📦', count: 0 },
];

export default function CategoriesPage() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Direct fetch without cache to ensure fresh data
        const response = await fetch('http://localhost:5000/api/categories');
        const result = await response.json();
        
        if (result.success && result.data) {
          const mappedData = result.data.map((cat: any) => ({
            ...cat,
            id: cat._id || cat.id,
            count: cat.resourceCount || cat.count || 0,
          }));
          console.log('Categories loaded:', mappedData);
          setCategories(mappedData);
        } else {
          setCategories(fallbackCategories);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategories(fallbackCategories);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">{t.categories.title}</h1>
          <p className="text-gray-500">{t.categories.breadcrumb}</p>
        </div>
      </div>

      {/* Categories Grid */}
      <section className="py-12 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => (
            <a
              key={category.id}
              href={`/search?category=${category.slug}`}
              className="relative rounded-xl overflow-hidden h-64 group"
            >
              <img
                src={category.coverImage || categoryImages[category.slug] || categoryImages['razno']}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <div className="flex items-center gap-2">
                  {category.icon && <span className="text-2xl">{category.icon}</span>}
                  <h3 className="text-xl font-bold">{category.name}</h3>
                </div>
                <p className="text-sm text-gray-300">
                  {category.count || 0} {t.categories.results}
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
