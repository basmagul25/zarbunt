function CategorySection() {
  const categories = [
    {
      number: "01",
      title: "Unstitched",
      subtitle: "FABRIC EDIT",
      description: "Prints, textures and embroidered 2 & 3 piece edits.",
      className: "category-one",
      category: "Unstitched",
    },
    {
      number: "02",
      title: "Ready To Wear",
      subtitle: "PRET EDIT",
      description: "Effortless silhouettes for everyday Pakistani dressing.",
      className: "category-two",
      category: "Ready To Wear",
    },
    {
      number: "03",
      title: "Shawls",
      subtitle: "WINTER EDIT",
      description: "Soft layers and statement textures for cooler days.",
      className: "category-three",
      category: "Shawl",
    },
  ];

  const exploreCategory = (category) => {
    window.dispatchEvent(
      new CustomEvent("changeProductCategory", { detail: category })
    );
    setTimeout(() => {
      document.getElementById("products")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  return (
    <section className="category-section">
      <div className="section-heading">
        <div>
          <p className="section-label">SHOP BY EDIT</p>
          <h2>Find your<br /><em>next look.</em></h2>
        </div>
        <p className="section-intro">
          From everyday lawn to polished pret and winter shawls,
          explore the collections shaping this season.
        </p>
      </div>

      <div className="category-grid">
        {categories.map((category) => (
          <article
            className={`category-card ${category.className}`}
            key={category.number}
            onClick={() => exploreCategory(category.category)}
          >
            <div className="category-top">
              <span>{category.number}</span>
              <small>{category.subtitle}</small>
            </div>
            <div className="category-info">
              <h3>{category.title}</h3>
              <p>{category.description}</p>
              <button>
                SHOP EDIT <span>↗</span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default CategorySection;
