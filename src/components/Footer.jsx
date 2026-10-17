import { STORE_INFO } from "../storeInfo";

function Footer({ onOpenPolicy, onCategorySelect }) {
  // href="#" wale link par click karne se page upar na jaye
  const handle = (event, action) => {
    event.preventDefault();

    if (action) {
      action();
    }
  };

  const shopLink = (label, category) => (
    <a
      href="#"
      onClick={(event) =>
        handle(
          event,
          onCategorySelect
            ? () => onCategorySelect(category)
            : null
        )
      }
    >
      {label}
    </a>
  );

  const policyLink = (label, page) => (
    <a
      href="#"
      onClick={(event) =>
        handle(
          event,
          onOpenPolicy ? () => onOpenPolicy(page) : null
        )
      }
    >
      {label}
    </a>
  );

  const socialLink = (label, url) =>
    url ? (
      <a href={url} target="_blank" rel="noreferrer">
        {label}
      </a>
    ) : (
      <a href="#" onClick={(event) => handle(event)}>
        {label}
      </a>
    );

  return (
    <footer className="footer">

      <div className="footer-top">

        <div className="footer-brand">
          <h2>
            THE HOUSE OF
            <br />
            ZARBUNT
          </h2>

          <p>
            Premium fabrics and contemporary styles,
            thoughtfully curated for modern Pakistani wardrobes.
          </p>
        </div>

        <div className="footer-column">
          <h3>SHOP</h3>

          {shopLink("New Arrivals", "New Arrivals")}
          {shopLink("Unstitched", "Unstitched")}
          {shopLink("Ready To Wear", "Ready To Wear")}
          {shopLink("Formal", "Formal")}
          {shopLink("Sale", "Sale")}
        </div>

        <div className="footer-column">
          <h3>HELP</h3>

          {policyLink("Contact Us", "contact")}
          {policyLink("Delivery Information", "shipping")}
          {policyLink("Returns & Exchange", "returns")}
          {policyLink("Terms & Conditions", "terms")}
          {policyLink("Privacy Policy", "privacy")}
        </div>

        <div className="footer-column">
          <h3>FOLLOW</h3>

          {socialLink("Instagram", STORE_INFO.social.instagram)}
          {socialLink("Facebook", STORE_INFO.social.facebook)}
          {socialLink("TikTok", STORE_INFO.social.tiktok)}
        </div>

      </div>

      <div className="footer-bottom">

        <p>
          © 2026 {STORE_INFO.name}. All rights reserved.
        </p>

        <div>
          {onOpenPolicy ? (
            <>
              <a
                href="#"
                onClick={(event) =>
                  handle(event, () => onOpenPolicy("privacy"))
                }
              >
                PRIVACY
              </a>

              <a
                href="#"
                onClick={(event) =>
                  handle(event, () => onOpenPolicy("terms"))
                }
              >
                TERMS
              </a>
            </>
          ) : (
            <>
              <span>PRIVACY</span>
              <span>TERMS</span>
            </>
          )}
        </div>

      </div>

    </footer>
  );
}

export default Footer;