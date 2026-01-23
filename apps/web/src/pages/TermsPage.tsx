import { SEO } from '../components/SEO';

export default function TermsPage() {
  return (
    <div>
      <SEO 
        title="Uslovi korišćenja - Rent&Co"
        description="Pročitajte uslove korišćenja platforme Rent&Co."
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a1a1a] to-[#2d1f1f] dark:from-[#0f0f1a] dark:to-[#1a0f1a] py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Uslovi korišćenja</h1>
          <p className="text-gray-400">Poslednja izmena: {new Date().toLocaleDateString('sr-RS')}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 container mx-auto px-4">
        <div className="max-w-3xl mx-auto prose dark:prose-invert">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-8 shadow-lg border border-transparent dark:border-white/5">
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">1. Opšte odredbe</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Dobrodošli na Rent&Co platformu. Korišćenjem ove platforme prihvatate sledeće uslove korišćenja. 
              Molimo vas da pažljivo pročitate ove uslove pre nego što počnete da koristite naše usluge.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">2. Registracija i korisnički nalog</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Za korišćenje određenih funkcija platforme potrebna je registracija. Prilikom registracije obavezujete se da:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-6 space-y-2">
              <li>Pružite tačne i potpune informacije</li>
              <li>Održavate sigurnost svoje lozinke</li>
              <li>Obavestite nas o neovlašćenom pristupu vašem nalogu</li>
              <li>Ne delite pristupne podatke sa trećim licima</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">3. Pravila oglašavanja</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Korisnici koji objavljuju oglase moraju se pridržavati sledećih pravila:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-6 space-y-2">
              <li>Oglasi moraju biti tačni i ne smeju dovoditi u zabludu</li>
              <li>Zabranjeno je oglašavanje ilegalnih proizvoda ili usluga</li>
              <li>Slike moraju odgovarati stvarnom stanju resursa</li>
              <li>Cene moraju biti jasno navedene</li>
              <li>Kontakt podaci moraju biti validni</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">4. Odgovornost</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Rent&Co služi kao platforma za povezivanje korisnika i ne učestvuje direktno u transakcijama 
              između korisnika. Nismo odgovorni za kvalitet resursa, ispunjenje obaveza ili bilo kakve 
              sporove između korisnika. Preporučujemo da uvek proverite resurse pre iznajmljivanja.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">5. Intelektualna svojina</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Sav sadržaj na platformi, uključujući logotipe, dizajn, tekst i grafiku, zaštićen je autorskim 
              pravima i pripada Rent&Co ili našim partnerima. Nije dozvoljeno kopiranje, distribucija ili 
              modifikacija sadržaja bez pisanog odobrenja.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">6. Prekid korišćenja</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Zadržavamo pravo da suspendujemo ili ukinemo korisnički nalog u slučaju kršenja ovih uslova 
              korišćenja, bez prethodne najave i bez obaveze vraćanja sredstava.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">7. Izmene uslova</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Zadržavamo pravo da izmenimo ove uslove korišćenja u bilo kom trenutku. Korisnici će biti 
              obavešteni o značajnim promenama putem email-a ili obaveštenja na platformi.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">8. Kontakt</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Za sva pitanja u vezi sa ovim uslovima korišćenja, možete nas kontaktirati na:{' '}
              <a href="mailto:info@rentco.rs" className="text-[#e85d45] hover:underline">
                info@rentco.rs
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
