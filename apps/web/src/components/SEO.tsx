import { Helmet as HelmetComponent } from 'react-helmet-async';
import type { ReactNode } from 'react';

// Workaround for React 18 type compatibility
const Helmet = HelmetComponent as any;

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  ogImageAlt?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  noIndex?: boolean;
  children?: ReactNode;
}

const DEFAULT_TITLE = 'Rent&Co | Iznajmljivanje opreme, prostora i usluga';
const DEFAULT_DESCRIPTION = 'Pretraži i iznajmi resurse u svom gradu. Objavi oglas, dodaj slike i cenu — jednostavno i brzo.';
const DEFAULT_OG_IMAGE = '/og-image.jpg';
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://rentandco.rs';

export function SEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  ogImageAlt = 'Rent&Co - Platforma za iznajmljivanje',
  twitterCard = 'summary_large_image',
  noIndex = false,
  children,
}: SEOProps) {
  const fullCanonical = canonical ? `${SITE_URL}${canonical}` : undefined;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {fullCanonical && <link rel="canonical" href={fullCanonical} />}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* OpenGraph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:alt" content={ogImageAlt} />
      {fullCanonical && <meta property="og:url" content={fullCanonical} />}
      <meta property="og:site_name" content="Rent&Co" />
      <meta property="og:locale" content="sr_RS" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      <meta name="twitter:image:alt" content={ogImageAlt} />

      {/* Additional meta tags from children */}
      {children}
    </Helmet>
  );
}

// Pre-defined SEO configs for common pages
export const SEOConfigs = {
  home: {
    title: 'Rent&Co | Iznajmljivanje opreme, prostora i usluga',
    description: 'Pretraži i iznajmi resurse u svom gradu. Objavi oglas, dodaj slike i cenu — jednostavno i brzo.',
    canonical: '/',
  },
  search: {
    title: 'Pretraga oglasa | Rent&Co',
    description: 'Pretražite hiljade oglasa za iznajmljivanje opreme, prostora i usluga. Filtrirajte po kategoriji, ceni i lokaciji.',
    canonical: '/search',
  },
  categories: {
    title: 'Kategorije | Rent&Co',
    description: 'Pregledajte sve kategorije resursa za iznajmljivanje - oprema, prostor, vozila, usluge i još mnogo toga.',
    canonical: '/categories',
  },
  about: {
    title: 'O nama | Rent&Co',
    description: 'Saznajte više o Rent&Co platformi za iznajmljivanje. Naša misija je da povezujemo ljude i resurse.',
    canonical: '/about',
  },
  contact: {
    title: 'Kontakt | Rent&Co',
    description: 'Kontaktirajte Rent&Co tim. Tu smo da vam pomognemo sa svim pitanjima o iznajmljivanju.',
    canonical: '/contact',
  },
  login: {
    title: 'Prijava | Rent&Co',
    description: 'Prijavite se na svoj Rent&Co nalog i pristupite svim funkcijama platforme.',
    canonical: '/login',
  },
  register: {
    title: 'Registracija | Rent&Co',
    description: 'Kreirajte besplatan Rent&Co nalog i počnite da iznajmljujete ili oglašavate resurse.',
    canonical: '/register',
  },
  create: {
    title: 'Dodaj oglas | Rent&Co',
    description: 'Objavite oglas za iznajmljivanje na Rent&Co platformi. Brzo, jednostavno i besplatno.',
    canonical: '/create',
  },
  favorites: {
    title: 'Omiljeni oglasi | Rent&Co',
    description: 'Vaši sačuvani oglasi za iznajmljivanje na jednom mestu.',
    canonical: '/favorites',
  },
};

// Helper to generate resource detail title
export function getResourceDetailTitle(title: string, city: string): string {
  return `${title} | Iznajmljivanje u ${city} — Rent&Co`;
}

// Helper to generate resource detail description
export function getResourceDetailDescription(title: string, description: string, city: string): string {
  const shortDesc = description.length > 120 ? description.substring(0, 120) + '...' : description;
  return `${title} - ${shortDesc} Iznajmljivanje u ${city} na Rent&Co.`;
}

// Helper to generate category page title
export function getCategoryTitle(categoryName: string): string {
  return `${categoryName} | Iznajmljivanje — Rent&Co`;
}

export default SEO;
