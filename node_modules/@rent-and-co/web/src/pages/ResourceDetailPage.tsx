import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context';

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
  const { slug } = useParams();
  const [resource, setResource] = useState<ResourceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [similarResources, setSimilarResources] = useState<ResourceDetail[]>([]);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true);
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
          setError('Resurs nije pronađen');
        }
      } catch (err) {
        console.error('Error fetching resource:', err);
        setError('Greška pri učitavanju resursa');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchResource();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e85d45]"></div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{error || 'Resurs nije pronađen'}</h1>
          <Link to="/search" className="text-[#e85d45] hover:underline">
            ← Nazad na pretragu
          </Link>
        </div>
      </div>
    );
  }

  const mainImage = resource.images[selectedImage]?.url || resource.images[0]?.url || '';
  const otherImages = resource.images.filter((_, index) => index !== selectedImage);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:text-[#e85d45]">{t.nav.home}</Link>
        {' / '}
        <Link to="/categories" className="hover:text-[#e85d45]">{t.nav.categories}</Link>
        {' / '}
        <Link to={`/search?category=${resource.categoryId?.slug}`} className="hover:text-[#e85d45]">
          {resource.categoryId?.name}
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
              {resource.categoryId?.icon} {resource.categoryId?.name}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">{resource.title}</h1>
          <p className="text-gray-500">
            {resource.location.address}, {resource.location.city}, {resource.location.country}
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <button className="p-2 border rounded-lg hover:bg-gray-100" title="Dodaj u favorite">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <button className="p-2 border rounded-lg hover:bg-gray-100" title="Podeli">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
          <div className="text-right">
            <p className="text-3xl font-bold text-[#e85d45]">
              {resource.currency === 'EUR' ? '€' : resource.currency === 'RSD' ? 'RSD' : '$'}
              {resource.pricePerDay.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">/ {t.search.perDay}</p>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="md:col-span-2 md:row-span-2">
          <img
            src={mainImage}
            alt={resource.title}
            className="w-full h-[300px] md:h-[400px] object-cover rounded-xl cursor-pointer"
            onClick={() => window.open(mainImage, '_blank')}
          />
        </div>
        {otherImages.slice(0, 4).map((image, index) => (
          <div key={index} className="relative">
            <img
              src={image.url}
              alt={image.alt || resource.title}
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
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">{t.resource.description}</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {resource.description}
            </p>
          </div>

          {/* Options */}
          {resource.options && resource.options.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Karakteristike</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {resource.options.map((option, index) => (
                  <div key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-[#e85d45] rounded-full mr-2"></span>
                    <span className="text-gray-600">{option}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Address */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">{t.resource.address}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-gray-500 text-sm">{t.resource.address}</p>
                <p className="font-medium">{resource.location.address || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">{t.resource.city}</p>
                <p className="font-medium">{resource.location.city}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">{t.resource.country}</p>
                <p className="font-medium">{resource.location.country}</p>
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
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">{t.resource.additionalInfo}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {resource.extraInfo.map((info, index) => (
                  <div key={index}>
                    <p className="text-gray-500 text-sm">{info.label}</p>
                    <p className="font-medium">{info.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">{t.resource.contactInfo}</h2>
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full mr-3 flex items-center justify-center text-xl">
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
                <p className="font-medium">
                  {resource.ownerId?.firstName} {resource.ownerId?.lastName}
                </p>
                {resource.ownerId?.phone && (
                  <p className="text-sm text-gray-500">☎ {resource.ownerId.phone}</p>
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

          {/* Contact Form */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-2">{t.resource.sendMessage}</h2>
            <p className="text-sm text-gray-500 mb-4">{t.resource.weRespondQuickly}</p>
            <form className="space-y-3">
              <input
                type="text"
                placeholder={t.resource.firstName}
                className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#e85d45]"
              />
              <input
                type="text"
                placeholder={t.resource.lastName}
                className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#e85d45]"
              />
              <input
                type="tel"
                placeholder={t.resource.phone}
                className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#e85d45]"
              />
              <input
                type="email"
                placeholder={t.resource.email}
                className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#e85d45]"
              />
              <textarea
                placeholder={t.resource.messageText}
                rows={3}
                className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#e85d45]"
              ></textarea>
              <label className="flex items-center text-sm">
                <input type="checkbox" className="mr-2" />
                {t.resource.acceptTerms}
              </label>
              <button type="button" className="w-full bg-[#1a1a1a] text-white py-3 rounded-lg hover:bg-gray-800 flex items-center justify-center transition-colors">
                {t.resource.send}
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          </div>

          {/* Stats */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between text-sm text-gray-500">
              <span>👁 {resource.views} pregleda</span>
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
              <h2 className="text-2xl font-bold">{t.resource.similarResources}</h2>
              <p className="text-gray-500">Slični oglasi u kategoriji {resource.categoryId?.name}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarResources.map((similar) => (
              <Link
                key={similar._id}
                to={`/resources/${similar.slug}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <img
                    src={similar.images[0]?.url || ''}
                    alt={similar.title}
                    className="w-full h-48 object-cover"
                  />
                  {similar.isFeatured && (
                    <span className="absolute top-3 left-3 bg-[#e85d45] text-white text-xs px-2 py-1 rounded">
                      ★ {t.search.featured}
                    </span>
                  )}
                  <span className="absolute bottom-3 left-3 bg-white text-sm px-2 py-1 rounded font-medium">
                    €{similar.pricePerDay.toFixed(2)} / {t.search.perDay}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-medium">{similar.title}</h3>
                  <p className="text-sm text-gray-500">
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
