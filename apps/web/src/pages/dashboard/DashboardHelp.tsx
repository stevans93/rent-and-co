import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface GuideStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const faqItems: FAQItem[] = [
  {
    question: 'Kako da objavim novi oglas?',
    answer: 'Kliknite na "Dodaj oglas" u bočnom meniju. Popunite sve potrebne informacije o vašem proizvodu ili usluzi, dodajte fotografije i postavite cenu. Nakon pregleda, vaš oglas će biti objavljen.',
  },
  {
    question: 'Koliko oglasa mogu da objavim?',
    answer: 'Broj oglasa zavisi od vašeg paketa. Osnovni paket dozvoljava do 3 oglasa, Pro paket do 15 oglasa, a Biznis paket nema ograničenja.',
  },
  {
    question: 'Kako da promenim cenu oglasa?',
    answer: 'Idite na "Moji oglasi", pronađite željeni oglas i kliknite na ikonicu za izmenu. Tu možete promeniti cenu i sve ostale detalje oglasa.',
  },
  {
    question: 'Šta znači status "Na čekanju"?',
    answer: 'Oglasi sa statusom "Na čekanju" su u procesu pregleda od strane našeg tima. Obično pregled traje do 24 sata.',
  },
  {
    question: 'Kako da kontaktiram podršku?',
    answer: 'Možete nas kontaktirati putem email-a na support@rentandco.rs ili kroz kontakt formu na stranici za pomoć.',
  },
  {
    question: 'Kako funkcioniše analitika?',
    answer: 'Analitika prikazuje statistike o vašim oglasima - broj pregleda, dodavanja u omiljene, i konverziju. Podaci se ažuriraju u realnom vremenu.',
  },
];

const guideSteps: GuideStep[] = [
  {
    title: 'Kreirajte profil',
    description: 'Registrujte se i popunite vaš profil sa svim potrebnim informacijama.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    title: 'Objavite oglas',
    description: 'Dodajte fotografije, opišite vaš proizvod i postavite cenu.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    title: 'Primajte upite',
    description: 'Zainteresovani korisnici će vas kontaktirati putem platforme.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    title: 'Zatvorite posao',
    description: 'Dogovorite iznajmljivanje i ostvarite zaradu.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function DashboardHelp() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Uputstvo & Pomoć</h1>
        <p className="text-gray-500 dark:text-gray-400">Naučite kako da koristite RENT&CO platformu</p>
      </div>

      {/* Quick Start Guide */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Kako početi?</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {guideSteps.map((step, index) => (
            <div key={index} className="relative">
              {index < guideSteps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gray-200 dark:bg-gray-700 -translate-x-1/2 z-0"></div>
              )}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#e85d45]/10 text-[#e85d45] flex items-center justify-center mb-4">
                  {step.icon}
                </div>
                <span className="text-xs text-[#e85d45] font-medium mb-1">Korak {index + 1}</span>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Tutorial */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Video uputstvo</h2>
        <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#e85d45] text-white flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-[#d54d35] transition-colors">
              <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">Kliknite za reprodukciju</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Česta pitanja</h2>
        <div className="space-y-3">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <span className="font-medium text-gray-900 dark:text-white">{item.question}</span>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${openFAQ === index ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openFAQ === index && (
                <div className="px-4 pb-4">
                  <p className="text-gray-600 dark:text-gray-400">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-gradient-to-r from-[#e85d45] to-[#ff7b5a] rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Još uvek imate pitanja?</h2>
            <p className="text-white/80">Naš tim za podršku je tu da vam pomogne</p>
          </div>
          <div className="flex gap-3">
            <a
              href="mailto:support@rentandco.rs"
              className="px-4 py-2 bg-white text-[#e85d45] rounded-lg font-medium hover:bg-white/90 transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Pošalji email
            </a>
            <a
              href="/contact"
              className="px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors"
            >
              Kontakt forma
            </a>
          </div>
        </div>
      </div>

      {/* Useful Links */}
      <div className="grid md:grid-cols-3 gap-6">
        <a
          href="/terms"
          className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-[#e85d45] transition-colors group"
        >
          <svg className="w-8 h-8 text-[#e85d45] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-[#e85d45] transition-colors">Uslovi korišćenja</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Pročitajte naše uslove</p>
        </a>
        <a
          href="/privacy"
          className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-[#e85d45] transition-colors group"
        >
          <svg className="w-8 h-8 text-[#e85d45] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-[#e85d45] transition-colors">Politika privatnosti</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kako čuvamo vaše podatke</p>
        </a>
        <a
          href="/about"
          className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-[#e85d45] transition-colors group"
        >
          <svg className="w-8 h-8 text-[#e85d45] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-[#e85d45] transition-colors">O nama</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Saznajte više o RENT&CO</p>
        </a>
      </div>
    </div>
  );
}
