const nodemailer = require("nodemailer");

const INQUIRY_TO = process.env.INQUIRY_TO || "gezeceyik1travel@gmail.com";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function buildEmailText(body) {
  return [
    "gezeceyik.travel — yeni form gönderimi",
    "",
    "Konu: " + (body.subject || "—"),
    "Ad: " + (body.name || "—"),
    "E-posta: " + (body.email || "—"),
    "Telefon: " + (body.phone || "—"),
    "",
    "Mesaj:",
    body.message || "—"
  ].join("\n");
}

async function sendViaWeb3Forms(body) {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) return null;

  const response = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      access_key: accessKey,
      subject: body.subject || "gezeceyik — Yeni talep",
      from_name: body.name || "gezeceyik",
      email: body.email || INQUIRY_TO,
      replyto: body.email || "",
      phone: body.phone || "",
      message: buildEmailText(body)
    })
  });

  const data = await response.json().catch(function () {
    return {};
  });
  if (data.success) return "web3forms";
  throw new Error(data.message || "Web3Forms gönderimi başarısız");
}

async function sendViaGmail(body) {
  const user = process.env.GMAIL_USER;
  const pass = (process.env.GMAIL_APP_PASSWORD || "").replace(/\s/g, "");
  if (!user || !pass) return null;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass }
  });

  await transporter.sendMail({
    from: '"gezeceyik" <' + user + ">",
    to: INQUIRY_TO,
    replyTo: body.email || user,
    subject: body.subject || "gezeceyik — Yeni talep",
    text: buildEmailText(body)
  });

  return "gmail";
}

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  if (!body.email && !body.message) {
    return res.status(400).json({ ok: false, error: "E-posta veya mesaj gerekli" });
  }

  try {
    let via = null;
    const providers = [sendViaWeb3Forms, sendViaGmail];

    for (let i = 0; i < providers.length; i++) {
      try {
        via = await providers[i](body);
        if (via) break;
      } catch (providerErr) {
        if (i === providers.length - 1 && !via) throw providerErr;
      }
    }

    if (!via) {
      return res.status(503).json({
        ok: false,
        error:
          "E-posta servisi yapılandırılmamış. Vercel ortam değişkenlerine GMAIL_USER + GMAIL_APP_PASSWORD veya WEB3FORMS_ACCESS_KEY ekleyin."
      });
    }

    return res.status(200).json({ ok: true, via: via });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message || "E-posta gönderilemedi"
    });
  }
};
