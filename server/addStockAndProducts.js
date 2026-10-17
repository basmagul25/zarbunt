/*
  Stock aur naye products ki ek baar chalne wali script.

  Ye products DELETE NAHI karti. Do kaam karti hai:

  1) Jin purane products ke sizes hain lekin stock set nahi, unke har size ka stock 10 kar deti hai
     (baad mein admin panel se har product ka stock badal sakte ho).
  2) 24 naye products add karti hai (Unstitched, Ready To Wear, Formal, Shawl).
     Agar kisi naam ka product pehle se maujood ho to usko dobara add nahi karti,
     isliye ye script do dafa chalane se bhi products double nahi hote.

  Note: naye products ki photos purane products ki photos se li gayi hain (demo ke liye),
  isliye kuch photos dohrayengi. Apni asal photos admin panel se badal dena.

  Chalane ka tareeka (server folder mein):
    node addStockAndProducts.js
*/

const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("./models/Product");

const DEFAULT_STOCK = 10;

const newProducts = [
  {
    "name": "Mehr Bagh Lawn",
    "category": "Unstitched",
    "subCategory": "Printed - 3 Piece",
    "price": 3290,
    "oldPrice": null,
    "badge": "NEW",
    "initial": "25",
    "artClass": "art-ivory",
    "image": "https://images.pexels.com/photos/36325934/pexels-photo-36325934.jpeg?auto=compress&cs=tinysrgb&w=900",
    "images": [
      "https://images.unsplash.com/photo-1773439878222-c383967772de?auto=format&fit=crop&w=900&q=80"
    ],
    "description": "Soft cotton lawn with a garden-inspired digital print. Includes shirt, dupatta and trouser fabric.",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "stockBySize": [
      {
        "size": "S",
        "stock": 8
      },
      {
        "size": "M",
        "stock": 12
      },
      {
        "size": "L",
        "stock": 10
      },
      {
        "size": "XL",
        "stock": 6
      }
    ],
    "inStock": true
  },
  {
    "name": "Gulnar Embroidered Lawn",
    "category": "Unstitched",
    "subCategory": "Embroidered - 3 Piece",
    "price": 4690,
    "oldPrice": null,
    "badge": "NEW",
    "initial": "26",
    "artClass": "art-sage",
    "image": "https://images.pexels.com/photos/35902080/pexels-photo-35902080.jpeg?auto=compress&cs=tinysrgb&w=900",
    "images": [
      "https://images.unsplash.com/photo-1773439877855-cd193d949717?auto=format&fit=crop&w=900&q=80"
    ],
    "description": "Fine lawn with delicate neckline embroidery and a printed chiffon dupatta. Light and breathable for everyday wear.",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "stockBySize": [
      {
        "size": "S",
        "stock": 5
      },
      {
        "size": "M",
        "stock": 9
      },
      {
        "size": "L",
        "stock": 7
      },
      {
        "size": "XL",
        "stock": 3
      }
    ],
    "inStock": true
  },
  {
    "name": "Sehr Chikankari Edit",
    "category": "Unstitched",
    "subCategory": "Embroidered - 2 Piece",
    "price": 3990,
    "oldPrice": null,
    "badge": "",
    "initial": "27",
    "artClass": "art-pearl",
    "image": "https://images.pexels.com/photos/36104914/pexels-photo-36104914.jpeg?auto=compress&cs=tinysrgb&w=900",
    "images": [
      "https://images.unsplash.com/photo-1773439878392-74abd38c55ec?auto=format&fit=crop&w=900&q=80"
    ],
    "description": "Chikankari-style embroidered shirt fabric with a matching plain trouser. A clean, understated look.",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "stockBySize": [
      {
        "size": "S",
        "stock": 12
      },
      {
        "size": "M",
        "stock": 15
      },
      {
        "size": "L",
        "stock": 10
      },
      {
        "size": "XL",
        "stock": 8
      }
    ],
    "inStock": true
  },
  {
    "name": "Dhanak Digital Print",
    "category": "Unstitched",
    "subCategory": "Printed - 2 Piece",
    "price": 2790,
    "oldPrice": 3490,
    "badge": "SALE",
    "initial": "28",
    "artClass": "art-rose",
    "image": "https://images.unsplash.com/photo-1702974779315-339d4265805d?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.unsplash.com/photo-1773439877634-e6ef9f571c12?auto=format&fit=crop&w=900&q=80"
    ],
    "description": "Bright digital print on soft lawn, now at a special price. Shirt and trouser fabric included.",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "stockBySize": [
      {
        "size": "S",
        "stock": 2
      },
      {
        "size": "M",
        "stock": 4
      },
      {
        "size": "L",
        "stock": 3
      },
      {
        "size": "XL",
        "stock": 0
      }
    ],
    "inStock": true
  },
  {
    "name": "Charcoal Khaddar Classic",
    "category": "Unstitched",
    "subCategory": "Printed - 1 Piece",
    "price": 2990,
    "oldPrice": null,
    "badge": "",
    "initial": "29",
    "artClass": "art-midnight",
    "image": "https://images.unsplash.com/photo-1773439879064-53483d0ce0d1?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.unsplash.com/photo-1773439877255-55e63cf17b2c?auto=format&fit=crop&w=900&q=80"
    ],
    "description": "Warm winter khaddar in a deep charcoal tone with a subtle printed finish. Single shirt piece.",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "stockBySize": [
      {
        "size": "S",
        "stock": 6
      },
      {
        "size": "M",
        "stock": 6
      },
      {
        "size": "L",
        "stock": 6
      },
      {
        "size": "XL",
        "stock": 6
      }
    ],
    "inStock": true
  },
  {
    "name": "Zarmeen Print and Embroidery",
    "category": "Unstitched",
    "subCategory": "Printed & Embroidered - 3 Piece",
    "price": 5190,
    "oldPrice": null,
    "badge": "POPULAR",
    "initial": "30",
    "artClass": "art-moss",
    "image": "https://images.unsplash.com/photo-1773439878222-c383967772de?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.unsplash.com/photo-1773439878338-c61b0fe9ed48?auto=format&fit=crop&w=900&q=80"
    ],
    "description": "A customer favourite: printed shirt with embroidered borders, a printed dupatta and dyed trouser fabric.",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "stockBySize": [
      {
        "size": "S",
        "stock": 10
      },
      {
        "size": "M",
        "stock": 8
      },
      {
        "size": "L",
        "stock": 5
      },
      {
        "size": "XL",
        "stock": 2
      }
    ],
    "inStock": true
  },
  {
    "name": "Aangan Kurta Set",
    "category": "Ready To Wear",
    "subCategory": "Printed - 2 Piece",
    "price": 3590,
    "oldPrice": null,
    "badge": "NEW",
    "initial": "31",
    "artClass": "art-sage",
    "image": "https://images.unsplash.com/photo-1773439877855-cd193d949717?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.unsplash.com/photo-1705921266774-2d902f6d0079?auto=format&fit=crop&w=900&q=80"
    ],
    "description": "Ready-stitched printed kurta with a matching trouser. Easy fit, soft on skin, made for daily wear.",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "stockBySize": [
      {
        "size": "S",
        "stock": 0
      },
      {
        "size": "M",
        "stock": 3
      },
      {
        "size": "L",
        "stock": 6
      },
      {
        "size": "XL",
        "stock": 9
      }
    ],
    "inStock": true
  },
  {
    "name": "Rani Gota Kurti",
    "category": "Ready To Wear",
    "subCategory": "Embroidered - 1 Piece",
    "price": 2990,
    "oldPrice": null,
    "badge": "",
    "initial": "32",
    "artClass": "art-rose",
    "image": "https://images.unsplash.com/photo-1773439878392-74abd38c55ec?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.pexels.com/photos/36325934/pexels-photo-36325934.jpeg?auto=compress&cs=tinysrgb&w=900"
    ],
    "description": "Straight kurti with gota detailing on the neckline and sleeves. Pairs well with any trouser or jeans.",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "stockBySize": [
      {
        "size": "S",
        "stock": 8
      },
      {
        "size": "M",
        "stock": 12
      },
      {
        "size": "L",
        "stock": 10
      },
      {
        "size": "XL",
        "stock": 6
      }
    ],
    "inStock": true
  },
  {
    "name": "Saffron Straight Shirt",
    "category": "Ready To Wear",
    "subCategory": "Solid - 2 Piece",
    "price": 2490,
    "oldPrice": null,
    "badge": "",
    "initial": "33",
    "artClass": "art-terracotta",
    "image": "https://images.unsplash.com/photo-1773439877634-e6ef9f571c12?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.pexels.com/photos/35902080/pexels-photo-35902080.jpeg?auto=compress&cs=tinysrgb&w=900"
    ],
    "description": "Solid saffron shirt with matching trouser. Simple, sharp and easy to style for work or casual days.",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "stockBySize": [
      {
        "size": "S",
        "stock": 5
      },
      {
        "size": "M",
        "stock": 9
      },
      {
        "size": "L",
        "stock": 7
      },
      {
        "size": "XL",
        "stock": 3
      }
    ],
    "inStock": true
  },
  {
    "name": "Marjan Embroidered Co-ord",
    "category": "Ready To Wear",
    "subCategory": "Embroidered - 2 Piece",
    "price": 5490,
    "oldPrice": null,
    "badge": "POPULAR",
    "initial": "34",
    "artClass": "art-mint",
    "image": "https://images.unsplash.com/photo-1773439877255-55e63cf17b2c?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.pexels.com/photos/36104914/pexels-photo-36104914.jpeg?auto=compress&cs=tinysrgb&w=900"
    ],
    "description": "Embroidered co-ord set with a relaxed silhouette. Shirt and trouser come ready to wear.",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "stockBySize": [
      {
        "size": "S",
        "stock": 12
      },
      {
        "size": "M",
        "stock": 15
      },
      {
        "size": "L",
        "stock": 10
      },
      {
        "size": "XL",
        "stock": 8
      }
    ],
    "inStock": true
  },
  {
    "name": "Chandni Three Piece",
    "category": "Ready To Wear",
    "subCategory": "Printed & Embroidered - 3 Piece",
    "price": 6290,
    "oldPrice": null,
    "badge": "LIMITED",
    "initial": "35",
    "artClass": "art-ivory",
    "image": "https://images.unsplash.com/photo-1773439878338-c61b0fe9ed48?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.unsplash.com/photo-1702974779315-339d4265805d?auto=format&fit=crop&w=900&q=80"
    ],
    "description": "Limited run: printed shirt with embroidered detailing, a chiffon dupatta and a matching trouser.",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "stockBySize": [
      {
        "size": "S",
        "stock": 2
      },
      {
        "size": "M",
        "stock": 4
      },
      {
        "size": "L",
        "stock": 3
      },
      {
        "size": "XL",
        "stock": 0
      }
    ],
    "inStock": true
  },
  {
    "name": "Meharbano Lawn Pret",
    "category": "Ready To Wear",
    "subCategory": "Printed - 1 Piece",
    "price": 1990,
    "oldPrice": 2490,
    "badge": "SALE",
    "initial": "36",
    "artClass": "art-blue",
    "image": "https://images.unsplash.com/photo-1705921266774-2d902f6d0079?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.unsplash.com/photo-1773439879064-53483d0ce0d1?auto=format&fit=crop&w=900&q=80"
    ],
    "description": "Lightweight printed lawn shirt, ready to wear. A great everyday piece at a lower price.",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "stockBySize": [
      {
        "size": "S",
        "stock": 6
      },
      {
        "size": "M",
        "stock": 6
      },
      {
        "size": "L",
        "stock": 6
      },
      {
        "size": "XL",
        "stock": 6
      }
    ],
    "inStock": true
  },
  {
    "name": "Gulabi Festive Suit",
    "category": "Ready To Wear",
    "subCategory": "Embroidered - 3 Piece",
    "price": 6890,
    "oldPrice": null,
    "badge": "NEW",
    "initial": "37",
    "artClass": "art-rose",
    "image": "https://images.pexels.com/photos/36325934/pexels-photo-36325934.jpeg?auto=compress&cs=tinysrgb&w=900",
    "images": [
      "https://images.unsplash.com/photo-1773439878222-c383967772de?auto=format&fit=crop&w=900&q=80"
    ],
    "description": "Festive three piece with rich embroidery on the shirt, a net dupatta and a raw silk trouser.",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "stockBySize": [
      {
        "size": "S",
        "stock": 10
      },
      {
        "size": "M",
        "stock": 8
      },
      {
        "size": "L",
        "stock": 5
      },
      {
        "size": "XL",
        "stock": 2
      }
    ],
    "inStock": true
  },
  {
    "name": "Shabnam Chiffon Gown",
    "category": "Formal",
    "subCategory": "Chiffon",
    "price": 9490,
    "oldPrice": null,
    "badge": "NEW",
    "initial": "38",
    "artClass": "art-pearl",
    "image": "https://images.pexels.com/photos/35902080/pexels-photo-35902080.jpeg?auto=compress&cs=tinysrgb&w=900",
    "images": [
      "https://images.unsplash.com/photo-1773439877855-cd193d949717?auto=format&fit=crop&w=900&q=80"
    ],
    "description": "Flowing chiffon gown with hand-finished sequin work. Made for weddings and evening events.",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "stockBySize": [
      {
        "size": "S",
        "stock": 0
      },
      {
        "size": "M",
        "stock": 3
      },
      {
        "size": "L",
        "stock": 6
      },
      {
        "size": "XL",
        "stock": 9
      }
    ],
    "inStock": true
  },
  {
    "name": "Aab-e-Zar Net Ensemble",
    "category": "Formal",
    "subCategory": "Net",
    "price": 10990,
    "oldPrice": null,
    "badge": "LIMITED",
    "initial": "39",
    "artClass": "art-emerald",
    "image": "https://images.pexels.com/photos/36104914/pexels-photo-36104914.jpeg?auto=compress&cs=tinysrgb&w=900",
    "images": [
      "https://images.unsplash.com/photo-1773439878392-74abd38c55ec?auto=format&fit=crop&w=900&q=80"
    ],
    "description": "Limited edition net ensemble with heavy zari work on the front and sleeves.",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "stockBySize": [
      {
        "size": "S",
        "stock": 8
      },
      {
        "size": "M",
        "stock": 12
      },
      {
        "size": "L",
        "stock": 10
      },
      {
        "size": "XL",
        "stock": 6
      }
    ],
    "inStock": true
  },
  {
    "name": "Mehfil-e-Noor Chiffon",
    "category": "Formal",
    "subCategory": "Chiffon",
    "price": 8490,
    "oldPrice": null,
    "badge": "",
    "initial": "40",
    "artClass": "art-midnight",
    "image": "https://images.unsplash.com/photo-1702974779315-339d4265805d?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.unsplash.com/photo-1773439877634-e6ef9f571c12?auto=format&fit=crop&w=900&q=80"
    ],
    "description": "Deep-toned chiffon formal with embroidered borders and a coordinated dupatta.",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "stockBySize": [
      {
        "size": "S",
        "stock": 5
      },
      {
        "size": "M",
        "stock": 9
      },
      {
        "size": "L",
        "stock": 7
      },
      {
        "size": "XL",
        "stock": 3
      }
    ],
    "inStock": true
  },
  {
    "name": "Ruby Net Anarkali",
    "category": "Formal",
    "subCategory": "Net",
    "price": 9990,
    "oldPrice": 12490,
    "badge": "SALE",
    "initial": "41",
    "artClass": "art-rose",
    "image": "https://images.unsplash.com/photo-1773439879064-53483d0ce0d1?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.unsplash.com/photo-1773439877255-55e63cf17b2c?auto=format&fit=crop&w=900&q=80"
    ],
    "description": "Ruby net anarkali with a flared hem and detailed embroidery, now on sale.",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "stockBySize": [
      {
        "size": "S",
        "stock": 12
      },
      {
        "size": "M",
        "stock": 15
      },
      {
        "size": "L",
        "stock": 10
      },
      {
        "size": "XL",
        "stock": 8
      }
    ],
    "inStock": true
  },
  {
    "name": "Pearl Dust Chiffon",
    "category": "Formal",
    "subCategory": "Chiffon",
    "price": 7790,
    "oldPrice": null,
    "badge": "POPULAR",
    "initial": "42",
    "artClass": "art-ivory",
    "image": "https://images.unsplash.com/photo-1773439878222-c383967772de?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.unsplash.com/photo-1773439878338-c61b0fe9ed48?auto=format&fit=crop&w=900&q=80"
    ],
    "description": "Soft pearl-toned chiffon with fine beadwork. A popular pick for dawat and mehndi events.",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "stockBySize": [
      {
        "size": "S",
        "stock": 2
      },
      {
        "size": "M",
        "stock": 4
      },
      {
        "size": "L",
        "stock": 3
      },
      {
        "size": "XL",
        "stock": 0
      }
    ],
    "inStock": true
  },
  {
    "name": "Kashmiri Kani Wrap",
    "category": "Shawl",
    "subCategory": "Winter - Pashmina",
    "price": 7990,
    "oldPrice": null,
    "badge": "POPULAR",
    "initial": "43",
    "artClass": "art-noor",
    "image": "https://images.unsplash.com/photo-1773439877855-cd193d949717?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.unsplash.com/photo-1705921266774-2d902f6d0079?auto=format&fit=crop&w=900&q=80"
    ],
    "description": "Pashmina-feel wrap with kani-inspired weave. Warm, light and a lasting winter piece.",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "stockBySize": [
      {
        "size": "S",
        "stock": 6
      },
      {
        "size": "M",
        "stock": 6
      },
      {
        "size": "L",
        "stock": 6
      },
      {
        "size": "XL",
        "stock": 6
      }
    ],
    "inStock": true
  },
  {
    "name": "Midnight Velvet Shawl",
    "category": "Shawl",
    "subCategory": "Winter - Velvet",
    "price": 6490,
    "oldPrice": null,
    "badge": "NEW",
    "initial": "44",
    "artClass": "art-midnight",
    "image": "https://images.unsplash.com/photo-1773439878392-74abd38c55ec?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.pexels.com/photos/36325934/pexels-photo-36325934.jpeg?auto=compress&cs=tinysrgb&w=900"
    ],
    "description": "Rich velvet shawl in a midnight shade with a soft embroidered border.",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "stockBySize": [
      {
        "size": "S",
        "stock": 10
      },
      {
        "size": "M",
        "stock": 8
      },
      {
        "size": "L",
        "stock": 5
      },
      {
        "size": "XL",
        "stock": 2
      }
    ],
    "inStock": true
  },
  {
    "name": "Charcoal Wool Stole",
    "category": "Shawl",
    "subCategory": "Winter - Wool",
    "price": 3990,
    "oldPrice": null,
    "badge": "",
    "initial": "45",
    "artClass": "art-winter",
    "image": "https://images.unsplash.com/photo-1773439877634-e6ef9f571c12?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.pexels.com/photos/35902080/pexels-photo-35902080.jpeg?auto=compress&cs=tinysrgb&w=900"
    ],
    "description": "Everyday wool stole in charcoal. Warm, soft and easy to carry.",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "stockBySize": [
      {
        "size": "S",
        "stock": 0
      },
      {
        "size": "M",
        "stock": 3
      },
      {
        "size": "L",
        "stock": 6
      },
      {
        "size": "XL",
        "stock": 9
      }
    ],
    "inStock": true
  },
  {
    "name": "Karandi Heritage Shawl",
    "category": "Shawl",
    "subCategory": "Winter - Karandi Lawn",
    "price": 4490,
    "oldPrice": 5490,
    "badge": "SALE",
    "initial": "46",
    "artClass": "art-moss",
    "image": "https://images.unsplash.com/photo-1773439877255-55e63cf17b2c?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.pexels.com/photos/36104914/pexels-photo-36104914.jpeg?auto=compress&cs=tinysrgb&w=900"
    ],
    "description": "Karandi weave shawl with a heritage border, now at a lower price.",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "stockBySize": [
      {
        "size": "S",
        "stock": 8
      },
      {
        "size": "M",
        "stock": 12
      },
      {
        "size": "L",
        "stock": 10
      },
      {
        "size": "XL",
        "stock": 6
      }
    ],
    "inStock": true
  },
  {
    "name": "Gulab Wool Wrap",
    "category": "Shawl",
    "subCategory": "Winter - Wool",
    "price": 4290,
    "oldPrice": null,
    "badge": "NEW",
    "initial": "47",
    "artClass": "art-rose",
    "image": "https://images.unsplash.com/photo-1773439878338-c61b0fe9ed48?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.unsplash.com/photo-1702974779315-339d4265805d?auto=format&fit=crop&w=900&q=80"
    ],
    "description": "Rose-toned wool wrap with a fine fringe. Soft against the skin and warm through the season.",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "stockBySize": [
      {
        "size": "S",
        "stock": 5
      },
      {
        "size": "M",
        "stock": 9
      },
      {
        "size": "L",
        "stock": 7
      },
      {
        "size": "XL",
        "stock": 3
      }
    ],
    "inStock": true
  },
  {
    "name": "Summer Lawn Dupatta Shawl",
    "category": "Shawl",
    "subCategory": "Summer - Lawn",
    "price": 2290,
    "oldPrice": null,
    "badge": "",
    "initial": "48",
    "artClass": "art-mint",
    "image": "https://images.unsplash.com/photo-1705921266774-2d902f6d0079?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.unsplash.com/photo-1773439879064-53483d0ce0d1?auto=format&fit=crop&w=900&q=80"
    ],
    "description": "Light summer lawn wrap for cool evenings. Breathable and easy to style.",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "stockBySize": [
      {
        "size": "S",
        "stock": 12
      },
      {
        "size": "M",
        "stock": 15
      },
      {
        "size": "L",
        "stock": 10
      },
      {
        "size": "XL",
        "stock": 8
      }
    ],
    "inStock": true
  }
];

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected.");

    // 1) Purane products ka stock
    const existing = await Product.find({
      "sizes.0": { $exists: true },
      "stockBySize.0": { $exists: false },
    });

    for (const product of existing) {
      product.stockBySize = product.sizes.map((size) => ({
        size,
        stock: DEFAULT_STOCK,
      }));

      await product.save();
    }

    console.log(`${existing.length} purane product(s) ko stock mil gaya (har size ${DEFAULT_STOCK}).`);

    // 2) Naye products
    let added = 0;
    let skipped = 0;

    for (const item of newProducts) {
      // Naam se dhoondo (capital/small ka farq nahi)
      const exists = await Product.findOne({ name: item.name }).collation({
        locale: "en",
        strength: 2,
      });

      if (exists) {
        skipped += 1;
        continue;
      }

      await Product.create({
        ...item,
        oldPrice: item.oldPrice ?? undefined,
      });

      added += 1;
    }

    console.log(`${added} naye product(s) add hue, ${skipped} pehle se maujood the.`);

    await mongoose.connection.close();
    console.log("Done.");
  } catch (error) {
    console.error("Failed:", error.message);
    process.exit(1);
  }
}

run();