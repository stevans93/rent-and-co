import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage, useAuth, useFavorites } from '../context';
import { InquiryForm } from '../components/InquiryForm';
import { SEO, getResourceDetailTitle, getResourceDetailDescription } from '../components/SEO';
import { ProductSchema, BreadcrumbSchema } from '../components/SchemaOrg';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE = API_URL.replace('/api', '');

// Helper to get full image URL
const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

interface ResourceDetail {
  _id: string;
  title: string;
  slug: string;
  description: string;
  pricePerDay: number;
  currency: string;
  status: string;
  isFeatured: boolean;
  options: string[];
  images: { url: string; alt: string; order: number }[];
  location: {
    country: string;
    city: string;
    address: string;
  };
  categoryId: {
    _id: string;
    name: string;
    slug: string;
    icon: string;
  };
  ownerId: {
    _id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
    profileImage?: string;
  };
  extraInfo: { label: string; value: string }[];
  views: number;
  createdAt: string;
}

export default function ResourceDetailPage() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { isFavorite: checkIsFavorite, toggleFavorite } = useFavorites();
  const { slug } = useParams();
  const [resource, setResource] = useState<ResourceDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [similarResources, setSimilarResources] = useState<ResourceDetail[]>([]);

  // Check if resource is in favorites using global context
  const isFavorite = resource ? checkIsFavorite(resource._id) : false;

  // Toggle favorite using global context
  const handleFavoriteToggle = async () => {
    if (!isAuthenticated || !resource || isTogglingFavorite) return;

    setIsTogglingFavorite(true);
    try {
      await toggleFavorite(resource._id);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setError(null);
        
        const response = await fetch(`http://localhost:5000/api/resources/${slug}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          setResource(result.data);
          
          // Fetch similar resources from same category
          if (result.data.categoryId?.slug) {
            const similarResponse = await fetch(
              `http://localhost:5000/api/resources?category=${result.data.categoryId.slug}&limit=3`
            );
            const similarResult = await similarResponse.json();
            if (similarResult.success && similarResult.data) {
              // Filter out current resource
              setSimilarResources(
                similarResult.data.filter((r: ResourceDetail) => r._id !== result.data._id).slice(0, 3)
              );
            }
          }
        } else {
          setError(t.resource.resourceNotFound);
        }
      } catch (err) {
        console.error('Error fetching resource:', err);
        setError(t.resource.loadError);
      }
    };

    if (slug) {
      fetchResource();
    }
  }, [slug]);

  if (error || !resource) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{error || t.resource.resourceNotFound}</h1>
          <Link to="/search" className="text-[#e85d45] hover:underline">
            ← {t.resource.backToSearch}
          </Link>
        </div>
      </div>
    );
  }

  const mainImage = getImageUrl(resource.images[selectedImage]?.url || resource.images[0]?.url || '');
  const otherImages = resource.images.filter((_, index) => index !== selectedImage);

  // SEO data
  const seoTitle = getResourceDetailTitle(resource.title, resource.location.city);
  const seoDescription = getResourceDetailDescription(resource.title, resource.description, resource.location.city);
  const breadcrumbItems = [
    { name: t.nav.home, url: '/' },
    { name: t.nav.categories, url: '/categories' },
    { name: (t.categories as Record<string, string>)[resource.categoryId?.slug || ''] || resource.categoryId?.name || '', url: `/category/${resource.categoryId?.slug}` },
    { name: resource.title, url: `/resources/${resource.slug}` },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* SEO */}
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonical={`/resources/${resource.slug}`}
        ogType="product"
        ogImage={mainImage}
        ogImageAlt={resource.title}
      />
      <ProductSchema
        name={resource.title}
        description={resource.description}
        image={resource.images.map(img => getImageUrl(img.url))}
        price={resource.pricePerDay}
        priceCurrency={resource.currency === '€' ? 'EUR' : 'RSD'}
        availability="InStock"
        url={`/resources/${resource.slug}`}
        category={(t.categories as Record<string, string>)[resource.categoryId?.slug || ''] || resource.categoryId?.name}
        seller={{
          name: `${resource.ownerId.firstName} ${resource.ownerId.lastName}`,
        }}
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:text-[#e85d45]">{t.nav.home}</Link>
        {' / '}
        <Link to="/categories" className="hover:text-[#e85d45]">{t.nav.categories}</Link>
        {' / '}
        <Link to={`/category/${resource.categoryId?.slug}`} className="hover:text-[#e85d45]">
          {(t.categories as Record<string, string>)[resource.categoryId?.slug || ''] || resource.categoryId?.name}
        </Link>
        {' / '}
        <span className="text-gray-800">{resource.title}</span>
      </div>

      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {resource.isFeatured && (
              <span className="bg-[#e85d45] text-white text-xs px-2 py-1 rounded">
                ★ {t.search.featured}
              </span>
            )}
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
              {resource.categoryId?.icon} {(t.categories as Record<string, string>)[resource.categoryId?.slug || ''] || resource.categoryId?.name}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {resource.title} — {t.resource.rentalIn} {resource.location.city}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {resource.location.address}, {resource.location.city}, {resource.location.country}
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          {isAuthenticated && (
            <button 
              onClick={handleFavoriteToggle}
              disabled={isTogglingFavorite}
              className={`p-2 border dark:border-dark-border rounded-lg transition-colors ${
                isFavorite 
                  ? 'bg-[#e85d45]/10 border-[#e85d45] text-[#e85d45]' 
                  : 'hover:bg-gray-100 dark:hover:bg-dark-light text-gray-600 dark:text-gray-300'
              } ${isTogglingFavorite ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isFavorite ? t.resource.removeFromFavorites : t.resource.addToFavorites}
              aria-label={isFavorite ? t.resource.removeFromFavorites : t.resource.addToFavorites}
            >
              <svg className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
          <button 
            className="p-2 border dark:border-dark-border rounded-lg hover:bg-gray-100 dark:hover:bg-dark-light text-gray-600 dark:text-gray-300 transition-colors" 
            title={t.resource.share}
            aria-label={t.resource.share}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
          <button 
            className="p-2 border dark:border-dark-border rounded-lg hover:bg-gray-100 dark:hover:bg-dark-light text-gray-600 dark:text-gray-300 transition-colors" 
            title={t.resource.report}
            aria-label={t.resource.report}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </button>
          <div className="text-right">
            <p className="text-3xl font-bold text-[#e85d45]">
              {resource.currency === 'EUR' ? '€' : resource.currency === 'RSD' ? 'RSD' : '$'}
              {resource.pricePerDay.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">/ {t.search.perDay}</p>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
        <div className="md:col-span-2 md:row-span-2 relative group">
          <img
            src={mainImage}
            alt={`${resource.title} — glavna fotografija`}
            className="w-full h-[300px] md:h-[420px] object-cover rounded-xl cursor-pointer transition-transform hover:brightness-95 dark-image"
            onClick={() => window.open(mainImage, '_blank')}
          />
          <div className="absolute bottom-3 left-3 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
            {selectedImage + 1} / {resource.images.length}
          </div>
        </div>
        {otherImages.slice(0, 4).map((image, index) => (
          <div key={index} className="relative">
            <img
              src={getImageUrl(image.url)}
              alt={`${resource.title} — detalj ${index + 1}`}
              className="w-full h-[120px] md:h-[195px] object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setSelectedImage(resource.images.findIndex(img => img.url === image.url))}
            />
            {index === 3 && resource.images.length > 5 && (
              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">+{resource.images.length - 5}</span>
              </div>
            )}
          </div>
        ))}
        {/* Fill empty slots if less than 4 images */}
        {otherImages.length < 4 && Array.from({ length: 4 - otherImages.length }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-gray-100 rounded-xl h-[120px] md:h-[195px]"></div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <div className="bg-white dark:bg-dark-card rounded-xl p-6 shadow-sm dark:shadow-none dark:border dark:border-dark-border">
            <h2 className="text-xl font-bold mb-4 dark:text-white">{t.resource.description}</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {resource.description}
            </p>
          </div>

          {/* Options */}
          {resource.options && resource.options.length > 0 && (
            <div className="bg-white dark:bg-dark-card rounded-xl p-6 shadow-sm dark:shadow-none dark:border dark:border-dark-border">
              <h2 className="text-xl font-bold mb-4 dark:text-white">{t.resource.features}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {resource.options.map((option, index) => {
                  const translatedOption = (t.featureNames as Record<string, string>)[option.toLowerCase()] || option;
                  return (
                    <div key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-[#e85d45] rounded-full mr-2"></span>
                      <span className="text-gray-600 dark:text-gray-300">{translatedOption}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Address */}
          <div className="bg-white dark:bg-dark-card rounded-xl p-6 shadow-sm dark:shadow-none dark:border dark:border-dark-border">
            <h2 className="text-xl font-bold mb-4 dark:text-white">{t.resource.address}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t.resource.address}</p>
                <p className="font-medium dark:text-white">{resource.location.address || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t.resource.city}</p>
                <p className="font-medium dark:text-white">{resource.location.city}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t.resource.country}</p>
                <p className="font-medium dark:text-white">{resource.location.country}</p>
              </div>
            </div>
            <div className="h-64 bg-gray-200 rounded-lg overflow-hidden">
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(
                  `${resource.location.address}, ${resource.location.city}, ${resource.location.country}`
                )}`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                className="rounded-lg"
              ></iframe>
            </div>
          </div>

          {/* Additional Info */}
          {resource.extraInfo && resource.extraInfo.length > 0 && (
            <div className="bg-white dark:bg-dark-card rounded-xl p-6 shadow-sm dark:shadow-none dark:border dark:border-dark-border">
              <h2 className="text-xl font-bold mb-4 dark:text-white">{t.resource.additionalInfo}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {resource.extraInfo.map((info, index) => {
                  const translatedLabel = (t.additionalInfo as Record<string, string>)[info.label.toLowerCase()] || info.label;
                  const translatedValue = (t.additionalInfo as Record<string, string>)[info.value.toLowerCase()] || info.value;
                  return (
                    <div key={index}>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{translatedLabel}</p>
                      <p className="font-medium dark:text-white">{translatedValue}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="bg-white dark:bg-dark-card rounded-xl p-6 shadow-sm dark:shadow-none dark:border dark:border-dark-border">
            <h2 className="text-lg font-bold mb-4 dark:text-white">{t.resource.contactInfo}</h2>
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-200 dark:bg-dark-light rounded-full mr-3 flex items-center justify-center text-xl dark:text-white">
                {resource.ownerId?.profileImage ? (
                  <img
                    src={resource.ownerId.profileImage}
                    alt={`${resource.ownerId.firstName} ${resource.ownerId.lastName}`}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>{resource.ownerId?.firstName?.[0]}{resource.ownerId?.lastName?.[0]}</span>
                )}
              </div>
              <div>
                <p className="font-medium dark:text-white">
                  {resource.ownerId?.firstName} {resource.ownerId?.lastName}
                </p>
                {resource.ownerId?.phone && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">☎ {resource.ownerId.phone}</p>
                )}
              </div>
            </div>
            <button className="w-full mt-4 bg-[#e85d45] text-white py-3 rounded-lg hover:bg-[#d54d35] flex items-center justify-center transition-colors">
              {t.resource.contactBtn}
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

          {/* Contact Form - Using InquiryForm component */}
          <div id="inquiry-form">
            <InquiryForm 
              resourceId={resource._id}
              onSuccess={() => console.log('Inquiry sent successfully')}
            />
          </div>

          {/* Stats */}
          <div className="bg-gray-50 dark:bg-dark-light rounded-xl p-4 border border-transparent dark:border-dark-border">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>👁 {resource.views} {t.resource.views}</span>
              <span>📅 {new Date(resource.createdAt).toLocaleDateString('sr-RS')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Resources */}
      {similarResources.length > 0 && (
        <section className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold dark:text-white">{t.resource.similarResources}</h2>
              <p className="text-gray-500 dark:text-gray-400">{t.resource.similarInCategory} {(t.categories as Record<string, string>)[resource.categoryId?.slug || ''] || resource.categoryId?.name}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarResources.map((similar) => (
              <Link
                key={similar._id}
                to={`/resources/${similar.slug}`}
                className="bg-white dark:bg-dark-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow dark:border dark:border-dark-border"
              >
                <div className="relative">
                  <img
                    src={getImageUrl(similar.images[0]?.url || '')}
                    alt={similar.title}
                    className="w-full h-48 object-cover"
                  />
                  {similar.isFeatured && (
                    <span className="absolute top-3 left-3 bg-[#e85d45] text-white text-xs px-2 py-1 rounded">
                      ★ {t.search.featured}
                    </span>
                  )}
                  <span className="absolute bottom-3 left-3 bg-white dark:bg-dark-card text-sm px-2 py-1 rounded font-medium dark:text-white">
                    €{similar.pricePerDay.toFixed(2)} / {t.search.perDay}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-medium dark:text-white">{similar.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {similar.location.city}, {similar.location.country}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
