import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../models/category";

dotenv.config();

const categories = [
  {
    name: "Turizam i Odmor",
    slug: "turizam-i-odmor",
    icon: "🏖️",
    order: 1,
  },
  {
    name: "Ugostiteljstvo",
    slug: "ugostiteljstvo",
    icon: "🍽️",
    order: 2,
  },
  {
    name: "Vozila, Mašine i Alati",
    slug: "vozila-masine-i-alati",
    icon: "🚗",
    order: 3,
  },
  {
    name: "Usluge",
    slug: "usluge",
    icon: "🔧",
    order: 4,
  },
  {
    name: "Menjam/Poklanjam",
    slug: "menjam-poklanjam",
    icon: "🎁",
    order: 5,
  },
  {
    name: "Razno",
    slug: "razno",
    icon: "📦",
    order: 6,
  },
];

const seedCategories = async () => {
  try {
    const mongoUri = process.env.DB_URL;
    if (!mongoUri) {
      throw new Error("DB_URL nije definisan u .env");
    }

    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB povezan");

    // Obriši postojeće kategorije
    await Category.deleteMany({});
    console.log("🗑️  Postojeće kategorije obrisane");

    // Ubaci nove kategorije
    const result = await Category.insertMany(categories);
    console.log(`✅ Ubačeno ${result.length} kategorija:`);
    
    result.forEach((cat) => {
      console.log(`   ${cat.icon} ${cat.name} (${cat.slug})`);
    });

    await mongoose.disconnect();
    console.log("\n✅ Seed završen uspešno!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Greška:", error);
    process.exit(1);
  }
};

seedCategories();
