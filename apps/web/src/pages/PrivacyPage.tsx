import { SEO } from '../components/SEO';

export default function PrivacyPage() {
  return (
    <div>
      <SEO 
        title="Zaštita podataka - Rent&Co"
        description="Saznajte kako štitimo vaše lične podatke na platformi Rent&Co."
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a1a1a] to-[#2d1f1f] dark:from-[#0f0f1a] dark:to-[#1a0f1a] py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Zaštita podataka i privatnost</h1>
          <p className="text-gray-400">Poslednja izmena: {new Date().toLocaleDateString('sr-RS')}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 container mx-auto px-4">
        <div className="max-w-3xl mx-auto prose dark:prose-invert">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-8 shadow-lg border border-transparent dark:border-white/5">
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">1. Uvod</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Rent&Co posvećen je zaštiti vaše privatnosti. Ova politika privatnosti objašnjava kako 
              prikupljamo, koristimo, čuvamo i štitimo vaše lične podatke u skladu sa Zakonom o zaštiti 
              podataka o ličnosti Republike Srbije i GDPR regulativom.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">2. Podaci koje prikupljamo</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Prikupljamo sledeće vrste podataka:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-6 space-y-2">
              <li><strong>Identifikacioni podaci:</strong> ime, prezime, email adresa, broj telefona</li>
              <li><strong>Podaci o nalogu:</strong> korisnično ime, lozinka (enkriptovana)</li>
              <li><strong>Podaci o oglasima:</strong> slike, opisi, lokacije, cene</li>
              <li><strong>Tehnički podaci:</strong> IP adresa, tip pretraživača, uređaj</li>
              <li><strong>Podaci o korišćenju:</strong> stranice koje posećujete, vreme provedeno na sajtu</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">3. Kako koristimo vaše podatke</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Vaše podatke koristimo za:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-6 space-y-2">
              <li>Pružanje i poboljšanje naših usluga</li>
              <li>Kreiranje i upravljanje vašim nalogom</li>
              <li>Komunikaciju sa vama (obaveštenja, podrška)</li>
              <li>Personalizaciju vašeg iskustva</li>
              <li>Sprečavanje prevara i zloupotreba</li>
              <li>Ispunjavanje zakonskih obaveza</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">4. Deljenje podataka</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Vaše lične podatke ne prodajemo trećim stranama. Možemo deliti podatke sa:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-6 space-y-2">
              <li>Provajderima usluga koji nam pomažu u poslovanju (hosting, analitika)</li>
              <li>Državnim organima kada je to zakonski obavezno</li>
              <li>Drugim korisnicima, u okviru funkcionalnosti platforme (npr. kontakt podaci u oglasima)</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">5. Sigurnost podataka</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Primenjujemo tehničke i organizacione mere za zaštitu vaših podataka, uključujući:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-6 space-y-2">
              <li>SSL/TLS enkripciju za sve komunikacije</li>
              <li>Enkriptovano čuvanje lozinki</li>
              <li>Redovne sigurnosne provere</li>
              <li>Ograničen pristup podacima samo ovlašćenim licima</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">6. Vaša prava</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Imate sledeća prava u vezi sa vašim podacima:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-6 space-y-2">
              <li><strong>Pravo pristupa:</strong> zatražite kopiju svojih podataka</li>
              <li><strong>Pravo ispravke:</strong> ispravite netačne podatke</li>
              <li><strong>Pravo brisanja:</strong> zatražite brisanje svojih podataka</li>
              <li><strong>Pravo ograničenja:</strong> ograničite obradu svojih podataka</li>
              <li><strong>Pravo prenosivosti:</strong> preuzmite svoje podatke u čitljivom formatu</li>
              <li><strong>Pravo prigovora:</strong> uložite prigovor na obradu podataka</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">7. Kolačići (Cookies)</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Koristimo kolačiće za poboljšanje vašeg iskustva na platformi. Možete podesiti vaš 
              pretraživač da odbije kolačiće, ali to može uticati na funkcionalnost sajta.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">8. Čuvanje podataka</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Vaše podatke čuvamo samo onoliko dugo koliko je potrebno za svrhe za koje su prikupljeni, 
              ili koliko zahteva zakon. Nakon brisanja naloga, vaši podaci će biti uklonjeni u roku od 30 dana.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">9. Kontakt</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Za sva pitanja o zaštiti podataka, kontaktirajte nas na:{' '}
              <a href="mailto:privacy@rentco.rs" className="text-[#e85d45] hover:underline">
                privacy@rentco.rs
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
