import { useLanguage } from '../context';
import { SearchBar, ResourceCard, CategoryCard, SectionHeader, Resource } from '../components';

export default function HomePage() {
  const { t } = useLanguage();

  // Mock data - later will come from API
  const categories = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    name: `${t.common.category} ${i + 1}`,
    count: 22,
  }));

  const featuredResources: Resource[] = Array.from({ length: 3 }, (_, i) => ({
    id: i + 1,
    title: 'Naziv resursa',
    address: 'Adresa',
    category: `${t.common.category} 1`,
    price: 14,
    isFeatured: true,
  }));

  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative h-[500px] bg-cover bg-center"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
        }}
      >
        <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
          <p className="text-sm mb-2">{t.home.whatIsLoremIpsum}</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.home.heroTitle}</h1>
          <p className="text-lg mb-8 max-w-2xl">
            {t.home.heroSubtitle}
          </p>
          <SearchBar className="w-full max-w-3xl" />
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 container mx-auto px-4">
        <SectionHeader
          title={t.home.categories}
          subtitle={t.home.heroSubtitle}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map(cat => (
            <CategoryCard
              key={cat.id}
              id={cat.id}
              name={cat.name}
              count={cat.count}
            />
          ))}
        </div>
      </section>

      {/* Featured Resources Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <SectionHeader
            title={t.home.featuredResources}
            subtitle={t.home.heroSubtitle}
            linkText={t.home.viewAllResources}
            linkTo="/search"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredResources.map(resource => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t.home.whatIsLoremIpsum}</h2>
              <p className="text-gray-500">{t.home.heroSubtitle}</p>
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a
                href="/create"
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 inline-flex items-center gap-2"
              >
                <span>{t.nav.addProduct}</span>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
              <a
                href="/contact"
                className="bg-[#1a1a1a] text-white px-6 py-3 rounded-lg hover:bg-gray-800"
              >
                {t.home.becomePartner}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
