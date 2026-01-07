import mongoose from "mongoose";
import dotenv from "dotenv";
import Resource from "../models/resource";
import Category from "../models/category";
import User from "../models/user";

dotenv.config();

const resourcesData = [
  // Turizam i Odmor
  {
    title: "Apartman na moru - Budva",
    slug: "apartman-na-moru-budva",
    description: "Prekrasan apartman sa pogledom na more, 50m od plaže. Klimatizovan, potpuno opremljen za 4 osobe.",
    pricePerDay: 80,
    currency: "EUR",
    categorySlug: "turizam-i-odmor",
    location: { city: "Budva", country: "Crna Gora", address: "Slovenska obala 15" },
    images: [{ url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", alt: "Apartman Budva", order: 0 }],
    options: ["Wi-Fi", "Klima", "Parking", "TV"],
    status: "active",
    isFeatured: true,
  },
  {
    title: "Vikendica na Zlatiboru",
    slug: "vikendica-na-zlatiboru",
    description: "Udobna vikendica sa kaminom, idealna za porodični odmor. Kapacitet 6 osoba, okružena prirodom.",
    pricePerDay: 120,
    currency: "EUR",
    categorySlug: "turizam-i-odmor",
    location: { city: "Zlatibor", country: "Srbija", address: "Partizanska bb" },
    images: [{ url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800", alt: "Vikendica Zlatibor", order: 0 }],
    options: ["Wi-Fi", "Kamin", "Parking", "Bašta"],
    status: "active",
    isFeatured: false,
  },
  {
    title: "Šator za kampovanje - 4 osobe",
    slug: "sator-za-kampovanje-4-osobe",
    description: "Vodootporni šator za 4 osobe, lak za postavljanje. Idealan za planinarenje i kampovanje.",
    pricePerDay: 15,
    currency: "EUR",
    categorySlug: "turizam-i-odmor",
    location: { city: "Beograd", country: "Srbija", address: "Knez Mihailova 22" },
    images: [{ url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800", alt: "Šator za kampovanje", order: 0 }],
    options: ["Vodootporan", "Lako postavljanje"],
    status: "active",
    isFeatured: false,
  },
  {
    title: "Kajak - dvosed",
    slug: "kajak-dvosed",
    description: "Kajak za dve osobe sa veslima i prslucima za spasavanje. Savršen za reke i jezera.",
    pricePerDay: 35,
    currency: "EUR",
    categorySlug: "turizam-i-odmor",
    location: { city: "Novi Sad", country: "Srbija", address: "Kej žrtava racije 5" },
    images: [{ url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800", alt: "Kajak dvosed", order: 0 }],
    options: ["Vesla uključena", "Prsluci uključeni"],
    status: "active",
    isFeatured: true,
  },
  {
    title: "Bicikl MTB - Trek",
    slug: "bicikl-mtb-trek",
    description: "Planinarski bicikl Trek, 21 brzina. Odlično održavan, pogodan za sve terene.",
    pricePerDay: 20,
    currency: "EUR",
    categorySlug: "turizam-i-odmor",
    location: { city: "Niš", country: "Srbija", address: "Obrenovićeva 12" },
    images: [{ url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800", alt: "Bicikl MTB Trek", order: 0 }],
    options: ["Kaciga uključena", "Pumpa"],
    status: "active",
    isFeatured: false,
  },

  // Ugostiteljstvo
  {
    title: "Espresso aparat - DeLonghi",
    slug: "espresso-aparat-delonghi",
    description: "Profesionalni espresso aparat DeLonghi, idealan za male kafiće i događaje.",
    pricePerDay: 45,
    currency: "EUR",
    categorySlug: "ugostiteljstvo",
    location: { city: "Beograd", country: "Srbija", address: "Terazije 8" },
    images: [{ url: "https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?w=800", alt: "Espresso aparat DeLonghi", order: 0 }],
    options: ["Mlin uključen", "Obuka"],
    status: "active",
    isFeatured: true,
  },
  {
    title: "Šator za događaje 10x5m",
    slug: "sator-za-dogadjaje-10x5m",
    description: "Veliki šator za događaje, svadbe, proslave. Kapacitet do 50 osoba.",
    pricePerDay: 150,
    currency: "EUR",
    categorySlug: "ugostiteljstvo",
    location: { city: "Novi Sad", country: "Srbija", address: "Bulevar oslobođenja 100" },
    images: [{ url: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800", alt: "Šator za događaje", order: 0 }],
    options: ["Montaža uključena", "Stolice dodatno"],
    status: "active",
    isFeatured: false,
  },
  {
    title: "Roštilj na gas - profesionalni",
    slug: "rostilj-na-gas-profesionalni",
    description: "Profesionalni roštilj na gas sa 4 gorionika. Idealan za ketering i događaje.",
    pricePerDay: 60,
    currency: "EUR",
    categorySlug: "ugostiteljstvo",
    location: { city: "Kragujevac", country: "Srbija", address: "Kralja Petra I 45" },
    images: [{ url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800", alt: "Roštilj na gas", order: 0 }],
    options: ["Gas boca uključena", "Pribor"],
    status: "active",
    isFeatured: false,
  },
  {
    title: "Set stolova i stolica - 10 kompleta",
    slug: "set-stolova-stolica-10-kompleta",
    description: "10 stolova i 60 stolica za događaje. Bele sklopive stolice, elegantne.",
    pricePerDay: 100,
    currency: "EUR",
    categorySlug: "ugostiteljstvo",
    location: { city: "Beograd", country: "Srbija", address: "Bulevar kralja Aleksandra 200" },
    images: [{ url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800", alt: "Set stolova i stolica", order: 0 }],
    options: ["Dostava uključena", "Stolnjaci dodatno"],
    status: "active",
    isFeatured: true,
  },
  {
    title: "Aparat za sladoled",
    slug: "aparat-za-sladoled",
    description: "Mašina za meki sladoled, 3 ukusa. Idealna za letnje događaje i festivale.",
    pricePerDay: 80,
    currency: "EUR",
    categorySlug: "ugostiteljstvo",
    location: { city: "Subotica", country: "Srbija", address: "Korzo 15" },
    images: [{ url: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=800", alt: "Aparat za sladoled", order: 0 }],
    options: ["Korneti uključeni", "Obuka"],
    status: "active",
    isFeatured: false,
  },

  // Vozila, Mašine i Alati
  {
    title: "Kombi vozilo - Mercedes Sprinter",
    slug: "kombi-vozilo-mercedes-sprinter",
    description: "Mercedes Sprinter, 8+1 sedište. Klima, ABS, idealan za grupna putovanja.",
    pricePerDay: 90,
    currency: "EUR",
    categorySlug: "vozila-masine-i-alati",
    location: { city: "Beograd", country: "Srbija", address: "Autoput 20" },
    images: [{ url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800", alt: "Mercedes Sprinter", order: 0 }],
    options: ["Pun rezervoar", "GPS", "Klima"],
    status: "active",
    isFeatured: true,
  },
  {
    title: "Bušilica Hilti - profesionalna",
    slug: "busilica-hilti-profesionalna",
    description: "Hilti TE 30 udarna bušilica. Snažna, pouzdana, za beton i ciglu.",
    pricePerDay: 25,
    currency: "EUR",
    categorySlug: "vozila-masine-i-alati",
    location: { city: "Novi Sad", country: "Srbija", address: "Industrijska zona bb" },
    images: [{ url: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800", alt: "Bušilica Hilti", order: 0 }],
    options: ["Set burgija", "Kofer"],
    status: "active",
    isFeatured: false,
  },
  {
    title: "Generator struje 5kW",
    slug: "generator-struje-5kw",
    description: "Agregat 5kW, benzinski. Idealan za gradilišta i događaje bez struje.",
    pricePerDay: 40,
    currency: "EUR",
    categorySlug: "vozila-masine-i-alati",
    location: { city: "Niš", country: "Srbija", address: "Vizantijski bulevar 10" },
    images: [{ url: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800", alt: "Generator struje", order: 0 }],
    options: ["Pun rezervoar", "Kablovi"],
    status: "active",
    isFeatured: false,
  },
  {
    title: "Skela - komplet 50m²",
    slug: "skela-komplet-50m2",
    description: "Građevinska skela, komplet za 50m² fasade. Aluminijumska, laka za montažu.",
    pricePerDay: 35,
    currency: "EUR",
    categorySlug: "vozila-masine-i-alati",
    location: { city: "Kragujevac", country: "Srbija", address: "Lepenički bulevar 5" },
    images: [{ url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800", alt: "Skela", order: 0 }],
    options: ["Montaža dodatno", "Platforme uključene"],
    status: "active",
    isFeatured: true,
  },
  {
    title: "Motorna testera Stihl",
    slug: "motorna-testera-stihl",
    description: "Stihl MS 250 motorna testera. Odlična za drva i uređenje dvorišta.",
    pricePerDay: 30,
    currency: "EUR",
    categorySlug: "vozila-masine-i-alati",
    location: { city: "Čačak", country: "Srbija", address: "Gradsko šetalište 8" },
    images: [{ url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800", alt: "Motorna testera Stihl", order: 0 }],
    options: ["Ulje uključeno", "Zaštitna oprema"],
    status: "active",
    isFeatured: false,
  },

  // Usluge
  {
    title: "DJ oprema - komplet",
    slug: "dj-oprema-komplet",
    description: "Kompletna DJ oprema: mikser, 2 zvučnika, mikrofon. Za svadbe i žurke.",
    pricePerDay: 120,
    currency: "EUR",
    categorySlug: "usluge",
    location: { city: "Beograd", country: "Srbija", address: "Strahinjića Bana 30" },
    images: [{ url: "https://images.unsplash.com/photo-1571266028243-d220c6a8b0e9?w=800", alt: "DJ oprema", order: 0 }],
    options: ["Dostava", "Tehničar dodatno"],
    status: "active",
    isFeatured: true,
  },
  {
    title: "Foto aparat Canon EOS R5",
    slug: "foto-aparat-canon-eos-r5",
    description: "Canon EOS R5 sa 24-70mm objektivom. Profesionalna oprema za fotografe.",
    pricePerDay: 75,
    currency: "EUR",
    categorySlug: "usluge",
    location: { city: "Novi Sad", country: "Srbija", address: "Zmaj Jovina 22" },
    images: [{ url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800", alt: "Canon EOS R5", order: 0 }],
    options: ["Dodatni objektiv", "Memorijska kartica"],
    status: "active",
    isFeatured: false,
  },
  {
    title: "Projektor i platno",
    slug: "projektor-i-platno",
    description: "Full HD projektor sa platnom 3x2m. Za prezentacije i kućni bioskop.",
    pricePerDay: 50,
    currency: "EUR",
    categorySlug: "usluge",
    location: { city: "Beograd", country: "Srbija", address: "Kneza Miloša 50" },
    images: [{ url: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800", alt: "Projektor i platno", order: 0 }],
    options: ["HDMI kabl", "Stalak"],
    status: "active",
    isFeatured: false,
  },
  {
    title: "PA sistem - ozvučenje",
    slug: "pa-sistem-ozvucenje",
    description: "Profesionalno ozvučenje za događaje do 200 ljudi. 2x1000W.",
    pricePerDay: 100,
    currency: "EUR",
    categorySlug: "usluge",
    location: { city: "Niš", country: "Srbija", address: "Kopitareva 10" },
    images: [{ url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800", alt: "PA sistem", order: 0 }],
    options: ["Mikrofoni", "Stalci", "Dostava"],
    status: "active",
    isFeatured: true,
  },
  {
    title: "Video kamera Sony 4K",
    slug: "video-kamera-sony-4k",
    description: "Sony FX3 profesionalna kamera. Za snimanje filmova i reklama.",
    pricePerDay: 150,
    currency: "EUR",
    categorySlug: "usluge",
    location: { city: "Beograd", country: "Srbija", address: "Obilićev venac 18" },
    images: [{ url: "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=800", alt: "Video kamera Sony 4K", order: 0 }],
    options: ["Tripod", "Gimbal dodatno"],
    status: "active",
    isFeatured: false,
  },

  // Menjam/Poklanjam
  {
    title: "Dečija kolica - Chicco",
    slug: "decija-kolica-chicco",
    description: "Chicco kolica u odličnom stanju. Poklanjam jer dete preraslo.",
    pricePerDay: 0,
    currency: "EUR",
    categorySlug: "menjam-poklanjam",
    location: { city: "Beograd", country: "Srbija", address: "Vojvode Stepe 100" },
    images: [{ url: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800", alt: "Dečija kolica Chicco", order: 0 }],
    options: ["Besplatno"],
    status: "active",
    isFeatured: false,
  },
  {
    title: "Stare knjige - klasici",
    slug: "stare-knjige-klasici",
    description: "Kolekcija starih knjiga, domaći i strani klasici. Menjam za nešto zanimljivo.",
    pricePerDay: 0,
    currency: "EUR",
    categorySlug: "menjam-poklanjam",
    location: { city: "Novi Sad", country: "Srbija", address: "Dunavska 20" },
    images: [{ url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800", alt: "Stare knjige", order: 0 }],
    options: ["Razmena"],
    status: "active",
    isFeatured: false,
  },
  {
    title: "Stari gramofon - ispravan",
    slug: "stari-gramofon-ispravan",
    description: "Vintage gramofon iz 70-ih, potpuno ispravan. Menjam za vinil ploče.",
    pricePerDay: 0,
    currency: "EUR",
    categorySlug: "menjam-poklanjam",
    location: { city: "Niš", country: "Srbija", address: "Cara Dušana 33" },
    images: [{ url: "https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=800", alt: "Stari gramofon", order: 0 }],
    options: ["Razmena za ploče"],
    status: "active",
    isFeatured: true,
  },
  {
    title: "Komoda - retro stil",
    slug: "komoda-retro-stil",
    description: "Drvena komoda iz 60-ih, potrebno malo osvežavanje. Poklanjam.",
    pricePerDay: 0,
    currency: "EUR",
    categorySlug: "menjam-poklanjam",
    location: { city: "Kragujevac", country: "Srbija", address: "Kneza Mihaila 15" },
    images: [{ url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800", alt: "Komoda retro stil", order: 0 }],
    options: ["Besplatno", "Preuzimanje lično"],
    status: "active",
    isFeatured: false,
  },
  {
    title: "Stari sat - zidni",
    slug: "stari-sat-zidni",
    description: "Antikvitetni zidni sat sa kukcanjem. Ispravan, menjam za slične antikvitete.",
    pricePerDay: 0,
    currency: "EUR",
    categorySlug: "menjam-poklanjam",
    location: { city: "Subotica", country: "Srbija", address: "Trg slobode 5" },
    images: [{ url: "https://images.unsplash.com/photo-1415604934674-561df9abf539?w=800", alt: "Stari zidni sat", order: 0 }],
    options: ["Razmena"],
    status: "active",
    isFeatured: false,
  },

  // Razno
  {
    title: "Šivaća mašina Singer",
    slug: "sivaca-masina-singer",
    description: "Električna šivaća mašina Singer, odlična za početnike i napredne.",
    pricePerDay: 15,
    currency: "EUR",
    categorySlug: "razno",
    location: { city: "Beograd", country: "Srbija", address: "Balkanska 18" },
    images: [{ url: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800", alt: "Šivaća mašina Singer", order: 0 }],
    options: ["Pribor uključen"],
    status: "active",
    isFeatured: false,
  },
  {
    title: "Teleskop astronomski",
    slug: "teleskop-astronomski",
    description: "Celestron teleskop za posmatranje zvezda. Idealan za hobiste.",
    pricePerDay: 40,
    currency: "EUR",
    categorySlug: "razno",
    location: { city: "Novi Sad", country: "Srbija", address: "Futoška 50" },
    images: [{ url: "https://images.unsplash.com/photo-1465189684280-6a8fa9b19a7a?w=800", alt: "Teleskop astronomski", order: 0 }],
    options: ["Tripod", "Mape neba"],
    status: "active",
    isFeatured: true,
  },
  {
    title: "Dron DJI Mavic",
    slug: "dron-dji-mavic",
    description: "DJI Mavic Air 2, 4K kamera. Za snimanje iz vazduha, lak za upravljanje.",
    pricePerDay: 70,
    currency: "EUR",
    categorySlug: "razno",
    location: { city: "Beograd", country: "Srbija", address: "Bulevar Mihajla Pupina 10" },
    images: [{ url: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800", alt: "Dron DJI Mavic", order: 0 }],
    options: ["3 baterije", "Kofer"],
    status: "active",
    isFeatured: true,
  },
  {
    title: "PlayStation 5 sa igrama",
    slug: "playstation-5-sa-igrama",
    description: "PS5 konzola sa 2 džojstika i 5 igara. Za žurke i druženja.",
    pricePerDay: 35,
    currency: "EUR",
    categorySlug: "razno",
    location: { city: "Niš", country: "Srbija", address: "Voždova 25" },
    images: [{ url: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800", alt: "PlayStation 5", order: 0 }],
    options: ["5 igara", "2 džojstika"],
    status: "active",
    isFeatured: false,
  },
  {
    title: "E-čitač Kindle Paperwhite",
    slug: "e-citac-kindle-paperwhite",
    description: "Amazon Kindle Paperwhite, idealan za čitanje na putovanjima.",
    pricePerDay: 8,
    currency: "EUR",
    categorySlug: "razno",
    location: { city: "Beograd", country: "Srbija", address: "Makedonska 30" },
    images: [{ url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800", alt: "Kindle Paperwhite", order: 0 }],
    options: ["Futrola", "Punjač"],
    status: "active",
    isFeatured: false,
  },
];

const seedResources = async () => {
  try {
    const mongoUri = process.env.DB_URL;
    if (!mongoUri) {
      throw new Error("DB_URL nije definisan u .env");
    }

    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB povezan");

    // Dohvati kategorije
    const categories = await Category.find().lean();
    const categoryMap = new Map(categories.map(c => [c.slug, c._id]));

    console.log("📂 Pronađene kategorije:", categories.map(c => c.slug).join(", "));

    // Kreiraj ili pronađi seed korisnika
    let seedUser = await User.findOne({ email: "seed@rentandco.rs" });
    if (!seedUser) {
      seedUser = await User.create({
        firstName: "Seed",
        lastName: "User",
        email: "seed@rentandco.rs",
        password: "SeedPassword123!", // Biće hashovan
        role: "user",
        active: true,
        city: "Beograd",
      });
      console.log("👤 Kreiran seed korisnik");
    }

    // Obriši postojeće resurse
    await Resource.deleteMany({});
    console.log("🗑️  Postojeći resursi obrisani");

    // Pripremi resurse sa categoryId i ownerId
    const resources = resourcesData.map(r => ({
      ...r,
      categoryId: categoryMap.get(r.categorySlug),
      ownerId: seedUser!._id,
      extraInfo: [
        { label: "Dostupnost", value: "Odmah" },
        { label: "Minimalno trajanje", value: "1 dan" },
      ],
    }));

    // Ubaci nove resurse
    const result = await Resource.insertMany(resources);
    console.log(`\n✅ Ubačeno ${result.length} resursa:`);
    
    // Grupiši po kategoriji
    const grouped: Record<string, string[]> = {};
    result.forEach((r) => {
      const cat = resourcesData.find(rd => rd.slug === r.slug)?.categorySlug || "unknown";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(r.title);
    });

    Object.entries(grouped).forEach(([cat, titles]) => {
      console.log(`\n📁 ${cat}:`);
      titles.forEach(t => console.log(`   • ${t}`));
    });

    await mongoose.disconnect();
    console.log("\n✅ Seed završen uspešno!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Greška:", error);
    process.exit(1);
  }
};

seedResources();
