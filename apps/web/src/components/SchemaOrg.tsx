import { Helmet as HelmetComponent } from 'react-helmet-async';

// Workaround for React 18 type compatibility
const Helmet = HelmetComponent as any;

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://rentandco.rs';
const SITE_NAME = 'Rent&Co';
const LOGO_URL = `${SITE_URL}/logo.png`;

// Organization Schema
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: LOGO_URL,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+381-11-123-4567',
      contactType: 'customer service',
      areaServed: 'RS',
      availableLanguage: ['Serbian', 'English'],
    },
    sameAs: [
      'https://facebook.com/rentandco',
      'https://instagram.com/rentandco',
      'https://twitter.com/rentandco',
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

// WebSite Schema with SearchAction
export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

// BreadcrumbList Schema
interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

// Product/Offer Schema for Resource Detail
interface ProductSchemaProps {
  name: string;
  description: string;
  image: string[];
  price: number;
  priceCurrency: string;
  availability: 'InStock' | 'OutOfStock' | 'PreOrder';
  url: string;
  sku?: string;
  brand?: string;
  category?: string;
  ratingValue?: number;
  reviewCount?: number;
  seller?: {
    name: string;
    url?: string;
  };
}

export function ProductSchema({
  name,
  description,
  image,
  price,
  priceCurrency,
  availability,
  url,
  sku,
  category,
  seller,
}: ProductSchemaProps) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image,
    url: `${SITE_URL}${url}`,
    offers: {
      '@type': 'Offer',
      price: price.toFixed(2),
      priceCurrency,
      availability: `https://schema.org/${availability}`,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      url: `${SITE_URL}${url}`,
    },
  };

  if (sku) {
    schema.sku = sku;
  }

  if (category) {
    schema.category = category;
  }

  if (seller) {
    schema.offers.seller = {
      '@type': 'Organization',
      name: seller.name,
      ...(seller.url && { url: seller.url }),
    };
  }

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

// LocalBusiness Schema (for rental services)
interface LocalBusinessSchemaProps {
  name: string;
  description: string;
  address: {
    streetAddress?: string;
    addressLocality: string;
    addressCountry: string;
  };
  priceRange?: string;
}

export function LocalBusinessSchema({
  name,
  description,
  address,
  priceRange = '€€',
}: LocalBusinessSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    description,
    url: SITE_URL,
    logo: LOGO_URL,
    address: {
      '@type': 'PostalAddress',
      ...address,
    },
    priceRange,
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

// FAQ Schema
interface FAQItem {
  question: string;
  answer: string;
}

export function FAQSchema({ items }: { items: FAQItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
