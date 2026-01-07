import { useLanguage } from '../context';

export default function ContactPage() {
  const { t } = useLanguage();

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

  return (
    <div>
      {/* Hero */}
      <section
        className="relative h-64 bg-cover bg-center"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url("https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=1920")',
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
          <h2 className="text-3xl font-bold mb-2">{t.contactPage.title}</h2>
          <p className="text-gray-500">
            {t.home.heroSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {contactCards.map((card, i) => (
            <div key={i} className="text-center">
              <div className="text-5xl mb-4">{card.icon}</div>
              <h3 className="text-lg font-bold mb-2">{card.title}</h3>
              <p className="text-gray-500 text-sm mb-2">{card.description}</p>
              <p className="font-medium">{card.phone}</p>
              <a href="#" className="text-[#e85d45] text-sm hover:underline">
                {t.contactPage.openGoogleMap}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Form */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-6">{t.home.whatIsLoremIpsum}</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.auth.firstName}</label>
                  <input
                    type="text"
                    placeholder={t.contactPage.yourName}
                    className="w-full border rounded-lg px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.auth.lastName}</label>
                  <input
                    type="text"
                    placeholder={t.contactPage.yourName}
                    className="w-full border rounded-lg px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.auth.email}</label>
                  <input
                    type="email"
                    placeholder={t.contactPage.yourName}
                    className="w-full border rounded-lg px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.contactPage.textarea}</label>
                  <textarea
                    placeholder={t.home.heroSubtitle}
                    rows={4}
                    className="w-full border rounded-lg px-4 py-3"
                  ></textarea>
                </div>
                <button className="w-full bg-[#e85d45] text-white py-3 rounded-lg flex items-center justify-center">
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
              <h2 className="text-2xl font-bold mb-4">{t.home.whatIsLoremIpsum}</h2>
              <p className="text-gray-600 mb-8">
                {t.home.heroSubtitle}
              </p>
              <div className="bg-gray-200 h-64 rounded-xl">
                {/* Map placeholder */}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
