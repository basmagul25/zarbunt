/*
  Existing products ko default sizes dene ki ek baar chalne wali script.

  Ye products DELETE NAHI karti. Sirf un products mein sizes daalti hai jinke sizes abhi khaali hain,
  aur jinke sizes pehle se set hain unko nahi chhedti.

  Sizes baad mein admin panel se har product ke liye badal sakte ho
  (kisi product ke sizes khaali kar do to uska size picker nahi dikhega).

  Chalane ka tareeka (server folder mein):
    node addSizes.js
*/

const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("./models/Product");

const DEFAULT_SIZES = ["S", "M", "L", "XL"];

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected.");

    const result = await Product.updateMany(
      {
        $or: [
          { sizes: { $exists: false } },
          { sizes: { $size: 0 } },
        ],
      },
      { $set: { sizes: DEFAULT_SIZES } }
    );

    console.log(`${result.modifiedCount} product(s) updated with sizes: ${DEFAULT_SIZES.join(", ")}`);

    await mongoose.connection.close();
    console.log("Done.");
  } catch (error) {
    console.error("Failed:", error.message);
    process.exit(1);
  }
}

run();