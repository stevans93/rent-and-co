import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth, useLanguage } from '../../context';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Form validation schema
const addListingSchema = z.object({
  title: z.string().min(5, 'Naslov mora imati najmanje 5 karaktera').max(100),
  description: z.string().min(20, 'Opis mora imati najmanje 20 karaktera').max(5000),
  categoryId: z.string().min(1, 'Kategorija je obavezna'),
  rentalType: z.string().optional(),
  pricePerDay: z.coerce.number().positive('Cena mora biti pozitivan broj'),
  currency: z.enum(['EUR', 'RSD', 'USD']),
  status: z.enum(['active', 'inactive', 'pending']),
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
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  } = useForm<AddListingFormData>({
    resolver: zodResolver(addListingSchema) as any,
    defaultValues: {
      currency: 'EUR',
      status: 'active',
      location: { country: 'Srbija' },
    },
  });

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

  // Handle image upload
  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 10) {
      alert('Maksimalno 10 fotografija');
      return;
    }

    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/');
      const isSmallEnough = file.size <= 5 * 1024 * 1024; // 5MB
      return isValid && isSmallEnough;
    });

    setImages(prev => [...prev, ...validFiles]);
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }, [images.length]);

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
      // First create the resource
      const response = await fetch(`${API_URL}/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

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
      navigate('/dashboard/my-listings');
    } catch (error) {
      console.error('Error creating listing:', error);
      setSubmitError(error instanceof Error ? error.message : 'Greška pri kreiranju oglasa');
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
                    {t.dashboard.status} *
                  </label>
                  <select
                    {...register('rentalType')}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent transition-all"
                  >
                    <option value="">{t.dashboard.selectCategory}</option>
                    {rentalTypes.map(type => (
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.dashboard.city} *
                  </label>
                  <input
                    {...register('location.city')}
                    placeholder="npr. Beograd"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent transition-all"
                  />
                  {errors.location?.city && <p className="text-red-500 text-sm mt-1">{errors.location.city.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.dashboard.municipality}
                  </label>
                  <input
                    {...register('location.municipality')}
                    placeholder="npr. Vračar"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent transition-all"
                  />
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
                    {...register('currency')}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent transition-all"
                  >
                    <option value="EUR">{t.dashboard.perDay}</option>
                  </select>
                </div>
              </div>

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
