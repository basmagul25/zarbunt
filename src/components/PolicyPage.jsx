import "./PolicyPage.css";

import { STORE_INFO } from "../storeInfo";
import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FEE,
} from "../shippingConfig";

const rs = (amount) =>
  `Rs. ${Number(amount).toLocaleString("en-PK")}`;

const PAGES = [
  { key: "terms", label: "Terms & Conditions" },
  { key: "privacy", label: "Privacy Policy" },
  { key: "returns", label: "Returns & Exchange" },
  { key: "shipping", label: "Shipping & Delivery" },
  { key: "contact", label: "Contact Us" },
];

/*
  Har page ka content yahan hai.
  sections ke andar blocks mein: text = paragraph, array = bullet list.
*/

function getContent(key) {
  const { name, email, phone, returnDays, deliveryDays } =
    STORE_INFO;

  if (key === "privacy") {
    return {
      eyebrow: "LEGAL",
      title: "Privacy Policy",
      intro: `This policy explains what personal information ${name} collects, how we use it and the choices you have. By using our website you agree to this policy.`,
      sections: [
        {
          title: "Information we collect",
          blocks: [
            [
              "Account details: your name, email address and password (your password is stored in a protected, hashed form, never as plain text).",
              "Order details: delivery name, phone number, address, city, the items you order and your chosen payment method.",
              "Cart and wishlist: saved in your browser and, when you are signed in, in your account.",
              "Payment information: card payments are handled by our payment partner, Safepay. We receive only the payment status, never your full card number.",
              "Browser storage: a sign-in token and your cart are kept in your browser so you stay signed in and do not lose your cart.",
            ],
          ],
        },
        {
          title: "How we use your information",
          blocks: [
            [
              "To process, deliver and support your orders.",
              "To send order confirmations, order status updates and password reset emails.",
              "To answer your questions and handle returns or exchanges.",
              "To keep our website secure and to meet legal requirements.",
            ],
          ],
        },
        {
          title: "Who we share it with",
          blocks: [
            "We share only what is needed to run your order: delivery partners (your name, phone number and address), our payment partner for card payments, and our email service so we can send you emails. We may also share information if the law requires it.",
            "We do not sell your personal information.",
          ],
        },
        {
          title: "Cookies and tracking",
          blocks: [
            "We use browser storage only to keep you signed in and to remember your cart and wishlist. At the moment we do not use advertising trackers.",
          ],
        },
        {
          title: "Keeping your information safe",
          blocks: [
            "We take reasonable steps to protect your information, including storing passwords in hashed form. No website can promise complete security, so please choose a strong password and keep it private.",
          ],
        },
        {
          title: "Your choices",
          blocks: [
            `You can ask us to show, correct or delete your personal information by writing to ${email}. We may need to keep basic order records for accounting and legal reasons.`,
          ],
        },
        {
          title: "How long we keep information",
          blocks: [
            "We keep your account until you ask us to delete it. Order records are kept for as long as needed for accounting, tax and legal purposes.",
          ],
        },
        {
          title: "Children",
          blocks: [
            "Our website is not meant for children. Please do not place orders if you are under 18 without a parent or guardian.",
          ],
        },
        {
          title: "Changes to this policy",
          blocks: [
            "We may update this policy from time to time. The date at the top shows when it was last changed.",
          ],
        },
        {
          title: "Contact us",
          blocks: [
            `Questions about privacy? Email ${email} or call ${phone}.`,
          ],
        },
      ],
    };
  }

  if (key === "returns") {
    return {
      eyebrow: "HELP",
      title: "Returns & Exchange",
      intro: `We want you to love what you ordered. If something is not right, you can ask for a return or exchange within ${returnDays} days of delivery, as explained below.`,
      sections: [
        {
          title: "What can be returned or exchanged",
          blocks: [
            [
              "Ready to wear: unworn, unwashed and unaltered, with all tags and original packaging.",
              "Unstitched fabric: uncut, unwashed and in its original packaging.",
              "Shawls and wraps: unused, with tags and original packaging.",
            ],
          ],
        },
        {
          title: "What cannot be returned",
          blocks: [
            [
              "Sale items, which are final sale unless they arrive damaged or incorrect.",
              "Items that have been cut, stitched, altered, washed or worn.",
              "Items without tags or original packaging, or damaged after delivery.",
            ],
          ],
        },
        {
          title: "Wrong or damaged items",
          blocks: [
            "If your order arrives damaged or you received the wrong item, please contact us within 48 hours of delivery with your order number and clear photos. An unboxing video helps us a lot. We will replace the item or refund you at no cost to you.",
          ],
        },
        {
          title: "How to request a return or exchange",
          blocks: [
            [
              `Contact us at ${email} or ${phone} within ${returnDays} days of delivery.`,
              "Tell us your order number, the item and the reason.",
              "We will reply with instructions. Please send the item back in its original packaging.",
            ],
          ],
        },
        {
          title: "Exchanges",
          blocks: [
            "You can exchange for a different size or another piece, subject to availability. If the new item costs more or less, we will tell you the difference before we proceed.",
          ],
        },
        {
          title: "Refunds",
          blocks: [
            [
              "Refunds are issued after we receive and check the returned item.",
              "Cash on Delivery orders: refunded by bank transfer or mobile wallet, using the details you give us.",
              "Card payments: refunded to the original card, usually within 7 to 10 working days after approval (your bank may take longer).",
              "Shipping fees are not refunded unless the return is due to our mistake.",
            ],
          ],
        },
        {
          title: "Return shipping",
          blocks: [
            "You pay the return shipping cost, unless the item was wrong or damaged when it reached you.",
          ],
        },
        {
          title: "Cancelling an order",
          blocks: [
            "You can cancel an order yourself from My Orders until it is shipped. If you paid by card, please contact us to cancel and arrange a refund.",
          ],
        },
      ],
    };
  }

  if (key === "shipping") {
    return {
      eyebrow: "HELP",
      title: "Shipping & Delivery",
      intro: `We deliver across Pakistan. Here is what to expect after you place an order with ${name}.`,
      sections: [
        {
          title: "Processing time",
          blocks: [
            "Orders are processed within 1 to 2 working days. You will get an email when your order is confirmed and when it ships.",
          ],
        },
        {
          title: "Delivery time",
          blocks: [
            `Delivery usually takes ${deliveryDays} after dispatch. Remote areas can take a little longer.`,
          ],
        },
        {
          title: "Shipping charges",
          blocks: [
            [
              `Orders of ${rs(FREE_SHIPPING_THRESHOLD)} or more: free shipping.`,
              `Orders below ${rs(FREE_SHIPPING_THRESHOLD)}: a flat shipping fee of ${rs(SHIPPING_FEE)}.`,
            ],
            "The shipping fee is always shown at checkout before you pay.",
          ],
        },
        {
          title: "Payment on delivery",
          blocks: [
            "Cash on Delivery is available across Pakistan. Please keep the payment ready when the rider arrives.",
          ],
        },
        {
          title: "Order updates",
          blocks: [
            "You can follow your order status any time in My Orders. We also email you when the status changes.",
          ],
        },
        {
          title: "Correct address and phone number",
          blocks: [
            "Please check your address and phone number carefully. We are not responsible for delays caused by incorrect or incomplete details. If a delivery attempt fails, the courier will try to contact you, and the parcel may be returned to us.",
          ],
        },
        {
          title: "Delays",
          blocks: [
            "Weather, public holidays and sale periods can slow down deliveries. We will do our best to keep you informed.",
          ],
        },
        {
          title: "Damaged in transit",
          blocks: [
            "If your parcel arrives damaged, please contact us within 48 hours of delivery with photos. See our Returns & Exchange page for details.",
          ],
        },
      ],
    };
  }

  if (key === "contact") {
    return {
      eyebrow: "HELP",
      title: "Contact Us",
      intro:
        "We are happy to help with orders, sizes, returns or anything else. Please include your order number so we can help you faster.",
      sections: [],
    };
  }

  // terms
  return {
    eyebrow: "LEGAL",
    title: "Terms & Conditions",
    intro: `Please read these terms carefully before using the ${name} website or placing an order.`,
    sections: [
      {
        title: "1. Using our website",
        blocks: [
          "By browsing our website or placing an order you agree to these terms. If you do not agree, please do not use the website.",
        ],
      },
      {
        title: "2. Products and colours",
        blocks: [
          "We try to show our products as accurately as we can. Colours may look slightly different on different screens, and measurements and fabric lengths are approximate. Prints and embroidery can vary a little from piece to piece.",
        ],
      },
      {
        title: "3. Prices",
        blocks: [
          "All prices are in Pakistani Rupees (PKR) and can change without notice. The price you see at checkout is the price you pay. If we find a pricing mistake, we may cancel the order and tell you.",
        ],
      },
      {
        title: "4. Orders",
        blocks: [
          "Placing an order is an offer to buy. We confirm your order by email and by updating its status. We may cancel an order if an item is out of stock, if details are incomplete, or if we suspect misuse. If you have already paid, we will refund you in full.",
        ],
      },
      {
        title: "5. Payment",
        blocks: [
          "We accept Cash on Delivery and debit or credit cards. Card payments are processed securely by Safepay. We never see or store your full card number.",
        ],
      },
      {
        title: "6. Your account",
        blocks: [
          "Please keep your password private. You are responsible for activity under your account, and for giving us correct information.",
        ],
      },
      {
        title: "7. Shipping, returns and exchanges",
        blocks: [
          "Delivery, returns and exchanges follow our Shipping & Delivery and Returns & Exchange pages, which are part of these terms.",
        ],
      },
      {
        title: "8. Our content",
        blocks: [
          `The photos, text, logo and design on this website belong to ${name}. Please do not copy or use them without our written permission.`,
        ],
      },
      {
        title: "9. Limitation of liability",
        blocks: [
          "To the extent the law allows, we are not responsible for indirect or consequential loss from using the website. Our responsibility for any order is limited to the price you paid for it.",
        ],
      },
      {
        title: "10. Governing law",
        blocks: ["These terms are governed by the laws of Pakistan."],
      },
      {
        title: "11. Changes",
        blocks: [
          "We may update these terms from time to time. The date at the top shows when they were last changed.",
        ],
      },
      {
        title: "12. Contact",
        blocks: [
          `Questions about these terms? Email ${email} or call ${phone}.`,
        ],
      },
    ],
  };
}

function getContactCards() {
  const { email, phone, whatsapp, address, hours } =
    STORE_INFO;

  return [
    {
      label: "EMAIL",
      value: email,
      href: `mailto:${email}`,
    },
    {
      label: "PHONE",
      value: phone,
      href: `tel:${String(phone).replace(/\s+/g, "")}`,
    },
    whatsapp
      ? {
          label: "WHATSAPP",
          value: `+${String(whatsapp).replace(/\D/g, "")}`,
          href: `https://wa.me/${String(whatsapp).replace(/\D/g, "")}`,
        }
      : null,
    {
      label: "ADDRESS",
      value: address,
    },
    {
      label: "OPENING HOURS",
      value: hours,
    },
  ].filter(Boolean);
}

function PolicyPage({ page, onBack, onNavigate }) {
  const content = getContent(page);

  return (
    <main className="policy-page">
      <div className="policy-container">
        <div className="policy-top">
          <button
            type="button"
            className="policy-back"
            onClick={onBack}
          >
            ← BACK TO SHOP
          </button>

          <span className="policy-brand">
            {STORE_INFO.name.toUpperCase()}
          </span>
        </div>

        <nav className="policy-tabs" aria-label="Help and policies">
          {PAGES.map((item) => (
            <button
              type="button"
              key={item.key}
              className={`policy-tab ${
                item.key === page ? "policy-tab-active" : ""
              }`}
              onClick={() => onNavigate(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <article className="policy-article">
          <p className="policy-eyebrow">{content.eyebrow}</p>

          <h1>{content.title}</h1>

          {page !== "contact" && (
            <p className="policy-updated">
              Last updated: {STORE_INFO.policyUpdated}
            </p>
          )}

          {content.intro && (
            <p className="policy-intro">{content.intro}</p>
          )}

          {content.sections.map((section) => (
            <section
              className="policy-section"
              key={section.title}
            >
              <h2>{section.title}</h2>

              {section.blocks.map((block, index) =>
                Array.isArray(block) ? (
                  <ul key={index}>
                    {block.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                ) : (
                  <p key={index}>{block}</p>
                )
              )}
            </section>
          ))}

          {page === "contact" && (
            <>
              <div className="contact-cards">
                {getContactCards().map((card) => (
                  <div
                    className="contact-card"
                    key={card.label}
                  >
                    <span>{card.label}</span>

                    {card.href ? (
                      <a
                        href={card.href}
                        target={
                          card.href.startsWith("http")
                            ? "_blank"
                            : undefined
                        }
                        rel="noreferrer"
                      >
                        {card.value}
                      </a>
                    ) : (
                      <strong>{card.value}</strong>
                    )}
                  </div>
                ))}
              </div>

              <a
                className="policy-mail-btn"
                href={`mailto:${STORE_INFO.email}`}
              >
                WRITE TO US →
              </a>
            </>
          )}
        </article>
      </div>
    </main>
  );
}

export default PolicyPage;