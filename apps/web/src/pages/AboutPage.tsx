import { useLanguage, useTheme } from '../context';
import { SEO, SEOConfigs } from '../components/SEO';

export default function AboutPage() {
  const { t } = useLanguage();
  const { isDark } = useTheme();

  const teamMembers = [
    { name: 'Ime prezime', role: 'Zanimanje' },
    { name: 'Ime prezime', role: 'Zanimanje' },
    { name: 'Ime prezime', role: 'Zanimanje' },
    { name: 'Ime prezime', role: 'Zanimanje' },
    { name: 'Ime prezime', role: 'Zanimanje' },
  ];

  // Dynamic hero images based on theme
  const heroImage = isDark
    ? 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1920'
    : 'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=1920';

  return (
    <div>
      <SEO {...SEOConfigs.about} />
      
      {/* Hero */}
      <section
        className="relative h-64 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url("${heroImage}")`,
        }}
      >
        <div className="container mx-auto px-4 h-full flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-white">{t.about.title}</h1>
          <p className="text-gray-200">{t.about.breadcrumb}</p>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              What is Lorem Ipsum?
              <br />
              Where does it come from?
            </h2>
          </div>
          <div className="space-y-4 text-gray-600 dark:text-gray-300">
            <p>
              Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a
              piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard
              McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of
              the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going
              through the cites of the word in classical literature, discovered the undoubtable
              source.
            </p>
            <p>
              The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those
              interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by
              Cicero are also reproduced in their exact original form, accompanied by English
              versions from the 1914 translation by H. Rackham.
            </p>
          </div>
        </div>
      </section>

      {/* Image */}
      <section className="container mx-auto px-4 mb-16">
        <img
          src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200"
          alt="About us"
          className="w-full h-80 object-cover rounded-xl dark-image"
        />
      </section>

      {/* Stats */}
      <section className="py-12 bg-gray-50 dark:bg-[#1a1a2e]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">4M</p>
              <p className="text-gray-500 dark:text-gray-400">{t.about.awardWinning}</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">12K</p>
              <p className="text-gray-500 dark:text-gray-400">{t.about.propertyReady}</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">20M</p>
              <p className="text-gray-500 dark:text-gray-400">{t.about.happyCustomer}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{t.about.ourTeam}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {t.home.heroSubtitle}
          </p>
        </div>
        <div className="flex justify-center gap-6">
          {teamMembers.map((member, i) => (
            <div key={i} className="text-center">
              <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-3 overflow-hidden">
                <img
                  src={`https://i.pravatar.cc/128?img=${i + 10}`}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">{member.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-100 dark:bg-[#1a1a2e]">
        <div className="container mx-auto px-4">
          <div className="bg-white dark:bg-[#1e1e2e] rounded-2xl p-8 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{t.home.whatIsLoremIpsum}</h2>
              <p className="text-gray-500 dark:text-gray-400">
                {t.home.heroSubtitle}
              </p>
            </div>
            <div className="flex space-x-4">
              <a
                href="/create"
                className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white px-6 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 flex items-center"
              >
                {t.nav.addProduct}
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </a>
              <a
                href="/contact"
                className="bg-[#1a1a1a] dark:bg-[#e85d45] text-white px-6 py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-[#d14d35]"
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
