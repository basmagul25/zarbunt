const products = [
  {
    id: 1,
    name: "Lavender Garden Lawn",
    category: "Unstitched",
    price: 3490,
    badge: "NEW",
    initial: "01",
    artClass: "art-ivory",
    image:
      "https://images.pexels.com/photos/36325934/pexels-photo-36325934.jpeg?auto=compress&cs=tinysrgb&w=900",
  },

  {
    id: 2,
    name: "Emerald Heritage",
    category: "Unstitched",
    price: 4290,
    badge: "NEW",
    initial: "02",
    artClass: "art-sage",
    image:
      "https://images.pexels.com/photos/35902080/pexels-photo-35902080.jpeg?auto=compress&cs=tinysrgb&w=900",
  },

  {
    id: 3,
    name: "Mint Pearl Embroidery",
    category: "Formal",
    price: 6990,
    badge: "NEW",
    initial: "03",
    artClass: "art-mint",
    image:
      "https://images.pexels.com/photos/36104914/pexels-photo-36104914.jpeg?auto=compress&cs=tinysrgb&w=900",
  },

  {
    id: 4,
    name: "Azure Evening Edit",
    category: "Ready To Wear",
    price: 4890,
    badge: "NEW",
    initial: "04",
    artClass: "art-blue",
    image:
      "https://images.unsplash.com/photo-1702974779315-339d4265805d?auto=format&fit=crop&w=900&q=80",
  },

  {
    id: 5,
    name: "Pearl Mist",
    category: "Unstitched",
    price: 3790,
    badge: "NEW",
    initial: "05",
    artClass: "art-pearl",
    image:
      "https://images.unsplash.com/photo-1773439879064-53483d0ce0d1?auto=format&fit=crop&w=900&q=80",
  },

  {
    id: 6,
    name: "Sage Garden Suit",
    category: "Ready To Wear",
    price: 5290,
    badge: "NEW",
    initial: "06",
    artClass: "art-sage",
    image:
      "https://images.unsplash.com/photo-1773439878222-c383967772de?auto=format&fit=crop&w=900&q=80",
  },

  {
    id: 7,
    name: "Ivory Bloom",
    category: "Unstitched",
    price: 3990,
    badge: "NEW",
    initial: "07",
    artClass: "art-ivory",
    image:
      "https://images.unsplash.com/photo-1773439877855-cd193d949717?auto=format&fit=crop&w=900&q=80",
  },

  {
    id: 8,
    name: "Rosewater Formal",
    category: "Formal",
    price: 7490,
    badge: "NEW",
    initial: "08",
    artClass: "art-rose",
    image:
      "https://images.unsplash.com/photo-1773439878392-74abd38c55ec?auto=format&fit=crop&w=900&q=80",
  },

  {
    id: 9,
    name: "Noor Embroidered Shawl",
    category: "Shawl",
    price: 5490,
    badge: "NEW",
    initial: "09",
    artClass: "art-noor",
    image:
      "https://images.unsplash.com/photo-1773439877634-e6ef9f571c12?auto=format&fit=crop&w=900&q=80",
  },

  {
    id: 10,
    name: "Winter Bloom Shawl",
    category: "Shawl",
    price: 6290,
    badge: "POPULAR",
    initial: "10",
    artClass: "art-winter",
    image:
      "https://images.unsplash.com/photo-1773439877255-55e63cf17b2c?auto=format&fit=crop&w=900&q=80",
  },

  {
    id: 11,
    name: "Mehfil Blue Shawl",
    category: "Shawl",
    price: 5790,
    badge: "NEW",
    initial: "11",
    artClass: "art-blue",
    image:
      "https://images.unsplash.com/photo-1773439877634-e6ef9f571c12?auto=format&fit=crop&w=900&q=80",
  },

  {
    id: 12,
    name: "Winter Sage Wrap",
    category: "Shawl",
    price: 5990,
    badge: "POPULAR",
    initial: "12",
    artClass: "art-sage",
    image:
      "https://images.unsplash.com/photo-1773439877255-55e63cf17b2c?auto=format&fit=crop&w=900&q=80",
  },

  {
    id: 13,
    name: "Midnight Formal",
    category: "Formal",
    price: 5990,
    badge: "POPULAR",
    initial: "13",
    artClass: "art-midnight",
    image:
      "https://images.unsplash.com/photo-1773439878338-c61b0fe9ed48?auto=format&fit=crop&w=900&q=80",
  },

  {
    id: 14,
    name: "Celeste Embroidered",
    category: "Formal",
    price: 7990,
    badge: "LIMITED",
    initial: "14",
    artClass: "art-mint",
    image:
      "https://images.pexels.com/photos/36325934/pexels-photo-36325934.jpeg?auto=compress&cs=tinysrgb&w=900",
  },

  {
    id: 15,
    name: "Rosewood Jacquard",
    category: "Ready To Wear",
    price: 4890,
    badge: "LIMITED",
    initial: "15",
    artClass: "art-rose",
    image:
      "https://images.unsplash.com/photo-1773439878392-74abd38c55ec?auto=format&fit=crop&w=900&q=80",
  },

  {
    id: 16,
    name: "Olive Silk Kurta",
    category: "Ready To Wear",
    price: 4590,
    badge: "NEW",
    initial: "16",
    artClass: "art-sage",
    image:
      "https://images.pexels.com/photos/35902080/pexels-photo-35902080.jpeg?auto=compress&cs=tinysrgb&w=900",
  },

  {
    id: 17,
    name: "Moss Green Kurta Set",
    category: "Ready To Wear",
    price: 3990,
    oldPrice: 4990,
    badge: "SALE",
    initial: "17",
    artClass: "art-moss",
    image:
      "https://images.unsplash.com/photo-1773439878222-c383967772de?auto=format&fit=crop&w=900&q=80",
  },

  {
    id: 18,
    name: "Terracotta Linen Edit",
    category: "Unstitched",
    price: 3190,
    oldPrice: 3990,
    badge: "SALE",
    initial: "18",
    artClass: "art-terracotta",
    image:
      "https://images.unsplash.com/photo-1773439878392-74abd38c55ec?auto=format&fit=crop&w=900&q=80",
  },

  {
    id: 19,
    name: "Pearl Evening Ensemble",
    category: "Formal",
    price: 6990,
    oldPrice: 8490,
    badge: "SALE",
    initial: "19",
    artClass: "art-pearl",
    image:
      "https://images.pexels.com/photos/36104914/pexels-photo-36104914.jpeg?auto=compress&cs=tinysrgb&w=900",
  },

  {
    id: 20,
    name: "Midnight Silk Set",
    category: "Ready To Wear",
    price: 4490,
    oldPrice: 5790,
    badge: "SALE",
    initial: "20",
    artClass: "art-silk",
    image:
      "https://images.unsplash.com/photo-1773439878338-c61b0fe9ed48?auto=format&fit=crop&w=900&q=80",
  },

  {
    id: 21,
    name: "Blue Dusk Shawl",
    category: "Shawl",
    price: 4790,
    oldPrice: 5790,
    badge: "SALE",
    initial: "21",
    artClass: "art-blue",
    image:
      "https://images.unsplash.com/photo-1705921266774-2d902f6d0079?auto=format&fit=crop&w=900&q=80",
  },

  {
    id: 22,
    name: "Beige Rose Lawn",
    category: "Unstitched",
    price: 2890,
    oldPrice: 3690,
    badge: "SALE",
    initial: "22",
    artClass: "art-terracotta",
    image:
      "https://images.unsplash.com/photo-1773439877255-55e63cf17b2c?auto=format&fit=crop&w=900&q=80",
  },

  {
    id: 23,
    name: "Mint Occasion Set",
    category: "Ready To Wear",
    price: 5190,
    oldPrice: 6490,
    badge: "SALE",
    initial: "23",
    artClass: "art-mint",
    image:
      "https://images.unsplash.com/photo-1773439879064-53483d0ce0d1?auto=format&fit=crop&w=900&q=80",
  },

  {
    id: 24,
    name: "Emerald Festive Edit",
    category: "Formal",
    price: 6490,
    oldPrice: 7990,
    badge: "SALE",
    initial: "24",
    artClass: "art-emerald",
    image:
      "https://images.pexels.com/photos/35902080/pexels-photo-35902080.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
];

export default products;