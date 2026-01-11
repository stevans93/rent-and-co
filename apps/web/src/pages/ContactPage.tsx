import { useLanguage, useTheme } from '../context';
import { SEO, SEOConfigs } from '../components/SEO';

export default function ContactPage() {
  const { t } = useLanguage();
  const { isDark } = useTheme();

  const contactCards = [
    {
      icon: '🏛️',
      title: t.home.whatIsLoremIpsum,
      description: t.home.heroSubtitle,
      phone: '(381) 011 905-2321',
    },
    {
      icon: '🗼',
      title: t.home.whatIsLoremIpsum,
      description: t.home.heroSubtitle,
      phone: '(381) 011 905-2321',
    },
    {
      icon: '🎡',
      title: t.home.whatIsLoremIpsum,
      description: t.home.heroSubtitle,
      phone: '(381) 011 905-2321',
    },
  ];

  // Dynamic hero images based on theme
  const heroImage = isDark
    ? 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1920'
    : 'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=1920';

  return (
    <div>
      <SEO {...SEOConfigs.contact} />
      
      {/* Hero */}
      <section
        className="relative h-64 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url("${heroImage}")`,
        }}
      >
        <div className="container mx-auto px-4 h-full flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-white">{t.contactPage.title}</h1>
          <p className="text-gray-200">{t.contactPage.breadcrumb}</p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{t.contactPage.title}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {t.home.heroSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {contactCards.map((card, i) => (
            <div key={i} className="text-center p-8 bg-white dark:bg-[#1e1e2e] rounded-xl border border-gray-100 dark:border-white/10 shadow-sm">
              <div className="text-5xl mb-4">{card.icon}</div>
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{card.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{card.description}</p>
              <p className="font-medium text-gray-900 dark:text-white">{card.phone}</p>
              <a href="#" className="text-[#e85d45] text-sm hover:underline">
                {t.contactPage.openGoogleMap}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 bg-gray-50 dark:bg-[#1a1a2e]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Form */}
            <div className="bg-white dark:bg-[#1e1e2e] rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{t.home.whatIsLoremIpsum}</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t.auth.firstName}</label>
                  <input
                    type="text"
                    placeholder={t.contactPage.yourName}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-[#252538] text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t.auth.lastName}</label>
                  <input
                    type="text"
                    placeholder={t.contactPage.yourName}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-[#252538] text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t.auth.email}</label>
                  <input
                    type="email"
                    placeholder={t.contactPage.yourName}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-[#252538] text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t.contactPage.textarea}</label>
                  <textarea
                    placeholder={t.home.heroSubtitle}
                    rows={4}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-[#252538] text-gray-900 dark:text-white placeholder-gray-400 resize-none"
                  ></textarea>
                </div>
                <button className="w-full bg-[#e85d45] text-white py-3 rounded-lg flex items-center justify-center hover:bg-[#d14d35]">
                  {t.contactPage.submit}
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </form>
            </div>

            {/* Info */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t.home.whatIsLoremIpsum}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                {t.home.heroSubtitle}
              </p>
              <div className="bg-gray-200 dark:bg-[#252538] h-64 rounded-xl">
                {/* Map placeholder */}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
