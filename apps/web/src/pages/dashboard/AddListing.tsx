import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth, useLanguage, useToast } from '../../context';
import { countries, getCitiesForCountry, getMunicipalitiesForCity } from '../../data/locations';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Form validation schema
const addListingSchema = z.object({
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

type AddListingFormData = z.infer<typeof addListingSchema>;

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function AddListing() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const { success, error: showError, warning } = useToast();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Location state
  const [selectedCountry, setSelectedCountry] = useState('Srbija');
  const [selectedCity, setSelectedCity] = useState('');

  // Helper to get translated category name
  const getCategoryName = (slug: string, fallbackName: string) => {
    const categoryNames = t.categories as Record<string, string>;
    return categoryNames[slug] || fallbackName;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
    setValue,
  } = useForm<AddListingFormData>({
    resolver: zodResolver(addListingSchema) as any,
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

  // Watch status to conditionally show/hide price section
  const currentStatus = watch('status');
  const isPriceRequired = currentStatus !== 'menjam' && currentStatus !== 'poklanjam';

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/categories`);
        const result = await response.json();
        if (result.success) {
          setCategories(result.data || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Compress image to target size (max 80KB) while maintaining quality
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
          
          // Max dimensions
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          
          // Scale down if needed
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
          
          // Start with high quality and reduce until under target size
          let quality = 0.8;
          let blob: Blob | null = null;
          
          const tryCompress = () => {
            canvas.toBlob(
              (result) => {
                if (!result) {
                  reject(new Error('Failed to compress image'));
                  return;
                }
                
                const sizeKB = result.size / 1024;
                
                if (sizeKB <= maxSizeKB || quality <= 0.1) {
                  // Convert blob to file
                  const compressedFile = new File([result], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  });
                  console.log(`Compressed ${file.name}: ${(file.size / 1024).toFixed(1)}KB -> ${(compressedFile.size / 1024).toFixed(1)}KB`);
                  resolve(compressedFile);
                } else {
                  // Reduce quality and try again
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

  // Handle image upload with compression
  const handleImageChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 10) {
      warning('Previše slika', 'Maksimalno 10 fotografija po oglasu');
      return;
    }

    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/');
      const isSmallEnough = file.size <= 10 * 1024 * 1024; // 10MB original limit
      return isValid && isSmallEnough;
    });

    // Compress each file
    const compressedFiles: File[] = [];
    for (const file of validFiles) {
      try {
        const compressed = await compressImage(file, 80); // Max 80KB
        compressedFiles.push(compressed);
        
        // Generate preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(compressed);
      } catch (error) {
        console.error('Error compressing image:', error);
        // Use original if compression fails
        compressedFiles.push(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      }
    }
    
    setImages(prev => [...prev, ...compressedFiles]);
  }, [images.length, compressImage, warning]);

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  // Step navigation
  const nextStep = async () => {
    let fieldsToValidate: (keyof AddListingFormData)[] = [];
    
    if (step === 1) {
      fieldsToValidate = ['title', 'categoryId', 'description'];
    } else if (step === 2) {
      // Images step - no validation needed
    } else if (step === 3) {
      fieldsToValidate = ['location'];
    }
    
    const isValid = await trigger(fieldsToValidate as any);
    if (isValid || step === 2) {
      setStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  // Submit form
  const onSubmit = async (data: AddListingFormData) => {
    if (!token) {
      setSubmitError('Morate biti prijavljeni');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare data - ensure pricePerDay is 0 for menjam/poklanjam
      const submitData = {
        ...data,
        pricePerDay: (data.status === 'menjam' || data.status === 'poklanjam') 
          ? 0 
          : (data.pricePerDay || 0),
      };

      // Debug logging - remove after fixing
      console.log('=== SUBMIT DATA ===');
      console.log('Form data:', data);
      console.log('Submit data:', submitData);
      console.log('===================');

      // First create the resource
      const response = await fetch(`${API_URL}/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      // Debug logging - remove after fixing
      console.log('=== API RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Result:', JSON.stringify(result, null, 2));
      if (result.errors) {
        console.log('Validation errors:');
        result.errors.forEach((err: { field: string; message: string }) => {
          console.log(`  - ${err.field}: ${err.message}`);
        });
      }
      console.log('====================');

      if (!result.success) {
        throw new Error(result.message || 'Greška pri kreiranju oglasa');
      }

      const resourceId = result.data._id;

      // Upload images if any
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach(image => {
          formData.append('images', image);
        });

        await fetch(`${API_URL}/resources/${resourceId}/images`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });
      }

      // Navigate to my listings
      success('Oglas uspešno kreiran!', 'Vaš oglas je objavljen i sada je vidljiv svima.');
      navigate('/dashboard/my-listings');
    } catch (error) {
      console.error('Error creating listing:', error);
      const errorMessage = error instanceof Error ? error.message : 'Greška pri kreiranju oglasa';
      setSubmitError(errorMessage);
      showError('Greška pri kreiranju oglasa', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: t.dashboard.basicInfo },
    { num: 2, label: t.dashboard.images },
    { num: 3, label: t.dashboard.location },
    { num: 4, label: t.dashboard.price },
  ];

  const rentalTypes = [
    { value: 'daily', label: 'Po danu' },
    { value: 'hourly', label: 'Po satu' },
    { value: 'weekly', label: 'Nedeljno' },
    { value: 'monthly', label: 'Mesečno' },
  ];

  const listingTypes = [
    { value: 'active', label: 'Izdajem' },
    { value: 'menjam', label: 'Menjam' },
    { value: 'poklanjam', label: 'Poklanjam' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.dashboard.addListing}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t.dashboard.basicInfo}</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((s, idx) => (
          <div key={s.num} className="flex items-center">
            <div
              onClick={() => s.num < step && setStep(s.num)}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-medium cursor-pointer transition-colors ${
                s.num <= step
                  ? 'bg-[#e85d45] text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
            >
              {s.num}
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-16 h-1 mx-2 ${s.num < step ? 'bg-[#e85d45]' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-100 dark:border-gray-800">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.dashboard.basicInfo}</h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t.dashboard.descriptionPlaceholder}</p>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.dashboard.listingTitle} *
                </label>
                <input
                  {...register('title')}
                  placeholder={t.dashboard.titlePlaceholder}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent transition-all"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.dashboard.category} *
                  </label>
                  <select
                    {...register('categoryId')}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent transition-all"
                  >
                    <option value="">{t.dashboard.selectCategory}</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{getCategoryName(cat.slug, cat.name)}</option>
                    ))}
                  </select>
                  {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tip oglasa *
                  </label>
                  <select
                    {...register('status')}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent transition-all"
                  >
                    {listingTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.dashboard.description} *
                </label>
                <textarea
                  {...register('description')}
                  rows={5}
                  placeholder={t.dashboard.descriptionPlaceholder}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent transition-all resize-none"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Images */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.dashboard.images}</h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t.dashboard.maxImages}</p>

              {/* Image Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.add('border-[#e85d45]', 'bg-[#e85d45]/5');
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.remove('border-[#e85d45]', 'bg-[#e85d45]/5');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.remove('border-[#e85d45]', 'bg-[#e85d45]/5');
                  const files = e.dataTransfer.files;
                  if (files && files.length > 0) {
                    // Create a fake event to reuse handleImageChange
                    const fakeEvent = {
                      target: { files }
                    } as React.ChangeEvent<HTMLInputElement>;
                    handleImageChange(fakeEvent);
                  }
                }}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-[#e85d45] transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-gray-600 dark:text-gray-400">{t.dashboard.dragAndDrop} <span className="text-[#e85d45]">{t.dashboard.browseFiles}</span></p>
                <p className="text-sm text-gray-400 mt-2">PNG, JPG - 5MB max</p>
              </div>

              {/* Image Previews */}
              {imagePreview.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {imagePreview.map((src, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={src}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.dashboard.location}</h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t.dashboard.enterPropertyAddress}</p>

              {/* Country Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Država *
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => {
                    setSelectedCountry(e.target.value);
                    setSelectedCity('');
                    setValue('location.country', e.target.value);
                    setValue('location.city', '');
                    setValue('location.municipality', '');
                  }}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent transition-all"
                >
                  {countries.map(country => (
                    <option key={country.code} value={country.name}>{country.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* City Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.dashboard.city} *
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      setValue('location.city', e.target.value);
                      setValue('location.municipality', '');
                    }}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent transition-all"
                  >
                    <option value="">Izaberite grad</option>
                    {getCitiesForCountry(selectedCountry).map(city => (
                      <option key={city.name} value={city.name}>{city.name}</option>
                    ))}
                  </select>
                  {errors.location?.city && <p className="text-red-500 text-sm mt-1">{errors.location.city.message}</p>}
                </div>

                {/* Municipality Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.dashboard.municipality}
                  </label>
                  <select
                    {...register('location.municipality')}
                    disabled={!selectedCity || getMunicipalitiesForCity(selectedCountry, selectedCity).length === 0}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Izaberite opštinu</option>
                    {getMunicipalitiesForCity(selectedCountry, selectedCity).map(m => (
                      <option key={m.name} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.dashboard.address}
                </label>
                <input
                  {...register('location.address')}
                  placeholder="npr. Kralja Milana 22"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent transition-all"
                />
              </div>
            </div>
          )}

          {/* Step 4: Price */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.dashboard.price}</h2>
              </div>
              
              {/* Show message for menjam/poklanjam */}
              {!isPriceRequired ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
                  <svg className="w-12 h-12 mx-auto text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
                    {currentStatus === 'poklanjam' ? 'Poklanjate ovaj artikal' : 'Menjate ovaj artikal'}
                  </h3>
                  <p className="text-green-600 dark:text-green-400">
                    {currentStatus === 'poklanjam' 
                      ? 'Za poklone ne treba unositi cenu. Možete direktno objaviti oglas.'
                      : 'Za zamenu ne treba unositi cenu. U opisu navedite šta želite u zamenu.'}
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t.dashboard.setPriceForRenting}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t.dashboard.priceEur} *
                      </label>
                      <input
                        {...register('pricePerDay')}
                        type="number"
                        placeholder="100"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent transition-all"
                      />
                      {errors.pricePerDay && <p className="text-red-500 text-sm mt-1">{errors.pricePerDay.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t.dashboard.perPeriod} *
                      </label>
                      <select
                        {...register('rentalType')}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent transition-all"
                      >
                        {rentalTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Error message */}
              {submitError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
                  {submitError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 1}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t.dashboard.back}
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {t.dashboard.saveAsDraft}
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 bg-[#e85d45] hover:bg-[#d54d35] text-white rounded-lg font-medium transition-colors"
              >
                {t.dashboard.next}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-[#e85d45] hover:bg-[#d54d35] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t.dashboard.publishing : t.dashboard.publishListing}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
