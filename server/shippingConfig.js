/*
  Shipping ka rule yahin se badlo.

  Dhyan rahe: yahi do numbers frontend wali file mein bhi hain (src/shippingConfig.js).
  Dono jagah same rakhna, warna checkout par dikhne wala total aur asal total alag ho jayenge.
  (Asal total hamesha yahi file tay karti hai.)
*/

const FREE_SHIPPING_THRESHOLD = 5000; // itne ya zyada ke order par shipping free
const SHIPPING_FEE = 250; // is se kam ke order par itni shipping

function calculateShipping(subtotal) {
  const amount = Number(subtotal) || 0;

  if (amount <= 0 || amount >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }

  return SHIPPING_FEE;
}

module.exports = {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FEE,
  calculateShipping,
};