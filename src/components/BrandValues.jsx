function BrandValues() {
  const values = [
    {
      number: "01",
      title: "Premium Quality",
      description:
        "Thoughtfully selected fabrics with a focus on texture, comfort and finish.",
    },
    {
      number: "02",
      title: "Made For You",
      description:
        "Versatile collections designed to fit everyday style and special occasions.",
    },
    {
      number: "03",
      title: "Nationwide Delivery",
      description:
        "Reliable delivery across Pakistan, bringing your favourite fabrics closer.",
    },
    {
      number: "04",
      title: "Easy Shopping",
      description:
        "A simple and enjoyable experience from discovering fabrics to checkout.",
    },
  ];

  return (
    <section className="brand-values">

      <div className="values-header">
        <p className="section-label">THE DIFFERENCE</p>

        <h2>
          Designed Around
          <br />
          Your Style.
        </h2>
      </div>

      <div className="values-grid">
        {values.map((value) => (
          <div className="value-item" key={value.number}>

            <span className="value-number">
              {value.number}
            </span>

            <h3>{value.title}</h3>

            <p>{value.description}</p>

          </div>
        ))}
      </div>

    </section>
  );
}

export default BrandValues;