/*
  Shipping ka rule (checkout par total dikhane ke liye).

  Dhyan rahe: yahi do numbers backend wali file mein bhi hain (server/shippingConfig.js).
  Dono jagah same rakhna. Asal total hamesha backend tay karta hai.
*/

export const FREE_SHIPPING_THRESHOLD = 5000; // itne ya zyada ke order par shipping free
export const SHIPPING_FEE = 250; // is se kam ke order par itni shipping

export function calculateShipping(subtotal) {
  const amount = Number(subtotal) || 0;

  if (amount <= 0 || amount >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }

  return SHIPPING_FEE;
}