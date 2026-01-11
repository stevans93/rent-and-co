import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage, useTheme, useAuth } from '../context';
import { SEO, SEOConfigs } from '../components/SEO';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Form validation schema based on shared schema
const createResourceFormSchema = z.object({
  title: z.string().min(5, 'Naslov mora imati najmanje 5 karaktera').max(100, 'Naslov može imati maksimalno 100 karaktera'),
  description: z.string().min(20, 'Opis mora imati najmanje 20 karaktera').max(5000, 'Opis može imati maksimalno 5000 karaktera'),
  categoryId: z.string().min(1, 'Kategorija je obavezna'),
  pricePerDay: z.coerce.number().positive('Cena mora biti pozitivan broj'),
  currency: z.enum(['EUR', 'RSD', 'USD']),
  status: z.enum(['active', 'inactive', 'pending']),
  options: z.array(z.string()).optional(),
  location: z.object({
    country: z.string(),
    city: z.string().min(2, 'Grad je obavezan'),
    address: z.string().optional(),
  }),
  extraInfo: z.array(z.object({
    label: z.string().min(1, 'Naziv je obavezan'),
    value: z.string().min(1, 'Vrednost je obavezna'),
  })).optional(),
});

type CreateResourceFormData = z.infer<typeof createResourceFormSchema>;

interface ImageFile {
  file?: File;
  url: string;
  alt: string;
  order: number;
  preview?: string;
  isUploading?: boolean;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
}

// Common options for resources
const COMMON_OPTIONS = [
  'WiFi', 'Parking', 'Klima', 'Grejanje', 'Osiguranje', 
  'Dostava', 'Non-stop', 'Vikend', 'Dugoročno', 'Kratkoročno'
];

export default function CreateResourcePage() {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateResourceFormData>({
    resolver: zodResolver(createResourceFormSchema),
    defaultValues: {
      currency: 'EUR',
      status: 'pending',
      location: {
        country: 'Srbija',
        city: '',
        address: '',
      },
      extraInfo: [],
      options: [],
    },
  });

  const { fields: extraInfoFields, append: appendExtraInfo, remove: removeExtraInfo } = useFieldArray({
    control,
    name: 'extraInfo',
  });

  const title = watch('title');

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/categories`);
        const result = await response.json();
        if (result.success) {
          setCategories(result.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!user || !token) {
      navigate('/login', { state: { from: '/create' } });
    }
  }, [user, token, navigate]);

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  // Process files
  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (images.length + imageFiles.length > 10) {
      alert('Maksimalno 10 slika je dozvoljeno');
      return;
    }

    const newImages: ImageFile[] = imageFiles.map((file, index) => ({
      file,
      url: '',
      alt: title ? `${title} — fotografija` : 'fotografija',
      order: images.length + index,
      preview: URL.createObjectURL(file),
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  // Remove image
  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      // Revoke object URL if it exists
      if (prev[index].preview) {
        URL.revokeObjectURL(prev[index].preview!);
      }
      // Update order
      return newImages.map((img, i) => ({ ...img, order: i }));
    });
  };

  // Update image alt text
  const updateImageAlt = (index: number, alt: string) => {
    setImages(prev => prev.map((img, i) => 
      i === index ? { ...img, alt } : img
    ));
  };

  // Reorder images (drag and drop)
  const moveImage = (fromIndex: number, toIndex: number) => {
    setImages(prev => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return newImages.map((img, i) => ({ ...img, order: i }));
    });
  };

  // Toggle option
  const toggleOption = (option: string) => {
    setSelectedOptions(prev => {
      const newOptions = prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option];
      setValue('options', newOptions);
      return newOptions;
    });
  };

  // Submit form
  const onSubmit = async (data: CreateResourceFormData) => {
    if (images.length === 0) {
      setSubmitError('Najmanje jedna slika je obavezna');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // First create resource with placeholder images
      const tempImages = images.map((img, index) => ({
        url: img.preview || 'placeholder',
        alt: img.alt,
        order: index,
      }));

      const resourceData = {
        ...data,
        options: selectedOptions,
        images: tempImages,
      };

      const createResponse = await fetch(`${API_URL}/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(resourceData),
      });

      const createResult = await createResponse.json();

      if (!createResult.success) {
        throw new Error(createResult.message || 'Greška pri kreiranju oglasa');
      }

      const resourceId = createResult.data._id;
      const resourceSlug = createResult.data.slug;

      // Upload images
      const filesToUpload = images.filter(img => img.file);
      if (filesToUpload.length > 0) {
        const formData = new FormData();
        filesToUpload.forEach(img => {
          if (img.file) {
            formData.append('images', img.file);
          }
        });

        const uploadResponse = await fetch(`${API_URL}/resources/${resourceId}/images`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResult.success) {
          console.warn('Image upload warning:', uploadResult.message);
        }
      }

      // Navigate to the created resource
      navigate(`/resources/${resourceSlug}`);
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitError(error instanceof Error ? error.message : 'Greška pri kreiranju oglasa');
    } finally {
      setIsSubmitting(false);
    }
  };

  const heroImage = isDark
    ? 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920'
    : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920';

  const steps = [
    { num: 1, label: 'Osnovne informacije' },
    { num: 2, label: 'Slike' },
    { num: 3, label: 'Lokacija' },
    { num: 4, label: 'Dodatno' },
  ];

  return (
    <div>
      <SEO {...SEOConfigs.create} />
      
      {/* Hero Section */}
      <section
        className="relative h-64 bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("${heroImage}")` }}
      >
        <div className="container mx-auto px-4 h-full flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-white">{t.create.title}</h1>
          <p className="text-gray-200">{t.create.breadcrumb}</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((s, idx) => (
            <div key={s.num} className="flex items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium cursor-pointer transition-colors ${
                  s.num <= step 
                    ? 'bg-[#e85d45] text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}
                onClick={() => setStep(s.num)}
              >
                {s.num}
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-16 md:w-24 h-1 ${s.num < step ? 'bg-[#e85d45]' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Step Labels */}
        <div className="hidden md:flex items-center justify-center mb-8 gap-8">
          {steps.map((s) => (
            <span 
              key={s.num} 
              className={`text-sm ${s.num === step ? 'text-[#e85d45] font-medium' : 'text-gray-500'}`}
            >
              {s.label}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-6">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="bg-white dark:bg-dark-card rounded-xl p-8 shadow-sm dark:border dark:border-dark-border">
                <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">{t.create.basicInfo}</h2>
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      {t.create.adTitle} *
                    </label>
                    <input
                      type="text"
                      {...register('title')}
                      placeholder="npr. Profesionalna kamera Canon EOS R5"
                      className={`w-full border rounded-lg px-4 py-3 bg-white dark:bg-dark-light text-gray-900 dark:text-white focus:outline-none focus:border-[#e85d45] ${
                        errors.title ? 'border-red-500' : 'border-gray-300 dark:border-dark-border'
                      }`}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      {t.create.category} *
                    </label>
                    <select
                      {...register('categoryId')}
                      className={`w-full border rounded-lg px-4 py-3 bg-white dark:bg-dark-light text-gray-900 dark:text-white focus:outline-none focus:border-[#e85d45] ${
                        errors.categoryId ? 'border-red-500' : 'border-gray-300 dark:border-dark-border'
                      }`}
                    >
                      <option value="">{t.create.selectCategory}</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                    {errors.categoryId && (
                      <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      {t.create.description} *
                    </label>
                    <textarea
                      {...register('description')}
                      placeholder={t.create.describeResource}
                      rows={5}
                      className={`w-full border rounded-lg px-4 py-3 bg-white dark:bg-dark-light text-gray-900 dark:text-white focus:outline-none focus:border-[#e85d45] ${
                        errors.description ? 'border-red-500' : 'border-gray-300 dark:border-dark-border'
                      }`}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                    )}
                  </div>

                  {/* Price & Currency */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        {t.create.price} *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        {...register('pricePerDay')}
                        placeholder="0.00"
                        className={`w-full border rounded-lg px-4 py-3 bg-white dark:bg-dark-light text-gray-900 dark:text-white focus:outline-none focus:border-[#e85d45] ${
                          errors.pricePerDay ? 'border-red-500' : 'border-gray-300 dark:border-dark-border'
                        }`}
                      />
                      {errors.pricePerDay && (
                        <p className="text-red-500 text-sm mt-1">{errors.pricePerDay.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Valuta
                      </label>
                      <select
                        {...register('currency')}
                        className="w-full border border-gray-300 dark:border-dark-border rounded-lg px-4 py-3 bg-white dark:bg-dark-light text-gray-900 dark:text-white"
                      >
                        <option value="EUR">EUR (€)</option>
                        <option value="RSD">RSD (дин)</option>
                        <option value="USD">USD ($)</option>
                      </select>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Status oglasa
                    </label>
                    <select
                      {...register('status')}
                      className="w-full border border-gray-300 dark:border-dark-border rounded-lg px-4 py-3 bg-white dark:bg-dark-light text-gray-900 dark:text-white"
                    >
                      <option value="pending">Na čekanju</option>
                      <option value="active">Aktivan</option>
                      <option value="inactive">Neaktivan</option>
                    </select>
                  </div>

                  {/* Options */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Opcije / Karakteristike
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_OPTIONS.map(option => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleOption(option)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                            selectedOptions.includes(option)
                              ? 'bg-[#e85d45] text-white'
                              : 'bg-gray-100 dark:bg-dark-light text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Images */}
            {step === 2 && (
              <div className="bg-white dark:bg-dark-card rounded-xl p-8 shadow-sm dark:border dark:border-dark-border">
                <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">{t.create.images}</h2>
                
                {/* Drag & Drop Zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-[#e85d45] bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-dark-border hover:border-[#e85d45]'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <div className="text-gray-500 dark:text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mb-2">{t.create.dragImages}</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[#e85d45] hover:underline font-medium"
                    >
                      {t.create.selectFiles}
                    </button>
                    <p className="text-sm mt-2">Maksimalno 10 slika, do 5MB po slici</p>
                  </div>
                </div>

                {/* Image Previews */}
                {images.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                      Uploadovane slike ({images.length}/10)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {images.map((img, index) => (
                        <div
                          key={index}
                          className="relative group bg-gray-100 dark:bg-dark-light rounded-lg overflow-hidden"
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('text/plain', index.toString())}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                            moveImage(fromIndex, index);
                          }}
                        >
                          <img
                            src={img.preview || img.url}
                            alt={img.alt}
                            className="w-full h-32 object-cover"
                          />
                          {index === 0 && (
                            <span className="absolute top-2 left-2 bg-[#e85d45] text-white text-xs px-2 py-0.5 rounded">
                              Glavna
                            </span>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                              title="Obriši"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          {/* Alt text input */}
                          <input
                            type="text"
                            value={img.alt}
                            onChange={(e) => updateImageAlt(index, e.target.value)}
                            placeholder="Alt tekst"
                            className="w-full text-xs p-2 bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      💡 Prevucite slike da ih preuredite. Prva slika će biti glavna.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Location */}
            {step === 3 && (
              <div className="bg-white dark:bg-dark-card rounded-xl p-8 shadow-sm dark:border dark:border-dark-border">
                <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Lokacija</h2>
                <div className="space-y-6">
                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      {t.create.country}
                    </label>
                    <input
                      type="text"
                      {...register('location.country')}
                      className="w-full border border-gray-300 dark:border-dark-border rounded-lg px-4 py-3 bg-white dark:bg-dark-light text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      {t.create.city} *
                    </label>
                    <input
                      type="text"
                      {...register('location.city')}
                      placeholder="npr. Beograd"
                      className={`w-full border rounded-lg px-4 py-3 bg-white dark:bg-dark-light text-gray-900 dark:text-white focus:outline-none focus:border-[#e85d45] ${
                        errors.location?.city ? 'border-red-500' : 'border-gray-300 dark:border-dark-border'
                      }`}
                    />
                    {errors.location?.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.location.city.message}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      {t.create.address}
                    </label>
                    <input
                      type="text"
                      {...register('location.address')}
                      placeholder={t.create.enterAddress}
                      className="w-full border border-gray-300 dark:border-dark-border rounded-lg px-4 py-3 bg-white dark:bg-dark-light text-gray-900 dark:text-white focus:outline-none focus:border-[#e85d45]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Extra Info */}
            {step === 4 && (
              <div className="bg-white dark:bg-dark-card rounded-xl p-8 shadow-sm dark:border dark:border-dark-border">
                <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Dodatne informacije</h2>
                
                {/* Extra Info Fields */}
                <div className="space-y-4">
                  {extraInfoFields.map((field, index) => (
                    <div key={field.id} className="flex gap-4 items-start">
                      <div className="flex-1">
                        <input
                          type="text"
                          {...register(`extraInfo.${index}.label`)}
                          placeholder="Naziv (npr. Težina)"
                          className="w-full border border-gray-300 dark:border-dark-border rounded-lg px-4 py-2 bg-white dark:bg-dark-light text-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          {...register(`extraInfo.${index}.value`)}
                          placeholder="Vrednost (npr. 2.5 kg)"
                          className="w-full border border-gray-300 dark:border-dark-border rounded-lg px-4 py-2 bg-white dark:bg-dark-light text-gray-900 dark:text-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExtraInfo(index)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => appendExtraInfo({ label: '', value: '' })}
                    className="flex items-center gap-2 text-[#e85d45] hover:underline"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Dodaj polje
                  </button>
                </div>

                {/* Summary */}
                <div className="mt-8 p-4 bg-gray-50 dark:bg-dark-light rounded-lg">
                  <h3 className="font-medium mb-2 dark:text-white">Pregled oglasa</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>📝 Naslov: {watch('title') || '-'}</li>
                    <li>📂 Kategorija: {categories.find(c => c._id === watch('categoryId'))?.name || '-'}</li>
                    <li>💰 Cena: {watch('pricePerDay') || 0} {watch('currency')}/dan</li>
                    <li>📍 Lokacija: {watch('location.city') || '-'}, {watch('location.country')}</li>
                    <li>🖼 Slike: {images.length}</li>
                    <li>🏷 Opcije: {selectedOptions.length > 0 ? selectedOptions.join(', ') : '-'}</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Error Message */}
            {submitError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
                {submitError}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
                className={`px-6 py-3 border rounded-lg transition-colors ${
                  step === 1
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-light'
                }`}
              >
                {t.create.back}
              </button>
              
              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-8 py-3 bg-[#e85d45] text-white rounded-lg hover:bg-[#d54d35] transition-colors"
                >
                  Dalje
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-[#e85d45] text-white rounded-lg hover:bg-[#d54d35] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Objavljujem...
                    </>
                  ) : (
                    t.create.publishAd
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-dark-card rounded-xl p-6 shadow-sm dark:border dark:border-dark-border sticky top-24">
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">💡 Saveti</h3>
              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                {step === 1 && (
                  <>
                    <p>✓ Napišite jasan i detaljan naslov</p>
                    <p>✓ Odaberite odgovarajuću kategoriju</p>
                    <p>✓ Detaljno opišite resurs i sve njegove karakteristike</p>
                    <p>✓ Postavite konkurentnu cenu</p>
                  </>
                )}
                {step === 2 && (
                  <>
                    <p>✓ Dodajte kvalitetne fotografije</p>
                    <p>✓ Prva slika će biti glavna</p>
                    <p>✓ Fotografišite iz više uglova</p>
                    <p>✓ Maksimalno 10 slika</p>
                  </>
                )}
                {step === 3 && (
                  <>
                    <p>✓ Tačno navedite lokaciju</p>
                    <p>✓ Grad je obavezan podatak</p>
                    <p>✓ Adresa pomaže korisnicima da vas pronađu</p>
                  </>
                )}
                {step === 4 && (
                  <>
                    <p>✓ Dodajte relevantne dodatne informacije</p>
                    <p>✓ npr. dimenzije, težina, godina proizvodnje</p>
                    <p>✓ Pregledajte sve podatke pre objave</p>
                  </>
                )}
              </div>

              {/* Progress */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-border">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Napredak</span>
                  <span className="text-[#e85d45] font-medium">{Math.round((step / 4) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-dark-light rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#e85d45] transition-all duration-300"
                    style={{ width: `${(step / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
