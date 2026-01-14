import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context';
import { useResources, useCategories, useDebounce } from '../hooks';
import { SearchBar, ResourceCard, Pagination, Button, Input, Select, Resource } from '../components';
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

// ============ Filters Sidebar Content ============

interface FiltersContentProps {
  filters: SearchFilters;
  onFilterChange: (key: string, value: string) => void;
  onSearch: () => void;
  onReset: () => void;
  onSaveSearch: () => void;
  categories: Array<{ id?: string | number; _id?: string; name: string; slug: string }>;
  isLoadingCategories: boolean;
  t: any;
}

interface SearchFilters {
  q: string;
  category: string;
  city: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
  status: string;
}

function FiltersContent({ 
  filters, 
  onFilterChange, 
  onSearch, 
  onReset, 
  onSaveSearch,
  categories,
  isLoadingCategories,
  t 
}: FiltersContentProps) {
  const cityOptions = [
    { value: '', label: t.search.allCities },
    { value: 'Beograd', label: 'Beograd' },
    { value: 'Novi Sad', label: 'Novi Sad' },
    { value: 'Ni�', label: 'Ni�' },
    { value: 'Kragujevac', label: 'Kragujevac' },
    { value: 'Subotica', label: 'Subotica' },
  ];

  const statusOptions = [
    { value: '', label: 'Svi statusi' },
    { value: 'available', label: 'Dostupno' },
    { value: 'rented', label: 'Iznajmljeno' },
    { value: 'maintenance', label: 'Na odr�avanju' },
  ];

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
        <Select
          label={t.common.category}
          options={categoryOptions}
          value={filters.category}
          onChange={(e) => onFilterChange('category', e.target.value)}
        />
      </div>

      {/* Status Filter */}
      <div>
        <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">{t.search.status}</h3>
        {statusOptions.map(option => (
          <label key={option.value} className="flex items-center mb-2 cursor-pointer">
            <input 
              type="radio" 
              name="status" 
              value={option.value}
              checked={filters.status === option.value}
              onChange={(e) => onFilterChange('status', e.target.value)}
              className="mr-3 accent-[#e85d45]" 
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">{option.label}</span>
          </label>
        ))}
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">{t.search.price}</h3>
        <div className="flex items-center gap-2">
          <Input 
            placeholder="�0" 
            value={filters.minPrice}
            onChange={(e) => onFilterChange('minPrice', e.target.value)}
            className="!py-2 text-sm" 
            type="number"
          />
          <span className="text-gray-400">�</span>
          <Input 
            placeholder="�1000" 
            value={filters.maxPrice}
            onChange={(e) => onFilterChange('maxPrice', e.target.value)}
            className="!py-2 text-sm" 
            type="number"
          />
        </div>
      </div>

      {/* City Filter */}
      <div>
        <Select
          label={t.search.location}
          options={cityOptions}
          value={filters.city}
          onChange={(e) => onFilterChange('city', e.target.value)}
        />
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <Button fullWidth onClick={onSearch}>{t.search.search}</Button>
        <Button fullWidth variant="outline" onClick={onReset}>
          {t.search.resetFilters || 'Resetuj izabrano'}
        </Button>
      </div>

      {/* Save Search */}
      <div className="flex justify-center pt-2">
        <button 
          onClick={onSaveSearch}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#e85d45] dark:hover:text-[#e85d45] transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          {t.search.saveSearch}
        </button>
      </div>
    </div>
  );
}

// ============ Main SearchPage Component ============

export default function SearchPage() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Mobile drawer state
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  
  // Initialize filters from URL
  const [filters, setFilters] = useState<SearchFilters>(() => ({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'default',
    status: searchParams.get('status') || '',
  }));
  
  const [currentPage, setCurrentPage] = useState(() => {
    return parseInt(searchParams.get('page') || '1', 10);
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
      limit: 12,
    };
    
    if (debouncedQuery) params.q = debouncedQuery;
    if (filters.category) params.category = filters.category;
    if (filters.city) params.city = filters.city;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.sort && filters.sort !== 'default') params.sort = filters.sort;
    if (filters.status) params.status = filters.status;
    
    return params;
  }, [currentPage, debouncedQuery, filters.category, filters.city, filters.minPrice, filters.maxPrice, filters.sort, filters.status]);

  // Fetch resources with TanStack Query
  const { data: resourcesData, isLoading, isError, error } = useResources(apiParams);

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

  const totalResults = (resourcesData as any)?.total || 0;
  const totalPages = Math.ceil(totalResults / 12) || 1;

  // Get category name for display
  const categoryName = useMemo(() => {
    if (!filters.category) return '';
    const cat = categories.find(c => c.slug === filters.category);
    return cat?.name || '';
  }, [filters.category, categories]);

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.q) params.set('q', filters.q);
    if (filters.category) params.set('category', filters.category);
    if (filters.city) params.set('city', filters.city);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.sort && filters.sort !== 'default') params.set('sort', filters.sort);
    if (filters.status) params.set('status', filters.status);
    if (currentPage > 1) params.set('page', String(currentPage));
    
    setSearchParams(params, { replace: true });
  }, [filters, currentPage, setSearchParams]);

  // Filter change handler
  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  }, []);

  // Search handler
  const handleSearch = useCallback(() => {
    setCurrentPage(1);
    setIsFilterDrawerOpen(false);
  }, []);

  // Reset filters
  const handleReset = useCallback(() => {
    setFilters({
      q: '',
      category: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      sort: 'default',
      status: '',
    });
    setCurrentPage(1);
  }, []);

  // Save search (store in localStorage)
  const handleSaveSearch = useCallback(() => {
    const savedSearches = JSON.parse(localStorage.getItem('savedSearches') || '[]');
    const searchToSave = {
      id: Date.now(),
      filters,
      name: filters.q || categoryName || 'Sacuvana pretraga',
      date: new Date().toISOString(),
    };
    savedSearches.push(searchToSave);
    localStorage.setItem('savedSearches', JSON.stringify(savedSearches.slice(-10))); // Keep last 10
    alert('Pretraga je sacuvana!');
  }, [filters, categoryName]);

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
          <SearchBar className="max-w-3xl mx-auto" />
        </div>
      </section>

      {/* Results */}
      <section className="py-12 container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{categoryName || t.search.title}</h2>
            <p className="text-gray-500 dark:text-gray-400">
              {filters.category ? `${t.nav.home} / ${t.nav.categories} / ${categoryName}` : t.search.breadcrumb}
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
                categories={categories}
                isLoadingCategories={isLoadingCategories}
                t={t}
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
              categories={categories}
              isLoadingCategories={isLoadingCategories}
              t={t}
            />
          </FilterDrawer>

          {/* Results Grid */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <p className="text-gray-500 dark:text-gray-400">
                {isLoading 
                  ? t.common.loading 
                  : `${t.search.showing} ${Math.min(1, totalResults)}-${Math.min(currentPage * 12, totalResults)} ${t.search.of} ${totalResults} ${t.search.results}`
                }
              </p>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">{t.search.sortBy}:</span>
                <Select 
                  options={sortOptions} 
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  fullWidth={false} 
                  className="w-40" 
                />
              </div>
            </div>

            {/* Error State */}
            {isError && (
              <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-red-600 dark:text-red-400 font-medium mb-2">Gre�ka pri ucitavanju</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{(error as Error)?.message || 'Poku�ajte ponovo.'}</p>
              </div>
            )}

            {/* Loading State - Skeleton */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <ResourceCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !isError && resources.length === 0 && (
              <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <svg className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">{t.common.noResults}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Poku�ajte sa drugim filterima ili pretragom.</p>
                <Button variant="outline" onClick={handleReset}>
                  Resetuj filtere
                </Button>
              </div>
            )}

            {/* Results Grid */}
            {!isLoading && !isError && resources.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {resources.map((resource: Resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && !isError && totalResults > 12 && (
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

