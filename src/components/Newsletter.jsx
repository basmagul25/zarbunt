import { useState } from "react";

function Newsletter() {
  const [email, setEmail] =
    useState("");

  const [submitted, setSubmitted] =
    useState(false);

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    if (!email.trim()) {
      return;
    }

    setSubmitted(true);
    setEmail("");
  };

  return (
    <section className="newsletter">
      <div className="newsletter-content">
        <p className="section-label">
          STAY IN THE LOOP
        </p>

        <h2>
          Something New
          <br />
          Is Always Coming.
        </h2>

        <p className="newsletter-description">
          Sign up for new collection
          launches, exclusive edits
          and updates from Zarbunt.
        </p>

        {submitted ? (
          <div className="newsletter-success">
            THANK YOU — YOU'RE ON THE LIST.
          </div>
        ) : (
          <form
            className="newsletter-form"
            onSubmit={
              handleSubmit
            }
          >
            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="Enter your email address"
              required
            />

            <button type="submit">
              SUBSCRIBE →
            </button>
          </form>
        )}
      </div>

      <div className="newsletter-side">
        <span>
          FABRIC
        </span>

        <strong>
          26
        </strong>

        <span>
          COLLECTION
        </span>
      </div>
    </section>
  );
}

export default Newsletter;