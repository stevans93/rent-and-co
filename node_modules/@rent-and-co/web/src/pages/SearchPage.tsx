import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context';
import { SearchBar, ResourceCard, Pagination, Button, Input, Select, Resource } from '../components';

export default function SearchPage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get('category');
  
  const [showFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [categoryName, setCategoryName] = useState<string>('');

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        
        // If we have a category, first fetch category name
        if (categorySlug) {
          const catResponse = await fetch(`http://localhost:5000/api/categories/${categorySlug}`);
          const catResult = await catResponse.json();
          if (catResult.success && catResult.data) {
            setCategoryName(catResult.data.name);
          }
        } else {
          setCategoryName('');
        }
        
        // Build API URL with category filter if present
        let apiUrl = `http://localhost:5000/api/resources?page=${currentPage}&limit=12`;
        if (categorySlug) {
          apiUrl += `&category=${categorySlug}`;
        }
        
        const response = await fetch(apiUrl);
        const result = await response.json();
        
        if (result.success && result.data) {
          // Transform API response to match Resource type
          const transformedResources = result.data.map((item: any) => ({
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
          setResources(transformedResources);
          setTotalResults(result.total || transformedResources.length);
        } else {
          setResources([]);
          setTotalResults(0);
        }
      } catch (error) {
        console.error('Error fetching resources:', error);
        setResources([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [currentPage, categorySlug, t.common.category]);

  const totalPages = Math.ceil(totalResults / 12) || 1;

  const sortOptions = [
    { value: 'default', label: 'Opcija 1' },
    { value: 'newest', label: t.search.newest },
    { value: 'price_asc', label: t.search.priceLowHigh },
    { value: 'price_desc', label: t.search.priceHighLow },
  ];

  const cityOptions = [
    { value: '', label: t.search.allCities },
    { value: 'belgrade', label: 'Beograd' },
    { value: 'novi_sad', label: 'Novi Sad' },
  ];

  return (
    <div>
      {/* Hero Search */}
      <section className="bg-[#1a1a1a] py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            {categoryName || t.search.title}
          </h1>
          <p className="text-gray-400 mb-8">{t.home.heroSubtitle}</p>
          <SearchBar className="max-w-3xl mx-auto" />
        </div>
      </section>

      {/* Results */}
      <section className="py-12 container mx-auto px-4">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">{categoryName || t.search.title}</h2>
          <p className="text-gray-500">
            {categorySlug ? `${t.nav.home} / ${t.nav.categories} / ${categoryName}` : t.search.breadcrumb}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <aside className="w-full lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="mb-6">
                  <Input
                    label={t.search.searchByName}
                    placeholder={t.home.searchPlaceholder}
                    className="text-sm"
                  />
                </div>

                <div className="mb-6">
                  <h3 className="font-medium mb-3">{t.search.status}</h3>
                  {['Status 1', 'Status 2', 'Status 3'].map(status => (
                    <label key={status} className="flex items-center mb-2">
                      <input type="radio" name="status" className="mr-2" />
                      <span className="text-sm text-gray-600">{status}</span>
                    </label>
                  ))}
                </div>

                <div className="mb-6">
                  <h3 className="font-medium mb-3">{t.search.options}</h3>
                  {['Opcija 1', 'Opcija 2', 'Opcija 3', 'Opcija 4', 'Opcija 5'].map(option => (
                    <label key={option} className="flex items-center mb-2">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-600">{option}</span>
                    </label>
                  ))}
                </div>

                <div className="mb-6">
                  <h3 className="font-medium mb-3">{t.search.price}</h3>
                  <input type="range" min="0" max="1000" className="w-full" />
                  <div className="flex justify-between mt-2 gap-2">
                    <Input placeholder="€100" className="!py-1 text-sm" />
                    <span className="text-gray-400 self-center">—</span>
                    <Input placeholder="€1000" className="!py-1 text-sm" />
                  </div>
                </div>

                <div className="mb-6">
                  <Select
                    label={t.search.location}
                    options={cityOptions}
                  />
                </div>

                <Button fullWidth>{t.search.search}</Button>

                <div className="flex justify-center mt-4 text-sm text-gray-500">
                  <button className="mr-4 hover:text-gray-700">{t.search.saveSearch}</button>
                  <button className="hover:text-gray-700">{t.search.saveSearch}</button>
                </div>
              </div>
            </aside>
          )}

          {/* Results Grid */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <p className="text-gray-500">
                {loading ? t.common.loading : `${t.search.showing} 1-${Math.min(12, totalResults)} ${t.search.of} ${totalResults} ${t.search.results}`}
              </p>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">{t.search.sortBy}:</span>
                <Select options={sortOptions} fullWidth={false} className="w-32" />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e85d45] mx-auto"></div>
                <p className="mt-4 text-gray-500">{t.common.loading}</p>
              </div>
            ) : resources.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">{t.common.noResults}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {resources.map(resource => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            )}

            {!loading && totalResults > 12 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalResults={totalResults}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
