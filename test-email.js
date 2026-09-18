// Sends one test submission through api/booking.js with the .env credentials,
// exactly as the site does. Usage: npm run email:test
require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const handler = require("./api/booking");

const res = {
  code: 200,
  setHeader() { return this; },
  status(c) { this.code = c; return this; },
  json(d) { console.log("HTTP " + this.code, JSON.stringify(d)); if (this.code !== 200) process.exitCode = 1; return this; },
  end() { return this; }
};
handler({
  method: "POST",
  body: {
    subject: "gezeceyik — test gönderimi",
    name: "Test (npm run email:test)",
    email: process.env.INQUIRY_TO || "gezeceyik1travel@gmail.com",
    phone: "",
    message: "Bu bir test mesajıdır — Türkçe karakterler: çğıöşü ÇĞİÖŞÜ. Gelen kutusunu ve spam klasörünü kontrol edin."
  }
}, res).then(function () {
  if (res.code === 200) console.log("Sent. Check the inbox (and spam) of " + (process.env.INQUIRY_TO || "gezeceyik1travel@gmail.com") + ".");
});
