const nodemailer = require("nodemailer");

/*
  Email bhejne ka ek hi jagah ka intezaam.

  Do tareeqe hain, jo .env mein set ho wahi chalta hai:

  1) Brevo (HTTPS):   BREVO_API_KEY set ho to Brevo ki API se email jati hai.
                       Live hosting (Render free) par yahi chalega, kyunki wahan SMTP band hai.
  2) SMTP (Gmail):    SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS set hon to Nodemailer se.
                       Computer par testing ke liye theek hai.

  Dono set na hon to getMailer() null deta hai aur email skip ho jati hai (order phir bhi ban jata hai).
*/

// "Zarbunt <abc@gmail.com>" ya "abc@gmail.com" ko { name, email } mein badalna
function parseAddress(value) {
  const text = String(value || "").trim();
  const match = text.match(/^(.*)<([^>]+)>\s*$/);

  if (match) {
    const name = match[1].trim().replace(/^"|"$/g, "");
    const email = match[2].trim();

    return name ? { name, email } : { email };
  }

  return { email: text };
}

function createBrevoMailer(apiKey) {
  return {
    async sendMail({ from, to, subject, text, html }) {
      const recipients = (Array.isArray(to) ? to : [to])
        .filter(Boolean)
        .map((address) => ({ email: String(address).trim() }));

      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          sender: parseAddress(from),
          to: recipients,
          subject,
          htmlContent: html,
          textContent: text,
        }),
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => "");

        throw new Error(
          `Brevo email failed (${response.status}): ${detail.slice(0, 200)}`
        );
      }

      return response.json().catch(() => ({}));
    },
  };
}

function getMailer() {
  if (process.env.BREVO_API_KEY) {
    return createBrevoMailer(process.env.BREVO_API_KEY);
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  return null;
}

module.exports = { getMailer, parseAddress };