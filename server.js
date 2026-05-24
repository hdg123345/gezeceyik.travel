/**
 * Local dev server: static site + POST /api/booking (same handler as Vercel).
 * Usage: copy .env.example → .env, fill Gmail or Web3Forms keys, then npm run dev
 */
require("dotenv").config();

const http = require("http");
const fs = require("fs");
const path = require("path");
const bookingHandler = require("./api/booking");

const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2"
};

function createResAdapter(nodeRes) {
  let statusCode = 200;
  const headers = {};
  return {
    setHeader(name, value) {
      headers[name] = value;
      return this;
    },
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      if (!headers["Content-Type"]) headers["Content-Type"] = "application/json; charset=utf-8";
      nodeRes.writeHead(statusCode, headers);
      nodeRes.end(JSON.stringify(data));
    },
    end(chunk) {
      nodeRes.writeHead(statusCode, headers);
      nodeRes.end(chunk);
    }
  };
}

function readBody(req) {
  return new Promise(function (resolve, reject) {
    const chunks = [];
    req.on("data", function (c) {
      chunks.push(c);
    });
    req.on("end", function () {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
    req.on("error", reject);
  });
}

function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";
  const filePath = path.normalize(path.join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(filePath, function (err, data) {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer(async function (req, res) {
  if (req.method === "OPTIONS" && req.url === "/api/booking") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    res.end();
    return;
  }

  if (req.url === "/api/booking" && req.method === "POST") {
    try {
      const raw = await readBody(req);
      const vercelReq = { method: "POST", body: raw };
      await bookingHandler(vercelReq, createResAdapter(res));
    } catch (err) {
      console.error("Booking API error:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: err.message || "Server error" }));
    }
    return;
  }

  if (req.method === "GET" || req.method === "HEAD") {
    serveStatic(req, res);
    return;
  }

  res.writeHead(405);
  res.end("Method not allowed");
});

server.listen(PORT, function () {
  const hasGmail = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD;
  const hasWeb3 = process.env.WEB3FORMS_ACCESS_KEY;
  console.log("gezeceyik dev server → http://localhost:" + PORT);
  console.log("  Open: http://localhost:" + PORT + "/index.html");
  if (!hasGmail && !hasWeb3) {
    console.warn("");
    console.warn("  ⚠ E-posta yapılandırılmadı. .env.example dosyasını .env olarak kopyalayıp");
    console.warn("    GMAIL_USER + GMAIL_APP_PASSWORD veya WEB3FORMS_ACCESS_KEY ekleyin.");
    console.warn("");
  } else {
    console.log("  ✓ E-posta gönderimi: " + (hasGmail ? "Gmail" : "Web3Forms"));
    console.log("  ✓ Alıcı: " + (process.env.INQUIRY_TO || "gezeceyik1travel@gmail.com"));
  }
});
