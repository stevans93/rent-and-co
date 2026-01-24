import { z } from 'zod';

// ==========================================
// User & Auth Schemas
// ==========================================

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
  role: z.enum(['user', 'admin', 'moderator']).default('user'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Login DTO
export const loginSchema = z.object({
  email: z.string().email('Nevažeća email adresa'),
  password: z.string().min(6, 'Lozinka mora imati najmanje 6 karaktera'),
});

// Register DTO
export const registerSchema = z.object({
  email: z.string().email('Nevažeća email adresa'),
  password: z.string().min(6, 'Lozinka mora imati najmanje 6 karaktera'),
  confirmPassword: z.string().min(6, 'Potvrda lozinke mora imati najmanje 6 karaktera'),
  firstName: z.string().min(2, 'Ime mora imati najmanje 2 karaktera'),
  lastName: z.string().min(2, 'Prezime mora imati najmanje 2 karaktera'),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Lozinke se ne poklapaju",
  path: ["confirmPassword"],
});

// ==========================================
// Category Schema
// ==========================================

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  icon: z.string().optional(),
  coverImage: z.string().url().optional(),
  order: z.number().default(0),
  resourceCount: z.number().default(0),
});

// ==========================================
// Location Schema
// ==========================================

export const locationSchema = z.object({
  country: z.string().default('Srbija'),
  city: z.string().min(2, 'Grad je obavezan'),
  municipality: z.string().optional(),
  address: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

// ==========================================
// Image Schema
// ==========================================

export const imageSchema = z.object({
  url: z.string().url('Nevažeća URL adresa slike'),
  alt: z.string().optional(),
  order: z.number().default(0),
});

// ==========================================
// Extra Info Schema
// ==========================================

export const extraInfoSchema = z.object({
  label: z.string().min(1, 'Naziv je obavezan'),
  value: z.string().min(1, 'Vrednost je obavezna'),
});

// ==========================================
// Resource/Listing Schemas
// ==========================================

export const resourceSchema = z.object({
  id: z.string(),
  title: z.string().min(5, 'Naslov mora imati najmanje 5 karaktera'),
  slug: z.string(),
  description: z.string().min(20, 'Opis mora imati najmanje 20 karaktera'),
  categoryId: z.string(),
  pricePerDay: z.number().min(0, 'Cena ne može biti negativna').optional(),
  currency: z.enum(['EUR', 'RSD', 'USD']).default('EUR'),
  isFeatured: z.boolean().default(false),
  status: z.enum(['active', 'inactive', 'pending', 'rented', 'menjam', 'poklanjam', 'draft']).default('pending'),
  options: z.array(z.string()).optional(),
  location: locationSchema,
  images: z.array(imageSchema).optional(),
  extraInfo: z.array(extraInfoSchema).optional(),
  ownerId: z.string(),
  views: z.number().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Create Resource DTO
export const createResourceSchema = z.object({
  title: z.string().min(5, 'Naslov mora imati najmanje 5 karaktera').max(100, 'Naslov može imati maksimalno 100 karaktera'),
  description: z.string().min(20, 'Opis mora imati najmanje 20 karaktera').max(5000, 'Opis može imati maksimalno 5000 karaktera'),
  categoryId: z.string().min(1, 'Kategorija je obavezna'),
  pricePerDay: z.number().min(0, 'Cena ne može biti negativna').optional().default(0),
  currency: z.enum(['EUR', 'RSD', 'USD']).default('EUR'),
  status: z.enum(['active', 'inactive', 'pending', 'menjam', 'poklanjam', 'draft']).default('active'),
  rentalType: z.string().optional(),
  options: z.array(z.string()).optional(),
  location: locationSchema,
  images: z.array(imageSchema).optional(),
  extraInfo: z.array(extraInfoSchema).optional(),
});

// Create Draft Resource DTO - relaxed validation for drafts
export const createDraftResourceSchema = z.object({
  title: z.string().max(100).optional().default('Nacrt'),
  description: z.string().max(5000).optional().default(''),
  categoryId: z.string().optional(),
  pricePerDay: z.number().min(0).optional().default(0),
  currency: z.enum(['EUR', 'RSD', 'USD']).default('EUR'),
  status: z.literal('draft'),
  rentalType: z.string().optional(),
  options: z.array(z.string()).optional(),
  location: z.object({
    country: z.string().default('Srbija'),
    city: z.string().default(''),
    municipality: z.string().optional(),
    address: z.string().optional(),
  }),
  images: z.array(imageSchema).optional(),
  extraInfo: z.array(extraInfoSchema).optional(),
});

// Update Resource DTO
export const updateResourceSchema = createResourceSchema.partial().extend({
  status: z.enum(['active', 'inactive', 'pending', 'rented', 'menjam', 'poklanjam', 'draft']).optional(),
  isFeatured: z.boolean().optional(),
});

// ==========================================
// Resource Query DTO (Search/Filter)
// ==========================================

export const resourceQuerySchema = z.object({
  // Search
  q: z.string().optional(),
  
  // Filters
  category: z.string().optional(),
  city: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  options: z.array(z.string()).or(z.string().transform(s => s.split(','))).optional(),
  status: z.enum(['active', 'inactive', 'pending', 'rented', 'menjam', 'poklanjam', 'draft']).optional(),
  isFeatured: z.coerce.boolean().optional(),
  ownerId: z.string().optional(),
  
  // Sorting
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'oldest', 'popular']).default('newest'),
  
  // Pagination
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(12),
});

// ==========================================
// Inquiry Schemas
// ==========================================

export const inquirySchema = z.object({
  id: z.string(),
  resourceId: z.string(),
  ownerId: z.string(),
  senderName: z.string(),
  senderEmail: z.string().email(),
  senderPhone: z.string().optional(),
  text: z.string(),
  status: z.enum(['pending', 'read', 'replied', 'closed']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Create Inquiry DTO
export const createInquirySchema = z.object({
  resourceId: z.string().min(1, 'ID resursa je obavezan'),
  senderName: z.string().min(2, 'Ime mora imati najmanje 2 karaktera').max(100),
  senderEmail: z.string().email('Nevažeća email adresa'),
  senderPhone: z.string().optional(),
  text: z.string().min(10, 'Poruka mora imati najmanje 10 karaktera').max(2000, 'Poruka može imati maksimalno 2000 karaktera'),
});

// Update Inquiry Status DTO
export const updateInquiryStatusSchema = z.object({
  status: z.enum(['pending', 'read', 'replied', 'closed']),
});

// ==========================================
// Contact Form Schema
// ==========================================

export const contactFormSchema = z.object({
  firstName: z.string().min(2, 'Ime mora imati najmanje 2 karaktera'),
  lastName: z.string().min(2, 'Prezime mora imati najmanje 2 karaktera'),
  email: z.string().email('Nevažeća email adresa'),
  message: z.string().min(10, 'Poruka mora imati najmanje 10 karaktera'),
});

// ==========================================
// Pagination Schema
// ==========================================

export const paginationSchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1).max(100),
  total: z.number(),
  totalPages: z.number(),
});

// ==========================================
// Legacy Schemas (for backward compatibility)
// ==========================================

export const searchFiltersSchema = resourceQuerySchema;
