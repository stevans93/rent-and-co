import { SEO } from '../components/SEO';

export default function PricingPage() {

  const pricingPlans = [
    {
      name: 'Besplatno',
      price: '0',
      currency: 'RSD',
      period: '/mesečno',
      description: 'Za početnike koji žele da isprobaju platformu',
      features: [
        'Do 3 aktivna oglasa',
        'Osnovna podrška',
        'Standardna vidljivost',
        'Email notifikacije',
      ],
      cta: 'Započni besplatno',
      popular: false,
    },
    {
      name: 'Pro',
      price: '1.990',
      currency: 'RSD',
      period: '/mesečno',
      description: 'Za ozbiljne korisnike sa više oglasa',
      features: [
        'Do 25 aktivnih oglasa',
        'Prioritetna podrška',
        'Poboljšana vidljivost',
        'SMS + Email notifikacije',
        'Analitika i statistika',
        'Istaknuti oglasi (5x)',
      ],
      cta: 'Izaberi Pro',
      popular: true,
    },
    {
      name: 'Biznis',
      price: '4.990',
      currency: 'RSD',
      period: '/mesečno',
      description: 'Za firme i agencije',
      features: [
        'Neograničen broj oglasa',
        'Dedicirana podrška 24/7',
        'Maksimalna vidljivost',
        'Sve vrste notifikacija',
        'Napredna analitika',
        'Neograničeno isticanje',
        'API pristup',
        'Brendirani profil',
      ],
      cta: 'Kontaktiraj nas',
      popular: false,
    },
  ];

  return (
    <div>
      <SEO 
        title="Cenovnik - Rent&Co"
        description="Pogledajte naše cenovne pakete i izaberite plan koji odgovara vašim potrebama."
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a1a1a] to-[#2d1f1f] dark:from-[#0f0f1a] dark:to-[#1a0f1a] py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Cenovnik</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Izaberite plan koji najbolje odgovara vašim potrebama. Svi planovi uključuju besplatnu probnu verziju.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white dark:bg-[#1e1e1e] rounded-2xl p-8 shadow-lg border-2 ${
                plan.popular
                  ? 'border-[#e85d45] scale-105'
                  : 'border-transparent dark:border-white/5'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#e85d45] text-white px-4 py-1 rounded-full text-sm font-medium">
                  Najpopularnije
                </div>
              )}
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {plan.name}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                {plan.description}
              </p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {plan.price}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {' '}{plan.currency}{plan.period}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-gray-600 dark:text-gray-300">
                    <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  plan.popular
                    ? 'bg-[#e85d45] text-white hover:bg-[#d14d35]'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50 dark:bg-[#0f0f0f]">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Često postavljana pitanja o cenama
          </h2>
          
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Mogu li da promenim plan kasnije?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Da, možete nadograditi ili smanjiti plan u bilo kom trenutku. Promene stupaju na snagu od sledećeg obračunskog perioda.
              </p>
            </div>
            
            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Da li postoji ugovor na određeni period?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Ne, svi naši planovi su mesečni i možete otkazati pretplatu u bilo kom trenutku bez penala.
              </p>
            </div>
            
            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Koji načini plaćanja su podržani?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Prihvatamo sve glavne platne kartice (Visa, Mastercard, Maestro), kao i uplate preko računa za biznis korisnike.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
