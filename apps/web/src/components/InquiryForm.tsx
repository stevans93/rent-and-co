/**
 * Inquiry Form Component
 * FAZA 6: React Hook Form + Zod validation
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useLanguage } from '../context';

// Zod validation schema
const inquirySchema = z.object({
  firstName: z.string()
    .min(2, 'Ime mora imati najmanje 2 karaktera')
    .max(50, 'Ime može imati najviše 50 karaktera'),
  lastName: z.string()
    .min(2, 'Prezime mora imati najmanje 2 karaktera')
    .max(50, 'Prezime može imati najviše 50 karaktera'),
  phone: z.string()
    .min(9, 'Telefon mora imati najmanje 9 cifara')
    .regex(/^[+]?[\d\s-]{9,20}$/, 'Unesite validan broj telefona'),
  email: z.string()
    .email('Unesite validnu email adresu'),
  message: z.string()
    .min(10, 'Poruka mora imati najmanje 10 karaktera')
    .max(1000, 'Poruka može imati najviše 1000 karaktera'),
  acceptTerms: z.boolean()
    .refine(val => val === true, 'Morate prihvatiti uslove korišćenja'),
});

export type InquiryFormData = z.infer<typeof inquirySchema>;

interface InquiryFormProps {
  resourceId: string;
  onSuccess?: () => void;
}

export function InquiryForm({ resourceId, onSuccess }: InquiryFormProps) {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      message: '',
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: InquiryFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_URL}/inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resourceId,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          email: data.email,
          message: data.message,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus('success');
        reset();
        onSuccess?.();
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.message || 'Došlo je do greške. Pokušajte ponovo.');
      }
    } catch (error) {
      console.error('Inquiry submission error:', error);
      setSubmitStatus('error');
      setErrorMessage('Greška pri slanju. Proverite internet konekciju.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBaseClass = "w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e85d45]/20 focus:border-[#e85d45] bg-white dark:bg-dark-light text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors";
  const inputErrorClass = "border-red-500 dark:border-red-500";
  const inputNormalClass = "border-gray-300 dark:border-dark-border";

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl p-6 shadow-sm dark:shadow-black/20 border border-transparent dark:border-dark-border transition-colors duration-300">
      <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
        {t.resource.sendMessage}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {t.resource.weRespondQuickly}
      </p>

      {/* Success Toast */}
      {submitStatus === 'success' && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
          <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-green-800 dark:text-green-200 font-medium">Poruka uspešno poslata!</p>
            <p className="text-green-600 dark:text-green-300 text-sm">Vlasnik oglasa će vas uskoro kontaktirati.</p>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {submitStatus === 'error' && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-800 dark:text-red-200">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
        {/* First Name */}
        <div>
          <input
            type="text"
            placeholder={t.resource.firstName}
            {...register('firstName')}
            className={`${inputBaseClass} ${errors.firstName ? inputErrorClass : inputNormalClass}`}
            aria-invalid={errors.firstName ? 'true' : 'false'}
            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
          />
          {errors.firstName && (
            <p id="firstName-error" className="mt-1 text-xs text-red-500" role="alert">
              {errors.firstName.message}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <input
            type="text"
            placeholder={t.resource.lastName}
            {...register('lastName')}
            className={`${inputBaseClass} ${errors.lastName ? inputErrorClass : inputNormalClass}`}
            aria-invalid={errors.lastName ? 'true' : 'false'}
            aria-describedby={errors.lastName ? 'lastName-error' : undefined}
          />
          {errors.lastName && (
            <p id="lastName-error" className="mt-1 text-xs text-red-500" role="alert">
              {errors.lastName.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <input
            type="tel"
            placeholder={t.resource.phone}
            {...register('phone')}
            className={`${inputBaseClass} ${errors.phone ? inputErrorClass : inputNormalClass}`}
            aria-invalid={errors.phone ? 'true' : 'false'}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
          />
          {errors.phone && (
            <p id="phone-error" className="mt-1 text-xs text-red-500" role="alert">
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <input
            type="email"
            placeholder={t.resource.email}
            {...register('email')}
            className={`${inputBaseClass} ${errors.email ? inputErrorClass : inputNormalClass}`}
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-xs text-red-500" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Message */}
        <div>
          <textarea
            placeholder={t.resource.messageText}
            rows={3}
            {...register('message')}
            className={`${inputBaseClass} ${errors.message ? inputErrorClass : inputNormalClass} resize-none`}
            aria-invalid={errors.message ? 'true' : 'false'}
            aria-describedby={errors.message ? 'message-error' : undefined}
          />
          {errors.message && (
            <p id="message-error" className="mt-1 text-xs text-red-500" role="alert">
              {errors.message.message}
            </p>
          )}
        </div>

        {/* Accept Terms */}
        <div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('acceptTerms')}
              className="mt-1 accent-[#e85d45]"
              aria-invalid={errors.acceptTerms ? 'true' : 'false'}
              aria-describedby={errors.acceptTerms ? 'terms-error' : undefined}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {t.resource.acceptTerms}
            </span>
          </label>
          {errors.acceptTerms && (
            <p id="terms-error" className="mt-1 text-xs text-red-500" role="alert">
              {errors.acceptTerms.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#1a1a1a] dark:bg-[#e85d45] text-white py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-[#d54d35] flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Pošalji upit vlasniku oglasa"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Slanje...
            </>
          ) : (
            <>
              Pošalji poruku
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default InquiryForm;
