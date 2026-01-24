import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage, useAuth } from '../context';
import { SearchBar, ResourceCard, CategoryCard, SectionHeader, Resource, HeroSection } from '../components';
import { SEO, SEOConfigs } from '../components/SEO';
import { categoriesApi, resourcesApi } from '../services/api';
import type { Category } from '../types';

export default function HomePage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [featuredResources, setFeaturedResources] = useState<Resource[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesApi.getAll();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch featured/premium resources from API
  useEffect(() => {
    const fetchFeaturedResources = async () => {
      try {
        const response = await resourcesApi.getAll({ 
          isFeatured: true, 
          limit: 6,
          page: 1 
        });
        
        // Transform API response to Resource format
        const resources: Resource[] = (response.data || []).map((item: any) => ({
          id: item._id || item.id,
          title: item.title,
          address: item.location ? `${item.location.address || ''}, ${item.location.city}` : '',
          category: (t.categories as Record<string, string>)[item.categoryId?.slug || ''] || item.categoryId?.name || t.common.category,
          price: item.pricePerDay,
          currency: item.currency || 'EUR',
          isFeatured: true,
          image: item.images?.[0]?.url || '',
          slug: item.slug,
        }));
        
        setFeaturedResources(resources);
      } catch (error) {
        console.error('Error fetching featured resources:', error);
      } finally {
        setIsLoadingFeatured(false);
      }
    };

    fetchFeaturedResources();
  }, [t.common.category]);

  return (
    <div>
      <SEO {...SEOConfigs.home} />
      
      {/* Hero Section with 6-grid animated background */}
      <HeroSection>
        <SearchBar variant="hero" showTabs={false} className="w-full max-w-2xl mx-auto" />
      </HeroSection>

      {/* Hero Text Section - below grid images */}
      <section className="py-8 bg-[#f9fafb] dark:bg-[#121212]">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            {t.home.heroTitle}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t.home.heroSubtitle}
          </p>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 container mx-auto px-4">
        <SectionHeader
          title={t.home.categories}
          subtitle={t.home.heroSubtitle}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {isLoadingCategories ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 animate-pulse">
                <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-xl mx-auto mb-4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto" />
              </div>
            ))
          ) : (
            categories.map(cat => (
              <CategoryCard
                key={cat.id || cat._id}
                id={cat.slug}
                name={cat.name}
                count={cat.count || cat.resourceCount || 0}
                icon={cat.icon}
              />
            ))
          )}
        </div>
      </section>

      {/* Featured/Premium Resources Section */}
      <section className="py-16 bg-gray-100 dark:bg-transparent">
        <div className="container mx-auto px-4">
          <SectionHeader
            title={t.home.featuredResources}
            subtitle={t.home.heroSubtitle}
            linkText={t.home.viewAllResources}
            linkTo="/search"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {isLoadingFeatured ? (
              // Loading skeleton for 6 cards
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-[#1e1e1e] rounded-xl overflow-hidden shadow-sm animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700" />
                  <div className="p-3">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : featuredResources.length > 0 ? (
              featuredResources.map(resource => (
                <ResourceCard key={resource.id} resource={resource} />
              ))
            ) : (
              // Empty state - show placeholder cards
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-[#1e1e1e] rounded-xl overflow-hidden shadow-sm">
                  <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="p-3">
                    <div className="text-xs text-gray-400 mb-1">Premium</div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Uskoro...</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-100 dark:bg-transparent">
        <div className="container mx-auto px-4">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center border border-transparent dark:border-white/5">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{t.home.whatIsLoremIpsum}</h2>
              <p className="text-gray-500 dark:text-gray-400">{(t.home as any).ctaSubtitle || t.home.heroSubtitle}</p>
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link
                to={user ? '/dashboard/add-listing' : '/login'}
                className="border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 inline-flex items-center gap-2"
              >
                <span>{t.nav.addProduct}</span>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link
                to="/partner"
                className="bg-[#1a1a1a] dark:bg-[#e85d45] text-white px-6 py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-[#d14d35]"
              >
                {t.home.becomePartner}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
