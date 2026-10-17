const Product = require("../models/Product");

/*
|--------------------------------------------------------------------------
| Har size ka stock sambhalne ke helper
|
| reserveStock  : order banate waqt stock kam karta hai
| releaseStock  : order na ban paye to wahi stock wapas karta hai
| restoreOrderStock : order cancel hone par uska stock wapas karta hai
|--------------------------------------------------------------------------
*/

// Reserve kiya hua stock wapas karo
async function releaseStock(reserved = []) {
  for (const item of reserved) {
    await Product.updateOne(
      {
        _id: item.productId,
        "stockBySize.size": item.size,
      },
      {
        $inc: {
          "stockBySize.$.stock": item.quantity,
        },
      }
    );
  }
}

/*
  items: [{ productId, size, quantity, name }]

  Stock ek hi step mein check aur kam hota hai (atomic), isliye do log
  ek saath aakhri piece nahi kharid sakte.

  Return:
    { ok: true,  reserved: [...] }
    { ok: false, message: "..." }
*/
async function reserveStock(items) {
  const reserved = [];

  for (const item of items) {
    // Bina size wale product ka stock track nahi hota
    if (!item.size) {
      continue;
    }

    const result = await Product.updateOne(
      {
        _id: item.productId,
        stockBySize: {
          $elemMatch: {
            size: item.size,
            stock: { $gte: item.quantity },
          },
        },
      },
      {
        $inc: {
          "stockBySize.$.stock": -item.quantity,
        },
      }
    );

    if (result.modifiedCount === 1) {
      reserved.push({
        productId: item.productId,
        size: item.size,
        quantity: item.quantity,
      });

      continue;
    }

    // Kam nahi hua: ya stock kam hai, ya is size ka stock track hi nahi hota
    const product = await Product.findById(item.productId);

    const entry = product?.stockBySize?.find(
      (stockEntry) => stockEntry.size === item.size
    );

    if (!entry) {
      continue;
    }

    // Jo stock pehle kam kar chuke the wo wapas karo
    await releaseStock(reserved);

    return {
      ok: false,
      message:
        entry.stock > 0
          ? `Only ${entry.stock} left in size ${item.size} for ${item.name}. Please reduce the quantity.`
          : `${item.name} (size ${item.size}) is sold out. Please remove it from your cart.`,
    };
  }

  return { ok: true, reserved };
}

// Order cancel hone par uske saare items ka stock wapas
async function restoreOrderStock(order) {
  const items = (order.items || []).map((item) => ({
    productId: item.productId,
    size: item.size,
    quantity: item.quantity,
  }));

  await releaseStock(items.filter((item) => item.size));
}

module.exports = {
  reserveStock,
  releaseStock,
  restoreOrderStock,
};