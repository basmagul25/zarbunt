function Footer() {
  return (
    <footer className="footer">

      <div className="footer-top">

        <div className="footer-brand">
          <h2>
            THE FABRIC
            <br />
            STORE
          </h2>

          <p>
            Premium fabrics and contemporary styles,
            thoughtfully curated for modern Pakistani wardrobes.
          </p>
        </div>

        <div className="footer-column">
          <h3>SHOP</h3>

          <a href="#">New Arrivals</a>
          <a href="#">Unstitched</a>
          <a href="#">Ready To Wear</a>
          <a href="#">Formal</a>
          <a href="#">Sale</a>
        </div>

        <div className="footer-column">
          <h3>HELP</h3>

          <a href="#">Contact Us</a>
          <a href="#">Delivery Information</a>
          <a href="#">Returns & Exchange</a>
          <a href="#">FAQs</a>
        </div>

        <div className="footer-column">
          <h3>FOLLOW</h3>

          <a href="#">Instagram</a>
          <a href="#">Facebook</a>
          <a href="#">TikTok</a>
        </div>

      </div>

      <div className="footer-bottom">

        <p>
          © 2026 The Fabric Store. All rights reserved.
        </p>

        <div>
          <span>PRIVACY</span>
          <span>TERMS</span>
        </div>

      </div>

    </footer>
  );
}

export default Footer;