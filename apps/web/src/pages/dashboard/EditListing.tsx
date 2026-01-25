import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth, useLanguage, useToast } from '../../context';
import { countries, getCitiesForCountry, getMunicipalitiesForCity } from '../../data/locations';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE = API_URL.replace('/api', '');

// Helper to get full image URL
const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

// Form validation schema
const editListingSchema = z.object({
  title: z.string().min(5, 'Naslov mora imati najmanje 5 karaktera').max(100),
  description: z.string().min(20, 'Opis mora imati najmanje 20 karaktera').max(5000),
  categoryId: z.string().min(1, 'Kategorija je obavezna'),
  rentalType: z.string().optional(),
  pricePerDay: z.coerce.number().min(0, 'Cena ne može biti negativna').optional(),
  currency: z.enum(['EUR', 'RSD', 'USD']),
  status: z.enum(['active', 'inactive', 'pending', 'menjam', 'poklanjam']),
  location: z.object({
    country: z.string().default('Srbija'),
    city: z.string().min(2, 'Grad je obavezan'),
    municipality: z.string().optional(),
    address: z.string().optional(),
  }),
});

type EditListingFormData = z.infer<typeof editListingSchema>;

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface ExistingImage {
  url: string;
  alt?: string;
  order: number;
}

export default function EditListing() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const { t } = useLanguage();
  const { success, error: showError, warning } = useToast();
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Location state
  const [selectedCountry, setSelectedCountry] = useState('Srbija');
  const [selectedCity, setSelectedCity] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<EditListingFormData>({
    resolver: zodResolver(editListingSchema) as any,
    defaultValues: {
      currency: 'EUR',
      status: 'active',
      pricePerDay: 0,
      location: { 
        country: 'Srbija',
        city: '',
        municipality: '',
        address: '',
      },
    },
  });

  // Helper to get translated category name
  const getCategoryName = (slug: string, fallbackName: string): string => {
    return (t.categories as Record<string, string>)[slug] || fallbackName;
  };

  const currentStatus = watch('status');
  const isPriceRequired = currentStatus !== 'menjam' && currentStatus !== 'poklanjam';

  // Fetch listing and categories
  useEffect(() => {
    const fetchData = async () => {
      if (!id || !token) return;
      
      try {
        // Fetch categories and listing in parallel
        const [catResponse, response] = await Promise.all([
          fetch(`${API_URL}/categories`),
          fetch(`${API_URL}/resources/my`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
        ]);
        
        const catResult = await catResponse.json();
        if (catResult.success) {
          setCategories(catResult.data || []);
        }

        const result = await response.json();
        
        if (result.success) {
          const listing = result.data.find((l: any) => l._id === id);
          if (listing) {
            // Set form values
            reset({
              title: listing.title,
              description: listing.description,
              categoryId: listing.categoryId?._id || listing.categoryId,
              pricePerDay: listing.pricePerDay,
              currency: listing.currency,
              status: listing.status,
              rentalType: listing.rentalType,
              location: {
                country: listing.location?.country || 'Srbija',
                city: listing.location?.city || '',
                municipality: listing.location?.municipality || '',
                address: listing.location?.address || '',
              },
            });
            
            // Set location state
            setSelectedCountry(listing.location?.country || 'Srbija');
            setSelectedCity(listing.location?.city || '');
            
            // Set existing images
            setExistingImages(listing.images || []);
          } else {
            showError(t.toasts.error, t.toasts.listingNotFound);
            navigate('/dashboard/my-listings');
          }
        }
      } catch (error) {
        console.error('Error fetching listing:', error);
        showError(t.toasts.error, t.toasts.loadError);
      }
    };
    
    fetchData();
  }, [id, token, reset, navigate, showError]);

  // Image compression
  const compressImage = useCallback((file: File, maxSizeKB: number = 80): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          
          if (width > MAX_WIDTH) {
            height = (height * MAX_WIDTH) / width;
            width = MAX_WIDTH;
          }
          if (height > MAX_HEIGHT) {
            width = (width * MAX_HEIGHT) / height;
            height = MAX_HEIGHT;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          
          let quality = 0.8;
          const tryCompress = () => {
            canvas.toBlob(
              (result) => {
                if (!result) {
                  reject(new Error('Failed to compress image'));
                  return;
                }
                const sizeKB = result.size / 1024;
                if (sizeKB <= maxSizeKB || quality <= 0.1) {
                  const compressedFile = new File([result], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  });
                  resolve(compressedFile);
                } else {
                  quality -= 0.1;
                  tryCompress();
                }
              },
              'image/jpeg',
              quality
            );
          };
          tryCompress();
        };
        img.onerror = () => reject(new Error('Failed to load image'));
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  }, []);

  const handleImageChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length + newImages.length + files.length;
    
    if (totalImages > 10) {
      warning(t.toasts.tooManyImages, t.toasts.tooManyImagesDesc);
      return;
    }

    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/');
      const isSmallEnough = file.size <= 10 * 1024 * 1024;
      return isValid && isSmallEnough;
    });

    const compressedFiles: File[] = [];
    for (const file of validFiles) {
      try {
        const compressed = await compressImage(file, 80);
        compressedFiles.push(compressed);
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(compressed);
      } catch (error) {
        console.error('Error compressing image:', error);
        compressedFiles.push(file);
      }
    }
    
    setNewImages(prev => [...prev, ...compressedFiles]);
  }, [existingImages.length, newImages.length, compressImage, warning]);

  const removeExistingImage = async (index: number) => {
    try {
      const response = await fetch(`${API_URL}/resources/${id}/images/${index}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
        success(t.toasts.imageDeleted, t.toasts.imageDeletedDesc);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      showError(t.toasts.error, t.toasts.imageDeleteError);
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: EditListingFormData) => {
    if (!token || !id) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const submitData = {
        ...data,
        pricePerDay: (data.status === 'menjam' || data.status === 'poklanjam') 
          ? 0 
          : (data.pricePerDay || 0),
      };

      // Update resource
      const response = await fetch(`${API_URL}/resources/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Greška pri ažuriranju oglasa');
      }

      // Upload new images if any
      if (newImages.length > 0) {
        const formData = new FormData();
        newImages.forEach(image => {
          formData.append('images', image);
        });

        await fetch(`${API_URL}/resources/${id}/images`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });
      }

      success(t.toasts.listingUpdated, t.toasts.listingUpdatedDesc);
      navigate('/dashboard/my-listings');
    } catch (error) {
      console.error('Error updating listing:', error);
      const errorMessage = error instanceof Error ? error.message : t.toasts.updateError;
      setSubmitError(errorMessage);
      showError(t.toasts.updateError, errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const listingTypes = [
    { value: 'active', label: 'Izdajem' },
    { value: 'menjam', label: 'Menjam' },
    { value: 'poklanjam', label: 'Poklanjam' },
    { value: 'inactive', label: 'Neaktivan' },
  ];

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Izmeni oglas</h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Ažurirajte informacije o vašem oglasu</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        {/* Basic Info */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-gray-800">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Osnovne informacije</h2>
          
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                Naslov *
              </label>
              <input
                {...register('title')}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent"
              />
              {errors.title && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                  Kategorija *
                </label>
                <select
                  {...register('categoryId')}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent"
                >
                  <option value="">{t.listings?.selectCategory || 'Izaberite kategoriju'}</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{getCategoryName(cat.slug, cat.name)}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.categoryId.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                  Tip oglasa *
                </label>
                <select
                  {...register('status')}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent"
                >
                  {listingTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                Opis *
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent resize-none"
              />
              {errors.description && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.description.message}</p>}
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-gray-800">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Fotografije</h2>
          
          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">Postojeće fotografije</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
                {existingImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={getImageUrl(img.url)}
                      alt={img.alt || `Slika ${index + 1}`}
                      className="w-full h-24 sm:h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-red-500 text-white p-1 rounded-full opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images */}
          {newImagePreviews.length > 0 && (
            <div className="mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">Nove fotografije</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
                {newImagePreviews.map((src, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={src}
                      alt={`Nova slika ${index + 1}`}
                      className="w-full h-24 sm:h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-red-500 text-white p-1 rounded-full opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 sm:p-8 text-center cursor-pointer hover:border-[#e85d45] transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
            <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Dodajte nove fotografije</p>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-gray-800">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Lokacija</h2>
          
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">Država</label>
              <select
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setSelectedCity('');
                  setValue('location.country', e.target.value);
                  setValue('location.city', '');
                }}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent"
              >
                {countries.map(country => (
                  <option key={country.code} value={country.name}>{country.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">Grad *</label>
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setValue('location.city', e.target.value);
                  }}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent"
                >
                  <option value="">Izaberite grad</option>
                  {getCitiesForCountry(selectedCountry).map(city => (
                    <option key={city.name} value={city.name}>{city.name}</option>
                  ))}
                </select>
                {errors.location?.city && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.location.city.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">Opština</label>
                <select
                  {...register('location.municipality')}
                  disabled={!selectedCity || getMunicipalitiesForCity(selectedCountry, selectedCity).length === 0}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent disabled:opacity-50"
                >
                  <option value="">Izaberite opštinu</option>
                  {getMunicipalitiesForCity(selectedCountry, selectedCity).map(m => (
                    <option key={m.name} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">Adresa</label>
              <input
                {...register('location.address')}
                placeholder="npr. Kralja Milana 22"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Price */}
        {isPriceRequired && (
          <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-gray-800">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Cena</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">Cena po danu</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('pricePerDay')}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">Valuta</label>
                <select
                  {...register('currency')}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="RSD">RSD (дин)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {submitError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4 text-sm text-red-700 dark:text-red-400">
            {submitError}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard/my-listings')}
            className="order-2 sm:order-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Otkaži
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="order-1 sm:order-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-[#e85d45] hover:bg-[#d54d35] text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Čuvanje...' : 'Sačuvaj izmene'}
          </button>
        </div>
      </form>
    </div>
  );
}
