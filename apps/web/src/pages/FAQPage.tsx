import { useState } from 'react';
import { SEO } from '../components/SEO';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // Opšta pitanja
  {
    category: 'Opšta pitanja',
    question: 'Šta je Rent&Co?',
    answer: 'Rent&Co je platforma za iznajmljivanje resursa koja povezuje ljude koji žele da iznajme nešto sa onima koji imaju šta da ponude. Bilo da tražite alat, vozilo, opremu ili prostor - na pravom ste mestu!'
  },
  {
    category: 'Opšta pitanja',
    question: 'Da li je korišćenje platforme besplatno?',
    answer: 'Osnovno korišćenje platforme je potpuno besplatno. Možete pregledati oglase i kontaktirati oglašivače bez ikakve naknade. Za dodatne funkcije kao što su istaknuti oglasi ili više aktivnih oglasa, nudimo premium pakete.'
  },
  {
    category: 'Opšta pitanja',
    question: 'Kako mogu da se registrujem?',
    answer: 'Registracija je jednostavna! Kliknite na dugme "Registruj se" u gornjem desnom uglu, unesite svoje podatke (ime, email, lozinku) i potvrdite email adresu. Za nekoliko minuta možete početi da koristite sve funkcije platforme.'
  },
  // Oglašavanje
  {
    category: 'Oglašavanje',
    question: 'Kako da postavim oglas?',
    answer: 'Nakon što se prijavite, idite na "Dodaj oglas" u vašem dashboard-u. Popunite formular sa nazivom, opisom, kategorijom, cenom i dodajte fotografije. Vaš oglas će biti pregledan i objavljen u najkraćem roku.'
  },
  {
    category: 'Oglašavanje',
    question: 'Koliko oglasa mogu da postavim?',
    answer: 'Sa besplatnim nalogom možete imati do 3 aktivna oglasa. Pro paket omogućava do 25 oglasa, dok Biznis paket nema ograničenja. Pogledajte naš cenovnik za više detalja.'
  },
  {
    category: 'Oglašavanje',
    question: 'Kako da istaknem svoj oglas?',
    answer: 'Istaknuti oglasi se prikazuju na vrhu rezultata pretrage i na početnoj stranici. Možete istaknuti oglas kroz opcije u dashboard-u ili nadogradnjom na Pro/Biznis paket koji uključuje besplatna isticanja.'
  },
  {
    category: 'Oglašavanje',
    question: 'Zašto je moj oglas odbijen?',
    answer: 'Oglasi mogu biti odbijeni iz više razloga: netačne informacije, neprikladne slike, zabranjeni proizvodi/usluge, ili nedovoljno detaljan opis. Dobićete email sa razlogom odbijanja i možete izmeniti i ponovo poslati oglas.'
  },
  // Iznajmljivanje
  {
    category: 'Iznajmljivanje',
    question: 'Kako da kontaktiram oglašivača?',
    answer: 'Na stranici svakog oglasa postoji formular za kontakt. Unesite svoje podatke i poruku, a oglašivač će dobiti obaveštenje na email. Takođe možete koristiti prikazane kontakt informacije ako su dostupne.'
  },
  {
    category: 'Iznajmljivanje',
    question: 'Da li Rent&Co garantuje kvalitet resursa?',
    answer: 'Rent&Co je platforma koja povezuje korisnike i ne učestvuje direktno u transakcijama. Preporučujemo da uvek proverite resurs pre iznajmljivanja, dogovorite se o uslovima pisanim putem i napravite fotografije stanja pre i posle.'
  },
  {
    category: 'Iznajmljivanje',
    question: 'Kako funkcioniše plaćanje?',
    answer: 'Plaćanje se dogovara direktno između korisnika. Preporučujemo korišćenje sigurnih metoda plaćanja i potpisivanje ugovora o iznajmljivanju za vrednije resurse.'
  },
  // Sigurnost
  {
    category: 'Sigurnost',
    question: 'Kako su zaštićeni moji podaci?',
    answer: 'Koristimo SSL enkripciju za sve komunikacije, vaše lozinke su enkriptovane i nikada ih ne čuvamo u čitljivom formatu. Poštujemo sve zakonske propise o zaštiti podataka. Više informacija u našoj Politici privatnosti.'
  },
  {
    category: 'Sigurnost',
    question: 'Šta ako imam problem sa drugim korisnikom?',
    answer: 'Ako imate problem, prvo pokušajte da ga rešite direktnom komunikacijom. Ako to ne uspe, možete nam prijaviti korisnika kroz opciju "Prijavi" na profilu ili oglasu, ili nas kontaktirati direktno na support@rentco.rs.'
  },
  // Tehnička pitanja
  {
    category: 'Tehnička pitanja',
    question: 'Zaboravio/la sam lozinku, šta da radim?',
    answer: 'Na stranici za prijavu kliknite na "Zaboravili ste lozinku?". Unesite email adresu i poslaćemo vam link za resetovanje lozinke. Link važi 24 sata.'
  },
  {
    category: 'Tehnička pitanja',
    question: 'Mogu li da koristim Rent&Co na mobilnom telefonu?',
    answer: 'Da! Naša platforma je potpuno responzivna i prilagođena za korišćenje na svim uređajima - računarima, tabletima i mobilnim telefonima.'
  },
];

export default function FAQPage() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('Sve');

  const categories = ['Sve', ...Array.from(new Set(faqData.map(item => item.category)))];
  
  const filteredFAQ = activeCategory === 'Sve' 
    ? faqData 
    : faqData.filter(item => item.category === activeCategory);

  return (
    <div>
      <SEO 
        title="Često postavljana pitanja - Rent&Co"
        description="Pronađite odgovore na najčešća pitanja o korišćenju Rent&Co platforme."
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a1a1a] to-[#2d1f1f] dark:from-[#0f0f1a] dark:to-[#1a0f1a] py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Često postavljana pitanja</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Pronađite odgovore na najčešća pitanja. Ako ne pronađete odgovor, slobodno nas kontaktirajte.
          </p>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="py-8 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? 'bg-[#e85d45] text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 container mx-auto px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {filteredFAQ.map((item, index) => (
            <div
              key={index}
              className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-sm border border-transparent dark:border-white/5 overflow-hidden"
            >
              <button
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                <span className="font-medium text-gray-900 dark:text-white pr-4">
                  {item.question}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 transition-transform ${
                    activeIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {activeIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gray-50 dark:bg-[#0f0f0f]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Niste pronašli odgovor?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Naš tim za podršku je tu da vam pomogne.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 bg-[#e85d45] text-white px-6 py-3 rounded-lg hover:bg-[#d14d35] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Kontaktirajte nas
          </a>
        </div>
      </section>
    </div>
  );
}
