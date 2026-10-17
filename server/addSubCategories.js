/*
  Existing products mein "subCategory" daalne ki ek baar chalne wali script.

  Ye products DELETE NAHI karti (seedProducts.js ki tarah nahi), sirf naam match karke
  subCategory field set karti hai. Jo product naam se match na ho usko chhodti hai.

  Ye sub categories demo ke liye maine bana di hain. Apne asal products ke hisaab se
  neeche list badal sakte ho (menu ke options se match karna zaroori hai, Navbar.jsx dekho).

  Chalane ka tareeka (server folder mein):
    node addSubCategories.js
*/

const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("./models/Product");

const subCategories = {
  // Unstitched
  "Lavender Garden Lawn": "Printed - 3 Piece",
  "Emerald Heritage": "Embroidered - 3 Piece",
  "Pearl Mist": "Embroidered - 2 Piece",
  "Ivory Bloom": "Printed - 2 Piece",
  "Terracotta Linen Edit": "Printed - 1 Piece",
  "Beige Rose Lawn": "Printed & Embroidered - 2 Piece",

  // Formal
  "Mint Pearl Embroidery": "Chiffon",
  "Rosewater Formal": "Chiffon",
  "Midnight Formal": "Net",
  "Celeste Embroidered": "Net",
  "Pearl Evening Ensemble": "Chiffon",
  "Emerald Festive Edit": "Net",

  // Ready To Wear
  "Azure Evening Edit": "Embroidered - 3 Piece",
  "Sage Garden Suit": "Printed - 2 Piece",
  "Rosewood Jacquard": "Embroidered - 2 Piece",
  "Olive Silk Kurta": "Printed - 1 Piece",
  "Moss Green Kurta Set": "Printed & Embroidered - 3 Piece",
  "Midnight Silk Set": "Solid - 2 Piece",
  "Mint Occasion Set": "Embroidered - 1 Piece",

  // Shawl
  "Noor Embroidered Shawl": "Winter - Pashmina",
  "Winter Bloom Shawl": "Winter - Velvet",
  "Mehfil Blue Shawl": "Winter - Wool",
  "Winter Sage Wrap": "Winter - Karandi Lawn",
  "Blue Dusk Shawl": "Summer - Lawn",
};

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected.");

    let updated = 0;
    const notFound = [];

    for (const [name, subCategory] of Object.entries(subCategories)) {
      const result = await Product.updateMany({ name }, { $set: { subCategory } });

      if (result.matchedCount === 0) {
        notFound.push(name);
      } else {
        updated += result.modifiedCount;
      }
    }

    console.log(`${updated} product(s) updated.`);

    if (notFound.length > 0) {
      console.log("In naamon ka koi product nahi mila (skip kiye):");
      notFound.forEach((name) => console.log(" -", name));
    }

    await mongoose.connection.close();
    console.log("Done.");
  } catch (error) {
    console.error("Failed:", error.message);
    process.exit(1);
  }
}

run();