function Hero() {

  const scrollToProducts = () => {
    document
      .getElementById("products")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  const scrollToCollections = () => {
    document
      .getElementById("collections")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  return (
    <section className="hero">

      <div className="hero-content">

        <p className="hero-small-text">
          THE NEW SEASON EDIT
        </p>

        <h1>
          Dress Your
          <br />
          Story.
        </h1>

        <p className="hero-description">
          Discover contemporary Pakistani fashion,
          refined fabrics and timeless pieces
          designed for every chapter of your style.
        </p>

        <div className="hero-buttons">

          <button
            className="hero-btn primary-btn"
            onClick={scrollToProducts}
          >
            SHOP NEW IN
          </button>

          <button
            className="hero-btn secondary-btn"
            onClick={scrollToCollections}
          >
            EXPLORE COLLECTIONS
          </button>

        </div>

        <div className="hero-meta">

          <span>01 — NEW SEASON</span>

          <span>
            PREMIUM PAKISTANI EDIT
          </span>

        </div>

      </div>

      <div className="hero-image">

        <img
          src="https://images.pexels.com/photos/36325934/pexels-photo-36325934.jpeg?auto=compress&cs=tinysrgb&w=1400"
          alt="Model wearing an elegant Pakistani outfit"
        />

        <div className="hero-image-overlay"></div>

        <div className="hero-image-text">

          <span>THE FABRIC STORE</span>

          <strong>NEW IN</strong>

        </div>

      </div>

    </section>
  );
}

export default Hero;