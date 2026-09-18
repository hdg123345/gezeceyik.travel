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

// Trust boundary: everything in the body is user input headed for an email.
// Strings only, trimmed, control characters stripped (a newline in "subject"
// is a header-injection attempt), each field capped at what a real enquiry
// needs. Anything else is dropped rather than forwarded.
const LIMITS = { subject: 150, name: 120, email: 200, phone: 40, message: 4000 };
function clean(value, max) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001f\u007f]+/g, " ").trim().slice(0, max);
}
function sanitize(raw) {
  const body = {};
  Object.keys(LIMITS).forEach(function (k) { body[k] = clean(raw[k], LIMITS[k]); });
  // "message" may keep its line breaks; everything else is one line.
  if (typeof raw.message === "string") body.message = raw.message.replace(/[^\S\r\n]+/g, " ").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, LIMITS.message);
  return body;
}
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  let raw = {};
  try {
    raw = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  } catch (e) {
    return res.status(400).json({ ok: false, error: "Geçersiz istek" });
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return res.status(400).json({ ok: false, error: "Geçersiz istek" });
  }
  // Honeypot: the forms carry a hidden "website" field no person fills in.
  // A bot that does gets a success response and nothing is sent.
  if (typeof raw.website === "string" && raw.website.trim()) {
    return res.status(200).json({ ok: true, via: "none" });
  }
  const body = sanitize(raw);
  if (!body.email && !body.message) {
    return res.status(400).json({ ok: false, error: "E-posta veya mesaj gerekli" });
  }
  if (body.email && !EMAIL_RE.test(body.email)) {
    return res.status(400).json({ ok: false, error: "Geçerli bir e-posta adresi girin" });
  }

  // What the server log needs to diagnose a failure, and nothing the
  // visitor wrote: which fields came in and how long they were.
  const shape = "subject=" + body.subject.length + " name=" + body.name.length + " email=" + (body.email ? "yes" : "no") +
                " phone=" + (body.phone ? "yes" : "no") + " message=" + body.message.length;

  try {
    let via = null;
    let lastErr = null;
    const providers = [["web3forms", sendViaWeb3Forms], ["gmail", sendViaGmail]];

    for (let i = 0; i < providers.length; i++) {
      const name = providers[i][0];
      try {
        via = await providers[i][1](body);
        if (via) break;
      } catch (providerErr) {
        lastErr = providerErr;
        // nodemailer errors carry the SMTP verdict: code (EAUTH, ECONNECTION,
        // EENVELOPE...), responseCode (535, 550...) and the command that
        // failed. Web3Forms failures carry their message.
        console.error("booking: " + name + " failed:", providerErr && providerErr.message,
          providerErr && providerErr.code ? "code=" + providerErr.code : "",
          providerErr && providerErr.responseCode ? "smtp=" + providerErr.responseCode : "",
          providerErr && providerErr.command ? "at=" + providerErr.command : "");
        if (providerErr && providerErr.code === "EAUTH") {
          console.error("booking: Gmail rejected the credentials. GMAIL_APP_PASSWORD must be a 16-character App Password " +
            "(Google Account > Security > 2-Step Verification > App passwords), not the account password; GMAIL_USER must be that account.");
        }
      }
    }

    if (!via) {
      if (!lastErr) {
        // Neither provider is configured. The fix belongs in the deployment
        // (.env locally, Environment Variables on Vercel -- see
        // EMAIL_SETUP.md), not in the visitor's face: the client shows its
        // own "write to us at ..." line.
        const has = function (k) { return process.env[k] && String(process.env[k]).trim() ? "set" : "MISSING"; };
        console.error("booking: no email provider configured -- GMAIL_USER " + has("GMAIL_USER") +
          ", GMAIL_APP_PASSWORD " + has("GMAIL_APP_PASSWORD") + ", WEB3FORMS_ACCESS_KEY " + has("WEB3FORMS_ACCESS_KEY") +
          " (values never logged); " + shape);
        return res.status(503).json({ ok: false, error: "E-posta servisi şu an kullanılamıyor" });
      }
      console.error("booking: every configured provider failed; " + shape);
      return res.status(502).json({ ok: false, error: "E-posta gönderilemedi" });
    }

    console.log("booking: sent via " + via + "; " + shape);
    return res.status(200).json({ ok: true, via: via });
  } catch (err) {
    console.error("booking: unexpected failure:", err && err.stack ? err.stack : err, shape);
    return res.status(500).json({ ok: false, error: "E-posta gönderilemedi" });
  }
};
