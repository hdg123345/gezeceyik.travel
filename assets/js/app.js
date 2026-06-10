(function premiumPolish() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const header = document.querySelector("header.site-top");
  const contactSection = document.getElementById("contactFormSection");
  const contactContainer = document.querySelector(".contact-form-container");
  const contactHint = document.getElementById("contactHint");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 20);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (!reduce && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) e.target.classList.add("is-visible");
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
    );
    document.querySelectorAll("#tour-full section").forEach(function (el) {
      el.classList.add("fade-in-section");
      io.observe(el);
    });
  }
  if (contactSection && contactContainer && "IntersectionObserver" in window) {
    const formObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            contactContainer.classList.add("is-visible");
            document.body.classList.add("form-active");
          } else {
            contactContainer.classList.remove("is-visible");
            document.body.classList.remove("form-active");
          }
        });
      },
      { threshold: 0.3 }
    );
    formObserver.observe(contactSection);
  }
  if (contactHint && contactSection) {
    contactHint.addEventListener("click", function () {
      contactSection.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  var countryCodeInput = document.querySelector('input[name="country_code"]');
  if (countryCodeInput) {
    countryCodeInput.addEventListener("input", function () {
      this.value = this.value.replace(/\D/g, "").slice(0, 4);
    });
  }

  document.addEventListener("gezeceyik-view", function (e) {
    if (e.detail && e.detail.tour) {
      document.querySelectorAll("#tour-full section").forEach(function (el) {
        el.classList.add("is-visible");
      });
    }
    if (e.detail && e.detail.tour) {
      document.body.classList.remove("form-active");
    }
  });

  function hydrateImages() {
    document.querySelectorAll("img").forEach(function (img) {
      img.classList.add("loading");
      const done = function () {
        img.classList.remove("loading");
        img.classList.add("loaded");
      };
      if (img.complete && img.naturalWidth) done();
      else img.addEventListener("load", done, { once: true });
      img.addEventListener(
        "error",
        function () {
          img.classList.remove("loading");
        },
        { once: true }
      );
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", hydrateImages);
  else hydrateImages();
})();

function L() {
  const v = (document.documentElement.getAttribute("data-lang") || "tr").toLowerCase();
  return v === "en" || v.startsWith("en-") ? "en" : "tr";
}

const INQUIRY_EMAIL = "gezeceyik1travel@gmail.com";

async function sendInquiryEmail(fields) {
  const payload = {
    subject: fields.subject || "gezeceyik — Yeni talep",
    name: fields.name || "—",
    email: fields.email || "",
    phone: fields.phone || "",
    message: fields.message || ""
  };
  const res = await fetch("/api/booking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(function () {
    return {};
  });
  if (res.ok && data.ok) return data;
  const lang = document.documentElement.getAttribute("data-lang") === "en" ? "en" : "tr";
  const fallback =
    lang === "en"
      ? "Could not send. Please email " + INQUIRY_EMAIL
      : "Gönderilemedi. Lütfen " + INQUIRY_EMAIL + " adresine yazın.";
  throw new Error(data.error || fallback);
}

const TOUR_BOOKING_LABELS = {
  backpacking: { tr: "Phuket & Bangkok · Backpacking", en: "Phuket & Bangkok · Backpacking" },
  phuket: { tr: "Phuket & Bangkok · Comfort", en: "Phuket & Bangkok · Comfort" },
  tomorrowland: {
    tr: "Phuket, Bangkok & Tomorrowland · Luxury",
    en: "Phuket, Bangkok & Tomorrowland · Luxury"
  }
};

const PAYMENT_OPTIONS = [
  { value: "transfer", tr: "Havale / EFT", en: "Bank transfer / EFT" },
  { value: "card", tr: "Kredi kartı", en: "Credit card" },
  { value: "cash", tr: "Nakit", en: "Cash" },
  { value: "other", tr: "Diğer (mesajda belirtin)", en: "Other (specify in message)" }
];

function getProgramDaysForTour(tourKey) {
  const lang = L();
  let days;
  if (tourKey === "tomorrowland") {
    days = applyTmlHotelNames(
      withDeparturePort(
        lang === "en" ? programDays_tml_en : programDays_tml,
        lang,
        "tomorrowland"
      )
    );
  } else if (tourKey === "backpacking") {
    days = withDeparturePort(
      lang === "en" ? programDays_en : programDays,
      lang,
      "backpacking"
    );
  } else {
    days = withDeparturePort(
      lang === "en" ? programDays_en : programDays,
      lang,
      "phuket"
    );
  }
  return applyNarrativeFlightTokens(
    mergeProgramSchedule(days, lang, tourKey),
    tourKey,
    currentDeparturePort,
    lang
  );
}

function getOptionalAddonsForTour(tourKey) {
  return getProgramDaysForTour(tourKey).filter(function (d) {
    return d.optional;
  });
}

function getTourBookingLabel(tourKey) {
  const lang = L();
  const labels = TOUR_BOOKING_LABELS[tourKey] || TOUR_BOOKING_LABELS.phuket;
  return labels[lang === "en" ? "en" : "tr"];
}

function getPaymentLabel(value) {
  const lang = L();
  const opt = PAYMENT_OPTIONS.find(function (o) {
    return o.value === value;
  });
  if (!opt) return value;
  return opt[lang === "en" ? "en" : "tr"];
}

function populateReserveTourSelect() {
  const sel = document.getElementById("reserve-tour");
  if (!sel) return;
  const keys = ["backpacking", "phuket", "tomorrowland"];
  sel.innerHTML = keys
    .map(function (key) {
      return (
        '<option value="' +
        key +
        '"' +
        (key === currentTour ? " selected" : "") +
        ">" +
        escapeHtml(getTourBookingLabel(key)) +
        "</option>"
      );
    })
    .join("");
}

function populateReservePaymentSelect() {
  const sel = document.getElementById("reserve-payment");
  if (!sel) return;
  const lang = L();
  sel.innerHTML = PAYMENT_OPTIONS.map(function (o) {
    return (
      '<option value="' +
      o.value +
      '">' +
      escapeHtml(o[lang === "en" ? "en" : "tr"]) +
      "</option>"
    );
  }).join("");
}

function renderReserveAddons(tourKey) {
  const list = document.getElementById("reserve-addons-list");
  if (!list) return;
  const lang = L();
  const addons = getOptionalAddonsForTour(tourKey);
  if (!addons.length) {
    list.innerHTML =
      '<p class="modal__addons-empty">' +
      escapeHtml(
        lang === "en"
          ? "No optional day tours for this package."
          : "Bu paket için opsiyonel gün turu bulunmuyor."
      ) +
      "</p>";
    return;
  }
  const dayWord = lang === "en" ? "Day" : "Gün";
  list.innerHTML = addons
    .map(function (d) {
      const id = "addon-day-" + tourKey + "-" + d.n;
      return (
        '<label class="modal__addon-option">' +
        '<input type="checkbox" name="addon" value="' +
        escapeHtml(String(d.n)) +
        '" id="' +
        id +
        '" />' +
        "<span><strong>" +
        dayWord +
        " " +
        d.n +
        "</strong> — " +
        escapeHtml(d.route) +
        "</span></label>"
      );
    })
    .join("");
}

function getSelectedReserveAddons() {
  const checked = document.querySelectorAll('#reserve-form input[name="addon"]:checked');
  const tourKey = document.getElementById("reserve-tour")?.value || currentTour;
  const addons = getOptionalAddonsForTour(tourKey);
  return Array.from(checked)
    .map(function (el) {
      const dayNum = Number(el.value);
      const day = addons.find(function (d) {
        return d.n === dayNum;
      });
      return day ? { n: day.n, route: day.route } : null;
    })
    .filter(Boolean);
}

function getBookingContextLines(tourKey) {
  const lang = L();
  const key = tourKey || currentTour;
  const tourLabel = getTourBookingLabel(key);
  const portKey = normalizeDeparturePort(currentDeparturePort);
  const port = DEPARTURE_PORT_LABELS[portKey][lang === "en" ? "en" : "tr"];
  const modeLabel =
    PRICING_MODE_LABELS[getEffectivePricingMode(key)][lang === "en" ? "en" : "tr"];
  const displayed = getDisplayedPriceEur(key, portKey);
  const dateSel = document.getElementById("tour-date-select");
  const tourDates = dateSel ? dateSel.options[dateSel.selectedIndex]?.textContent?.trim() : "";
  let lines =
    (lang === "en" ? "Package: " : "Paket: ") +
    tourLabel +
    "\n" +
    (lang === "en" ? "Departure: " : "Kalkış: ") +
    port;
  if (tourDates) {
    lines += "\n" + (lang === "en" ? "Tour dates: " : "Tur tarihi: ") + tourDates;
  }
  lines +=
    "\n" +
    (lang === "en" ? "Pricing: " : "Fiyatlandırma: ") +
    modeLabel +
    "\n" +
    (lang === "en" ? "Package price (per person): " : "Paket fiyatı (kişi başı): ") +
    formatEurDisplay(displayed);
  return lines;
}

function buildReserveMessage(data) {
  const lang = L();
  const lines = [];
  lines.push(lang === "en" ? "Booking request" : "Rezervasyon talebi");
  lines.push("");
  lines.push(getBookingContextLines(data.tour));
  lines.push("");
  lines.push((lang === "en" ? "Name: " : "Ad Soyad: ") + data.name);
  lines.push((lang === "en" ? "Email: " : "E-posta: ") + data.email);
  if (data.phone) lines.push((lang === "en" ? "Phone: " : "Telefon: ") + data.phone);
  lines.push((lang === "en" ? "Guests: " : "Kişi sayısı: ") + data.guests);
  lines.push(
    (lang === "en" ? "Preferred payment: " : "Tercih edilen ödeme: ") + data.paymentLabel
  );
  lines.push("");
  if (data.checkedBaggage) {
    lines.push(lang === "en" ? "20 kg checked baggage: requested" : "20 kg kayıtlı bagaj: talep edildi");
  } else {
    lines.push(
      lang === "en" ? "20 kg checked baggage: not requested" : "20 kg kayıtlı bagaj: talep edilmedi"
    );
  }
  lines.push("");
  if (data.addons.length) {
    lines.push(lang === "en" ? "Optional add-ons selected:" : "Seçilen opsiyonel turlar:");
    data.addons.forEach(function (a) {
      const dayWord = lang === "en" ? "Day" : "Gün";
      lines.push("  • " + dayWord + " " + a.n + " — " + a.route);
    });
  } else {
    lines.push(
      lang === "en" ? "Optional add-ons: none selected" : "Opsiyonel turlar: seçilmedi"
    );
  }
  if (data.message) {
    lines.push("");
    lines.push(lang === "en" ? "Message:" : "Mesaj:");
    lines.push(data.message);
  }
  return lines.join("\n");
}

async function handleSubmit(event) {
  event.preventDefault();
  const form = document.getElementById("contactForm");
  const successMsg = document.getElementById("successMessage");
  const quickContact = document.querySelector(".quick-contact");
  const contactSection = document.getElementById("contactFormSection");
  const contactContainer = document.querySelector(".contact-form-container");
  const submitBtn = form && form.querySelector('button[type="submit"]');
  if (!form || !successMsg) return;
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const formData = new FormData(form);
  const countryCode = String(formData.get("country_code") || "").replace(/\D/g, "");
  const phoneLocal = String(formData.get("phone") || "").trim();
  const phoneFull = countryCode ? "+" + countryCode + " " + phoneLocal : phoneLocal;
  const data = {
    name: formData.get("name") || "",
    phone: phoneFull,
    email: formData.get("email") || "",
    message: formData.get("message") || ""
  };

  const contactErr = document.getElementById("contact-form-error");
  if (contactErr) {
    contactErr.classList.remove("is-visible");
    contactErr.textContent = "";
  }
  if (submitBtn) submitBtn.disabled = true;
  try {
    await sendInquiryEmail({
      subject: "gezeceyik İletişim — " + data.name,
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message
    });
  } catch (err) {
    if (contactErr) {
      contactErr.textContent = err.message || "";
      contactErr.classList.add("is-visible");
    }
    if (submitBtn) submitBtn.disabled = false;
    return;
  }
  if (submitBtn) submitBtn.disabled = false;

  form.style.display = "none";
  if (quickContact) quickContact.style.display = "none";
  successMsg.style.display = "block";
  setTimeout(function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(function () {
      form.reset();
      form.style.display = "flex";
      if (quickContact) quickContact.style.display = "flex";
      successMsg.style.display = "none";
      if (contactContainer) contactContainer.classList.remove("is-visible");
      document.body.classList.remove("form-active");
      if (contactSection && !location.hash) {
        contactSection.blur && contactSection.blur();
      }
    }, 1000);
  }, 3000);
}

const programDays = [
  {
    n: 1,
    route: "İstanbul > Doha > Phuket",
    summary:
      "SAW'da uçuştan 3 saat önce buluşma; Qatar Airways ile Doha aktarmalı Phuket'e uçuş. Geceleme uçakta.",
    date: "2 Aralık 2026 — Çarşamba",
    image: {
      src: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80",
      alt: "Uçak ve gökyüzü"
    },
    content: `
  <p><strong>Tur başlangıç tarihinden bir takvim günü önce</strong> İstanbul Sabiha Gökçen Havalimanı dış hatlar gidiş terminalinde uçuştan 3 saat önce buluşma.</p>
  <p>Bilet, bagaj ve pasaport işlemlerinin ardından Qatar Airways <strong>QR242</strong> ile Doha'ya hareket. Aktarma sonrası <strong>QR850</strong> ile Phuket'e hareket.</p>
  <p><strong>Uçuş saatleri</strong> (teyit tur dokümanında):</p>
  <ul>
    <li>QR242: İstanbul (SAW) 18:15 → Doha 05:35</li>
    <li>QR850: Doha 07:35 → Phuket 15:40</li>
  </ul>
  <p>Geceleme uçakta.</p>`
  },
  {
    n: 2,
    route: "Phuket varış",
    summary:
      "Phuket Havalimanı'na varış; VIP van ile Thanthip Beach Resort (2–7 Aralık). Check-in ve Patong'da serbest zaman.",
    date: "2–7 Aralık 2026 — Phuket",
    image: {
      src: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&q=80",
      alt: "Phuket plajı",
      objectPosition: "center 72%"
    },
    content: `
  <p>Phuket Uluslararası Havalimanı'na varışımızın ardından özel VIP van ile Patong bölgesindeki <strong>Thanthip Beach Resort</strong>'a transfer.</p>
  <p>Otel check-in sonrası serbest zaman:</p>
  <ul>
    <li>Plajda dinlenme</li>
    <li>Şehir keşfi</li>
    <li>Yerel restoranlar</li>
    <li>Patong gece hayatı</li>
  </ul>
  <p>Geceleme Phuket'teki otelimizde.</p>`
  },
  {
    n: 3,
    optional: true,
    route: "Phuket / Phi Phi Adaları turu",
    summary:
      "Tam günlük hızlı tekne turu: Maya Bay, lagünler, snorkel ve öğle yemekli büfe. Akşam serbest.",
    date: "4 Aralık 2026 — Cuma",
    image: {
      src: "phi-phi-island.jpg",
      alt: "Phi Phi Adaları — Maya Koyu ve tekne turu",
      altEn: "Phi Phi Islands — Maya Bay boat tour",
      objectPosition: "center 58%"
    },
    content: `
  <p>Kahvaltı sonrası <strong>tam günlük öğle yemekli Phi Phi Adaları hızlı tekne turu</strong> için hareket.</p>
  <p><strong>Program:</strong></p>
  <ul>
    <li>Maya Bay (<em>The Beach</em> filmi)</li>
    <li>Pileh Lagoon</li>
    <li>Viking Cave</li>
    <li>Monkey Beach</li>
    <li>Bamboo Island</li>
    <li>Khai Island (snorkel)</li>
  </ul>
  <p><strong>Dahil olanlar:</strong> Snorkel ekipmanı, yaşam yeleği, tekne üzerinde Tayland büfesi öğle yemeği, ulusal park ücretleri, İngilizce rehber.</p>
  <p>Akşam Patong'da serbest zaman. Geceleme otelimizde.</p>`
  },
  {
    n: 4,
    optional: true,
    route: "Phuket / James Bond Adası turu",
    summary:
      "Phang Nga Körfezi: kano, James Bond Adası, yüzen köy ve öğle yemekli tam gün tekne turu.",
    date: "5 Aralık 2026 — Cumartesi",
    image: {
      src: "james-bond-island.jpg",
      alt: "James Bond Adası — Phang Nga körfezi",
      altEn: "James Bond Island — Phang Nga Bay",
      objectPosition: "center 63%"
    },
    content: `
  <p>Kahvaltı sonrası <strong>tam günlük öğle yemekli James Bond Adası ve Phang Nga Körfezi</strong> turu.</p>
  <p><strong>Program:</strong></p>
  <ul>
    <li>Hong Island deniz mağaralarında kanoyla keşif</li>
    <li>Panak buz mağarası</li>
    <li>James Bond Adası (Koh Tapu)</li>
    <li>Koh Panyee yüzen balıkçı köyü</li>
    <li>Naka Yai plajında yüzme</li>
  </ul>
  <p><strong>Dahil olanlar:</strong> Kano, yaşam yeleği, kask, öğle yemeği, ulusal park ücretleri, rehber.</p>
  <p>Geceleme Phuket'teki otelimizde.</p>`
  },
  {
    n: 5,
    optional: true,
    route: "Phuket / Khao Sok Milli Parkı",
    summary:
      "Tam gün Khao Sok: yağmur ormanı, Cheow Lan Gölü tekne turu ve yüzen bungalovlar (ek ücretli).",
    date: "6 Aralık 2026 — Pazar",
    image: {
      src: "khao-sok-national-park.jpg",
      alt: "Khao Sok — Cheow Lan Gölü",
      altEn: "Khao Sok — Cheow Lan Lake",
      objectPosition: "center 49%"
    },
    content: `
  <p>Kahvaltı sonrası <strong>Khao Sok Milli Parkı tam gün turu</strong> (tur fiyatına dahil değildir; ek ücretli).</p>
  <p><strong>Program:</strong></p>
  <ul>
    <li>Tapınak ormanı ve kireçtaşı zirveleri</li>
    <li>Tekne ile <strong>Cheow Lan Gölü</strong> turu</li>
    <li>Yüzen bungalovlar ve mağara keşifleri</li>
    <li>Paddle board / kano veya yüzme molaları</li>
    <li>Öğle yemeği (göl kenarı restoran veya tekne üzerinde)</li>
  </ul>
  <p><strong>Dahil olanlar:</strong> Milli park girişi, tekne/göl turu, öğle yemeği, rehber (tur paketine göre değişebilir).</p>
  <p>Akşam Patong'da serbest zaman. Geceleme otelimizde.</p>`
  },
  {
    n: 6,
    route: "Phuket > Bangkok",
    summary:
      "Sabah serbest; öğleden sonra Thai AirAsia ile Bangkok. Solitaire Bangkok'a transfer (7–11 Aralık).",
    date: "7 Aralık 2026 — Pazartesi",
    image: {
      src: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
      alt: "Resort ve havuz",
      objectPosition: "center 72%"
    },
    content: `
  <p>Kahvaltı sonrası serbest zaman: Patong'da yüzme, alışveriş, spa veya <strong>Jungceylon AVM</strong>.</p>
  <p>Öğleden sonra Phuket Havalimanı'na transfer. <strong>Thai AirAsia FD3014</strong> ile Bangkok'a hareket.</p>
  <p><strong>Uçuş:</strong> 07.12.2026 Phuket 14:00 → Bangkok 15:25.</p>
  <p>Suvarnabhumi'ye varışta özel van ile <strong>Solitaire Bangkok Sukhumvit 11</strong>'e transfer (7–11 Aralık konaklama).</p>
  <p>Akşam Soi 11 çevresinde hoş geldin yemeği önerisi.</p>`
  },
  {
    n: 7,
    optional: true,
    route: "Bangkok şehir turu (tam gün)",
    summary:
      "Grand Palace, Wat Pho, Wat Arun, Chao Phraya teknesi, ICONSIAM ve Yaowarat sokak lezzetleri.",
    date: "8 Aralık 2026 — Salı",
    image: {
      src: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800&q=80",
      alt: "Bangkok tapınağı",
      objectPosition: "center 94%"
    },
    content: `
  <p>Büfe kahvaltı sonrası <strong>tam günlük Bangkok şehir turu</strong>.</p>
  <p><strong>Program:</strong></p>
  <ul>
    <li><strong>Grand Palace &amp; Wat Phra Kaew</strong></li>
    <li><strong>Wat Pho</strong> — 46 m uzanmış Buda</li>
    <li>Yerel restoranda öğle yemeği (Tom Yum, Pad Thai)</li>
    <li><strong>Chao Phraya</strong> uzun kuyruklu tekne ile kanal turu</li>
    <li><strong>Wat Arun</strong></li>
    <li>ICONSIAM serbest alışveriş</li>
    <li><strong>Yaowarat</strong> sokak yemeği</li>
  </ul>
  <p><strong>Dahil olanlar:</strong> Giriş ücretleri, öğle yemeği, özel van, lisanslı Türkçe rehber.</p>
  <p><strong>Giyim:</strong> Grand Palace için omuz ve diz kapalı olmalıdır.</p>`
  },
  {
    n: 8,
    optional: true,
    route: "Bangkok · Muay Thai günü",
    summary:
      "Tam gün Muay Thai deneyimi: ice bath, spa, antrenman spor masajı, teori ve akşam Rajadamnern Stadyumu'nda canlı dövüş izleme (ek ücretli).",
    date: "9 Aralık 2026 — Çarşamba",
    image: {
      src: "https://images.unsplash.com/photo-1773289338370-6197ab131713?w=800&q=80",
      alt: "Muay Thai antrenmanı",
      objectPosition: "center 38%"
    },
    content: `
  <p>Sabah otelde geç kahvaltı sonrası <strong>Bangkok'ta tam gün Muay Thai programı</strong> (tur fiyatına dahil değildir; ek ücretli).</p>
  <p><strong>Program:</strong></p>
  <ul>
    <li>Ice bath (buz banyosu)</li>
    <li>Spa</li>
    <li>Antrenman spor masajı</li>
    <li>Muay Thai teorisi</li>
    <li>Akşam Rajadamnern Stadyumu'nda (Bangkok) canlı Muay Thai müsabakası izleme</li>
  </ul>
  <p>Geceleme otelimizde.</p>`
  },
  {
    n: 9,
    route: "Bangkok > İstanbul",
    summary:
      "Check-out, Suvarnabhumi'ye VIP transfer. Turkish Airlines TK65 ile SAW'a dönüş; turun sonu.",
    date: "10 Aralık 2026 — Perşembe",
    image: {
      src: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80",
      alt: "Havalimanı ve seyahat"
    },
    content: `
  <p>Kahvaltı sonrası check-out. Özel van ile <strong>Bangkok Suvarnabhumi Havalimanı</strong>'na transfer.</p>
  <p>Bilet, bagaj ve pasaport işlemlerinden sonra <strong>Turkish Airlines TK65</strong> ile İstanbul'a hareket.</p>
  <p><strong>Varış:</strong> İstanbul Sabiha Gökçen Havalimanı — turumuzun sonu. Güvenli yolculuklar dileriz.</p>`
  }
];

const sidebarIncluded = [
  "Gidiş-dönüş uluslararası ekonomi uçuşları + Phuket–Bangkok iç hat (kalkış limanına göre)",
  "Thai AirAsia ile Phuket → Bangkok iç hat (7 kg kabin dahil)",
  "Phuket — Thanthip Beach Resort Patong (4★), 2–7 Aralık 2026 · kahvaltı dahil",
  "Bangkok — Solitaire Bangkok Sukhumvit 11 (4★), 7–11 Aralık 2026 · kahvaltı dahil",
  "Tüm havalimanı ve şehir transferleri (özel VIP van)",
  "Profesyonel İngilizce/Türkçe rehberlik hizmeti",
  "7/24 destek hizmeti"
];

const sidebarIncluded_backpack = [
  "Ekonomi tarifeli uluslararası uçuşlar (kalkış limanına göre Air Arabia / AirAsia veya çoklu aktarma)",
  "Thai AirAsia ile Phuket → Bangkok iç hat (7 kg kabin dahil)",
  "Phuket Old Town Hostel — 3–7 Aralık (4 gece)",
  "Do Dee Cafe Hostel — 7–11 Aralık (4 gece)",
  "Havalimanı ve şehir transferleri",
  "Profesyonel rehberlik",
  "7/24 destek hizmeti"
];
const sidebarIncluded_backpack_en = [
  "Economy international flights (Air Arabia / AirAsia or multi-stop per departure airport)",
  "Thai AirAsia Phuket → Bangkok domestic (7 kg cabin included)",
  "Phuket Old Town Hostel — 3–7 Dec (4 nights)",
  "Do Dee Cafe Hostel — 7–11 Dec (4 nights)",
  "Airport and city transfers",
  "Professional guiding",
  "24/7 support service"
];

const includedBottom = [
  "Tüm uçuşlar (uluslararası ve Phuket–Bangkok iç hat)",
  "Konaklama",
  "VIP van transferleri",
  "İngilizce/Türkçe rehberlik",
  "7/24 destek hizmeti"
];

const excludedBottom = [
  "Yemekler (kahvaltı dışında öğle ve akşam yemekleri)",
  "Kişisel harcamalar ve bahşişler",
  "Ekstra aktiviteler (Muay Thai kursu, spa, masaj vs.)",
  "Seyahat sigortası (önerilir, ayrıca alınabilir)"
];

const TDAC_ARRIVAL_CARD_URL = "https://tdac.immigration.go.th/arrival-card/#/home";
const THAILAND_EVISA_URL = "https://www.thaievisa.go.th/";

const visaInfoHtml = `
  <div class="terms-item">
    <h4>Vize</h4>
    <p>Pasaportların dönüş tarihinden itibaren minimum <strong>6 ay</strong> geçerlilik süresinin olması gerekmektedir.</p>
    <p>Gümrük geçişlerinde ve sınır kapılarında pasaportunuza giriş-çıkış kaşesi basılabilmesi için pasaportunuzda en az <strong>6 boş sayfa</strong> olması gerekmektedir. Vize alınmış olması veya vize gerektirmeyen pasaporta sahip olunması, ülkeye giriş ve çıkış yapılabileceği anlamına gelmez; pasaport polisinin sizi ülkeye kabul etmeme veya ülkeden çıkarmama yetkisi bulunmaktadır. <strong>Kıbrıslı Gezgin</strong>'in bu konuda herhangi bir sorumluluğu bulunmamaktadır.</p>
    <p>Yırtılmış, yıpranmış veya benzeri tahribata uğramış pasaportlar ile seyahat edilememektedir.</p>
    <p>Türk vatandaşı olmayan ya da çifte vatandaşlığı olup diğer ülke pasaportunu kullanarak tura katılacak misafirlerin, seyahat edilecek ülkenin kullanacakları pasaporta uyguladığı vize prosedürünü ilgili konsolosluklara bizzat danışmaları gerekmektedir. <strong>Kıbrıslı Gezgin</strong>'in doğacak olumsuzluklardan dolayı herhangi bir sorumluluğu bulunmamaktadır.</p>
    <p>18 yaşından küçük misafirlerimizin anne veya babasından herhangi biriyle seyahat etmesi durumunda, seyahate katılmayan ebeveynden <strong>noter onaylı muvafakatname</strong> alması gerekmektedir.</p>
  </div>
`;

const visaInfoHtml_en = `
  <div class="terms-item">
    <h4>Visa</h4>
    <p>Passports must be valid for at least <strong>6 months</strong> from the return date.</p>
    <p>For border and customs clearance, your passport must have at least <strong>6 blank pages</strong> for entry/exit stamps. Holding a visa or a visa-exempt passport does not guarantee entry or exit; immigration officers may refuse entry or require departure. <strong>Kıbrıslı Gezgin</strong> accepts no liability in this regard.</p>
    <p>Travel is not permitted with torn, damaged or otherwise defaced passports.</p>
    <p>Guests who are not Turkish citizens, or who hold dual nationality and will join the tour on another country's passport, must consult the relevant consulates about visa requirements for the passport they will use. <strong>Kıbrıslı Gezgin</strong> accepts no liability for adverse outcomes arising from this.</p>
    <p>Guests under 18 travelling with only one parent must carry a <strong>notarized consent letter</strong> from the parent who is not travelling.</p>
  </div>
`;

const generalHtml = `
  <h3>Tayland geneli</h3>
  <ul>
    <li><strong>Para birimi:</strong> Thai Baht (THB) — 1€ ≈ 38-40 THB</li>
    <li><strong>İklim:</strong> Aralık ayında 25-32°C, kuru sezon</li>
    <li><strong>Saat farkı:</strong> Türkiye'den +4 saat ileri</li>
    <li><strong>Dil:</strong> Tay dili (Thai); turistik bölgelerde İngilizce yaygın</li>
    <li><strong>Elektrik:</strong> 220V, çoğunlukla A/B/C tipi prizler</li>
    <li><strong>Aşılar:</strong> Sarı humma önerilir (zorunlu değil)</li>
  </ul>
  <p style="font-size:0.85rem;color:var(--text-muted);margin-top:0.5rem">Ülkeye özel vize gereklilikleri için yukarıdan pasaport ülkenizi seçin.</p>
`;

const accommodationNotesHtml = `
  <h3>Konaklamaya dair önemli notlar</h3>
  <ul>
    <li>İlgili tur programında belirtilen otel/oteller <strong>“ve benzeri”</strong> olup, nihai otel <strong>Kıbrıslı Gezgin</strong> tarafından belirlenerek kesinleşecek ve tur kalkış tarihinden <strong>48 saat önce</strong> bildirilecektir.</li>
    <li>Otellerin yıldız ve sınıflandırması gidilen ülkelerin değerlendirme şartlarına göre farklılık gösterebilir.</li>
    <li>Otellere giriş saati gidilen şehrin yerel saati ile en erken <strong>15:00</strong>; çıkış saati ise <strong>11:00 / 12:00</strong>'dır.</li>
    <li>Oteller giriş esnasında kredi kartınızdan olası harcamalarınız adına belli bir miktar <strong>depozito</strong> talep edebilir.</li>
    <li>Yatak tipi garanti edilemeyip, otelin müsaitliğine bağlı olarak bloke edilmektedir.</li>
    <li>Tek kişilik odalarda yatak tipi tek kişiliktir. Çift kişilik yataklı oda blokajı müsaitlik doğrultusunda verilebilir.</li>
    <li>Triple veya 2 yetişkin + 1 çocuk olarak alınan rezervasyonlarda 3. kişi veya çocuk için verilen yataklar sabit yatak konforunda değildir; normal yatak standardından daha küçük açılır-kapanır yatak verilebilir.</li>
    <li>Grup konaklamalarında oteller kahvaltı organizasyonunu ana restoran harici otel içerisinde farklı bir salonda verebilir. Otel kahvaltı saatini gruba özel belirleyebilir. Sunulan kahvaltı, bulunan ülkenin kültürüne uygun olarak sınırlı bir menü ile servis edilmektedir.</li>
  </ul>
`;

const accommodationNotesHtml_en = `
  <h3>Important accommodation notes</h3>
  <ul>
    <li>Hotels listed in the tour programme are <strong>“or similar”</strong>. The final property will be confirmed by <strong>Kıbrıslı Gezgin</strong> and communicated at least <strong>48 hours</strong> before departure.</li>
    <li>Star ratings and classifications may differ according to each destination country's standards.</li>
    <li>Standard hotel check-in is from <strong>15:00</strong> and check-out by <strong>11:00 / 12:00</strong> local time.</li>
    <li>Hotels may request a <strong>deposit</strong> on your credit card at check-in for incidental charges.</li>
    <li>Bed types are not guaranteed and are allocated subject to availability.</li>
    <li>Single rooms have a single bed. Double beds in twin bookings are subject to availability.</li>
    <li>For triple or 2 adults + 1 child bookings, the third bed may be a smaller sofa/fold-out bed, not the same standard as regular beds.</li>
    <li>On group stays, breakfast may be served in a separate hall rather than the main restaurant. The hotel may set breakfast times for the group. Breakfast is a limited menu reflecting local customs.</li>
  </ul>
`;

const flightNotesHtml = `
  <h3>Uçak biletlerine dair önemli notlar</h3>
  <ul>
    <li>Uçak biletleri pasaportta geçen isim/soyisim, doğum tarihi, T.C. kimlik numarası ve pasaport detaylarına göre kesilmektedir. Bu bilgilerin hatalı bildirilmesi durumunda <strong>Kıbrıslı Gezgin</strong>'in bu konuda herhangi bir sorumluluğu bulunmamaktadır.</li>
    <li>Uçuş saatinden minimum <strong>3 saat önce</strong> belirtilen havalimanında olunması gerekmektedir.</li>
    <li>Misafirler <strong>online check-in</strong> işlemini uçuştan 24 saat öncesinden kendileri yapmakla yükümlüdür. Havayolunun atamış olduğu koltuk üzerinden ilerleyebilir ya da uçağın müsaitliği doğrultusunda ek ücret ödeyerek önceden koltuk seçimi yapabilirler. Kimi havayolları grup biletlerinde online check-in ve koltuk seçimine izin vermemektedir; koltuk talepleri müsaitliğe bağlı olarak havalimanında bagaj teslimi esnasında kontuar görevlisine bildirilmelidir.</li>
    <li>Havayolu kaynaklı rötar ve iptaller, uçuş saati veya parkur değişiklikleri ve buna bağlı fiyat artışlarından <strong>Kıbrıslı Gezgin</strong> sorumlu değildir.</li>
    <li>İç hat bağlantısı veren havayolları için müsaitlik ve fiyatlandırmanın tarafımıza sorulmasını rica ederiz.</li>
    <li>İç hat uçuşunu kendileri alan misafirlerimiz, uçuş gecikmesi nedeniyle uluslararası uçuşa yetişemezse <strong>Kıbrıslı Gezgin</strong> sorumlu değildir. Olası tur iptali veya uçuş değişikliklerinde mağduriyet yaşamamak için iç hat biletlerinin cezasız iptal/değişiklik yapılabilir sınıftan alınmasını tavsiye ederiz; aksi halde sorumluluk kabul edilmez.</li>
    <li>Bazı havayolları <strong>sıralı bilet</strong> kuralı uygular; gidiş uçağı kullanılmazsa dönüş uçuşu havayolu tarafından otomatik iptal edilebilir.</li>
    <li>Havayollarının uçuş günü/saati ile ilgili değişiklik yapma hakkı bulunmaktadır. Bagaj taşıma kurallarını acente veya misafirlere bildirmeksizin değiştirme hakkı da mevcuttur.</li>
    <li>Business kabinde seyahat için biletlerin grup rezervasyonundan ayrılması gerekir. Kalkıştan <strong>20 gün önce</strong> talep ile müsaitliğe bağlı fiyat sunulabilir; kabul eden misafirler için münferit bilet şartları geçerlidir ve iptal/değişiklikte iade mümkün olmayabilir.</li>
    <li>Ülkelerdeki yerel havayollarının iç/dış hat uçuşlarında bagaj hakları farklılık gösterebilir; bagaj hakkı ücretli olabilir.</li>
    <li>Uçak biletini kendi alıp yalnızca yer hizmetlerine katılan misafirler, grup ile aynı uçuş saatlerini almazsa transfer ve şehir turuna katılamayabilir; havalimanı–otel ulaşımı misafirin sorumluluğundadır.</li>
    <li>Hamile misafirler, özel doktor kısıtlaması olmadığı ve doktor onayı ile <strong>36. haftaya kadar</strong> seyahat edebilir.</li>
    <li>İlgili tur bölge karşılamalı olup farklı acente misafirlerinin katılımına açık bir programdır. <strong>Kıbrıslı Gezgin</strong> misafirleri, <strong>Kıbrıslı Gezgin</strong> sorumluluğundadır. Rehberlik hizmeti varılan ülke başlangıçlıdır.</li>
  </ul>
`;

const flightNotesHtml_en = `
  <h3>Important flight ticket notes</h3>
  <ul>
    <li>Tickets are issued according to passport name/surname, date of birth, national ID (where applicable) and passport details. We accept no liability for incorrect information provided by guests.</li>
    <li>Please be at the designated airport at least <strong>3 hours</strong> before departure.</li>
    <li>Guests must complete <strong>online check-in</strong> from 24 hours before departure. You may use the airline-assigned seat or pay extra for seat selection if available. Some airlines do not allow online check-in or seat selection on group tickets; seat requests should be made at the check-in counter when dropping baggage, subject to availability.</li>
    <li>We are not liable for airline delays or cancellations, schedule or routing changes, or related fare increases.</li>
    <li>For airlines offering domestic connections, please ask us about availability and pricing.</li>
    <li>Guests who book their own domestic flights are not covered if a delay causes them to miss the international flight. We recommend flexible domestic tickets; otherwise We accept no liability.</li>
    <li>Some airlines apply <strong>sequential ticketing</strong>; if the outbound flight is not used, the return may be cancelled automatically.</li>
    <li>Airlines may change flight dates/times and baggage rules without prior notice to the agency or guests.</li>
    <li>For business class, tickets must be separated from the group booking. Requests at least <strong>20 days</strong> before departure may receive a quote subject to availability; individual fare rules apply and refunds on changes may not be possible.</li>
    <li>Baggage allowances on local carriers may differ on domestic/international sectors and may be chargeable.</li>
    <li>Guests who buy their own flights and join for land services only must match group flight times to use transfers and city tours; airport–hotel transport is their responsibility.</li>
    <li>Pregnant guests may travel up to <strong>week 36</strong> with medical clearance, unless otherwise restricted.</li>
    <li>This is a regional group tour open to guests from other agencies. Guests who book with us are under our responsibility. Guiding starts in the destination country.</li>
  </ul>
`;

const accommodationHtml = `
  <h3>Phuket — Thanthip Beach Resort Patong (4★)</h3>
  <p><strong>2–7 Aralık 2026</strong> (5 gece) · kahvaltı dahil</p>
  <p>Twin oda; Patong plajına 200 m; açık havuz, restoran ve bar; ücretsiz WiFi.</p>
  <ul>
    <li><strong>Konum:</strong> Patong Beach merkezi</li>
    <li><strong>Oda tipi:</strong> Twin / çift kişilik standart oda — klimalı</li>
    <li><strong>Check-in / Check-out:</strong> 14:00 / 12:00</li>
  </ul>
  <h3>Bangkok — Solitaire Bangkok Sukhumvit 11 (4★ Superior)</h3>
  <p><strong>7–11 Aralık 2026</strong> (4 gece) · kahvaltı dahil</p>
  <p>Twin Superior oda; Nana BTS yürüme mesafesi; çatı havuzu, spa ve fitness.</p>
  <ul>
    <li><strong>Konum:</strong> Sukhumvit Soi 11</li>
    <li><strong>Check-in / Check-out:</strong> 14:00 / 12:00</li>
  </ul>
  <p style="font-size:0.85rem;color:var(--text-muted)">Tüm Comfort kalkışlarında aynı oteller ve tarihler. Otel değişiklik hakkı saklıdır; aynı kategori veya üstü garanti edilir.</p>
  ${accommodationNotesHtml}
`;

const accommodationHtml_backpack = `
  <h3>Phuket (3–7 Aralık) — Phuket Old Town Hostel</h3>
  <p>Backpacker hostel, Phuket Eski Şehir bölgesinde (3–7 Aralık, 4 gece). Ortak alan, ücretsiz WiFi.</p>
  <ul>
    <li><strong>Konum:</strong> Phuket Old Town — sokak yemekleri, gece pazarları, tapınaklar yürüme mesafesinde</li>
    <li><strong>Oda tipi:</strong> 8 kişilik paylaşımlı yatakhanede yatak</li>
    <li><strong>Check-in / Check-out:</strong> 14:00 / 11:00</li>
  </ul>
  <h3>Bangkok (7–11 Aralık) — Do Dee Cafe Hostel</h3>
  <p>Hostel / pansiyon, Bangkok (Phasi Charoen), 7–11 Aralık (4 gece). Bahçe, teras, ücretsiz WiFi.</p>
  <ul>
    <li><strong>Konum:</strong> Bangkok — şehir merkezine toplu taşıma ile ulaşım</li>
    <li><strong>Oda tipi:</strong> 8 kişilik paylaşımlı yatakhanede yatak</li>
    <li><strong>Check-in / Check-out:</strong> 14:00 / 11:00</li>
  </ul>
  <p style="font-size:0.85rem;color:var(--text-muted)">Backpacking paketinde yalnızca paylaşımlı hostel odaları dahildir.</p>
  ${accommodationNotesHtml}`;

const accommodationHtml_backpack_en = `
  <h3>Phuket (3–7 Dec) — Phuket Old Town Hostel</h3>
  <p>Backpacker hostel in Phuket Old Town (3–7 Dec, 4 nights). Shared areas, free WiFi.</p>
  <ul>
    <li><strong>Location:</strong> Phuket Old Town — street food, night markets, temples within walking distance</li>
    <li><strong>Room type:</strong> 8 people shared dorm</li>
    <li><strong>Check-in / Check-out:</strong> 14:00 / 11:00</li>
  </ul>
  <h3>Bangkok (7–11 Dec) — Do Dee Cafe Hostel</h3>
  <p>Hostel in Bangkok (Phasi Charoen), 7–11 Dec (4 nights). Garden, terrace, free WiFi.</p>
  <ul>
    <li><strong>Location:</strong> Bangkok — public transport to city centre</li>
    <li><strong>Room type:</strong> 8 people shared dorm</li>
    <li><strong>Check-in / Check-out:</strong> 14:00 / 11:00</li>
  </ul>
  <p style="font-size:0.85rem;color:var(--text-muted)">Backpacking package includes shared hostel rooms only.</p>
  ${accommodationNotesHtml_en}`;

const flightsHtml = `
  <h3>Gidiş uçuşları</h3>
  <p><strong>Qatar Airways QR242 — İstanbul (SAW) → Doha (DOH)</strong><br />Kalkış: 02.12.2026 18:15 · Varış: 03.12.2026 05:35</p>
  <p><strong>Qatar Airways QR850 — Doha (DOH) → Phuket (HKT)</strong><br />Kalkış: 03.12.2026 07:35 · Varış: 03.12.2026 15:40</p>
  <h3>İç hat uçuşu (Phuket → Bangkok)</h3>
  <p><strong>Thai AirAsia FD3014 — Phuket (HKT) → Bangkok (BKK)</strong><br />Kalkış: 08.12.2026 14:00 · Varış: 08.12.2026 15:25</p>
  <h3>Dönüş uçuşu</h3>
  <p><strong>Turkish Airlines TK65 — Bangkok (BKK) → İstanbul (SAW)</strong><br />Kalkış: 10.12.2026 09:25 · Varış: 10.12.2026 15:10</p>
  <h3>Bagaj bilgisi</h3>
  <ul>
    <li><strong>Uluslararası:</strong> 7 kg kabin bagajı dahil · 20 kg kayıtlı bagaj ek ücretlidir</li>
    <li><strong>İç hat (Thai AirAsia):</strong> 7 kg kabin bagajı dahil · 20 kg kayıtlı bagaj ek ücretlidir</li>
  </ul>
  <p style="font-size:0.85rem;color:var(--text-muted)">Kesin uçuş bilgisi tur teyidinde paylaşılır.</p>
`;

function tourPhoto(unsplashId, alt, altEn) {
  const base = "https://images.unsplash.com/" + unsplashId;
  const params = "auto=format&fit=crop&fm=jpg&q=85";
  return {
    href: base + "?" + params + "&w=1920",
    src: base + "?" + params + "&w=800&h=600",
    alt: alt,
    altEn: altEn || alt
  };
}

function localPhoto(filename, alt, altEn) {
  return {
    href: filename,
    src: filename,
    alt: alt,
    altEn: altEn || alt
  };
}

const photos = [
  /* Bangkok */
  tourPhoto("photo-1563492065599-3520f775eeed", "Bangkok — Wat Arun", "Bangkok — Wat Arun"),
  tourPhoto("photo-1510379872535-9310dc6fd6a7", "Bangkok — tapınak ve şehir", "Bangkok — temple and city"),
  tourPhoto("photo-1546228139-87f5312cac42", "Bangkok — saray ve tapınak bölgesi", "Bangkok — palace and temple district"),
  tourPhoto("photo-1519451241324-20b4ea2c4220", "Bangkok — gece şehir manzarası", "Bangkok — city skyline at night"),
  /* Phuket */
  tourPhoto("photo-1589394815804-964ed0be2eb5", "Phuket — turkuaz kumsal", "Phuket — turquoise beach"),
  tourPhoto("photo-1551418988-c21e451467b7", "Phuket — Andaman kıyısı", "Phuket — Andaman coastline"),
  tourPhoto("photo-1483683804023-6ccdb62f86ef", "Phuket — plaj ve deniz", "Phuket — beach and sea"),
  tourPhoto("photo-1651960065928-942d1f3dd56b", "Phuket — tropik koy", "Phuket — tropical bay"),
  /* Oteller */
  tourPhoto("photo-1520250497591-112f2f40a3f4", "Otel — havuzlu tropik resort", "Hotel — tropical pool resort"),
  tourPhoto("photo-1566073771259-6a8506099945", "Otel — infinity havuz", "Hotel — infinity pool"),
  tourPhoto("photo-1550504969-937eb02c18b3", "Otel — lüks havuz ve teras", "Hotel — luxury pool and terrace"),
  tourPhoto("photo-1586739807089-5f978d168cfa", "Otel — resort konaklama", "Hotel — resort stay"),
  /* Phi Phi turu */
  localPhoto("phi-phi-island.jpg", "Phi Phi — Maya Koyu ve tekne turu", "Phi Phi — Maya Bay boat tour"),
  tourPhoto("photo-1655921779872-6e7d3b34cfb1", "Phi Phi — Maya Koyu manzarası", "Phi Phi — Maya Bay view"),
  tourPhoto("photo-1664471347423-54d7ac98bc9b", "Phi Phi — plaj ve adalar", "Phi Phi — beach and islands"),
  tourPhoto("photo-1516017973299-06458f7db713", "Phi Phi — gün batımı", "Phi Phi — sunset"),
  /* James Bond Adası (Phang Nga) */
  localPhoto("james-bond-island.jpg", "James Bond Adası — Phang Nga körfezi", "James Bond Island — Phang Nga Bay"),
  tourPhoto("photo-1578406024474-81f6eb54b23d", "James Bond Adası — Phang Nga körfezi", "James Bond Island — Phang Nga Bay"),
  tourPhoto("photo-1605045544284-d13c6d6a60a6", "James Bond Adası — kireçtaşı kayalıkları", "James Bond Island — limestone karsts"),
  tourPhoto("photo-1545153976-5d451256a9a1", "Phang Nga — tekne ile körfez turu", "Phang Nga — bay tour by boat"),
  /* Khao Sok Milli Parkı */
  localPhoto("khao-sok-national-park.jpg", "Khao Sok — Cheow Lan Gölü", "Khao Sok — Cheow Lan Lake"),
  tourPhoto("photo-1494948949099-1311f3e907a9", "Khao Sok — Cheow Lan Gölü ve yüzen bungalovlar", "Khao Sok — Cheow Lan Lake floating bungalows"),
  tourPhoto("photo-1578157693553-69118df519ed", "Khao Sok — yağmur ormanı", "Khao Sok — rainforest"),
  tourPhoto("photo-1520961810802-7f0a32de665a", "Khao Sok — göl ve dağlar", "Khao Sok — lake and mountains"),
  tourPhoto("photo-1504214208698-ea1916a2195a", "Khao Sok — kireçtaşı zirveleri", "Khao Sok — limestone peaks"),
  /* Tekne turları */
  tourPhoto("photo-1506929562872-bb421503ef21", "Andaman — tekne ile ada turu", "Andaman — island hopping by boat"),
  tourPhoto("photo-1606711870315-ca871bc590ac", "Phang Nga — koylar ve turkuaz su", "Phang Nga — coves and turquoise water")
];

/* ─── English translations for dynamic content ─────────────────────── */
const programDays_en = [
  {
    n: 1, route: "Istanbul > Doha > Phuket",
    summary: "Meet at SAW 3 hours before departure; Qatar Airways flight with Doha layover to Phuket. Overnight on plane.",
    date: "2 December 2026 — Wednesday",
    image: { src: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80", alt: "Aircraft and sky" },
    content: `
  <p><strong>One calendar day before the tour start</strong>, meet at Istanbul Sabiha Gökçen International Airport departures terminal 3 hours before the flight.</p>
  <p>After ticket, baggage and passport check-in, depart with Qatar Airways <strong>QR242</strong> to Doha. After layover, continue with <strong>QR850</strong> to Phuket.</p>
  <p><strong>Flight times</strong> (confirmed in tour document):</p>
  <ul>
    <li>QR242: Istanbul (SAW) 18:15 → Doha 05:35</li>
    <li>QR850: Doha 07:35 → Phuket 15:40</li>
  </ul>
  <p>Overnight on the plane.</p>`
  },
  {
    n: 2, route: "Phuket arrival",
    summary: "Arrive at Phuket Airport; VIP van to Thanthip Beach Resort (2–7 Dec). Check-in and free time in Patong.",
    date: "2–7 December 2026 — Phuket",
    image: {
      src: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&q=80",
      alt: "Phuket beach",
      objectPosition: "center 72%"
    },
    content: `
  <p>After arrival at Phuket International Airport, private VIP van transfer to <strong>Thanthip Beach Resort</strong> in the Patong area.</p>
  <p>After hotel check-in, free time:</p>
  <ul>
    <li>Relax on the beach</li>
    <li>Explore the city</li>
    <li>Local restaurants</li>
    <li>Patong nightlife</li>
  </ul>
  <p>Overnight at our Phuket hotel.</p>`
  },
  {
    n: 3, optional: true, route: "Phuket / Phi Phi Islands tour",
    summary: "Full-day speedboat tour: Maya Bay, lagoons, snorkeling and buffet lunch. Evening free.",
    date: "4 December 2026 — Friday",
    image: {
      src: "phi-phi-island.jpg",
      alt: "Phi Phi Adaları — Maya Koyu ve tekne turu",
      altEn: "Phi Phi Islands — Maya Bay boat tour",
      objectPosition: "center 58%"
    },
    content: `
  <p>After breakfast, departure for a <strong>full-day Phi Phi Islands speedboat tour with lunch</strong>.</p>
  <p><strong>Program:</strong></p>
  <ul>
    <li>Maya Bay (<em>The Beach</em> film location)</li>
    <li>Pileh Lagoon</li>
    <li>Viking Cave</li>
    <li>Monkey Beach</li>
    <li>Bamboo Island</li>
    <li>Khai Island (snorkeling)</li>
  </ul>
  <p><strong>Included:</strong> Snorkeling equipment, life vest, Thai buffet lunch on board, national park fees, English-speaking guide.</p>
  <p>Evening free time in Patong. Overnight at our hotel.</p>`
  },
  {
    n: 4, optional: true, route: "Phuket / James Bond Island tour",
    summary: "Phang Nga Bay: canoeing, James Bond Island, floating village and full-day boat tour with lunch.",
    date: "5 December 2026 — Saturday",
    image: {
      src: "james-bond-island.jpg",
      alt: "James Bond Adası — Phang Nga körfezi",
      altEn: "James Bond Island — Phang Nga Bay",
      objectPosition: "center 63%"
    },
    content: `
  <p>After breakfast, <strong>full-day James Bond Island and Phang Nga Bay</strong> tour with lunch.</p>
  <p><strong>Program:</strong></p>
  <ul>
    <li>Canoe exploration of Hong Island sea caves</li>
    <li>Panak ice cave</li>
    <li>James Bond Island (Koh Tapu)</li>
    <li>Koh Panyee floating fishing village</li>
    <li>Swimming at Naka Yai beach</li>
  </ul>
  <p><strong>Included:</strong> Canoe, life vest, helmet, lunch, national park fees, guide.</p>
  <p>Overnight at our Phuket hotel.</p>`
  },
  {
    n: 5,
    optional: true,
    route: "Phuket / Khao Sok National Park",
    summary:
      "Full-day Khao Sok: rainforest, Cheow Lan Lake boat tour and floating bungalows (extra cost).",
    date: "6 December 2026 — Sunday",
    image: {
      src: "khao-sok-national-park.jpg",
      alt: "Khao Sok — Cheow Lan Gölü",
      altEn: "Khao Sok — Cheow Lan Lake",
      objectPosition: "center 49%"
    },
    content: `
  <p>After breakfast, <strong>full-day Khao Sok National Park tour</strong> (not included in the tour price; extra cost).</p>
  <p><strong>Program:</strong></p>
  <ul>
    <li>Rainforest and limestone peaks</li>
    <li><strong>Cheow Lan Lake</strong> boat tour</li>
    <li>Floating bungalows and cave exploration</li>
    <li>Paddle board / canoe or swimming stops</li>
    <li>Lunch (lakeside restaurant or on board)</li>
  </ul>
  <p><strong>Included:</strong> National park entry, lake/boat tour, lunch, guide (may vary by tour package).</p>
  <p>Evening free time in Patong. Overnight at our hotel.</p>`
  },
  {
    n: 6, route: "Phuket > Bangkok",
    summary: "Morning free; afternoon Thai AirAsia to Bangkok. Transfer to Solitaire Bangkok (7–11 Dec).",
    date: "7 December 2026 — Monday",
    image: {
      src: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
      alt: "Resort and pool",
      objectPosition: "center 72%"
    },
    content: `
  <p>After breakfast, free time: swimming in Patong, shopping, spa or <strong>Jungceylon Mall</strong>.</p>
  <p>Afternoon transfer to Phuket Airport. Departure with <strong>Thai AirAsia FD3014</strong> to Bangkok.</p>
  <p><strong>Flight:</strong> 07.12.2026 Phuket 14:00 → Bangkok 15:25.</p>
  <p>On arrival at Suvarnabhumi, private van transfer to <strong>Solitaire Bangkok Sukhumvit 11</strong> (7–11 December).</p>
  <p>Evening welcome dinner suggestion around Soi 11.</p>`
  },
  {
    n: 7, optional: true, route: "Bangkok city tour (full day)",
    summary: "Grand Palace, Wat Pho, Wat Arun, Chao Phraya boat, ICONSIAM and Yaowarat street food.",
    date: "8 December 2026 — Tuesday",
    image: {
      src: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800&q=80",
      alt: "Bangkok temple",
      objectPosition: "center 94%"
    },
    content: `
  <p>After buffet breakfast, <strong>full-day Bangkok city tour</strong>.</p>
  <p><strong>Program:</strong></p>
  <ul>
    <li><strong>Grand Palace &amp; Wat Phra Kaew</strong></li>
    <li><strong>Wat Pho</strong> — 46 m reclining Buddha</li>
    <li>Lunch at local restaurant (Tom Yum, Pad Thai)</li>
    <li><strong>Chao Phraya</strong> long-tail boat canal tour</li>
    <li><strong>Wat Arun</strong></li>
    <li>ICONSIAM free shopping</li>
    <li><strong>Yaowarat</strong> street food</li>
  </ul>
  <p><strong>Included:</strong> Entry fees, lunch, private van, licensed Turkish-speaking guide.</p>
  <p><strong>Dress code:</strong> Shoulders and knees must be covered for Grand Palace.</p>`
  },
  {
    n: 8,
    optional: true,
    route: "Bangkok · Muay Thai day",
    summary: "Full-day Muay Thai experience: ice bath, spa, training sports massage, theory and live fight at Rajadamnern Stadium, Bangkok in the evening (extra cost).",
    date: "9 December 2026 — Wednesday",
    image: {
      src: "https://images.unsplash.com/photo-1773289338370-6197ab131713?w=800&q=80",
      alt: "Muay Thai training",
      objectPosition: "center 38%"
    },
    content: `
  <p>After a late breakfast at the hotel, a <strong>full-day Muay Thai program in Bangkok</strong> (not included in the tour price; extra cost).</p>
  <p><strong>Program:</strong></p>
  <ul>
    <li>Ice bath</li>
    <li>Spa</li>
    <li>Training sports massage</li>
    <li>Muay Thai theory</li>
    <li>Evening — live Muay Thai bout at Rajadamnern Stadium, Bangkok</li>
  </ul>
  <p>Overnight at our hotel.</p>`
  },
  {
    n: 9, route: "Bangkok > Istanbul",
    summary: "Check-out, VIP transfer to Suvarnabhumi. Return to SAW with Turkish Airlines TK65; end of tour.",
    date: "10 December 2026 — Thursday",
    image: { src: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80", alt: "Airport and travel" },
    content: `
  <p>After breakfast, check-out. Private van transfer to <strong>Bangkok Suvarnabhumi Airport</strong>.</p>
  <p>After ticket, baggage and passport check-in, departure to Istanbul with <strong>Turkish Airlines TK65</strong>.</p>
  <p><strong>Arrival:</strong> Istanbul Sabiha Gökçen Airport — end of our tour. Have a safe trip!</p>`
  }
];

const PROGRAM_DAY_DETAILS = {
  tr: {
    1: `
  <p><strong>18:15</strong> — Sabiha Gökçen dış hatlar terminalinde buluşma; bilet, bagaj ve pasaport işlemleri (~2 saat).</p>
  <p><strong>18:15 → 05:35</strong> — QR242 ile Doha uçuşu (~4 saat). Aktarmada bekleme ve dinlenme (~2 saat).</p>
  <p><strong>07:35 → 15:40</strong> — QR850 ile Phuket'e uçuş (~6 saat). Geceleme uçakta; ertesi gün varış programı.</p>`,
    2: `
  <p><strong>~15:40–16:30</strong> — Phuket Havalimanı varışı, pasaport ve bagaj alımı.</p>
  <p><strong>~16:30–17:30</strong> — Özel VIP van ile Patong / Thanthip Beach Resort transfer (~1 saat).</p>
  <p><strong>~17:30+</strong> — Otel check-in. Plaj, şehir keşfi veya akşam yemeği; gece Patong'da serbest zaman.</p>`,
    3: `
  <p><strong>08:00–08:30</strong> — Otelden alınış, marina/limana transfer.</p>
  <p><strong>08:30–12:00</strong> — Hızlı tekne ile Maya Bay, Pileh Lagoon, Viking Cave ziyaretleri (~3,5 saat).</p>
  <p><strong>12:00–13:00</strong> — Tekne üzerinde Tayland büfesi öğle yemeği.</p>
  <p><strong>13:00–16:30</strong> — Monkey Beach, Bamboo ve Khai Adası; snorkel molaları.</p>
  <p><strong>17:30</strong> — Limana dönüş, otele transfer. Akşam Patong'da serbest zaman.</p>`,
    4: `
  <p><strong>08:00–08:30</strong> — Otelden alınış, Phang Nga körfezi tekne turu kalkış noktasına transfer.</p>
  <p><strong>08:30–11:30</strong> — Hong Island mağaralarında kano, Panak buz mağarası (~3 saat).</p>
  <p><strong>11:30–12:30</strong> — James Bond Adası (Koh Tapu) ve fotoğraf molası.</p>
  <p><strong>12:30–13:30</strong> — Öğle yemeği (tekne veya köy restoranı).</p>
  <p><strong>13:30–16:30</strong> — Koh Panyee yüzen köy, Naka Yai plajında yüzme.</p>
  <p><strong>17:30</strong> — Otele dönüş; akşam serbest.</p>`,
    5: `
  <p><strong>06:30–07:00</strong> — Erken kahvaltı, Phuket'ten Khao Sok'a özel araç ile transfer (~2,5–3 saat).</p>
  <p><strong>~10:00–11:30</strong> — Milli park girişi, yağmur ormanı ve kireçtaşı manzarası (~1,5 saat).</p>
  <p><strong>~11:30–14:30</strong> — Cheow Lan Gölü'nde tekne turu, yüzen bungalovlar ve mağara keşfi (~3 saat).</p>
  <p><strong>~13:00–14:00</strong> — Öğle yemeği (göl kenarı veya tekne üzerinde).</p>
  <p><strong>~14:30–17:00</strong> — Kano / paddle board veya yüzme molası; ardından Phuket'e dönüş (~2,5–3 saat).</p>
  <p><strong>~19:00+</strong> — Otele varış; Patong'da serbest zaman.</p>`,
    6: `
  <p><strong>08:00–12:00</strong> — Kahvaltı sonrası serbest zaman: plaj, Jungceylon AVM veya spa (~4 saat).</p>
  <p><strong>~12:00–13:30</strong> — Otel check-out, Phuket Havalimanı'na VIP transfer (~1 saat).</p>
  <p><strong>14:00–15:25</strong> — Thai AirAsia FD3014 ile Bangkok'a uçuş.</p>
  <p><strong>~16:00–17:00</strong> — Suvarnabhumi varışı, Solitaire Bangkok'a transfer ve check-in.</p>
  <p><strong>19:00+</strong> — Soi 11 çevresinde akşam yemeği.</p>`,
    7: `
  <p><strong>08:30–09:00</strong> — Otelden alınış, Grand Palace &amp; Wat Phra Kaew (~2 saat).</p>
  <p><strong>10:30–11:30</strong> — Wat Pho (uzanmış Buda) ziyareti (~1 saat).</p>
  <p><strong>12:00–13:00</strong> — Yerel restoranda öğle yemeği (Tom Yum, Pad Thai).</p>
  <p><strong>13:30–15:00</strong> — Chao Phraya uzun kuyruklu tekne ile kanal turu (~1,5 saat).</p>
  <p><strong>15:30–16:30</strong> — Wat Arun ziyareti (~1 saat).</p>
  <p><strong>17:00–18:30</strong> — ICONSIAM alışveriş, ardından Yaowarat sokak lezzetleri.</p>
  <p><strong>19:00</strong> — Otele dönüş.</p>`,
    8: `
  <p><strong>10:00–11:00</strong> — Geç kahvaltı, kamp/stüdyoya transfer.</p>
  <p><strong>11:00–12:30</strong> — Ice bath ve spa programı (~1,5 saat).</p>
  <p><strong>12:30–14:00</strong> — Antrenman spor masajı ve dinlenme.</p>
  <p><strong>14:30–17:00</strong> — Muay Thai teorisi ve hafif antrenman (~2,5 saat).</p>
  <p><strong>18:00–19:30</strong> — Otele dönüş, hazırlık ve akşam yemeği.</p>
  <p><strong>20:00+</strong> — Rajadamnern Stadyumu'nda canlı Muay Thai müsabakası; gece geç saatte otele dönüş.</p>`,
    9: `
  <p><strong>07:00–08:30</strong> — Kahvaltı ve otel check-out.</p>
  <p><strong>08:30–09:30</strong> — Özel van ile Suvarnabhumi Havalimanı transfer (~1 saat).</p>
  <p><strong>09:30–11:00</strong> — Check-in, bagaj ve pasaport işlemleri (~1,5 saat).</p>
  <p><strong>11:00+</strong> — Dönüş uçuşu (kalkış limanına göre); tur sonu.</p>`,
    10: `
  <p><strong>09:00–10:30</strong> — Kahvaltı, plajda dinlenme veya Pattaya/Jomtien keşfi.</p>
  <p><strong>11:00–15:00</strong> — İsteğe bağlı Coral Adası tekne turu veya Sanctuary of Truth (~4 saat).</p>
  <p><strong>16:00–18:00</strong> — Otele dönüş, dinlenme; yarınki festival için hazırlık.</p>
  <p><strong>19:00+</strong> — İsteğe bağlı Walking Street veya erken uyku.</p>`,
    11: `
  <p><strong>10:00–12:00</strong> — Geç kahvaltı, otele dinlenme ve festival kıyafeti hazırlığı.</p>
  <p><strong>12:00–17:00</strong> — Serbest zaman, hafif öğle yemeği (~5 saat).</p>
  <p><strong>18:00–19:00</strong> — Festival shuttle ile alana transfer.</p>
  <p><strong>19:00–02:00</strong> — Tomorrowland Day 2; geç saatte otele dönüş.</p>`,
    12: `
  <p><strong>08:00–09:30</strong> — Kahvaltı ve check-out.</p>
  <p><strong>09:30–11:30</strong> — Pattaya'dan Bangkok Suvarnabhumi'ye transfer (~2 saat).</p>
  <p><strong>12:00+</strong> — Havalimanında check-in; gece/ sabah dönüş uçuşu (limana göre).</p>`
  },
  en: {
    1: `
  <p><strong>18:15</strong> — Meet at Sabiha Gökçen departures; ticket, baggage and passport (~2 hours).</p>
  <p><strong>18:15 → 05:35</strong> — QR242 to Doha (~4 hours). Layover and rest (~2 hours).</p>
  <p><strong>07:35 → 15:40</strong> — QR850 to Phuket (~6 hours). Overnight on the plane; arrival programme next day.</p>`,
    2: `
  <p><strong>~15:40–16:30</strong> — Arrive Phuket Airport; passport and baggage.</p>
  <p><strong>~16:30–17:30</strong> — Private VIP van to Patong / Thanthip Beach Resort (~1 hour).</p>
  <p><strong>~17:30+</strong> — Hotel check-in. Beach, explore town or dinner; free evening in Patong.</p>`,
    3: `
  <p><strong>08:00–08:30</strong> — Hotel pickup, transfer to marina.</p>
  <p><strong>08:30–12:00</strong> — Speedboat to Maya Bay, Pileh Lagoon, Viking Cave (~3.5 hours).</p>
  <p><strong>12:00–13:00</strong> — Thai buffet lunch on board.</p>
  <p><strong>13:00–16:30</strong> — Monkey Beach, Bamboo and Khai Islands; snorkelling stops.</p>
  <p><strong>17:30</strong> — Return to pier, transfer to hotel. Free evening in Patong.</p>`,
    4: `
  <p><strong>08:00–08:30</strong> — Hotel pickup, transfer to Phang Nga pier.</p>
  <p><strong>08:30–11:30</strong> — Canoe at Hong Island caves, Panak ice cave (~3 hours).</p>
  <p><strong>11:30–12:30</strong> — James Bond Island (Koh Tapu) and photo stop.</p>
  <p><strong>12:30–13:30</strong> — Lunch on boat or at village.</p>
  <p><strong>13:30–16:30</strong> — Koh Panyee floating village, swim at Naka Yai beach.</p>
  <p><strong>17:30</strong> — Return to hotel; free evening.</p>`,
    5: `
  <p><strong>06:30–07:00</strong> — Early breakfast, drive from Phuket to Khao Sok (~2.5–3 hours).</p>
  <p><strong>~10:00–11:30</strong> — Park entry, rainforest and limestone views (~1.5 hours).</p>
  <p><strong>~11:30–14:30</strong> — Cheow Lan Lake boat tour, floating bungalows and caves (~3 hours).</p>
  <p><strong>~13:00–14:00</strong> — Lunch lakeside or on board.</p>
  <p><strong>~14:30–17:00</strong> — Canoe / paddle or swim; drive back to Phuket (~2.5–3 hours).</p>
  <p><strong>~19:00+</strong> — Arrive hotel; free time in Patong.</p>`,
    6: `
  <p><strong>08:00–12:00</strong> — Free time after breakfast: beach, Jungceylon Mall or spa (~4 hours).</p>
  <p><strong>~12:00–13:30</strong> — Check-out, VIP transfer to Phuket Airport (~1 hour).</p>
  <p><strong>14:00–15:25</strong> — Thai AirAsia FD3014 to Bangkok.</p>
  <p><strong>~16:00–17:00</strong> — Arrive Suvarnabhumi, transfer to Solitaire Bangkok and check-in.</p>
  <p><strong>19:00+</strong> — Dinner around Soi 11.</p>`,
    7: `
  <p><strong>08:30–09:00</strong> — Pickup, Grand Palace &amp; Wat Phra Kaew (~2 hours).</p>
  <p><strong>10:30–11:30</strong> — Wat Pho (reclining Buddha) (~1 hour).</p>
  <p><strong>12:00–13:00</strong> — Lunch at local restaurant (Tom Yum, Pad Thai).</p>
  <p><strong>13:30–15:00</strong> — Chao Phraya long-tail canal tour (~1.5 hours).</p>
  <p><strong>15:30–16:30</strong> — Wat Arun visit (~1 hour).</p>
  <p><strong>17:00–18:30</strong> — ICONSIAM shopping, then Yaowarat street food.</p>
  <p><strong>19:00</strong> — Return to hotel.</p>`,
    8: `
  <p><strong>10:00–11:00</strong> — Late breakfast, transfer to camp/studio.</p>
  <p><strong>11:00–12:30</strong> — Ice bath and spa (~1.5 hours).</p>
  <p><strong>12:30–14:00</strong> — Training sports massage and rest.</p>
  <p><strong>14:30–17:00</strong> — Muay Thai theory and light training (~2.5 hours).</p>
  <p><strong>18:00–19:30</strong> — Back to hotel, get ready and dinner.</p>
  <p><strong>20:00+</strong> — Live Muay Thai at Rajadamnern Stadium; late return to hotel.</p>`,
    9: `
  <p><strong>07:00–08:30</strong> — Breakfast and hotel check-out.</p>
  <p><strong>08:30–09:30</strong> — Private van to Suvarnabhumi Airport (~1 hour).</p>
  <p><strong>09:30–11:00</strong> — Check-in, baggage and passport (~1.5 hours).</p>
  <p><strong>11:00+</strong> — Return flight (per departure airport); end of tour.</p>`,
    10: `
  <p><strong>09:00–10:30</strong> — Breakfast, beach or explore Pattaya/Jomtien.</p>
  <p><strong>11:00–15:00</strong> — Optional Coral Island boat or Sanctuary of Truth (~4 hours).</p>
  <p><strong>16:00–18:00</strong> — Back to hotel, rest; prep for tomorrow's festival.</p>
  <p><strong>19:00+</strong> — Optional Walking Street or early night.</p>`,
    11: `
  <p><strong>10:00–12:00</strong> — Late breakfast, rest at hotel, festival outfit.</p>
  <p><strong>12:00–17:00</strong> — Free time, light lunch (~5 hours).</p>
  <p><strong>18:00–19:00</strong> — Festival shuttle to venue.</p>
  <p><strong>19:00–02:00</strong> — Tomorrowland Day 2; late return to hotel.</p>`,
    12: `
  <p><strong>08:00–09:30</strong> — Breakfast and check-out.</p>
  <p><strong>09:30–11:30</strong> — Transfer Pattaya to Bangkok Suvarnabhumi (~2 hours).</p>
  <p><strong>12:00+</strong> — Airport check-in; overnight/morning return flight (per port).</p>`
  }
};

const PROGRAM_DAY_DETAILS_TML = {
  tr: {
    9: `
  <p><strong>08:00–10:00</strong> — Kahvaltı ve Bangkok otel check-out.</p>
  <p><strong>10:00–12:00</strong> — Özel transferle Pattaya'ya (~2 saat).</p>
  <p><strong>12:00–16:00</strong> — Royal Cliff Beach Terrace check-in, dinlenme ve hazırlık.</p>
  <p><strong>17:00–18:00</strong> — Festival shuttle ile alana transfer.</p>
  <p><strong>18:00–01:00</strong> — Tomorrowland Day 1; geç saatte otele dönüş.</p>`
  },
  en: {
    9: `
  <p><strong>08:00–10:00</strong> — Breakfast and Bangkok hotel check-out.</p>
  <p><strong>10:00–12:00</strong> — Private transfer to Pattaya (~2 hours).</p>
  <p><strong>12:00–16:00</strong> — Royal Cliff Beach Terrace check-in, rest and prep.</p>
  <p><strong>17:00–18:00</strong> — Festival shuttle to venue.</p>
  <p><strong>18:00–01:00</strong> — Tomorrowland Day 1; late return to hotel.</p>`
  }
};

const PROGRAM_DAY_NARRATIVE = {
  tr: {
    1: `<p>Tayland maceramızın başlangıcında {{DEPARTURE_AIRPORT}}'nda buluşarak check-in, bagaj ve pasaport işlemlerimizi tamamlıyor, heyecan dolu yolculuğumuza başlıyoruz. {{OUTBOUND_CONNECTIONS}} uzun uçuş boyunca geceyi uçakta geçirirken Asya'nın egzotik atmosferine doğru ilerliyoruz. Yolculuk boyunca dinlenme ve aktarma molalarıyla birlikte farklı havalimanı deneyimleri yaşayacak, sabah saatlerinde palmiye ağaçları ve tropik havasıyla ünlü Phuket'e vararak unutulmaz tatilimizin ilk gününe adım atacağız.</p>`,
    2: `<p>Sabah Phuket Uluslararası Havalimanı'na varışımızın ardından pasaport ve bagaj işlemlerimizi tamamlayıp özel transfer aracımızla konaklayacağımız bölgeye geçiyoruz. Otel check-in işlemleri sonrası günün geri kalanında Phuket Old Town'un renkli sokaklarını keşfedebilir, Tayland sokak lezzetlerini deneyebilir veya Patong sahilinde tropik atmosferin tadını çıkarabilirsiniz. İlk günümüz, uzun yolculuğun ardından dinlenme ve Tayland kültürüne yavaş yavaş adapte olma fırsatı sunarken akşam saatlerinde canlı gece hayatı ve hareketli sokaklarıyla Phuket'in enerjisini hissetmeye başlıyoruz.</p>`,
    3: `<p>Kahvaltının ardından Tayland'ın en ünlü doğal güzelliklerinden biri olan Phi Phi Adaları için tam günlük sürat teknesi turuna çıkıyoruz. Tur boyunca Maya Bay'in bembeyaz kumsalları, Viking Cave'in etkileyici kayalıkları ve Monkey Beach'in tropik atmosferi eşliğinde yüzme ve snorkel molaları veriyoruz. Turkuaz renkteki berrak sularda yüzme fırsatı bulurken, teknede sunulan öğle yemeği ve gün boyu süren ada keşfi sayesinde Andaman Denizi'nin eşsiz güzelliğini doyasıya deneyimliyoruz. Gün sonunda Phuket'e dönüş yaparak akşam saatlerini serbest şekilde değerlendirebilirsiniz.</p>`,
    4: `<p>Bugün rotamız, Phang Nga Körfezi'nin büyüleyici doğası içerisinde yer alan ve dünyaca ünlü James Bond filmiyle ünlenen James Bond Adası. Kano gezileriyle gizli mağaraları ve lagünleri keşfederken devasa kireçtaşı kayalıkları arasında unutulmaz manzaralar eşliğinde keyifli bir tekne turu gerçekleştiriyoruz. Öğle yemeği sonrası Koh Tapu çevresinde fotoğraf molaları verirken, Tayland'ın en ikonik doğal noktalarından birini yakından görme fırsatı yakalıyoruz. Gün boyunca hem doğa hem deniz keyfini bir arada yaşayacağımız bu tur, seyahatin en özel deneyimlerinden biri olacak.</p>`,
    5: `<p>Sabah erken saatlerde Tayland'ın en etkileyici doğal alanlarından biri olan Khao Sok Milli Parkı'na doğru yola çıkıyoruz. Yağmur ormanlarıyla çevrili bölgede Cheow Lan Gölü üzerinde gerçekleştireceğimiz tekne gezisi sırasında büyüleyici manzaralar eşliğinde doğanın huzurunu hissediyoruz. Bölgedeki mağaralar, göl evleri ve yemyeşil tropik doğa sayesinde Tayland'ın farklı yüzünü keşfederken kano, yüzme ve doğa aktiviteleriyle dolu unutulmaz bir gün geçiriyoruz. Şehir kalabalığından uzak bu deneyim, turun en sakin ve en etkileyici günlerinden biri olacak.</p>`,
    6: `<p>Kahvaltının ardından Phuket'te son serbest zamanımızı değerlendiriyor; alışveriş, plaj veya spa keyfiyle tropik tatilin son saatlerinin tadını çıkarıyoruz. Ardından havalimanına transfer olarak Bangkok uçuşumuza geçiyoruz. Tayland'ın modern yüzü olarak bilinen Bangkok'a varışımız sonrası otelimize transfer oluyor ve kısa bir dinlenmenin ardından şehrin enerjik atmosferiyle tanışıyoruz. Akşam saatlerinde Bangkok'un meşhur gece hayatını keşfedebilir, sokak lezzetlerini deneyebilir veya şehrin ışıklı caddelerinde keyifli bir yürüyüş yapabilirsiniz.</p>`,
    7: `<p>Bugün Bangkok'un tarihi, kültürel ve modern yüzünü bir arada keşfedeceğimiz dolu dolu bir şehir turu gerçekleştiriyoruz. Grand Palace ve Wat Phra Kaew gibi Tayland'ın en önemli tarihi yapılarını ziyaret ederken Budist kültürü hakkında bilgi ediniyoruz. Ardından Wat Pho ve Chao Phraya Nehri çevresinde şehrin geleneksel atmosferini deneyimliyor, kanal turu sırasında Bangkok'un farklı yaşam tarzını yakından gözlemliyoruz. Günün devamında alışveriş ve yerel lezzet duraklarıyla Bangkok'un hareketli yaşamını keşfederken akşam saatlerinde şehrin renkli atmosferinin tadını çıkarıyoruz.</p>`,
    8: `<p>Bangkok'taki son tam günümüzde Tayland kültürünün en önemli sembollerinden biri olan Muay Thai deneyimi bizi bekliyor. Gün boyunca antrenman alanlarını ziyaret ederek Muay Thai'nin temel tekniklerini ve tarihini yakından tanıma fırsatı buluyoruz. Spa, dinlenme ve hafif antrenmanlarla geçen günün ardından akşam saatlerinde canlı Muay Thai müsabakasını izleyerek Tayland spor kültürünün heyecanını yerinde hissediyoruz. Hem eğlenceli hem de farklı bir deneyim sunan bu gün, Bangkok seyahatimizin en unutulmaz anlarından biri olacak.</p>`,
    9: `<p>Turumuzun son gününde otelden ayrılarak Bangkok Havalimanı'na transfer oluyor ve dönüş yolculuğumuza başlıyoruz. {{RETURN_TRANSIT}} uçuşumuz boyunca Tayland'da geçirdiğimiz unutulmaz günleri, tropik adaları, egzotik lezzetleri ve eşsiz deneyimleri geride bırakırken bolca anı ve fotoğrafla eve dönüyoruz. {{ARRIVAL_CITY}} varışımızla birlikte masmavi denizler, hareketli şehirler ve benzersiz kültürel deneyimlerle dolu Tayland maceramız sona eriyor.</p>`,
    10: `<p>Festival arası dinlenme gününde kahvaltı sonrası Pattaya veya Jomtien plajında vakit geçirebiliriz. İstersek Coral Adası tekne turuna veya Sanctuary of Truth ziyaretine çıkabiliriz. Öğleden sonra otele dönüp dinleniyoruz; akşam Walking Street'e gidebilir veya erken uyuyabiliriz.</p>`,
    11: `<p>Geç kahvaltı yapıp otelde dinleniyoruz ve gün boyu festival için enerji depoluyoruz. Öğleden sonra hafif öğle yemeği yiyoruz, akşam festival shuttle ile alana gidiyoruz ve Tomorrowland'ın ikinci gününü geç saatlere kadar yaşıyoruz; gece otele dönüyoruz.</p>`,
    12: `<p>Kahvaltı ve check-out sonrası Pattaya'dan Bangkok Suvarnabhumi Havalimanı'na özel transferle gidiyoruz. Havalimanında check-in işlemlerimizi tamamlıyoruz; kalkış limanınıza göre gece veya sabah dönüş uçuşumuza biniyoruz.</p>`
  },
  en: {
    1: `<p>Our Thailand adventure begins at {{DEPARTURE_AIRPORT}}, where we meet, check in and complete baggage and passport formalities before setting off. {{OUTBOUND_CONNECTIONS}} we spend the night on board, heading into Asia's exotic atmosphere. With rest and layover breaks along the way, we experience different airports and step into Phuket in the morning — palm trees and tropical air — for the first day of an unforgettable holiday.</p>`,
    2: `<p>After landing at Phuket International Airport we complete passport and baggage, then transfer by private van to our accommodation area. After hotel check-in you can explore colourful Phuket Old Town, try Thai street food or enjoy Patong beach. Our first day offers rest after the long journey and a gentle introduction to Thai culture; by evening we feel Phuket's energy in its lively nightlife and busy streets.</p>`,
    3: `<p>After breakfast we head out on a full-day speedboat tour to the Phi Phi Islands, one of Thailand's most famous natural wonders. We swim and snorkel at Maya Bay's white sands, Viking Cave's dramatic cliffs and Monkey Beach's tropical setting. With turquoise clear water, lunch on the boat and island-hopping all day, we experience the Andaman Sea at its best. We return to Phuket in the evening for free time.</p>`,
    4: `<p>Today we visit James Bond Island in the stunning Phang Nga Bay, famous worldwide from the film. By canoe we explore hidden caves and lagoons among towering limestone karsts on a memorable boat tour. After lunch we take photos around Koh Tapu and see one of Thailand's most iconic natural sights up close. A special day combining nature and sea.</p>`,
    5: `<p>Early morning we drive to Khao Sok National Park, one of Thailand's most impressive natural areas. On Cheow Lan Lake we enjoy a boat trip through rainforest scenery and feel the peace of nature. Caves, lake houses and lush tropical forest show another side of Thailand as we spend an unforgettable day with kayaking, swimming and outdoor activities — one of the calmest and most striking days of the tour.</p>`,
    6: `<p>After breakfast we enjoy our last free time in Phuket — shopping, beach or spa — before transferring to the airport for our flight to Bangkok. On arrival we check in at our hotel and rest briefly before discovering the city's energetic atmosphere. In the evening you can explore Bangkok nightlife, street food or a stroll along the lit streets.</p>`,
    7: `<p>Today we take a full city tour covering Bangkok's historic, cultural and modern sides. We visit the Grand Palace and Wat Phra Kaew and learn about Buddhist culture, then Wat Pho and the Chao Phraya area. A canal tour shows everyday Bangkok; later we shop and taste local food. By evening we enjoy the city's colourful atmosphere.</p>`,
    8: `<p>On our last full day in Bangkok we experience Muay Thai, a symbol of Thai culture. We visit training venues and learn basic techniques and history. After spa, rest and light training we watch a live Muay Thai match in the evening and feel Thailand's sporting excitement firsthand — one of the most memorable days in Bangkok.</p>`,
    9: `<p>On our final day we check out and transfer to Bangkok Airport for the journey home. On our {{RETURN_TRANSIT}} flight we leave behind unforgettable days, tropical islands, exotic flavours and unique experiences, returning with memories and photos. With our arrival in {{ARRIVAL_CITY}}, our Thailand adventure — blue seas, vibrant cities and rich culture — comes to an end.</p>`,
    10: `<p>On our rest day between festival dates we have breakfast, then relax on the beach in Pattaya or Jomtien. We can optionally take a Coral Island boat tour or visit Sanctuary of Truth. We return to the hotel to rest; in the evening we may visit Walking Street or turn in early.</p>`,
    11: `<p>We have a late breakfast and rest at the hotel to save energy for the festival. We have a light lunch in the afternoon, then take the festival shuttle to the venue for Tomorrowland Day 2 until late night; we return to the hotel.</p>`,
    12: `<p>After breakfast and check-out we transfer from Pattaya to Bangkok Suvarnabhumi. We complete airport check-in and board our return flight overnight or in the morning depending on your departure airport.</p>`
  }
};

const PROGRAM_DAY_NARRATIVE_TML = {
  tr: {
    9: `<p>Kahvaltı ve Bangkok otel check-out sonrası özel transferle Pattaya'ya geçiyoruz ve Royal Cliff Beach Terrace otelinde check-in yapıyoruz. Gün boyu dinlenip festival için hazırlanıyoruz; akşam shuttle ile Tomorrowland Thailand Day 1'e gidiyoruz, açılış gecesini izliyoruz ve geç saatte otele dönüyoruz.</p>`
  },
  en: {
    9: `<p>After breakfast and Bangkok hotel check-out we transfer to Pattaya and check in at Royal Cliff Beach Terrace. We rest and prepare for the festival during the day; in the evening we take the shuttle to Tomorrowland Thailand Day 1, enjoy opening night, then return late to the hotel.</p>`
  }
};

function detailsParagraphsToList(html) {
  return html
    .trim()
    .split(/\n+/)
    .map(function (line) {
      return line.trim().replace(/^<p>/i, "<li>").replace(/<\/p>$/i, "</li>");
    })
    .filter(Boolean)
    .join("\n        ");
}

function mergeProgramSchedule(days, lang, tour) {
  const key = lang === "en" ? "en" : "tr";
  const base = PROGRAM_DAY_DETAILS[key] || PROGRAM_DAY_DETAILS.tr;
  const tmlExtra =
    tour === "tomorrowland" ? PROGRAM_DAY_DETAILS_TML[key] || {} : {};
  const narrativeBase = PROGRAM_DAY_NARRATIVE[key] || PROGRAM_DAY_NARRATIVE.tr;
  const narrativeTml =
    tour === "tomorrowland" ? PROGRAM_DAY_NARRATIVE_TML[key] || {} : {};
  const programLabel = lang === "en" ? "Program:" : "Program:";
  return days.map(function (d) {
    const details = (tmlExtra[d.n] || base[d.n] || "").trim();
    const narrative = (narrativeTml[d.n] || narrativeBase[d.n] || "").trim();
    if (!details && !narrative) return d;
    let content = d.content || "";
    if (details) {
      const programUl =
        "<ul>\n        " + detailsParagraphsToList(details) + "\n      </ul>";
      const programBlock =
        '<p><strong>' + programLabel + "</strong></p>\n      " + programUl;
      if (
        /<p><strong>Program:<\/strong><\/p>\s*<ul>[\s\S]*?<\/ul>/i.test(content)
      ) {
        content = content.replace(
          /<p><strong>Program:<\/strong><\/p>\s*<ul>[\s\S]*?<\/ul>/i,
          programBlock
        );
      } else if (
        /<p><strong>Önerilen aktiviteler:<\/strong><\/p>\s*<ul>[\s\S]*?<\/ul>/i.test(
          content
        )
      ) {
        content = content.replace(
          /<p><strong>Önerilen aktiviteler:<\/strong><\/p>\s*<ul>[\s\S]*?<\/ul>/i,
          programBlock
        );
      } else if (
        /<p><strong>Recommended activities:<\/strong><\/p>\s*<ul>[\s\S]*?<\/ul>/i.test(
          content
        )
      ) {
        content = content.replace(
          /<p><strong>Recommended activities:<\/strong><\/p>\s*<ul>[\s\S]*?<\/ul>/i,
          programBlock
        );
      } else if (
        /<p>[^<]*(?:serbest zaman|free time)[^<]*<\/p>\s*<ul>[\s\S]*?<\/ul>/i.test(
          content
        )
      ) {
        content = content.replace(
          /<p>[^<]*(?:serbest zaman|free time)[^<]*<\/p>\s*<ul>[\s\S]*?<\/ul>/i,
          programBlock
        );
      } else {
        const firstClose = content.indexOf("</p>");
        if (firstClose > 0) {
          content =
            content.slice(0, firstClose + 4) +
            "\n      " +
            programBlock +
            content.slice(firstClose + 4);
        }
      }
    }
    const merged = Object.assign({}, d, { content: content });
    if (narrative) merged.dayNarrative = narrative;
    return merged;
  });
}

function splitAfterProgram(html) {
  const trimmed = (html || "").trim();
  const m = trimmed.match(
    /<p><strong>Program:<\/strong><\/p>\s*<ul>[\s\S]*?<\/ul>/i
  );
  if (!m) return { head: trimmed, tail: "" };
  const end = trimmed.indexOf(m[0]) + m[0].length;
  return {
    head: trimmed.slice(0, end).trim(),
    tail: trimmed.slice(end).trim()
  };
}

function extractProgramAccordion(html) {
  const trimmed = (html || "").trim();
  const m = trimmed.match(
    /<p><strong>Program:<\/strong><\/p>\s*(<ul>[\s\S]*?<\/ul>)/i
  );
  if (!m) {
    return { intro: trimmed, programHtml: "", after: "" };
  }
  const start = trimmed.indexOf(m[0]);
  return {
    intro: trimmed.slice(0, start).trim(),
    programHtml: m[1].trim(),
    after: trimmed.slice(start + m[0].length).trim()
  };
}

function splitDayModalContent(html) {
  const trimmed = (html || "").trim();
  if (!trimmed) return { main: "", foot: "" };
  const hoursRe = /<p><strong>(?:Saatler|Hours):<\/strong>[\s\S]*?<\/p>/i;
  const match = trimmed.match(hoursRe);
  if (match) {
    const endIdx = trimmed.indexOf(match[0]) + match[0].length;
    return {
      main: trimmed.slice(0, endIdx).trim(),
      foot: trimmed.slice(endIdx).trim()
    };
  }
  const footRe =
    /<p>(?:Akşam|Evening|Geceleme|Overnight|Yarın|After breakfast, check-out|Kahvaltı sonrası check-out)/i;
  const footIdx = trimmed.search(footRe);
  if (footIdx > 0) {
    return {
      main: trimmed.slice(0, footIdx).trim(),
      foot: trimmed.slice(footIdx).trim()
    };
  }
  return { main: trimmed, foot: "" };
}

const sidebarIncluded_en = [
  "Round-trip international economy flights + Phuket–Bangkok domestic (per departure airport)",
  "Thai AirAsia Phuket → Bangkok domestic (7 kg cabin included)",
  "Phuket — Thanthip Beach Resort Patong (4★), 2–7 Dec 2026 · breakfast included",
  "Bangkok — Solitaire Bangkok Sukhumvit 11 (4★), 7–11 Dec 2026 · breakfast included",
  "All airport and city transfers (private VIP van)",
  "Professional English/Turkish guiding service",
  "24/7 support service"
];

const includedBottom_en = [
  "All flights (international and Phuket–Bangkok domestic)",
  "Accommodation",
  "VIP van transfers",
  "English/Turkish guiding",
  "24/7 support service"
];

const excludedBottom_en = [
  "Meals (lunch and dinner except breakfast)",
  "Personal expenses and tips",
  "Extra activities (Muay Thai class, spa, massage etc.)",
  "Travel insurance (recommended, can be purchased separately)"
];

const generalHtml_en = `
  <h3>About Thailand</h3>
  <ul>
    <li><strong>Currency:</strong> Thai Baht (THB) — 1€ ≈ 38-40 THB</li>
    <li><strong>Climate:</strong> 25-32°C in December, dry season</li>
    <li><strong>Time difference:</strong> +4 hours ahead of Turkey (GMT+7)</li>
    <li><strong>Language:</strong> Thai; English widely used in tourist areas</li>
    <li><strong>Electricity:</strong> 220V, mostly type A/B/C plugs</li>
    <li><strong>Vaccinations:</strong> Yellow fever recommended (not mandatory)</li>
  </ul>
  <p style="font-size:0.85rem;color:var(--text-muted);margin-top:0.5rem">Select your passport country above for country-specific visa requirements.</p>
`;

const importantInfoHtml = `
  <h2>Katılım Koşulları</h2>
  <div class="terms-item">
    <h4>Aracılık ve Sorumluluk</h4>
    <p><strong>Kıbrıslı Gezgin</strong>, hava yolu ile yolcu arasında aracı konumundadır ve 28.09.1955 Lahey Protokolü'ne tabidir. Uçuş saatleri değişebilir; tüm saatlerin hareket tarihlerinden 48 saat önce teyit edilmesi gerekmektedir. Uçağın ineceği şehre göre parkurlarda değişiklikler olabilir. Uçuş saatleri hakkında bizden veya satış temsilcinizden bilgi alabilirsiniz. Hava yolu şirketleri tarafından yapılabilecek saat değişiklikleri ve rötarlardan Kıbrıslı Gezgin sorumlu tutulamaz.</p>
  </div>
  <div class="terms-item">
    <h4>Uçuş İşlemleri</h4>
    <p>Uçaklı turlara katılan kişilerin check-in ve boarding işlemleri kişisel sorumluluklarındadır ve uçuş öncesinde havalimanında hava yolu kontuarlarında veya online olarak yapılmalıdır. Son dakika rötarları ve kapı değişiklikleri havalimanlarında sesli anons edilmekte ve bilgi panolarında gösterilmektedir. Bu bilgilerin takip edilmesi gerekmektedir.</p>
  </div>
  ${visaInfoHtml}
  <div class="terms-item">
    <h4>Tura Katılım</h4>
    <p>Kıbrıslı Gezgin tarafından bildirilen saatlerde belirtilen havalimanında hazır bulunmayan, check-in ve boarding işlemlerini zamanında yapmayan ya da uçağa binmeyen kişilerin uçuşu gerçekleştirememelerinden Kıbrıslı Gezgin sorumlu değildir. Uçağı kaçıran kişilerin tura dahil olmaları için gerekli olan gidiş-dönüş yeni uçak biletleri ve bölgedeki transfer masrafları kendilerine aittir.</p>
    <p>Program kapsamındaki geziler zorlayıcı nedenler, hava koşulları, yerel otorite kararları veya kapalı yollar nedeniyle belirtilen günler dışında yapılabilir, ertelenebilir veya yapılamayabilir; bu hallerde Kıbrıslı Gezgin sorumlu tutulmaz. Araç girişinin mümkün olmadığı noktalarda program yaya veya toplu taşıma ile sürdürülebilir.</p>
    <p>Şehir ve opsiyonel turlar içeriği değişmemek kaydıyla farklı günlere alınabilir; opsiyonel tur ücretleri içerik ve katılım sayısına göre değişebilir. Yeterli katılım olmayan opsiyonel geziler yapılmayabilir; yol üzeri opsiyonel turlar tüm misafirler katılmasa da gerçekleştirilebilir. Katılmayan misafirler rehber yönlendirmesiyle dinlenme alanında bekler ve bu beklemeyi kabul ederek tura katılmış sayılır.</p>
  </div>
  <div class="terms-item">
    <h4>Kişisel Eşyalar</h4>
    <p>Tura iştirak eden kişilerin şahsi eşyaları, çantaları ve valizleri kendi sorumluluğundadır. Unutulan, kaybolan veya çalınan eşyaların bulunması durumunda, ülkeye veya kişiye ulaştırılması sırasında yapılan masraflar eşya sahibine aittir.</p>
  </div>
  <div class="terms-item">
    <h4>Pasaport geçerlilik tarihi</h4>
    <p>Yurt dışına seyahat edecek tüm yolcularımızın, mevcut geçerli bulunan pasaportlarının ilk alış tarihi 10 yıldan eski olmamalıdır. Ayrıca seyahat bitimi itibariyle geçerlilik sürelerinin 6 aylık olması gerekmektedir. Pasaportunu yenileyecek misafirlerimiz satın alma sırasında geçerli pasaport bilgisi vermediği takdirde ilerleyen günlerde güncel pasaport bilgilerini satın aldığı kanal aracılığıyla paylaşmakla yükümlüdür.</p>
  </div>
  <h2>İptal Şartları</h2>
  <div class="terms-item">
    <p>Turun kalkış tarihinden 30 gün öncesine kadar cezasız iptal hakkı bulunmaktadır.</p>
  </div>
  <div class="terms-item">
    <p>Gezi için yeterli katılım sağlanamadığı takdirde; son iptal bildirim tarihi, gezi hareket tarihinden 30 gün öncesi olarak belirlenmiştir. Böyle bir durum geliştiğinde iptal bilgisi misafire iletilir.</p>
  </div>
  <div class="terms-item">
    <p><strong>Kıbrıslı Gezgin</strong>, misafirin doğrudan otel, havayolu vb. tedarikçi ile iletişime geçerek yaptığı herhangi bir değişiklik veya iptal işlemi için sorumluluk kabul etmeyecektir. Bu durumda tur sözleşmesindeki İptal Koşulları geçerlidir.</p>
  </div>
`;

const importantInfoHtml_en = `
  <h2>Participation Terms</h2>
  <div class="terms-item">
    <h4>Agency &amp; Liability</h4>
    <p>We act as an intermediary between the airline and the passenger and are subject to the Hague Protocol of 28.09.1955. Flight times may change; all times must be reconfirmed 48 hours before departure. Routes may vary depending on the arrival city. Contact us or your sales representative for schedule updates. We cannot be held responsible for schedule changes or delays made by airlines.</p>
  </div>
  <div class="terms-item">
    <h4>Flight Procedures</h4>
    <p>Participants on flight-inclusive tours are personally responsible for check-in and boarding, which must be completed at airline counters or online before departure. Last-minute delays and gate changes are announced at airports and shown on information boards; passengers must follow these announcements.</p>
  </div>
  ${visaInfoHtml_en}
  <div class="terms-item">
    <h4>Tour Participation</h4>
    <p>We are not responsible if participants are not at the specified airport at the announced time, fail to complete check-in/boarding on time, or miss the flight. Passengers who miss their flight must cover the cost of new round-trip tickets and local transfers required to join the tour.</p>
    <p>Program tours may take place on different days, be rescheduled or not run due to force majeure, weather, local authority decisions or road closures; we are not liable in such cases. Where vehicles cannot enter, the program may continue on foot or by public transport.</p>
    <p>City and optional tours may be moved to other days without changing content; optional tour prices may vary by content and group size. Optional tours may not operate without sufficient participation; en-route optional tours may run without all guests joining. Non-participants will wait at a rest area as directed by the guide and are considered to have joined the tour by accepting this wait.</p>
  </div>
  <div class="terms-item">
    <h4>Personal Belongings</h4>
    <p>Personal items, bags and luggage are the passenger's responsibility. Costs to return lost, forgotten or stolen items to the owner or country are borne by the owner.</p>
  </div>
  <div class="terms-item">
    <h4>Hotels &amp; Accommodation</h4>
    <p>We reserve the right to change hotel names. Triple rooms may include extra beds (sofa/fold-out/coach beds); crowding and bed type in triple/child bookings are accepted. Child prices apply when the child shares a room with two adults. Continental breakfast typically includes butter, jam or honey, bread, tea or coffee and juice. Group breakfasts may be served in a separate hall.</p>
  </div>
  <div class="terms-item">
    <h4>Passport validity</h4>
    <p>Passports must not be more than 10 years from the original issue date and must be valid for at least 6 months after the end of travel. Guests renewing passports must share updated passport details through their booking channel if valid details were not provided at purchase.</p>
  </div>
  <h2>Cancellation Terms</h2>
  <div class="terms-item">
    <p>You may cancel without penalty up to 30 days before the tour departure date.</p>
  </div>
  <div class="terms-item">
    <p>If sufficient participation for the trip cannot be secured, the latest cancellation notice date is set as 30 days before the departure date. In such a case, guests will be notified of the cancellation.</p>
  </div>
  <div class="terms-item">
    <p>We will not accept responsibility for any change or cancellation made by the guest through direct contact with suppliers such as hotels, airlines, etc. In such cases, the Cancellation Terms in the tour contract apply.</p>
  </div>
`;

const accommodationHtml_en = `
  <h3>Phuket — Thanthip Beach Resort Patong (4★)</h3>
  <p><strong>2–7 December 2026</strong> (5 nights) · breakfast included</p>
  <p>Twin room; ~200 m to Patong beach; outdoor pool, restaurant and bar; free WiFi.</p>
  <ul>
    <li><strong>Location:</strong> Central Patong</li>
    <li><strong>Room type:</strong> Twin / double standard — air-conditioned</li>
    <li><strong>Check-in / Check-out:</strong> 14:00 / 12:00</li>
  </ul>
  <h3>Bangkok — Solitaire Bangkok Sukhumvit 11 (4★ Superior)</h3>
  <p><strong>7–11 December 2026</strong> (4 nights) · breakfast included</p>
  <p>Twin Superior room; walking distance to Nana BTS; rooftop pool, spa and fitness.</p>
  <ul>
    <li><strong>Location:</strong> Sukhumvit Soi 11</li>
    <li><strong>Check-in / Check-out:</strong> 14:00 / 12:00</li>
  </ul>
  <p style="font-size:0.85rem;color:var(--text-muted)">Same hotels and dates for all Comfort departures. Hotels subject to change; same category or higher guaranteed.</p>
  ${accommodationNotesHtml_en}
`;

const flightsHtml_en = `
  <h3>Outbound flights</h3>
  <p><strong>Qatar Airways QR242 — Istanbul (SAW) → Doha (DOH)</strong><br />Dep: 02.12.2026 18:15 · Arr: 03.12.2026 05:35</p>
  <p><strong>Qatar Airways QR850 — Doha (DOH) → Phuket (HKT)</strong><br />Dep: 03.12.2026 07:35 · Arr: 03.12.2026 15:40</p>
  <h3>Domestic flight (Phuket → Bangkok)</h3>
  <p><strong>Thai AirAsia FD3014 — Phuket (HKT) → Bangkok (BKK)</strong><br />Dep: 08.12.2026 14:00 · Arr: 08.12.2026 15:25</p>
  <h3>Return flight</h3>
  <p><strong>Turkish Airlines TK65 — Bangkok (BKK) → Istanbul (SAW)</strong><br />Dep: 10.12.2026 09:25 · Arr: 10.12.2026 15:10</p>
  <h3>Baggage info</h3>
  <ul>
    <li><strong>International:</strong> 7 kg cabin baggage included · 20 kg checked baggage extra</li>
    <li><strong>Domestic (Thai AirAsia):</strong> 7 kg cabin baggage included · 20 kg checked baggage extra</li>
  </ul>
  <p style="font-size:0.85rem;color:var(--text-muted)">Exact flight info is shared upon tour confirmation.</p>
`;

/* ─── TOMORROWLAND PACKAGE — Program Days ─────────────────────────────
   Full Phuket & Bangkok tour (days 1-8) + Pattaya / Tomorrowland
   extension (days 9-12). The festival days are appended to the normal
   itinerary's first 8 days so nothing is lost. */
const festivalDays_tml = [
  {
    n: 9,
    route: "Bangkok → Pattaya · Tomorrowland Day 1",
    summary: "Bangkok'tan Pattaya'ya transfer, otele yerleşme. Akşam Tomorrowland Day 1.",
    date: "11 Aralık 2026 — Cuma",
    image: { src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80", alt: "Tomorrowland sahne" },
    content: `
  <p>Otelde kahvaltı ve check-out sonrası <strong>özel transferle Pattaya'ya</strong> geçiş (1.5-2 saat).</p>
  <p><strong>Royal Cliff Beach Terrace Pattaya</strong> otelinde check-in. Festival hazırlığı, dinlenme.</p>
  <p>Akşam festival shuttle servisi ile <strong>Tomorrowland Thailand Day 1</strong>'e hareket. Açılış gecesi, ana sahne show. Geç saatlerde otele dönüş.</p>`
  },
  {
    n: 10,
    route: "Pattaya serbest gün",
    summary: "Plaj, dinlenme, isteğe bağlı tekne turları veya Pattaya keşfi.",
    date: "12 Aralık 2026 — Cumartesi",
    image: { src: "https://images.unsplash.com/photo-1625276413000-12c38e7b7d0a?w=800&q=80", alt: "Pattaya plajı" },
    content: `
  <p>Festival arası dinlenme günü. Otelde kahvaltı sonrası serbest zaman.</p>
  <p><strong>Önerilen aktiviteler:</strong></p>
  <ul>
    <li>Pattaya Plajı / Jomtien Plajı — denize girme, dinlenme</li>
    <li>Coral Adası (Koh Larn) tekne turu — kristal sular</li>
    <li>Sanctuary of Truth — ahşap dev tapınak</li>
    <li>Walking Street — gece hayatı</li>
    <li>Floating Market — geleneksel pazar</li>
  </ul>
  <p>Yarın son festival günü için enerji depolama.</p>`
  },
  {
    n: 11,
    route: "Tomorrowland Day 2",
    summary: "Festivalin kapanış günü — büyük ana sahne, headliner sanatçılar.",
    date: "13 Aralık 2026 — Pazar",
    image: { src: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80", alt: "Festival kalabalık" },
    content: `
  <p>Otelde geç kahvaltı, gün boyu dinlenme ve hazırlık.</p>
  <p>Akşam festival shuttle servisi ile <strong>Tomorrowland Day 2</strong>'ye hareket. Büyük ana sahnede festival son gecesi: headliner DJ'ler, kapanış show'u, havai fişek gösterisi.</p>
  <p>Geç saatlerde otele dönüş.</p>`
  },
  {
    n: 12,
    route: "Pattaya → Bangkok → dönüş",
    summary: "Otelde kahvaltı, BKK transferi; 14 Aralık gece uçuşu (kalkış limanına göre).",
    date: "14 Aralık 2026 — Pazartesi",
    image: { src: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80", alt: "Uçak" },
    content: `
  <p>Otelde kahvaltı sonrası check-out. Özel transferle Bangkok Suvarnabhumi'ye (1.5-2 saat).</p>
  <p><strong>Dönüş uçuşu</strong> kalkış limanınıza göre değişir — İstanbul: <strong>TK8548</strong> 14.12.2026 23:45 → 15.12.2026 06:05 IST.</p>
  <p>Uçuş sekmesinde seçili limanın 14 Aralık dönüş detayları listelenir.</p>`
  }
];

const PROGRAM_DAY_OVERRIDES_TML_RETURN_BY_PORT = {
  tr: {
    istanbul: {
      12: {
        route: "Pattaya → Bangkok → İstanbul",
        summary: "Check-out; gece TK8548 ile İstanbul Havalimanı'na varış (15 Aralık sabah).",
        content: `
  <p>Kahvaltı sonrası check-out ve BKK transferi.</p>
  <ul><li>TK8548: 14.12.2026 23:45 BKK → 15.12.2026 06:05 IST</li></ul>
  <p><strong>Varış:</strong> İstanbul Havalimanı (IST) — tur sonu.</p>`
      }
    },
    ercan: {
      12: {
        route: "Pattaya → Bangkok → İstanbul > Ercan",
        summary: "Gece TK8548 + sabah IST–ECN ile Ercan varışı.",
        content: `
  <p>BKK transferi sonrası:</p>
  <ul>
    <li>TK8548: 14.12.2026 23:45 → 15.12.2026 06:05 IST</li>
    <li>IST → ECN: 15.12.2026 07:45 · 08:20</li>
  </ul>
  <p><strong>Varış:</strong> Ercan (ECN) — tur sonu.</p>`
      }
    },
    larnaca: {
      12: {
        route: "Pattaya → Bangkok > Doha > Larnaca",
        summary: "Sabah erken BKK; Qatar ile 14 Aralık Larnaca varışı.",
        content: `
  <ul>
    <li>BKK → DOH: 14.12.2026 03:00 · 06:25</li>
    <li>DOH → LCA: 14.12.2026 08:25 · 11:00</li>
  </ul>
  <p><strong>Varış:</strong> Larnaca (LCA) — tur sonu.</p>`
      }
    },
    helsinki: {
      12: {
        route: "Pattaya → Bangkok > Helsinki",
        summary: "Finnair direkt BKK–HEL; 14 Aralık öğleden sonra varış.",
        content: `
  <ul><li>BKK → HEL (Finnair): 14.12.2026 11:15 · 18:50</li></ul>
  <p><strong>Varış:</strong> Helsinki-Vantaa (HEL) — tur sonu.</p>`
      }
    },
    london: {
      12: {
        route: "Pattaya → Bangkok > Londra",
        summary: "Norse Atlantic ile Gatwick'e direkt dönüş.",
        content: `
  <ul><li>BKK → LGW (Norse Atlantic UK): 14.12.2026 12:45 · 18:45</li></ul>
  <p><strong>Varış:</strong> Londra Gatwick (LGW) — tur sonu.</p>`
      }
    },
    berlin: {
      12: {
        route: "Pattaya → Bangkok > Doha > Berlin",
        summary: "Gece BKK kalkışı; Qatar ile 15 Aralık sabah Berlin.",
        content: `
  <ul>
    <li>BKK → DOH: 14.12.2026 20:30 · 23:55</li>
    <li>DOH → BER: 15.12.2026 02:40 · 06:50</li>
  </ul>
  <p><strong>Varış:</strong> Berlin Brandenburg (BER) — tur sonu.</p>`
      }
    },
    amsterdam: {
      12: {
        route: "Pattaya → Bangkok > Amsterdam",
        summary: "Sabah erken Thai Airways direkt AMS varışı.",
        content: `
  <ul><li>BKK → AMS (Thai Airways): 14.12.2026 05:00 · 11:40</li></ul>
  <p><strong>Varış:</strong> Amsterdam Schiphol (AMS) — tur sonu.</p>`
      }
    }
  },
  en: {
    istanbul: {
      12: {
        route: "Pattaya → Bangkok → Istanbul",
        summary: "Check-out; overnight TK8548 to Istanbul Airport (morning 15 Dec).",
        content: `
  <p>After breakfast, check-out and transfer to BKK.</p>
  <ul><li>TK8548: 14.12.2026 23:45 BKK → 15.12.2026 06:05 IST</li></ul>
  <p><strong>Arrival:</strong> Istanbul Airport (IST) — end of tour.</p>`
      }
    },
    ercan: {
      12: {
        route: "Pattaya → Bangkok → Istanbul > Ercan",
        summary: "Overnight TK8548 + morning IST–ECN to Ercan.",
        content: `
  <ul>
    <li>TK8548: 14.12.2026 23:45 → 15.12.2026 06:05 IST</li>
    <li>IST → ECN: 15.12.2026 07:45 · 08:20</li>
  </ul>
  <p><strong>Arrival:</strong> Ercan (ECN) — end of tour.</p>`
      }
    },
    larnaca: {
      12: {
        route: "Pattaya → Bangkok > Doha > Larnaca",
        summary: "Early morning BKK; Qatar to Larnaca on 14 December.",
        content: `
  <ul>
    <li>BKK → DOH: 14.12.2026 03:00 · 06:25</li>
    <li>DOH → LCA: 14.12.2026 08:25 · 11:00</li>
  </ul>
  <p><strong>Arrival:</strong> Larnaca (LCA) — end of tour.</p>`
      }
    },
    helsinki: {
      12: {
        route: "Pattaya → Bangkok > Helsinki",
        summary: "Finnair direct BKK–HEL; afternoon arrival 14 December.",
        content: `
  <ul><li>BKK → HEL (Finnair): 14.12.2026 11:15 · 18:50</li></ul>
  <p><strong>Arrival:</strong> Helsinki-Vantaa (HEL) — end of tour.</p>`
      }
    },
    london: {
      12: {
        route: "Pattaya → Bangkok > London",
        summary: "Norse Atlantic direct to Gatwick.",
        content: `
  <ul><li>BKK → LGW (Norse Atlantic UK): 14.12.2026 12:45 · 18:45</li></ul>
  <p><strong>Arrival:</strong> London Gatwick (LGW) — end of tour.</p>`
      }
    },
    berlin: {
      12: {
        route: "Pattaya → Bangkok > Doha > Berlin",
        summary: "Evening BKK departure; Qatar to Berlin morning 15 December.",
        content: `
  <ul>
    <li>BKK → DOH: 14.12.2026 20:30 · 23:55</li>
    <li>DOH → BER: 15.12.2026 02:40 · 06:50</li>
  </ul>
  <p><strong>Arrival:</strong> Berlin Brandenburg (BER) — end of tour.</p>`
      }
    },
    amsterdam: {
      12: {
        route: "Pattaya → Bangkok > Amsterdam",
        summary: "Early Thai Airways direct to Amsterdam.",
        content: `
  <ul><li>BKK → AMS (Thai Airways): 14.12.2026 05:00 · 11:40</li></ul>
  <p><strong>Arrival:</strong> Amsterdam Schiphol (AMS) — end of tour.</p>`
      }
    }
  }
};

const festivalDays_tml_en = [
  {
    n: 9,
    route: "Bangkok → Pattaya · Tomorrowland Day 1",
    summary: "Transfer from Bangkok to Pattaya, hotel check-in. Tomorrowland Day 1 in the evening.",
    date: "11 December 2026 — Friday",
    image: { src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80", alt: "Tomorrowland stage" },
    content: `
  <p>After breakfast and check-out, <strong>private transfer to Pattaya</strong> (1.5-2 hours).</p>
  <p>Check-in at <strong>Royal Cliff Beach Terrace Pattaya</strong>. Festival prep and rest.</p>
  <p>Evening: festival shuttle to <strong>Tomorrowland Thailand Day 1</strong>. Opening night, main stage show. Late-night return to hotel.</p>`
  },
  {
    n: 10,
    route: "Pattaya free day",
    summary: "Beach, rest, optional boat tours or Pattaya exploration.",
    date: "12 December 2026 — Saturday",
    image: { src: "https://images.unsplash.com/photo-1625276413000-12c38e7b7d0a?w=800&q=80", alt: "Pattaya beach" },
    content: `
  <p>Rest day between festival days. Free time after breakfast at the hotel.</p>
  <p><strong>Recommended activities:</strong></p>
  <ul>
    <li>Pattaya Beach / Jomtien Beach — swimming, relaxing</li>
    <li>Coral Island (Koh Larn) boat tour — crystal waters</li>
    <li>Sanctuary of Truth — wooden temple</li>
    <li>Walking Street — nightlife</li>
    <li>Floating Market — traditional market</li>
  </ul>
  <p>Saving energy for the final festival day.</p>`
  },
  {
    n: 11,
    route: "Tomorrowland Day 2",
    summary: "Festival closing day — main stage, headliner artists.",
    date: "13 December 2026 — Sunday",
    image: { src: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80", alt: "Festival crowd" },
    content: `
  <p>Late breakfast at the hotel; rest and prep during the day.</p>
  <p>Evening: festival shuttle to <strong>Tomorrowland Day 2</strong>. Final festival night on the main stage: headliner DJs, closing show, fireworks.</p>
  <p>Late-night return to hotel.</p>`
  },
  {
    n: 12,
    route: "Pattaya → Bangkok → return",
    summary: "Breakfast, BKK transfer; 14 December return flight (varies by departure city).",
    date: "14 December 2026 — Monday",
    image: { src: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80", alt: "Airplane" },
    content: `
  <p>Breakfast and check-out. Private transfer to Bangkok Suvarnabhumi (1.5-2 hours).</p>
  <p><strong>Return flight</strong> depends on your departure city — example Istanbul: <strong>TK8548</strong> 14.12.2026 23:45 → 15.12.2026 06:05 IST.</p>
  <p>See the Flights tab for your port's 14 December return details.</p>`
  }
];

// Full festival package = first 8 days of the normal tour + 4 festival days
const programDays_tml    = programDays.slice(0, 8).concat(festivalDays_tml);
const programDays_tml_en = programDays_en.slice(0, 8).concat(festivalDays_tml_en);

const PROGRAM_DAY_OVERRIDES_TML_HOTELS = {
  tr: {
    2: {
      route: "Phuket varış · SKYVIEW Resort",
      summary:
        "Phuket Havalimanı'na varış; VIP van ile SKYVIEW Resort Patong (2–7 Aralık). Check-in ve Patong'da serbest zaman.",
      content: `
  <p>Phuket Uluslararası Havalimanı'na varışımızın ardından özel VIP van ile Patong'daki <strong>SKYVIEW Resort Phuket Patong Beach</strong>'e transfer.</p>
  <p>Otel check-in sonrası serbest zaman:</p>
  <ul>
    <li>Plajda dinlenme</li>
    <li>Şehir keşfi</li>
    <li>Yerel restoranlar</li>
    <li>Patong gece hayatı</li>
  </ul>
  <p>Geceleme <strong>SKYVIEW Resort</strong>'ta (2–7 Aralık, 5 gece).</p>`
    },
    6: {
      route: "Phuket > Bangkok",
      summary:
        "Sabah serbest; öğleden sonra Thai AirAsia ile Bangkok. Grande Centre Point Prestige'a transfer (7–11 Aralık).",
      content: `
  <p>Kahvaltı sonrası serbest zaman: Patong'da yüzme, alışveriş, spa veya <strong>Jungceylon AVM</strong>.</p>
  <p>Öğleden sonra Phuket Havalimanı'na transfer. <strong>Thai AirAsia FD3014</strong> ile Bangkok'a hareket.</p>
  <p><strong>Uçuş:</strong> 07.12.2026 Phuket 14:00 → Bangkok 15:25.</p>
  <p>Suvarnabhumi'ye varışta özel van ile <strong>Grande Centre Point Prestige Bangkok</strong>'a transfer (7–11 Aralık, 4 gece).</p>
  <p>Akşam Ratchadamri / Lumpini çevresinde serbest zaman.</p>`
    }
  },
  en: {
    2: {
      route: "Phuket arrival · SKYVIEW Resort",
      summary:
        "Arrive Phuket Airport; VIP van to SKYVIEW Resort Patong (2–7 Dec). Check-in and free time in Patong.",
      content: `
  <p>After arrival at Phuket International Airport, private VIP van transfer to <strong>SKYVIEW Resort Phuket Patong Beach</strong> in Patong.</p>
  <p>After hotel check-in, free time:</p>
  <ul>
    <li>Relax on the beach</li>
    <li>Explore the city</li>
    <li>Local restaurants</li>
    <li>Patong nightlife</li>
  </ul>
  <p>Overnight at <strong>SKYVIEW Resort</strong> (2–7 December, 5 nights).</p>`
    },
    6: {
      route: "Phuket > Bangkok",
      summary:
        "Morning free; afternoon Thai AirAsia to Bangkok. Transfer to Grande Centre Point Prestige (7–11 Dec).",
      content: `
  <p>After breakfast, free time: swimming in Patong, shopping, spa or <strong>Jungceylon Mall</strong>.</p>
  <p>Afternoon transfer to Phuket Airport. Departure with <strong>Thai AirAsia FD3014</strong> to Bangkok.</p>
  <p><strong>Flight:</strong> 07.12.2026 Phuket 14:00 → Bangkok 15:25.</p>
  <p>On arrival at Suvarnabhumi, private van transfer to <strong>Grande Centre Point Prestige Bangkok</strong> (7–11 December, 4 nights).</p>
  <p>Evening free time around Ratchadamri / Lumpini.</p>`
    }
  }
};

const PROGRAM_DAY_OVERRIDES_LCA_COMFORT = {
  tr: {
    1: {
      route: "Larnaca > Dubai > Phuket",
      summary:
        "Larnaca (LCA) akşam kalkışı; Dubai (DXB) aktarmalı Emirates ile Phuket. Aynı gün varış ve Thanthip check-in.",
      content: `
  <p><strong>02 Aralık akşamı</strong> Larnaca (LCA) kalkış. <strong>Emirates</strong> ile Dubai ve Phuket.</p>
  <p><strong>Gidiş uçuşları</strong> (Comfort · Larnaca kalkışlı):</p>
  <ul>
    <li>LCA → DXB: Kalkış 02.12.2026 19:40 · Varış 03.12.2026 00:55 (+1 gün) — 3s 15dk</li>
    <li>DXB aktarma: ~2s 05dk</li>
    <li>DXB → HKT: Kalkış 03.12.2026 03:00 · Varış 03.12.2026 12:05 — 6s 05dk</li>
  </ul>
  <p>Toplam seyahat süresi 11s 25dk. Varış sonrası <strong>Thanthip Beach Resort</strong> (2–7 Aralık).</p>`
    },
    8: {
      route: "Bangkok > Doha > Larnaca",
      summary:
        "Sabah erken BKK kalkışı; Doha aktarmalı Qatar Airways ile aynı gün Larnaca varışı.",
      content: `
  <p>Kahvaltı sonrası check-out (<strong>Solitaire Bangkok Sukhumvit 11</strong>, 7–11 Aralık). Özel van ile Suvarnabhumi'ye transfer.</p>
  <p><strong>Dönüş</strong> (Comfort · Larnaca kalkışlı):</p>
  <ul>
    <li>BKK → DOH: 11.12.2026 03:00 · 06:25 (7s 25dk)</li>
    <li>DOH aktarma: ~2s</li>
    <li>DOH → LCA: 11.12.2026 08:25 · 11:00 (3s 35dk)</li>
  </ul>
  <p><strong>Varış:</strong> Larnaca (LCA) — turumuzun sonu. Güvenli yolculuklar dileriz.</p>`
    }
  },
  en: {
    1: {
      route: "Larnaca > Dubai > Phuket",
      summary:
        "Evening departure from Larnaca (LCA); Emirates via Dubai (DXB) to Phuket. Same-day arrival and Thanthip check-in.",
      content: `
  <p><strong>Evening of 2 December</strong>, depart Larnaca (LCA). <strong>Emirates</strong> to Dubai and Phuket.</p>
  <p><strong>Outbound flights</strong> (Comfort · Larnaca departure):</p>
  <ul>
    <li>LCA → DXB: Dep 02.12.2026 19:40 · Arr 03.12.2026 00:55 (+1 day) — 3h 15m</li>
    <li>DXB layover: ~2h 05m</li>
    <li>DXB → HKT: Dep 03.12.2026 03:00 · Arr 03.12.2026 12:05 — 6h 05m</li>
  </ul>
  <p>Total travel time 11h 25m. After arrival, <strong>Thanthip Beach Resort</strong> (2–7 December).</p>`
    },
    8: {
      route: "Bangkok > Doha > Larnaca",
      summary:
        "Early morning BKK departure; Qatar Airways via Doha, same-day arrival in Larnaca.",
      content: `
  <p>After breakfast, check-out (<strong>Solitaire Bangkok Sukhumvit 11</strong>, 7–11 December). Private transfer to Suvarnabhumi.</p>
  <p><strong>Return</strong> (Comfort · Larnaca departure):</p>
  <ul>
    <li>BKK → DOH: 11.12.2026 03:00 · 06:25 (7h 25m)</li>
    <li>DOH layover: ~2h</li>
    <li>DOH → LCA: 11.12.2026 08:25 · 11:00 (3h 35m)</li>
  </ul>
  <p><strong>Arrival:</strong> Larnaca (LCA) — end of our tour. Have a safe journey.</p>`
    }
  }
};

const PROGRAM_DAY_OVERRIDES_LCA_SHARED = {
  tr: {
    1: {
      route: "Larnaca > Atina > Sharjah > Phuket",
      summary:
        "Larnaca (LCA) kalkış; Atina ve Sharjah aktarmalı Air Arabia ile Phuket. Tüm stillerde aynı gidiş rotası.",
      content: `
  <p><strong>02 Aralık</strong> Larnaca (LCA) bölgesinden hareket. <strong>Atina (ATH)</strong> aktarması sonrası <strong>Air Arabia</strong> ile Sharjah (SHJ) ve Phuket (HKT).</p>
  <p><strong>Gidiş uçuşları</strong> (teyit tur dokümanında):</p>
  <ul>
    <li>LCA → ATH: Atina aktarması · ~1s 45dk bekleme</li>
    <li>ATH → SHJ: Kalkış 02.12.2026 13:45 · Varış 02.12.2026 20:15</li>
    <li>SHJ aktarma: ~4s 40dk</li>
    <li>SHJ → HKT: Kalkış 03.12.2026 00:55 · Varış 03.12.2026 10:10</li>
  </ul>
  <p>Geceleme uçakta veya Phuket varışına göre konaklamada.</p>`
    }
  },
  en: {
    1: {
      route: "Larnaca > Athens > Sharjah > Phuket",
      summary:
        "Depart Larnaca (LCA); Air Arabia via Athens and Sharjah to Phuket. Same outbound for all styles.",
      content: `
  <p><strong>2 December</strong> travel from the Larnaca (LCA) area. Connection in <strong>Athens (ATH)</strong>, then <strong>Air Arabia</strong> to Sharjah (SHJ) and Phuket (HKT).</p>
  <p><strong>Outbound flights</strong> (confirmed in tour document):</p>
  <ul>
    <li>LCA → ATH: Athens connection · ~1h 45m wait</li>
    <li>ATH → SHJ: Dep 02.12.2026 13:45 · Arr 02.12.2026 20:15</li>
    <li>SHJ layover: ~4h 40m</li>
    <li>SHJ → HKT: Dep 03.12.2026 00:55 · Arr 03.12.2026 10:10</li>
  </ul>
  <p>Overnight on the plane or at accommodation after Phuket arrival.</p>`
    }
  }
};

const PROGRAM_DAY_OVERRIDES_LCA_RETURN = {
  tr: {
    8: {
      route: "Bangkok > Doha > Larnaca",
      summary:
        "Sabah erken BKK kalkışı; Doha aktarmalı Qatar Airways ile Larnaca (LCA).",
      content: `
  <p>Kahvaltı sonrası check-out. Özel van ile <strong>Bangkok Suvarnabhumi Havalimanı</strong>'na transfer.</p>
  <ul>
    <li>BKK → DOH: Kalkış 11.12.2026 03:00 · Varış 11.12.2026 06:25</li>
    <li>DOH aktarma: ~2s</li>
    <li>DOH → LCA: Kalkış 11.12.2026 08:25 · Varış 11.12.2026 11:00</li>
  </ul>
  <p><strong>Varış:</strong> Larnaca — turumuzun sonu. Güvenli yolculuklar dileriz.</p>`
    },
    11: {
      route: "Pattaya → Bangkok > Doha > Larnaca",
      summary:
        "Pattaya'dan BKK'ye transfer; sabah erken uçuşla Doha üzerinden Larnaca dönüşü.",
      content: `
  <p>Otelde kahvaltı sonrası check-out. Özel transferle Bangkok Suvarnabhumi Havalimanı'na hareket (1.5-2 saat).</p>
  <ul>
    <li>BKK → DOH: Kalkış 14.12.2026 03:00 · Varış 14.12.2026 06:25</li>
    <li>DOH aktarma: ~2s</li>
    <li>DOH → LCA: Kalkış 14.12.2026 08:25 · Varış 14.12.2026 11:00</li>
  </ul>
  <p><strong>Varış:</strong> Larnaca — turumuzun sonu. Güvenli yolculuklar dileriz.</p>`
    }
  },
  en: {
    8: {
      route: "Bangkok > Doha > Larnaca",
      summary:
        "Early morning BKK departure; Qatar Airways via Doha to Larnaca (LCA).",
      content: `
  <p>After breakfast, check-out. Private transfer to <strong>Bangkok Suvarnabhumi Airport</strong>.</p>
  <ul>
    <li>BKK → DOH: Dep 11.12.2026 03:00 · Arr 11.12.2026 06:25</li>
    <li>DOH layover: ~2h</li>
    <li>DOH → LCA: Dep 11.12.2026 08:25 · Arr 11.12.2026 11:00</li>
  </ul>
  <p><strong>Arrival:</strong> Larnaca — end of our tour. Have a safe journey.</p>`
    },
    11: {
      route: "Pattaya → Bangkok > Doha > Larnaca",
      summary:
        "Transfer from Pattaya to BKK; early morning return via Doha to Larnaca.",
      content: `
  <p>Breakfast and check-out at the hotel. Private transfer to Bangkok Suvarnabhumi Airport (1.5-2 hours).</p>
  <ul>
    <li>BKK → DOH: Dep 14.12.2026 03:00 · Arr 14.12.2026 06:25</li>
    <li>DOH layover: ~2h</li>
    <li>DOH → LCA: Dep 14.12.2026 08:25 · Arr 14.12.2026 11:00</li>
  </ul>
  <p><strong>Arrival:</strong> Larnaca — end of our tour. Have a safe journey.</p>`
    }
  }
};

const PROGRAM_DAY_OVERRIDES_ERCAN = {
  tr: {
    1: {
      route: "Ercan > İstanbul > Phuket",
      summary:
        "Ercan (ECN) kalkış; İstanbul (IST) aktarmalı Turkish Airlines ile Phuket'e. Gece uçuşu ve aktarma.",
      content: `
  <p><strong>Tur başlangıç günü akşamı</strong> Ercan Havalimanı'ndan (ECN) hareket. Bilet, bagaj ve pasaport işlemlerinin ardından <strong>Turkish Airlines</strong> ile İstanbul'a uçuş.</p>
  <p><strong>Gidiş uçuşları</strong> (teyit tur dokümanında):</p>
  <ul>
    <li>ECN → IST: Kalkış 02.12.2026 21:20 · Varış 03.12.2026 00:15 (+1 gün)</li>
    <li>IST aktarma: ~1s 45dk bekleme</li>
    <li>IST → HKT: Kalkış 03.12.2026 02:00 · Varış 03.12.2026 15:50</li>
  </ul>
  <p>Toplam seyahat süresi 13s 30dk. Varış sonrası <strong>Thanthip Beach Resort</strong> (2–7 Aralık).</p>`
    },
    8: {
      route: "Bangkok > İstanbul > Ercan",
      summary:
        "Sabah BKK kalkışı; Turkish Airlines + Pegasus ile aynı gün Ercan varışı.",
      content: `
  <p>Kahvaltı sonrası check-out (<strong>Solitaire Bangkok Sukhumvit 11</strong>, 7–11 Aralık). Özel van ile Suvarnabhumi'ye transfer.</p>
  <p><strong>Dönüş</strong> (Comfort · Ercan kalkışlı):</p>
  <ul>
    <li>BKK → IST (Turkish Airlines): 11.12.2026 10:20 · 16:45</li>
    <li>IST aktarma: ~2s 05dk</li>
    <li>IST → ECN (Pegasus): 11.12.2026 18:50 · 19:20</li>
  </ul>
  <p><strong>Varış:</strong> Ercan (ECN) — turumuzun sonu. Güvenli yolculuklar dileriz.</p>`
    },
    11: {
      route: "Pattaya → Bangkok → İstanbul > Ercan",
      summary:
        "Pattaya'dan BKK'ye transfer; gece uçuşu ve İstanbul aktarması ile Ercan'a dönüş.",
      content: `
  <p>Otelde kahvaltı sonrası check-out. Özel transferle Bangkok Suvarnabhumi Havalimanı'na hareket (1.5-2 saat).</p>
  <p><strong>Dönüş uçuşları</strong> (teyit tur dokümanında):</p>
  <ul>
    <li>BKK → IST (TK8548): Kalkış 13.12.2026 23:45 · Varış 14.12.2026 06:05 (+1 gün)</li>
    <li>IST aktarma: ~1s 40dk</li>
    <li>IST → ECN: Kalkış 14.12.2026 07:45 · Varış 14.12.2026 08:20</li>
  </ul>
  <p><strong>Varış:</strong> Ercan — turumuzun sonu. Güvenli yolculuklar dileriz.</p>`
    }
  },
  en: {
    1: {
      route: "Ercan > Istanbul > Phuket",
      summary:
        "Depart Ercan (ECN); Turkish Airlines via Istanbul (IST) to Phuket. Overnight flight and layover.",
      content: `
  <p><strong>On the evening of the tour start date</strong>, depart from Ercan Airport (ECN). After check-in, baggage and passport control, fly to Istanbul with <strong>Turkish Airlines</strong>.</p>
  <p><strong>Outbound flights</strong> (confirmed in tour document):</p>
  <ul>
    <li>ECN → IST: Dep 02.12.2026 21:20 · Arr 03.12.2026 00:15 (+1 day)</li>
    <li>IST layover: ~1h 45m wait</li>
    <li>IST → HKT: Dep 03.12.2026 02:00 · Arr 03.12.2026 15:50</li>
  </ul>
  <p>Total travel time 13h 30m. After arrival, <strong>Thanthip Beach Resort</strong> (2–7 December).</p>`
    },
    8: {
      route: "Bangkok > Istanbul > Ercan",
      summary:
        "Morning BKK departure; Turkish Airlines + Pegasus, same-day arrival in Ercan.",
      content: `
  <p>After breakfast, check-out (<strong>Solitaire Bangkok Sukhumvit 11</strong>, 7–11 Dec). Private transfer to Suvarnabhumi.</p>
  <p><strong>Return</strong> (Comfort · Ercan departure):</p>
  <ul>
    <li>BKK → IST (Turkish Airlines): 11.12.2026 10:20 · 16:45</li>
    <li>IST layover: ~2h 05m</li>
    <li>IST → ECN (Pegasus): 11.12.2026 18:50 · 19:20</li>
  </ul>
  <p><strong>Arrival:</strong> Ercan (ECN) — end of our tour. Have a safe journey.</p>`
    },
    11: {
      route: "Pattaya → Bangkok → Istanbul > Ercan",
      summary:
        "Transfer from Pattaya to BKK; return to Ercan via Istanbul with overnight connection.",
      content: `
  <p>Breakfast and check-out at the hotel. Private transfer to Bangkok Suvarnabhumi Airport (1.5-2 hours).</p>
  <p><strong>Return flights</strong> (confirmed in tour document):</p>
  <ul>
    <li>BKK → IST (TK8548): Dep 13.12.2026 23:45 · Arr 14.12.2026 06:05 (+1 day)</li>
    <li>IST layover: ~1h 40m</li>
    <li>IST → ECN: Dep 14.12.2026 07:45 · Arr 14.12.2026 08:20</li>
  </ul>
  <p><strong>Arrival:</strong> Ercan — end of our tour. Have a safe journey.</p>`
    }
  }
};

const PROGRAM_DAY_OVERRIDES_BACKPACK_ERCAN = {
  tr: {
    1: {
      route: "Ercan > İstanbul > Kuala Lumpur > Phuket",
      summary:
        "AJet + AirAsia X / AirAsia ile çoklu aktarma; tüm aktarmalar kendi sorumluluğunuzda.",
      content: `
  <p><strong>02 Aralık</strong> Ercan (ECN) kalkış. <strong>AJet</strong> ile Sabiha Gökçen (SAW), ardından <strong>AirAsia X</strong> ile Kuala Lumpur ve <strong>AirAsia</strong> ile Phuket.</p>
  <ul>
    <li>ECN → SAW: 02.12.2026 11:30 · 14:10 (1s 40dk)</li>
    <li>SAW aktarma ~3s 10dk</li>
    <li>SAW → KUL: 02.12.2026 17:20 · 03.12.2026 08:40 (10s 20dk)</li>
    <li>KUL aktarma ~1s 40dk</li>
    <li>KUL → HKT: 03.12.2026 10:20 · 10:50 (1s 30dk)</li>
  </ul>
  <p>Toplam seyahat süresi 18s 20dk.</p>`
    },
    2: {
      route: "Phuket varış",
      summary:
        "Phuket Havalimanı'na varış; transfer ile Phuket Old Town Hostel. Check-in ve Eski Şehir'de serbest zaman.",
      content: `
  <p>Phuket Uluslararası Havalimanı'na varış (ör. 03.12.2026 ~10:50). Havalimanından <strong>Phuket Old Town Hostel</strong>'e transfer.</p>
  <p>Hostel check-in sonrası serbest zaman — Phuket Old Town, sokak yemekleri ve gece pazarları.</p>
  <p>Geceleme Phuket Old Town Hostel'de (3–7 Aralık).</p>`
    },
    8: {
      route: "Bangkok > İstanbul > Ercan",
      summary:
        "Sabah BKK kalkışı; Turkish Airlines ile İstanbul, Pegasus ile Ercan — aynı gün varış.",
      content: `
  <p>Hostelde check-out ve BKK transferi.</p>
  <p><strong>Dönüş</strong> (Backpacking · Ercan kalkışlı):</p>
  <ul>
    <li>BKK → IST (Turkish Airlines): 11.12.2026 10:20 · 16:45 (10s 25dk)</li>
    <li>IST aktarma ~2s 05dk</li>
    <li>IST → ECN (Pegasus): 11.12.2026 18:50 · 19:20 (1s 30dk)</li>
  </ul>
  <p><strong>Varış:</strong> Ercan (ECN) — tur sonu.</p>`
    }
  },
  en: {
    1: {
      route: "Ercan > Istanbul > Kuala Lumpur > Phuket",
      summary:
        "Multi-stop via AJet and AirAsia; multi-stop routing.",
      content: `
  <p><strong>2 December</strong> depart Ercan (ECN). <strong>AJet</strong> to Sabiha Gökçen (SAW), then <strong>AirAsia X</strong> to Kuala Lumpur and <strong>AirAsia</strong> to Phuket.</p>
  <ul>
    <li>ECN → SAW: 02.12.2026 11:30 · 14:10 (1h 40m)</li>
    <li>SAW layover ~3h 10m</li>
    <li>SAW → KUL: 02.12.2026 17:20 · 03.12.2026 08:40 (10h 20m)</li>
    <li>KUL layover ~1h 40m</li>
    <li>KUL → HKT: 03.12.2026 10:20 · 10:50 (1h 30m)</li>
  </ul>
  <p>Total travel time 18h 20m.</p>`
    },
    2: {
      route: "Phuket arrival",
      summary:
        "Arrive Phuket Airport; transfer to Phuket Old Town Hostel. Check-in and free time in Old Town.",
      content: `
  <p>Arrival at Phuket International Airport (e.g. 03.12.2026 ~10:50). Transfer to <strong>Phuket Old Town Hostel</strong>.</p>
  <p>After hostel check-in, free time in Phuket Old Town.</p>
  <p>Overnight at Phuket Old Town Hostel (3–7 December).</p>`
    },
    8: {
      route: "Bangkok > Istanbul > Ercan",
      summary:
        "Morning BKK departure; Turkish Airlines to Istanbul, Pegasus to Ercan — same-day arrival.",
      content: `
  <p>Hostel check-out and transfer to BKK.</p>
  <p><strong>Return</strong> (Backpacking · Ercan departure):</p>
  <ul>
    <li>BKK → IST (Turkish Airlines): 11.12.2026 10:20 · 16:45 (10h 25m)</li>
    <li>IST layover ~2h 05m</li>
    <li>IST → ECN (Pegasus): 11.12.2026 18:50 · 19:20 (1h 30m)</li>
  </ul>
  <p><strong>Arrival:</strong> Ercan (ECN) — end of tour.</p>`
    }
  }
};

const PROGRAM_DAY_OVERRIDES_BACKPACK_LCA = {
  tr: {
    1: {
      route: "Larnaca > Atina > Sharjah > Phuket",
      summary:
        "Wizz Air + Air Arabia ile Atina ve Sharjah aktarmalı; tüm aktarmalar kendi sorumluluğunuzda.",
      content: `
  <p><strong>02 Aralık</strong> Larnaca (LCA) kalkış. <strong>Wizz Air</strong> ile Atina (ATH), <strong>Air Arabia</strong> ile Sharjah ve Phuket.</p>
  <ul>
    <li>LCA → ATH: 02.12.2026 06:40 · 08:40 (2s)</li>
    <li>ATH aktarma ~5s 05dk</li>
    <li>ATH → SHJ: 02.12.2026 13:45 · 20:15 (4s 30dk)</li>
    <li>SHJ aktarma ~4s 40dk</li>
    <li>SHJ → HKT: 03.12.2026 00:55 · 10:10 (6s 15dk)</li>
  </ul>
  <p>Toplam seyahat süresi 22s 30dk.</p>`
    },
    2: {
      route: "Phuket varış",
      summary:
        "Phuket Havalimanı'na varış; transfer ile Phuket Old Town Hostel. Check-in ve Eski Şehir'de serbest zaman.",
      content: `
  <p>Phuket Uluslararası Havalimanı'na varış (ör. 03.12.2026 ~10:10). Havalimanından <strong>Phuket Old Town Hostel</strong>'e transfer.</p>
  <p>Hostel check-in sonrası serbest zaman — Phuket Old Town.</p>
  <p>Geceleme Phuket Old Town Hostel'de (3–7 Aralık).</p>`
    },
    8: {
      route: "Bangkok > Doha > Larnaca",
      summary:
        "Akşam BKK kalkışı; Doha aktarmalı Qatar Airways ile ertesi gün Larnaca varışı.",
      content: `
  <p>Hostelde check-out ve BKK transferi.</p>
  <p><strong>Dönüş</strong> (Backpacking · Larnaca kalkışlı):</p>
  <ul>
    <li>BKK → DOH: 11.12.2026 20:30 · 23:55 (7s 25dk)</li>
    <li>DOH aktarma ~8s 30dk</li>
    <li>DOH → LCA: 12.12.2026 08:25 · 11:00 (3s 35dk)</li>
  </ul>
  <p><strong>Varış:</strong> Larnaca (LCA) — tur sonu.</p>`
    }
  },
  en: {
    1: {
      route: "Larnaca > Athens > Sharjah > Phuket",
      summary:
        "Via Wizz Air and Air Arabia through Athens and Sharjah; multi-stop routing.",
      content: `
  <p><strong>2 December</strong> depart Larnaca (LCA). <strong>Wizz Air</strong> to Athens (ATH), <strong>Air Arabia</strong> to Sharjah and Phuket.</p>
  <ul>
    <li>LCA → ATH: 02.12.2026 06:40 · 08:40 (2h)</li>
    <li>ATH layover ~5h 05m</li>
    <li>ATH → SHJ: 02.12.2026 13:45 · 20:15 (4h 30m)</li>
    <li>SHJ layover ~4h 40m</li>
    <li>SHJ → HKT: 03.12.2026 00:55 · 10:10 (6h 15m)</li>
  </ul>
  <p>Total travel time 22h 30m.</p>`
    },
    2: {
      route: "Phuket arrival",
      summary:
        "Arrive Phuket Airport; transfer to Phuket Old Town Hostel. Check-in and free time in Old Town.",
      content: `
  <p>Arrival at Phuket International Airport (e.g. 03.12.2026 ~10:10). Transfer to <strong>Phuket Old Town Hostel</strong>.</p>
  <p>After hostel check-in, free time in Phuket Old Town.</p>
  <p>Overnight at Phuket Old Town Hostel (3–7 December).</p>`
    },
    8: {
      route: "Bangkok > Doha > Larnaca",
      summary:
        "Evening BKK departure; Qatar Airways via Doha, arrival in Larnaca next morning.",
      content: `
  <p>Hostel check-out and transfer to BKK.</p>
  <p><strong>Return</strong> (Backpacking · Larnaca departure):</p>
  <ul>
    <li>BKK → DOH: 11.12.2026 20:30 · 23:55 (7h 25m)</li>
    <li>DOH layover ~8h 30m</li>
    <li>DOH → LCA: 12.12.2026 08:25 · 11:00 (3h 35m)</li>
  </ul>
  <p><strong>Arrival:</strong> Larnaca (LCA) — end of tour.</p>`
    }
  }
};

const PROGRAM_DAY_OVERRIDES_BACKPACK_HEL = {
  tr: {
    1: {
      route: "Helsinki > İstanbul > Phuket",
      summary:
        "Turkish Airlines ile İstanbul aktarmalı Phuket; gece uçuşu ve aktarma kendi sorumluluğunuzda.",
      content: `
  <p><strong>02 Aralık</strong> Helsinki-Vantaa (HEL) kalkış. <strong>Turkish Airlines</strong> ile İstanbul (IST) aktarmalı Phuket (HKT).</p>
  <ul>
    <li>HEL → IST: 02.12.2026 12:30 · 17:15 (3s 45dk)</li>
    <li>IST aktarma ~8s 45dk</li>
    <li>IST → HKT: 03.12.2026 02:00 · 15:50 (9s 50dk)</li>
  </ul>
  <p>Toplam seyahat süresi 22s 20dk. Geceleme uçakta.</p>`
    },
    2: {
      route: "Phuket varış",
      summary:
        "Phuket Havalimanı'na varış; transfer ile Phuket Old Town Hostel. Check-in ve Eski Şehir'de serbest zaman.",
      content: `
  <p>Phuket Uluslararası Havalimanı'na varış (ör. 03.12.2026 ~15:50). Havalimanından <strong>Phuket Old Town Hostel</strong>'e transfer.</p>
  <p>Hostel check-in sonrası serbest zaman — Phuket Old Town.</p>
  <p>Geceleme Phuket Old Town Hostel'de (3–7 Aralık).</p>`
    },
    8: {
      route: "Bangkok > Stockholm > Helsinki",
      summary:
        "Sabah BKK kalkışı; Norse Atlantic + Norwegian ile Stockholm aktarmalı Helsinki dönüşü.",
      content: `
  <p>Hostelde check-out ve BKK transferi.</p>
  <p><strong>Dönüş</strong> (Backpacking · Helsinki kalkışlı):</p>
  <ul>
    <li>BKK → ARN (Norse Atlantic): 11.12.2026 06:00 · 12:55 (12s 55dk)</li>
    <li>ARN aktarma ~4s 25dk</li>
    <li>ARN → HEL (Norwegian): 11.12.2026 17:20 · 19:20 (1s)</li>
  </ul>
  <p><strong>Varış:</strong> Helsinki-Vantaa (HEL) — tur sonu.</p>`
    }
  },
  en: {
    1: {
      route: "Helsinki > Istanbul > Phuket",
      summary:
        "Turkish Airlines via Istanbul to Phuket; overnight flight with layover in Istanbul.",
      content: `
  <p><strong>2 December</strong> depart Helsinki-Vantaa (HEL). <strong>Turkish Airlines</strong> via Istanbul (IST) to Phuket (HKT).</p>
  <ul>
    <li>HEL → IST: 02.12.2026 12:30 · 17:15 (3h 45m)</li>
    <li>IST layover ~8h 45m</li>
    <li>IST → HKT: 03.12.2026 02:00 · 15:50 (9h 50m)</li>
  </ul>
  <p>Total travel time 22h 20m. Overnight on the plane.</p>`
    },
    2: {
      route: "Phuket arrival",
      summary:
        "Arrive Phuket Airport; transfer to Phuket Old Town Hostel. Check-in and free time in Old Town.",
      content: `
  <p>Arrival at Phuket International Airport (e.g. 03.12.2026 ~15:50). Transfer to <strong>Phuket Old Town Hostel</strong>.</p>
  <p>After hostel check-in, free time in Phuket Old Town.</p>
  <p>Overnight at Phuket Old Town Hostel (3–7 December).</p>`
    },
    8: {
      route: "Bangkok > Stockholm > Helsinki",
      summary:
        "Morning BKK departure; Norse Atlantic + Norwegian via Stockholm to Helsinki.",
      content: `
  <p>Hostel check-out and transfer to BKK.</p>
  <p><strong>Return</strong> (Backpacking · Helsinki departure):</p>
  <ul>
    <li>BKK → ARN (Norse Atlantic): 11.12.2026 06:00 · 12:55 (12h 55m)</li>
    <li>ARN layover ~4h 25m</li>
    <li>ARN → HEL (Norwegian): 11.12.2026 17:20 · 19:20 (1h)</li>
  </ul>
  <p><strong>Arrival:</strong> Helsinki-Vantaa (HEL) — end of tour.</p>`
    }
  }
};

const PROGRAM_DAY_OVERRIDES_COMFORT_IST = {
  tr: {
    1: {
      route: "İstanbul > Phuket",
      summary:
        "İstanbul Havalimanı (IST) kalkış; Turkish Airlines direkt Phuket. Aynı gün varış ve Thanthip check-in.",
      content: `
  <p><strong>02 Aralık</strong> İstanbul Havalimanı (IST) dış hatlar terminalinde uçuştan en az 3 saat önce buluşma.</p>
  <p><strong>Turkish Airlines</strong> ile direkt Phuket (HKT):</p>
  <ul>
    <li>IST → HKT: 02.12.2026 02:00 · 15:50 (9s 50dk)</li>
  </ul>
  <p>Varış sonrası VIP van ile <strong>Thanthip Beach Resort</strong>'a transfer (2–7 Aralık konaklama).</p>`
    },
    2: {
      route: "Phuket · Thanthip Beach Resort",
      summary:
        "Patong'da Thanthip Beach Resort'ta konaklama (2–7 Aralık). Serbest zaman ve opsiyonel turlar.",
      content: `
  <p><strong>Thanthip Beach Resort Patong (4★)</strong> — 2–7 Aralık 2026 (5 gece), kahvaltı dahil.</p>
  <p>Patong plajı, alışveriş ve gece hayatına yakın konumda serbest zaman.</p>`
    },
    8: {
      route: "Bangkok > İstanbul",
      summary:
        "Check-out Solitaire; gece BKK kalkışı Turkish Airlines TK8548 ile İstanbul varışı (12 Aralık sabah).",
      content: `
  <p>Kahvaltı sonrası check-out (<strong>Solitaire Bangkok Sukhumvit 11</strong>, 7–11 Aralık). VIP van ile Suvarnabhumi'ye transfer.</p>
  <p><strong>Turkish Airlines TK8548</strong> — dönüş (Comfort · İstanbul kalkışlı):</p>
  <ul>
    <li>BKK → IST: 11.12.2026 23:45 · 12.12.2026 06:05 (10s 20dk)</li>
  </ul>
  <p><strong>Varış:</strong> İstanbul Havalimanı (IST) — tur sonu.</p>`
    }
  },
  en: {
    1: {
      route: "Istanbul > Phuket",
      summary:
        "Depart Istanbul Airport (IST); Turkish Airlines non-stop to Phuket. Same-day arrival and Thanthip check-in.",
      content: `
  <p><strong>2 December</strong> meet at Istanbul Airport (IST) international departures at least 3 hours before departure.</p>
  <p><strong>Turkish Airlines</strong> direct to Phuket (HKT):</p>
  <ul>
    <li>IST → HKT: 02.12.2026 02:00 · 15:50 (9h 50m)</li>
  </ul>
  <p>After arrival, VIP van transfer to <strong>Thanthip Beach Resort</strong> (stay 2–7 December).</p>`
    },
    2: {
      route: "Phuket · Thanthip Beach Resort",
      summary:
        "Stay at Thanthip Beach Resort Patong (2–7 Dec). Free time and optional tours.",
      content: `
  <p><strong>Thanthip Beach Resort Patong (4★)</strong> — 2–7 December 2026 (5 nights), breakfast included.</p>
  <p>Free time near Patong beach, shopping and nightlife.</p>`
    },
    8: {
      route: "Bangkok > Istanbul",
      summary:
        "Check-out Solitaire; overnight BKK departure Turkish Airlines TK8548 to Istanbul (morning 12 Dec).",
      content: `
  <p>After breakfast, check-out (<strong>Solitaire Bangkok Sukhumvit 11</strong>, 7–11 Dec). VIP van to Suvarnabhumi.</p>
  <p><strong>Turkish Airlines TK8548</strong> — return (Comfort · Istanbul departure):</p>
  <ul>
    <li>BKK → IST: 11.12.2026 23:45 · 12.12.2026 06:05 (10h 20m)</li>
  </ul>
  <p><strong>Arrival:</strong> Istanbul Airport (IST) — end of tour.</p>`
    }
  }
};

const PROGRAM_DAY_OVERRIDES_AMS_COMFORT = {
  tr: {
    1: {
      route: "Amsterdam > Delhi > Phuket",
      summary:
        "Amsterdam (AMS) kalkış; Air India ile Delhi aktarmalı Phuket. Varış günü Thanthip check-in.",
      content: `
  <p><strong>02 Aralık</strong> Amsterdam Schiphol (AMS) kalkış. <strong>Air India</strong> ile Delhi (DEL) aktarmalı Phuket (HKT).</p>
  <p><strong>Gidiş uçuşları</strong> (Comfort · Amsterdam kalkışlı):</p>
  <ul>
    <li>AMS → DEL: 02.12.2026 20:35 · 03.12.2026 10:00 (+1 gün) — 8s 55dk</li>
    <li>DEL aktarma: ~3s 20dk</li>
    <li>DEL → HKT: 03.12.2026 13:20 · 19:30 — 4s 40dk</li>
  </ul>
  <p>Toplam seyahat süresi 16s 55dk. Varış sonrası <strong>Thanthip Beach Resort</strong> (2–7 Aralık).</p>`
    },
    8: {
      route: "Bangkok > Amsterdam",
      summary:
        "Sabah erken BKK kalkışı; Thai Airways ile direkt Amsterdam varışı — aynı gün.",
      content: `
  <p>Kahvaltı sonrası check-out (<strong>Solitaire Bangkok Sukhumvit 11</strong>, 7–11 Aralık). Özel van ile Suvarnabhumi'ye transfer.</p>
  <p><strong>Dönüş</strong> (Comfort · Amsterdam kalkışlı):</p>
  <ul>
    <li>BKK → AMS (Thai Airways): 11.12.2026 05:00 · 11:40 (12s 40dk · direkt)</li>
  </ul>
  <p><strong>Varış:</strong> Amsterdam Schiphol (AMS) — turumuzun sonu. Güvenli yolculuklar dileriz.</p>`
    }
  },
  en: {
    1: {
      route: "Amsterdam > Delhi > Phuket",
      summary:
        "Depart Amsterdam (AMS); Air India via Delhi to Phuket. Thanthip check-in on arrival day.",
      content: `
  <p><strong>2 December</strong> depart Amsterdam Schiphol (AMS). <strong>Air India</strong> via Delhi (DEL) to Phuket (HKT).</p>
  <p><strong>Outbound flights</strong> (Comfort · Amsterdam departure):</p>
  <ul>
    <li>AMS → DEL: Dep 02.12.2026 20:35 · Arr 03.12.2026 10:00 (+1 day) — 8h 55m</li>
    <li>DEL layover: ~3h 20m</li>
    <li>DEL → HKT: Dep 03.12.2026 13:20 · Arr 03.12.2026 19:30 — 4h 40m</li>
  </ul>
  <p>Total travel time 16h 55m. After arrival, <strong>Thanthip Beach Resort</strong> (2–7 December).</p>`
    },
    8: {
      route: "Bangkok > Amsterdam",
      summary:
        "Early morning BKK departure; direct Thai Airways to Amsterdam — same day.",
      content: `
  <p>After breakfast, check-out (<strong>Solitaire Bangkok Sukhumvit 11</strong>, 7–11 December). Private transfer to Suvarnabhumi.</p>
  <p><strong>Return</strong> (Comfort · Amsterdam departure):</p>
  <ul>
    <li>BKK → AMS (Thai Airways): 11.12.2026 05:00 · 11:40 (12h 40m · non-stop)</li>
  </ul>
  <p><strong>Arrival:</strong> Amsterdam Schiphol (AMS) — end of our tour. Have a safe journey.</p>`
    }
  }
};

const PROGRAM_DAY_OVERRIDES_BACKPACK_AMS = {
  tr: {
    1: {
      route: "Amsterdam > Delhi > Phuket",
      summary:
        "Air India ile Delhi aktarmalı Phuket; aktarma kendi sorumluluğunuzda.",
      content: `
  <p><strong>02 Aralık</strong> Amsterdam Schiphol (AMS) kalkış. <strong>Air India</strong> ile Delhi (DEL) aktarmalı Phuket (HKT).</p>
  <ul>
    <li>AMS → DEL: 02.12.2026 20:35 · 03.12.2026 10:00 (8s 55dk)</li>
    <li>DEL aktarma ~3s 20dk</li>
    <li>DEL → HKT: 03.12.2026 13:20 · 19:30 (4s 40dk)</li>
  </ul>
  <p>Toplam seyahat süresi 16s 55dk.</p>`
    },
    2: {
      route: "Phuket varış",
      summary:
        "Phuket Havalimanı'na varış; transfer ile Phuket Old Town Hostel. Check-in ve Eski Şehir'de serbest zaman.",
      content: `
  <p>Phuket Uluslararası Havalimanı'na varış (ör. 03.12.2026 ~19:30). Havalimanından <strong>Phuket Old Town Hostel</strong>'e transfer.</p>
  <p>Hostel check-in sonrası serbest zaman — Phuket Old Town.</p>
  <p>Geceleme Phuket Old Town Hostel'de (3–7 Aralık).</p>`
    },
    8: {
      route: "Bangkok > Kuveyt > Amsterdam",
      summary:
        "Gece BKK kalkışı; Kuwait Airways ile Kuveyt aktarmalı Amsterdam dönüşü.",
      content: `
  <p>Hostelde check-out ve BKK transferi.</p>
  <p><strong>Dönüş</strong> (Backpacking · Amsterdam kalkışlı):</p>
  <ul>
    <li>BKK → KWI: 11.12.2026 03:00 · 06:35 (7s 35dk)</li>
    <li>KWI aktarma ~1s 55dk</li>
    <li>KWI → AMS: 11.12.2026 08:30 · 12:55 (6s 25dk)</li>
  </ul>
  <p><strong>Varış:</strong> Amsterdam Schiphol (AMS) — tur sonu.</p>`
    }
  },
  en: {
    1: {
      route: "Amsterdam > Delhi > Phuket",
      summary:
        "Air India via Delhi to Phuket; layover.",
      content: `
  <p><strong>2 December</strong> depart Amsterdam Schiphol (AMS). <strong>Air India</strong> via Delhi (DEL) to Phuket (HKT).</p>
  <ul>
    <li>AMS → DEL: 02.12.2026 20:35 · 03.12.2026 10:00 (8h 55m)</li>
    <li>DEL layover ~3h 20m</li>
    <li>DEL → HKT: 03.12.2026 13:20 · 19:30 (4h 40m)</li>
  </ul>
  <p>Total travel time 16h 55m.</p>`
    },
    2: {
      route: "Phuket arrival",
      summary:
        "Arrive Phuket Airport; transfer to Phuket Old Town Hostel. Check-in and free time in Old Town.",
      content: `
  <p>Arrival at Phuket International Airport (e.g. 03.12.2026 ~19:30). Transfer to <strong>Phuket Old Town Hostel</strong>.</p>
  <p>After hostel check-in, free time in Phuket Old Town.</p>
  <p>Overnight at Phuket Old Town Hostel (3–7 December).</p>`
    },
    8: {
      route: "Bangkok > Kuwait > Amsterdam",
      summary:
        "Overnight BKK departure; Kuwait Airways via Kuwait City to Amsterdam.",
      content: `
  <p>Hostel check-out and transfer to BKK.</p>
  <p><strong>Return</strong> (Backpacking · Amsterdam departure):</p>
  <ul>
    <li>BKK → KWI: 11.12.2026 03:00 · 06:35 (7h 35m)</li>
    <li>KWI layover ~1h 55m</li>
    <li>KWI → AMS: 11.12.2026 08:30 · 12:55 (6h 25m)</li>
  </ul>
  <p><strong>Arrival:</strong> Amsterdam Schiphol (AMS) — end of tour.</p>`
    }
  }
};

const PROGRAM_DAY_OVERRIDES_BER_COMFORT = {
  tr: {
    1: {
      route: "Berlin > İstanbul > Phuket",
      summary:
        "Berlin (BER) kalkış; İstanbul aktarmalı Turkish Airlines ile Phuket. Varış günü Thanthip check-in.",
      content: `
  <p><strong>02 Aralık</strong> Berlin Brandenburg (BER) kalkış. <strong>Turkish Airlines</strong> ile İstanbul (IST) aktarmalı Phuket (HKT).</p>
  <p><strong>Gidiş uçuşları</strong> (Comfort · Berlin kalkışlı):</p>
  <ul>
    <li>BER → IST: 02.12.2026 14:30 · 19:30 (3s)</li>
    <li>IST aktarma: ~6s 30dk</li>
    <li>IST → HKT: 03.12.2026 02:00 · 15:50 (9s 50dk)</li>
  </ul>
  <p>Toplam seyahat süresi 19s 20dk. Varış sonrası <strong>Thanthip Beach Resort</strong> (2–7 Aralık).</p>`
    },
    8: {
      route: "Bangkok > Doha > Berlin",
      summary:
        "Sabah BKK kalkışı; Qatar Airways ile Doha aktarmalı aynı gün Berlin varışı.",
      content: `
  <p>Kahvaltı sonrası check-out (<strong>Solitaire Bangkok Sukhumvit 11</strong>, 7–11 Aralık). Özel van ile Suvarnabhumi'ye transfer.</p>
  <p><strong>Dönüş</strong> (Comfort · Berlin kalkışlı):</p>
  <ul>
    <li>BKK → DOH: 11.12.2026 09:05 · 12:30 (7s 25dk)</li>
    <li>DOH aktarma: ~3s 15dk</li>
    <li>DOH → BER: 11.12.2026 15:45 · 19:55 (6s 10dk)</li>
  </ul>
  <p><strong>Varış:</strong> Berlin Brandenburg (BER) — turumuzun sonu. Güvenli yolculuklar dileriz.</p>`
    }
  },
  en: {
    1: {
      route: "Berlin > Istanbul > Phuket",
      summary:
        "Depart Berlin (BER); Turkish Airlines via Istanbul to Phuket. Thanthip check-in on arrival day.",
      content: `
  <p><strong>2 December</strong> depart Berlin Brandenburg (BER). <strong>Turkish Airlines</strong> via Istanbul (IST) to Phuket (HKT).</p>
  <p><strong>Outbound flights</strong> (Comfort · Berlin departure):</p>
  <ul>
    <li>BER → IST: 02.12.2026 14:30 · 19:30 (3h)</li>
    <li>IST layover: ~6h 30m</li>
    <li>IST → HKT: 03.12.2026 02:00 · 15:50 (9h 50m)</li>
  </ul>
  <p>Total travel time 19h 20m. After arrival, <strong>Thanthip Beach Resort</strong> (2–7 December).</p>`
    },
    8: {
      route: "Bangkok > Doha > Berlin",
      summary:
        "Morning BKK departure; Qatar Airways via Doha, same-day arrival in Berlin.",
      content: `
  <p>After breakfast, check-out (<strong>Solitaire Bangkok Sukhumvit 11</strong>, 7–11 December). Private transfer to Suvarnabhumi.</p>
  <p><strong>Return</strong> (Comfort · Berlin departure):</p>
  <ul>
    <li>BKK → DOH: 11.12.2026 09:05 · 12:30 (7h 25m)</li>
    <li>DOH layover: ~3h 15m</li>
    <li>DOH → BER: 11.12.2026 15:45 · 19:55 (6h 10m)</li>
  </ul>
  <p><strong>Arrival:</strong> Berlin Brandenburg (BER) — end of our tour. Have a safe journey.</p>`
    }
  }
};

const PROGRAM_DAY_OVERRIDES_BACKPACK_BER = {
  tr: {
    1: {
      route: "Berlin > Amsterdam > Delhi > Phuket",
      summary:
        "KLM + Air India ile Amsterdam ve Delhi aktarmalı; tüm aktarmalar kendi sorumluluğunuzda.",
      content: `
  <p><strong>02 Aralık</strong> Berlin Brandenburg (BER) kalkış. <strong>KLM</strong> ile Amsterdam (AMS), <strong>Air India</strong> ile Delhi (DEL) ve Phuket (HKT).</p>
  <ul>
    <li>BER → AMS: 02.12.2026 16:30 · 17:55 (1s 25dk)</li>
    <li>AMS aktarma ~2s 40dk</li>
    <li>AMS → DEL: 02.12.2026 20:35 · 03.12.2026 10:00 (8s 55dk)</li>
    <li>DEL aktarma ~3s 20dk</li>
    <li>DEL → HKT: 03.12.2026 13:20 · 19:30 (4s 40dk)</li>
  </ul>
  <p>Toplam seyahat süresi 21 saat.</p>`
    },
    2: {
      route: "Phuket varış",
      summary:
        "Phuket Havalimanı'na varış; transfer ile Phuket Old Town Hostel. Check-in ve Eski Şehir'de serbest zaman.",
      content: `
  <p>Phuket Uluslararası Havalimanı'na varış (ör. 03.12.2026 ~19:30). Havalimanından <strong>Phuket Old Town Hostel</strong>'e transfer.</p>
  <p>Hostel check-in sonrası serbest zaman — Phuket Old Town.</p>
  <p>Geceleme Phuket Old Town Hostel'de (3–7 Aralık).</p>`
    },
    8: {
      route: "Bangkok > Doha > Berlin",
      summary:
        "Akşam BKK kalkışı; Qatar Airways ile Doha aktarmalı Berlin varışı (12 Aralık sabah).",
      content: `
  <p>Hostelde check-out ve BKK transferi.</p>
  <p><strong>Dönüş</strong> (Backpacking · Berlin kalkışlı):</p>
  <ul>
    <li>BKK → DOH: 11.12.2026 20:30 · 23:55 (7s 25dk)</li>
    <li>DOH aktarma ~2s 45dk</li>
    <li>DOH → BER: 12.12.2026 02:40 · 06:50 (6s 10dk)</li>
  </ul>
  <p><strong>Varış:</strong> Berlin Brandenburg (BER) — tur sonu.</p>`
    }
  },
  en: {
    1: {
      route: "Berlin > Amsterdam > Delhi > Phuket",
      summary:
        "Via KLM and Air India through Amsterdam and Delhi; multi-stop routing.",
      content: `
  <p><strong>2 December</strong> depart Berlin Brandenburg (BER). <strong>KLM</strong> to Amsterdam (AMS), <strong>Air India</strong> to Delhi (DEL) and Phuket (HKT).</p>
  <ul>
    <li>BER → AMS: 02.12.2026 16:30 · 17:55 (1h 25m)</li>
    <li>AMS layover ~2h 40m</li>
    <li>AMS → DEL: 02.12.2026 20:35 · 03.12.2026 10:00 (8h 55m)</li>
    <li>DEL layover ~3h 20m</li>
    <li>DEL → HKT: 03.12.2026 13:20 · 19:30 (4h 40m)</li>
  </ul>
  <p>Total travel time 21 hours.</p>`
    },
    2: {
      route: "Phuket arrival",
      summary:
        "Arrive Phuket Airport; transfer to Phuket Old Town Hostel. Check-in and free time in Old Town.",
      content: `
  <p>Arrival at Phuket International Airport (e.g. 03.12.2026 ~19:30). Transfer to <strong>Phuket Old Town Hostel</strong>.</p>
  <p>After hostel check-in, free time in Phuket Old Town.</p>
  <p>Overnight at Phuket Old Town Hostel (3–7 December).</p>`
    },
    8: {
      route: "Bangkok > Doha > Berlin",
      summary:
        "Evening BKK departure; Qatar Airways via Doha, arrival in Berlin morning of 12 December.",
      content: `
  <p>Hostel check-out and transfer to BKK.</p>
  <p><strong>Return</strong> (Backpacking · Berlin departure):</p>
  <ul>
    <li>BKK → DOH: 11.12.2026 20:30 · 23:55 (7h 25m)</li>
    <li>DOH layover ~2h 45m</li>
    <li>DOH → BER: 12.12.2026 02:40 · 06:50 (6h 10m)</li>
  </ul>
  <p><strong>Arrival:</strong> Berlin Brandenburg (BER) — end of tour.</p>`
    }
  }
};

const PROGRAM_DAY_OVERRIDES_LON_COMFORT = {
  tr: {
    1: {
      route: "Londra > Doha > Phuket",
      summary:
        "Gatwick (LGW) kalkış; Qatar Airways ile Doha aktarmalı Phuket. Varış günü Thanthip check-in.",
      content: `
  <p><strong>02 Aralık</strong> Londra Gatwick (LGW) kalkış. <strong>Qatar Airways</strong> ile Doha (DOH) aktarmalı Phuket (HKT).</p>
  <p><strong>Gidiş uçuşları</strong> (Comfort · Londra kalkışlı):</p>
  <ul>
    <li>LGW → DOH: 02.12.2026 08:40 · 18:15 (6s 35dk)</li>
    <li>DOH aktarma: ~2s 05dk</li>
    <li>DOH → HKT: 02.12.2026 20:20 · 03.12.2026 06:50 (6s 30dk)</li>
  </ul>
  <p>Toplam seyahat süresi 15s 10dk. Varış sonrası <strong>Thanthip Beach Resort</strong> (2–7 Aralık).</p>`
    },
    8: {
      route: "Bangkok > Londra",
      summary:
        "Öğle BKK kalkışı; EVA Air ile direkt Heathrow varışı — aynı gün.",
      content: `
  <p>Kahvaltı sonrası check-out (<strong>Solitaire Bangkok Sukhumvit 11</strong>, 7–11 Aralık). Özel van ile Suvarnabhumi'ye transfer.</p>
  <p><strong>Dönüş</strong> (Comfort · Londra kalkışlı):</p>
  <ul>
    <li>BKK → LHR (EVA Air): 11.12.2026 12:40 · 19:05 (13s 25dk · direkt)</li>
  </ul>
  <p><strong>Varış:</strong> Londra Heathrow (LHR) — turumuzun sonu. Güvenli yolculuklar dileriz.</p>`
    }
  },
  en: {
    1: {
      route: "London > Doha > Phuket",
      summary:
        "Depart Gatwick (LGW); Qatar Airways via Doha to Phuket. Thanthip check-in on arrival day.",
      content: `
  <p><strong>2 December</strong> depart London Gatwick (LGW). <strong>Qatar Airways</strong> via Doha (DOH) to Phuket (HKT).</p>
  <p><strong>Outbound flights</strong> (Comfort · London departure):</p>
  <ul>
    <li>LGW → DOH: 02.12.2026 08:40 · 18:15 (6h 35m)</li>
    <li>DOH layover: ~2h 05m</li>
    <li>DOH → HKT: 02.12.2026 20:20 · 03.12.2026 06:50 (6h 30m)</li>
  </ul>
  <p>Total travel time 15h 10m. After arrival, <strong>Thanthip Beach Resort</strong> (2–7 December).</p>`
    },
    8: {
      route: "Bangkok > London",
      summary:
        "Midday BKK departure; direct EVA Air to Heathrow — same day.",
      content: `
  <p>After breakfast, check-out (<strong>Solitaire Bangkok Sukhumvit 11</strong>, 7–11 December). Private transfer to Suvarnabhumi.</p>
  <p><strong>Return</strong> (Comfort · London departure):</p>
  <ul>
    <li>BKK → LHR (EVA Air): 11.12.2026 12:40 · 19:05 (13h 25m · non-stop)</li>
  </ul>
  <p><strong>Arrival:</strong> London Heathrow (LHR) — end of our tour. Have a safe journey.</p>`
    }
  }
};

const PROGRAM_DAY_OVERRIDES_BACKPACK_LON = {
  tr: {
    1: {
      route: "Londra > Doha > Phuket",
      summary:
        "Heathrow (LHR) kalkış; Qatar Airways ile Doha aktarmalı Phuket. Geceleme uçakta.",
      content: `
  <p><strong>02 Aralık</strong> Londra Heathrow (LHR) kalkış. <strong>Qatar Airways</strong> ile Doha (DOH) aktarmalı Phuket (HKT).</p>
  <ul>
    <li>LHR → DOH: 02.12.2026 08:40 · 18:20 (6s 40dk)</li>
    <li>DOH aktarma ~2 saat</li>
    <li>DOH → HKT: 02.12.2026 20:20 · 03.12.2026 06:50 (6s 30dk)</li>
  </ul>
  <p>Toplam seyahat süresi 15s 10dk. Geceleme uçakta.</p>`
    },
    2: {
      route: "Phuket varış",
      summary:
        "Phuket Havalimanı'na varış; transfer ile Phuket Old Town Hostel. Check-in ve Eski Şehir'de serbest zaman.",
      content: `
  <p>Phuket Uluslararası Havalimanı'na varış (ör. 03.12.2026 sabah ~06:50). Havalimanından <strong>Phuket Old Town Hostel</strong>'e transfer.</p>
  <p>Hostel check-in sonrası serbest zaman — Phuket Old Town.</p>
  <p>Geceleme Phuket Old Town Hostel'de (3–7 Aralık).</p>`
    },
    8: {
      route: "Bangkok > Kuveyt > Londra",
      summary:
        "Gece BKK kalkışı; Kuwait Airways ile Kuveyt aktarmalı Heathrow dönüşü.",
      content: `
  <p>Hostelde check-out ve BKK transferi.</p>
  <p><strong>Dönüş</strong> (Backpacking · Londra kalkışlı):</p>
  <ul>
    <li>BKK → KWI: 11.12.2026 03:00 · 06:35 (7s 35dk)</li>
    <li>KWI aktarma ~3s 25dk</li>
    <li>KWI → LHR: 11.12.2026 10:00 · 13:45 (6s 45dk)</li>
  </ul>
  <p><strong>Varış:</strong> Londra Heathrow (LHR) — tur sonu.</p>`
    }
  },
  en: {
    1: {
      route: "London > Doha > Phuket",
      summary:
        "Depart Heathrow (LHR); Qatar Airways via Doha to Phuket. Overnight on plane.",
      content: `
  <p><strong>2 December</strong> depart London Heathrow (LHR). <strong>Qatar Airways</strong> via Doha (DOH) to Phuket (HKT).</p>
  <ul>
    <li>LHR → DOH: 02.12.2026 08:40 · 18:20 (6h 40m)</li>
    <li>DOH layover ~2 hours</li>
    <li>DOH → HKT: 02.12.2026 20:20 · 03.12.2026 06:50 (6h 30m)</li>
  </ul>
  <p>Total travel time 15h 10m. Overnight on the plane.</p>`
    },
    2: {
      route: "Phuket arrival",
      summary:
        "Arrive Phuket Airport; transfer to Phuket Old Town Hostel. Check-in and free time in Old Town.",
      content: `
  <p>Arrival at Phuket International Airport (e.g. 03.12.2026 ~06:50). Transfer to <strong>Phuket Old Town Hostel</strong>.</p>
  <p>After hostel check-in, free time in Phuket Old Town.</p>
  <p>Overnight at Phuket Old Town Hostel (3–7 December).</p>`
    },
    8: {
      route: "Bangkok > Kuwait > London",
      summary:
        "Overnight BKK departure; Kuwait Airways via Kuwait City to Heathrow.",
      content: `
  <p>Hostel check-out and transfer to BKK.</p>
  <p><strong>Return</strong> (Backpacking · London departure):</p>
  <ul>
    <li>BKK → KWI: 11.12.2026 03:00 · 06:35 (7h 35m)</li>
    <li>KWI layover ~3h 25m</li>
    <li>KWI → LHR: 11.12.2026 10:00 · 13:45 (6h 45m)</li>
  </ul>
  <p><strong>Arrival:</strong> London Heathrow (LHR) — end of tour.</p>`
    }
  }
};

const PROGRAM_DAY_OVERRIDES_HEL_COMFORT = {
  tr: {
    1: {
      route: "Helsinki > Phuket",
      summary:
        "Helsinki-Vantaa (HEL) kalkış; Finnair ile direkt Phuket. Varış günü Thanthip check-in.",
      content: `
  <p><strong>02 Aralık</strong> Helsinki-Vantaa (HEL) kalkış. <strong>Finnair</strong> ile direkt Phuket (HKT).</p>
  <p><strong>Gidiş uçuşu</strong> (Comfort · Helsinki kalkışlı):</p>
  <ul>
    <li>HEL → HKT: Kalkış 02.12.2026 16:35 · Varış 03.12.2026 09:00 (+1 gün)</li>
    <li>Uçuş süresi: ~11s 25dk · direkt</li>
  </ul>
  <p>Varış sonrası <strong>Thanthip Beach Resort</strong> (2–7 Aralık).</p>`
    },
    8: {
      route: "Bangkok > Helsinki",
      summary:
        "Öğle BKK kalkışı; Finnair ile direkt Helsinki varışı — aynı gün.",
      content: `
  <p>Kahvaltı sonrası check-out (<strong>Solitaire Bangkok Sukhumvit 11</strong>, 7–11 Aralık). Özel van ile Suvarnabhumi'ye transfer.</p>
  <p><strong>Dönüş</strong> (Comfort · Helsinki kalkışlı):</p>
  <ul>
    <li>BKK → HEL (Finnair): 11.12.2026 11:15 · 18:50 (12s 35dk · direkt)</li>
  </ul>
  <p><strong>Varış:</strong> Helsinki-Vantaa (HEL) — turumuzun sonu. Güvenli yolculuklar dileriz.</p>`
    }
  },
  en: {
    1: {
      route: "Helsinki > Phuket",
      summary:
        "Depart Helsinki-Vantaa (HEL); direct Finnair to Phuket. Thanthip check-in on arrival day.",
      content: `
  <p><strong>2 December</strong> depart Helsinki-Vantaa (HEL). <strong>Finnair</strong> direct to Phuket (HKT).</p>
  <p><strong>Outbound flight</strong> (Comfort · Helsinki departure):</p>
  <ul>
    <li>HEL → HKT: Dep 02.12.2026 16:35 · Arr 03.12.2026 09:00 (+1 day)</li>
    <li>Duration: ~11h 25m · non-stop</li>
  </ul>
  <p>After arrival, <strong>Thanthip Beach Resort</strong> (2–7 December).</p>`
    },
    8: {
      route: "Bangkok > Helsinki",
      summary:
        "Midday BKK departure; direct Finnair to Helsinki — same day.",
      content: `
  <p>After breakfast, check-out (<strong>Solitaire Bangkok Sukhumvit 11</strong>, 7–11 December). Private transfer to Suvarnabhumi.</p>
  <p><strong>Return</strong> (Comfort · Helsinki departure):</p>
  <ul>
    <li>BKK → HEL (Finnair): 11.12.2026 11:15 · 18:50 (12h 35m · non-stop)</li>
  </ul>
  <p><strong>Arrival:</strong> Helsinki-Vantaa (HEL) — end of our tour. Have a safe journey.</p>`
    }
  }
};

const PROGRAM_DAY_OVERRIDES_HEL_SHARED = {
  tr: {
    1: {
      route: "Helsinki > Phuket",
      summary:
        "Helsinki (HEL) kalkış; Finnair ile direkt Phuket.",
      content: `
  <p><strong>02 Aralık</strong> Helsinki-Vantaa (HEL) kalkış. <strong>Finnair</strong> ile direkt Phuket (HKT).</p>
  <p><strong>Gidiş uçuşu</strong> (teyit tur dokümanında):</p>
  <ul>
    <li>HEL → HKT: Kalkış 02.12.2026 16:35 · Varış 03.12.2026 09:00 (+1 gün)</li>
    <li>Uçuş süresi: ~11s 25dk · direkt</li>
  </ul>
  <p>Geceleme uçakta; Phuket varışında konaklamaya geçiş.</p>`
    }
  },
  en: {
    1: {
      route: "Helsinki > Phuket",
      summary:
        "Depart Helsinki (HEL); direct Finnair to Phuket.",
      content: `
  <p><strong>2 December</strong> depart Helsinki-Vantaa (HEL). <strong>Finnair</strong> direct to Phuket (HKT).</p>
  <p><strong>Outbound flight</strong> (confirmed in tour document):</p>
  <ul>
    <li>HEL → HKT: Dep 02.12.2026 16:35 · Arr 03.12.2026 09:00 (+1 day)</li>
    <li>Duration: ~11h 25m · non-stop</li>
  </ul>
  <p>Overnight on the plane; transfer to accommodation after Phuket arrival.</p>`
    }
  }
};

const PROGRAM_DAY_OVERRIDES_HEL_RETURN = {
  tr: {
    8: {
      route: "Bangkok > İstanbul > Helsinki",
      summary:
        "Sabah BKK kalkışı; İstanbul aktarmalı Turkish Airlines ile Helsinki.",
      content: `
  <p>Kahvaltı sonrası check-out. Özel van ile <strong>Bangkok Suvarnabhumi Havalimanı</strong>'na transfer.</p>
  <ul>
    <li>BKK → IST: Kalkış 11.12.2026 06:10 · Varış 11.12.2026 12:50</li>
    <li>IST aktarma: ~2s 30dk</li>
    <li>IST → HEL: Kalkış 11.12.2026 15:20 · Varış 11.12.2026 18:05</li>
  </ul>
  <p><strong>Varış:</strong> Helsinki — turumuzun sonu. Güvenli yolculuklar dileriz.</p>`
    }
  },
  en: {
    8: {
      route: "Bangkok > Istanbul > Helsinki",
      summary:
        "Morning BKK departure; Turkish Airlines via Istanbul to Helsinki.",
      content: `
  <p>After breakfast, check-out. Private transfer to <strong>Bangkok Suvarnabhumi Airport</strong>.</p>
  <ul>
    <li>BKK → IST: Dep 11.12.2026 06:10 · Arr 11.12.2026 12:50</li>
    <li>IST layover: ~2h 30m</li>
    <li>IST → HEL: Dep 11.12.2026 15:20 · Arr 11.12.2026 18:05</li>
  </ul>
  <p><strong>Arrival:</strong> Helsinki — end of our tour. Have a safe journey.</p>`
    }
  }
};

const PROGRAM_DAY_OVERRIDES_HEL_RETURN_TML = {
  tr: {
    11: {
      route: "Pattaya → Bangkok > Helsinki",
      summary:
        "Finnair ile BKK–Helsinki; gizli şehir bileti (resmi varış Münih).",
      content: `
  <p>Otelde kahvaltı sonrası check-out. Özel transferle Bangkok Suvarnabhumi Havalimanı'na hareket (1.5-2 saat).</p>
  <ul>
    <li>BKK → HEL: Kalkış 14.12.2026 11:15 · Varış 14.12.2026 18:50 · Finnair</li>
    <li><strong>Gizli şehir:</strong> Bilet resmi olarak Münih (MUC) varışlı; Helsinki aktarmasında iniş planlanır — risk ve kurallar yolcuya aittir.</li>
  </ul>
  <p><strong>Varış:</strong> Helsinki — turumuzun sonu. Güvenli yolculuklar dileriz.</p>`
    }
  },
  en: {
    11: {
      route: "Pattaya → Bangkok > Helsinki",
      summary:
        "Finnair BKK–Helsinki; hidden-city ticket (official destination Munich).",
      content: `
  <p>Breakfast and check-out at the hotel. Private transfer to Bangkok Suvarnabhumi Airport (1.5-2 hours).</p>
  <ul>
    <li>BKK → HEL: Dep 14.12.2026 11:15 · Arr 14.12.2026 18:50 · Finnair</li>
    <li><strong>Hidden city:</strong> Ticket officially to Munich (MUC); planned disembarkation in Helsinki — risks and rules are the passenger's responsibility.</li>
  </ul>
  <p><strong>Arrival:</strong> Helsinki — end of our tour. Have a safe journey.</p>`
    }
  }
};

const PROGRAM_DAY_OVERRIDES_BACKPACK = {
  tr: {
    1: {
      route: "İstanbul > Sharjah > Phuket",
      summary:
        "İstanbul Havalimanı (IST) kalkış; Air Arabia ile Sharjah aktarmalı Phuket'e. Geceleme uçakta.",
      content: `
  <p><strong>02 Aralık</strong> İstanbul Havalimanı (IST) dış hatlar terminalinde uçuştan en az 3 saat önce buluşma.</p>
  <p>Bilet, bagaj ve pasaport işlemlerinden sonra <strong>Air Arabia</strong> ile Sharjah (SHJ) aktarmalı Phuket'e hareket. Sharjah aktarması (~5 saat).</p>
  <p><strong>Gidiş</strong> (Backpacking · İstanbul kalkışlı):</p>
  <ul>
    <li>IST → SHJ: 02.12.2026 14:35 · 19:55 (4s 20dk)</li>
    <li>SHJ aktarma ~5 saat</li>
    <li>SHJ → HKT: 03.12.2026 00:55 · 10:10 (6s 15dk)</li>
  </ul>
  <p>Toplam seyahat süresi 15s 35dk. Geceleme uçakta.</p>`
    },
    2: {
      route: "Phuket varış",
      summary:
        "Phuket Havalimanı'na varış; transfer ile Phuket Old Town Hostel. Check-in ve Eski Şehir'de serbest zaman.",
      content: `
  <p>Phuket Uluslararası Havalimanı'na varış (ör. 03.12.2026 sabah ~10:10). Havalimanından <strong>Phuket Old Town Hostel</strong>'e transfer.</p>
  <p>Hostel check-in sonrası serbest zaman:</p>
  <ul>
    <li>Phuket Old Town sokakları ve gece pazarları</li>
    <li>Yerel restoranlar ve sokak yemekleri</li>
    <li>Tapınaklar ve müzeler (yürüme mesafesi)</li>
  </ul>
  <p>Geceleme Phuket Old Town Hostel'de (3–7 Aralık).</p>`
    },
    8: {
      route: "Bangkok > Doha > İstanbul (SAW)",
      summary: "Gece uçuşu; Qatar Airways ile Doha aktarmalı Sabiha Gökçen dönüşü.",
      content: `
  <p>Hostelde check-out. Bangkok Suvarnabhumi Havalimanı'na transfer.</p>
  <p><strong>Dönüş</strong> (Backpacking · İstanbul kalkışlı):</p>
  <ul>
    <li>BKK → DOH: 11.12.2026 03:00 · 06:25 (7s 25dk)</li>
    <li>DOH aktarma ~1s 05dk</li>
    <li>DOH → SAW: 11.12.2026 07:30 · 12:10 (4s 40dk)</li>
  </ul>
  <p><strong>Varış:</strong> İstanbul Sabiha Gökçen (SAW) — tur sonu.</p>`
    }
  },
  en: {
    1: {
      route: "Istanbul > Sharjah > Phuket",
      summary:
        "Depart Istanbul Airport (IST); Air Arabia via Sharjah to Phuket. Overnight on plane.",
      content: `
  <p><strong>2 December</strong> meet at Istanbul Airport (IST) international departures at least 3 hours before departure.</p>
  <p>After check-in, <strong>Air Arabia</strong> via Sharjah (SHJ) to Phuket. Sharjah layover (~5 hours).</p>
  <p><strong>Outbound</strong> (Backpacking · Istanbul departure):</p>
  <ul>
    <li>IST → SHJ: 02.12.2026 14:35 · 19:55 (4h 20m)</li>
    <li>SHJ layover ~5 hours</li>
    <li>SHJ → HKT: 03.12.2026 00:55 · 10:10 (6h 15m)</li>
  </ul>
  <p>Total travel time 15h 35m. Overnight on the plane.</p>`
    },
    2: {
      route: "Phuket arrival",
      summary:
        "Arrive Phuket Airport; transfer to Phuket Old Town Hostel. Check-in and free time in Old Town.",
      content: `
  <p>Arrival at Phuket International Airport (e.g. 03.12.2026 ~10:10). Transfer to <strong>Phuket Old Town Hostel</strong>.</p>
  <p>After hostel check-in, free time:</p>
  <ul>
    <li>Phuket Old Town streets and night markets</li>
    <li>Local restaurants and street food</li>
    <li>Temples and museums within walking distance</li>
  </ul>
  <p>Overnight at Phuket Old Town Hostel (3–7 December).</p>`
    },
    8: {
      route: "Bangkok > Doha > Istanbul (SAW)",
      summary: "Overnight return via Doha with Qatar Airways to Sabiha Gökçen.",
      content: `
  <p>Check-out at hostel. Transfer to Bangkok Suvarnabhumi Airport.</p>
  <p><strong>Return</strong> (Backpacking · Istanbul departure):</p>
  <ul>
    <li>BKK → DOH: 11.12.2026 03:00 · 06:25 (7h 25m)</li>
    <li>DOH layover ~1h 05m</li>
    <li>DOH → SAW: 11.12.2026 07:30 · 12:10 (4h 40m)</li>
  </ul>
  <p><strong>Arrival:</strong> Istanbul Sabiha Gökçen (SAW) — end of tour.</p>`
    }
  }
};

function withDeparturePort(days, lang, tour) {
  let overrides = {};
  const port = currentDeparturePort;
  if (tour === "backpacking" && port === "istanbul") {
    overrides = Object.assign({}, PROGRAM_DAY_OVERRIDES_BACKPACK[lang] || {});
  } else if (tour === "phuket" && port === "istanbul") {
    overrides = Object.assign({}, overrides, PROGRAM_DAY_OVERRIDES_COMFORT_IST[lang] || {});
  }
  if (port === "larnaca") {
    const lcaShared = PROGRAM_DAY_OVERRIDES_LCA_SHARED[lang] || {};
    const lcaReturn = PROGRAM_DAY_OVERRIDES_LCA_RETURN[lang] || {};
    if (tour === "backpacking") {
      overrides = Object.assign({}, lcaShared, lcaReturn, overrides, PROGRAM_DAY_OVERRIDES_BACKPACK_LCA[lang] || {});
    } else if (tour === "phuket") {
      overrides = Object.assign({}, lcaReturn, overrides, PROGRAM_DAY_OVERRIDES_LCA_COMFORT[lang] || {});
    } else {
      overrides = Object.assign({}, lcaShared, overrides, lcaReturn);
    }
  } else if (port === "ercan") {
    const er = PROGRAM_DAY_OVERRIDES_ERCAN[lang] || {};
    if (tour === "backpacking") {
      overrides = Object.assign({}, er, overrides, PROGRAM_DAY_OVERRIDES_BACKPACK_ERCAN[lang] || {});
    } else {
      overrides = Object.assign({}, overrides, er);
    }
  } else if (port === "helsinki") {
    const helShared = PROGRAM_DAY_OVERRIDES_HEL_SHARED[lang] || {};
    const helReturn = PROGRAM_DAY_OVERRIDES_HEL_RETURN[lang] || {};
    if (tour === "tomorrowland") {
      overrides = Object.assign({}, helShared, overrides, PROGRAM_DAY_OVERRIDES_HEL_RETURN_TML[lang] || {});
    } else if (tour === "phuket") {
      overrides = Object.assign({}, helReturn, overrides, PROGRAM_DAY_OVERRIDES_HEL_COMFORT[lang] || {});
    } else if (tour === "backpacking") {
      overrides = Object.assign({}, overrides, PROGRAM_DAY_OVERRIDES_BACKPACK_HEL[lang] || {});
    } else {
      overrides = Object.assign({}, helShared, overrides, helReturn);
    }
  } else if (port === "london") {
    if (tour === "backpacking") {
      overrides = Object.assign({}, overrides, PROGRAM_DAY_OVERRIDES_BACKPACK_LON[lang] || {});
    } else if (tour === "phuket") {
      overrides = Object.assign({}, overrides, PROGRAM_DAY_OVERRIDES_LON_COMFORT[lang] || {});
    }
  } else if (port === "berlin") {
    if (tour === "backpacking") {
      overrides = Object.assign({}, overrides, PROGRAM_DAY_OVERRIDES_BACKPACK_BER[lang] || {});
    } else if (tour === "phuket") {
      overrides = Object.assign({}, overrides, PROGRAM_DAY_OVERRIDES_BER_COMFORT[lang] || {});
    }
  } else if (port === "amsterdam") {
    if (tour === "backpacking") {
      overrides = Object.assign({}, overrides, PROGRAM_DAY_OVERRIDES_BACKPACK_AMS[lang] || {});
    } else if (tour === "phuket") {
      overrides = Object.assign({}, overrides, PROGRAM_DAY_OVERRIDES_AMS_COMFORT[lang] || {});
    }
  }
  if (tour === "tomorrowland") {
    overrides = Object.assign({}, overrides, PROGRAM_DAY_OVERRIDES_TML_HOTELS[lang] || {});
    const tmlRetByPort = (PROGRAM_DAY_OVERRIDES_TML_RETURN_BY_PORT[lang] || {})[port] || {};
    overrides = Object.assign({}, overrides, tmlRetByPort);
  }
  if (!Object.keys(overrides).length) return days;
  if (tour === "phuket" || tour === "backpacking") {
    if (overrides[8]) {
      if (!overrides[9]) overrides[9] = overrides[8];
      delete overrides[8];
    }
  }
  if (tour === "tomorrowland") {
    if (overrides[5] && !overrides[6]) {
      overrides = Object.assign({}, overrides, { 6: overrides[5] });
    }
    if (overrides[11] && !overrides[12]) {
      overrides = Object.assign({}, overrides, { 12: overrides[11] });
    }
  }
  return days.map(function (d) {
    if (d.n === 9 && tour !== "phuket" && tour !== "backpacking") return d;
    if (d.n === 12 && tour !== "tomorrowland") return d;
    if (!overrides[d.n]) return d;
    return Object.assign({}, d, overrides[d.n]);
  });
}

/* ─── TOMORROWLAND PACKAGE — Side content (TR/EN) ─────────────────── */
const generalHtml_tml = `
  ${visaInfoHtml}
  <p>Bu paket normal Phuket &amp; Bangkok turunun tamamını içerir; ardından <strong>Pattaya'da Tomorrowland Thailand</strong> festival uzantısı eklenir. Toplam <strong>02–14 Aralık 2026</strong>, <strong>10 gece 11 gün</strong>. Festival günleri <strong>11 ve 13 Aralık</strong>; aradaki gün serbest.</p>
  <h3>Tayland geneli</h3>
  <ul>
    <li><strong>Para birimi:</strong> Thai Baht (THB) — 1€ ≈ 38-40 THB</li>
    <li><strong>İklim:</strong> Aralık ayında 25-32°C, kuru sezon</li>
    <li><strong>Saat farkı:</strong> Türkiye'den +4 saat ileri (GMT+7)</li>
    <li><strong>Festival ulaşımı:</strong> Pattaya'dan festival alanına shuttle servis paket dahilinde</li>
    <li><strong>Festival bileti:</strong> Tomorrowland Full Madness Pass — iki gün dahil</li>
    <li><strong>Elektrik:</strong> 220V, A/B/C tipi prizler</li>
  </ul>
  <p style="font-size:0.85rem;color:var(--text-muted);margin-top:0.5rem">Pasaport ve vize bilgisi pasaport ülkenize göre yukarıda gösterilir.</p>`;
const generalHtml_tml_en = `
  ${visaInfoHtml_en}
  <p>This package includes the full Phuket &amp; Bangkok tour, then adds the <strong>Tomorrowland Thailand</strong> festival extension in Pattaya. Total <strong>02–14 December 2026</strong>, <strong>10 nights 11 days</strong>. Festival days are <strong>11 and 13 December</strong>; the day in between is free.</p>
  <h3>About Thailand</h3>
  <ul>
    <li><strong>Currency:</strong> Thai Baht (THB) — 1€ ≈ 38-40 THB</li>
    <li><strong>Climate:</strong> 25-32°C in December, dry season</li>
    <li><strong>Time difference:</strong> +4 hours ahead of Turkey (GMT+7)</li>
    <li><strong>Festival transport:</strong> Shuttle service from Pattaya to festival ground included</li>
    <li><strong>Festival ticket:</strong> Tomorrowland Full Madness Pass — both festival days included</li>
    <li><strong>Electricity:</strong> 220V, type A/B/C plugs</li>
  </ul>
  <p style="font-size:0.85rem;color:var(--text-muted);margin-top:0.5rem">Passport &amp; visa details are shown above based on your passport country.</p>`;

const accommodationHtml_tml = `
  <h3>Phuket (5 gece) — SKYVIEW Resort Phuket Patong Beach</h3>
  <p>2–7 Aralık 2026 · Patong · kahvaltı dahil. Havuz, plaja yakın konum; ücretsiz WiFi.</p>
  <h3>Bangkok (4 gece) — Grande Centre Point Prestige Bangkok</h3>
  <p>7–11 Aralık 2026 · Ratchadamri / Lumpini · kahvaltı dahil. Siam BTS ve Lumpini Park'a yakın; havuz, spa, fitness.</p>
  <h3>Pattaya (3 gece) — Royal Cliff Beach Terrace Pattaya (5★)</h3>
  <p>11–14 Aralık 2026 · Phra Tamnak · kahvaltı dahil. Deniz manzaralı teras, infinity havuz, spa.</p>
  <ul>
    <li><strong>Konum:</strong> Güney Pattaya kıyısı — festival transferine uygun</li>
    <li><strong>Olanaklar:</strong> Açık havuz, spa, fitness, restoran, ücretsiz WiFi</li>
    <li><strong>Check-in / Check-out:</strong> Otel politikasına göre (teyit dokümanında)</li>
  </ul>
  <p style="font-size:0.85rem;color:var(--text-muted)">Otel değişiklik hakkı saklıdır; aynı kategori veya üstü garanti edilir.</p>
  ${accommodationNotesHtml}`;
const accommodationHtml_tml_en = `
  <h3>Phuket (5 nights) — SKYVIEW Resort Phuket Patong Beach</h3>
  <p>2–7 December 2026 · Patong · breakfast included. Pool, close to the beach; free WiFi.</p>
  <h3>Bangkok (4 nights) — Grande Centre Point Prestige Bangkok</h3>
  <p>7–11 December 2026 · Ratchadamri / Lumpini · breakfast included. Near Siam BTS and Lumpini Park; pool, spa, fitness.</p>
  <h3>Pattaya (3 nights) — Royal Cliff Beach Terrace Pattaya (5★)</h3>
  <p>11–14 December 2026 · Phra Tamnak · breakfast included. Sea-view terrace, infinity pool, spa.</p>
  <ul>
    <li><strong>Location:</strong> South Pattaya coast — convenient for festival transfers</li>
    <li><strong>Amenities:</strong> Outdoor pool, spa, fitness, restaurant, free WiFi</li>
    <li><strong>Check-in / Check-out:</strong> Per hotel policy (confirmed in tour document)</li>
  </ul>
  <p style="font-size:0.85rem;color:var(--text-muted)">Hotel subject to change; same category or higher is guaranteed.</p>
  ${accommodationNotesHtml_en}`;

const flightsHtml_tml = `
  <h3>Gidiş uçuşları</h3>
  <p><strong>Comfort paketi ile aynı</strong> — kalkış limanına göre (İstanbul, Ercan, Larnaca, Helsinki, Londra, Berlin, Amsterdam). Uçuş sekmesinde seçtiğiniz limana göre güncel gidiş rotası gösterilir.</p>
  <h3>İç hat uçuşu (Phuket → Bangkok)</h3>
  <p><strong>Thai AirAsia FD3014</strong> — 07.12.2026 · Comfort ile aynı saatler.</p>
  <h3>Karayolu transferi (Bangkok ↔ Pattaya)</h3>
  <p>11 Aralık Bangkok → Pattaya · 14 Aralık Pattaya → Bangkok havalimanı (özel araç, ~1.5-2 saat).</p>
  <h3>Dönüş uçuşları (14 Aralık — festival sonrası)</h3>
  <p>Kalkış limanına göre değişir (14 Ara); İstanbul: <strong>TK8548</strong> BKK 23:45 → IST 06:05 (+1 gün). Uçuş sekmesinde seçili limanın dönüş detayları listelenir.</p>
  <h3>Bagaj bilgisi</h3>
  <ul>
    <li><strong>Uluslararası (Qatar / THY ekonomi):</strong> 7 kg kabin bagajı dahil · 20 kg kayıtlı bagaj ek ücretlidir</li>
    <li><strong>İç hat (Thai AirAsia):</strong> 7 kg kabin bagajı dahil · 20 kg kayıtlı bagaj ek ücretlidir</li>
  </ul>
  <p style="font-size:0.85rem;color:var(--text-muted)">Kesin uçuş saatleri tur teyidinde paylaşılır.</p>`;
const flightsHtml_tml_en = `
  <h3>Outbound flights</h3>
  <p><strong>Same as the Comfort package</strong> for your departure city (Istanbul, Ercan, Larnaca, Helsinki, London, Berlin, Amsterdam). See the Flights tab for your selected port.</p>
  <h3>Domestic flight (Phuket → Bangkok)</h3>
  <p><strong>Thai AirAsia FD3014</strong> — 07.12.2026 · same times as Comfort.</p>
  <h3>Road transfer (Bangkok ↔ Pattaya)</h3>
  <p>11 Dec Bangkok → Pattaya · 14 Dec Pattaya → Bangkok airport (private vehicle, ~1.5-2 hours).</p>
  <h3>Return flights (14 December — after festival)</h3>
  <p>Vary by departure city (14 Dec); example Istanbul: <strong>TK8548</strong> BKK 23:45 → IST 06:05 (+1 day). Full return details appear in the Flights tab for your port.</p>
  <h3>Baggage info</h3>
  <ul>
    <li><strong>International (Qatar / THY economy):</strong> 7 kg cabin baggage included · 20 kg checked baggage extra</li>
    <li><strong>Domestic (Thai AirAsia):</strong> 7 kg cabin baggage included · 20 kg checked baggage extra</li>
  </ul>
  <p style="font-size:0.85rem;color:var(--text-muted)">Exact flight times shared upon tour confirmation.</p>`;

const photos_tml = [
  { href: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=80", src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80", alt: "Tomorrowland sahne", altEn: "Tomorrowland stage" },
  { href: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1600&q=80", src: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80", alt: "Festival kalabalık", altEn: "Festival crowd" },
  { href: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=1600&q=80", src: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&q=80", alt: "Phuket plajı", altEn: "Phuket beach" },
  { href: "https://images.unsplash.com/photo-1625276413000-12c38e7b7d0a?w=1600&q=80", src: "https://images.unsplash.com/photo-1625276413000-12c38e7b7d0a?w=600&q=80", alt: "Pattaya plajı", altEn: "Pattaya beach" },
  { href: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=1600&q=80", src: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=600&q=80", alt: "Bangkok tapınağı", altEn: "Bangkok temple" },
  { href: "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=1600&q=80", src: "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=600&q=80", alt: "Bangkok gece hayatı", altEn: "Bangkok nightlife" }
];

const sidebarIncluded_tml = [
  "Gidiş-dönüş uluslararası uçuşlar + Phuket-Bangkok iç hat",
  "Phuket 5 gece + Bangkok 4 gece + Pattaya 3 gece konaklama",
  "Tüm kahvaltılar dahil",
  "Tüm transferler (havalimanı, şehirler arası, Bangkok ↔ Pattaya)",
  "Festival shuttle servisi",
  "Tomorrowland Full Madness Pass (2 gün)",
  "7/24 destek hizmeti"
];
const sidebarIncluded_tml_en = [
  "Roundtrip international flights + Phuket-Bangkok domestic",
  "Phuket 5 nights + Bangkok 4 nights + Pattaya 3 nights",
  "All breakfasts included",
  "All transfers (airport, intercity, Bangkok ↔ Pattaya)",
  "Festival shuttle service",
  "Tomorrowland Full Madness Pass (2 days)",
  "24/7 support service"
];

const includedBottom_tml = [
  "Gidiş uçuşları Comfort paketi ile aynı; dönüş 14 Aralık (festival sonrası) ekonomi biletleri",
  "Phuket-Bangkok arası iç hat uçağı (Thai AirAsia, 7 kg kabin dahil)",
  "Phuket — SKYVIEW Resort Patong'da 5 gece kahvaltı dahil (2–7 Aralık)",
  "Bangkok — Grande Centre Point Prestige'da 4 gece kahvaltı dahil (7–11 Aralık)",
  "Pattaya — Royal Cliff Beach Terrace'da 3 gece kahvaltı dahil (11–14 Aralık)",
  "Tüm havalimanı, şehirler arası ve Bangkok ↔ Pattaya transferleri (özel VIP van)",
  "Pattaya ↔ festival alanı shuttle servisi (2 gün)",
  "Tomorrowland Thailand Full Madness Pass (11 ve 13 Aralık)",
  "Lisanslı Türkçe konuşan rehber/koordinatör",
  "7/24 destek hizmeti"
];
const includedBottom_tml_en = [
  "Outbound flights same as Comfort package; return 14 December (post-festival) economy flights",
  "Phuket-Bangkok domestic flight (Thai AirAsia, 7 kg cabin included)",
  "Phuket — SKYVIEW Resort Patong — 5 nights with breakfast (2–7 December)",
  "Bangkok — Grande Centre Point Prestige — 4 nights with breakfast (7–11 December)",
  "Pattaya — Royal Cliff Beach Terrace — 3 nights with breakfast (11–14 December)",
  "All airport, intercity and Bangkok ↔ Pattaya transfers (private VIP van)",
  "Pattaya ↔ festival ground shuttle service (2 days)",
  "Tomorrowland Thailand Full Madness Pass (11 &amp; 13 December)",
  "Licensed Turkish-speaking guide/coordinator",
  "24/7 support service"
];

const excludedBottom_tml = [
  "Tayland vize ücreti (gerekli ülkeler için)",
  "Festival alanında yiyecek/içecek harcamaları",
  "Öğle ve akşam yemekleri",
  "Opsiyonel turlar (tekne turu, vb.)",
  "Bahşişler ve kişisel harcamalar",
  "Seyahat sağlık sigortası (önerilir)"
];
const excludedBottom_tml_en = [
  "Thailand visa fee (where applicable)",
  "Food &amp; beverage spending at festival",
  "Lunches and dinners",
  "Optional tours (boat tours, etc.)",
  "Tips and personal expenses",
  "Travel insurance (recommended)"
];

/* ─── Flights by departure port ───────────────────────────────────── */
const FLIGHT_DOMESTIC = {
  titleTr: 'İç hat uçuşu', titleEn: 'Domestic flight',
  route: 'Phuket (HKT) → Bangkok (BKK) · Thai AirAsia FD3014',
  timeTr: 'Kalkış: 08.12.2026 14:00 · Varış: 08.12.2026 15:25',
  timeEn: 'Dep: 08.12.2026 14:00 · Arr: 08.12.2026 15:25'
};
const FLIGHT_DOMESTIC_COMFORT = {
  titleTr: 'İç hat uçuşu', titleEn: 'Domestic flight',
  route: 'Phuket (HKT) → Bangkok (BKK) · Thai AirAsia FD3014',
  timeTr: 'Kalkış: 07.12.2026 14:00 · Varış: 07.12.2026 15:25',
  timeEn: 'Dep: 07.12.2026 14:00 · Arr: 07.12.2026 15:25'
};
const FLIGHT_TML_TRANSFER = {
  titleTr: 'Bangkok ↔ Pattaya transferi', titleEn: 'Bangkok ↔ Pattaya transfer',
  route: 'Bangkok ↔ Pattaya · özel araç (karayolu)',
  timeTr: '11 Aralık gidiş · 14 Aralık dönüş · ~1.5-2 saat',
  timeEn: '11 Dec out · 14 Dec back · ~1.5-2 hours'
};
  /* Ercan (ECN) — Turkish Airlines via Istanbul */
const FLIGHT_ECN_OUTBOUND = [
  { titleTr: 'Gidiş uçuşu 1', titleEn: 'Outbound flight 1',
    route: 'Ercan (ECN) → İstanbul (IST) · Turkish Airlines',
    timeTr: 'Kalkış: 02.12.2026 21:20 · Varış: 03.12.2026 00:15 (+1 gün)',
    timeEn: 'Dep: 02.12.2026 21:20 · Arr: 03.12.2026 00:15 (+1 day)' },
  { titleTr: 'İstanbul aktarma', titleEn: 'Istanbul layover',
    route: 'İstanbul (IST) — aktarma',
    timeTr: 'Bekleme: ~1s 45dk',
    timeEn: 'Wait: ~1h 45m' },
  { titleTr: 'Gidiş uçuşu 2', titleEn: 'Outbound flight 2',
    route: 'İstanbul (IST) → Phuket (HKT) · Turkish Airlines',
    timeTr: 'Kalkış: 03.12.2026 02:00 · Varış: 03.12.2026 15:50',
    timeEn: 'Dep: 03.12.2026 02:00 · Arr: 03.12.2026 15:50' }
];
const FLIGHT_ECN_RETURN = [
  { titleTr: 'Dönüş uçuşu 1', titleEn: 'Return flight 1',
    route: 'Bangkok (BKK) → İstanbul (IST) · Turkish Airlines',
    timeTr: 'Kalkış: 11.12.2026 10:20 · Varış: 11.12.2026 16:45',
    timeEn: 'Dep: 11.12.2026 10:20 · Arr: 11.12.2026 16:45' },
  { titleTr: 'İstanbul aktarma', titleEn: 'Istanbul layover',
    route: 'İstanbul (IST) — aktarma',
    timeTr: 'Bekleme: ~2s 05dk',
    timeEn: 'Wait: ~2h 05m' },
  { titleTr: 'Dönüş uçuşu 2', titleEn: 'Return flight 2',
    route: 'İstanbul (IST) → Ercan (ECN) · Pegasus',
    timeTr: 'Kalkış: 11.12.2026 18:50 · Varış: 11.12.2026 19:20',
    timeEn: 'Dep: 11.12.2026 18:50 · Arr: 11.12.2026 19:20' }
];
const FLIGHT_ECN_RETURN_TML = [
  { titleTr: 'Dönüş uçuşu 1', titleEn: 'Return flight 1',
    route: 'Bangkok (BKK) → İstanbul (IST) · Turkish Airlines TK8548',
    timeTr: 'Kalkış: 14.12.2026 23:45 · Varış: 15.12.2026 06:05 (+1 gün)',
    timeEn: 'Dep: 14.12.2026 23:45 · Arr: 15.12.2026 06:05 (+1 day)' },
  { titleTr: 'İstanbul aktarma', titleEn: 'Istanbul layover',
    route: 'İstanbul (IST) — aktarma',
    timeTr: 'Bekleme: ~1s 40dk',
    timeEn: 'Wait: ~1h 40m' },
  { titleTr: 'Dönüş uçuşu 2', titleEn: 'Return flight 2',
    route: 'İstanbul (IST) → Ercan (ECN) · Turkish Airlines',
    timeTr: 'Kalkış: 14.12.2026 07:45 · Varış: 14.12.2026 08:20',
    timeEn: 'Dep: 14.12.2026 07:45 · Arr: 14.12.2026 08:20' }
];
const FLIGHT_ECN_OUTBOUND_BACKPACK = [
  { titleTr: 'Gidiş uçuşu 1', titleEn: 'Outbound flight 1',
    route: 'Ercan (ECN) → İstanbul (SAW) · AJet',
    timeTr: 'Kalkış: 02.12.2026 11:30 · Varış: 02.12.2026 14:10',
    timeEn: 'Dep: 02.12.2026 11:30 · Arr: 02.12.2026 14:10' },
  { titleTr: 'İstanbul aktarma', titleEn: 'Istanbul layover',
    route: 'Sabiha Gökçen (SAW) — bekleme ~3s 10dk',
    timeTr: 'Aktarma',
    timeEn: 'Layover' },
  { titleTr: 'Gidiş uçuşu 2', titleEn: 'Outbound flight 2',
    route: 'İstanbul (SAW) → Kuala Lumpur (KUL) · AirAsia X',
    timeTr: 'Kalkış: 02.12.2026 17:20 · Varış: 03.12.2026 08:40 (+1 gün)',
    timeEn: 'Dep: 02.12.2026 17:20 · Arr: 03.12.2026 08:40 (+1 day)' },
  { titleTr: 'Kuala Lumpur aktarma', titleEn: 'Kuala Lumpur layover',
    route: 'Kuala Lumpur (KUL) — bekleme ~1s 40dk',
    timeTr: 'Aktarma',
    timeEn: 'Layover' },
  { titleTr: 'Gidiş uçuşu 3', titleEn: 'Outbound flight 3',
    route: 'Kuala Lumpur (KUL) → Phuket (HKT) · AirAsia',
    timeTr: 'Kalkış: 03.12.2026 10:20 · Varış: 03.12.2026 10:50',
    timeEn: 'Dep: 03.12.2026 10:20 · Arr: 03.12.2026 10:50' }
];
const FLIGHT_ECN_RETURN_BACKPACK = [
  { titleTr: 'Dönüş uçuşu 1', titleEn: 'Return flight 1',
    route: 'Bangkok (BKK) → İstanbul (IST) · Turkish Airlines',
    timeTr: 'Kalkış: 11.12.2026 10:20 · Varış: 11.12.2026 16:45',
    timeEn: 'Dep: 11.12.2026 10:20 · Arr: 11.12.2026 16:45' },
  { titleTr: 'İstanbul aktarma', titleEn: 'Istanbul layover',
    route: 'İstanbul (IST) — bekleme ~2s 05dk',
    timeTr: 'Aktarma',
    timeEn: 'Layover' },
  { titleTr: 'Dönüş uçuşu 2', titleEn: 'Return flight 2',
    route: 'İstanbul (IST) → Ercan (ECN) · Pegasus',
    timeTr: 'Kalkış: 11.12.2026 18:50 · Varış: 11.12.2026 19:20',
    timeEn: 'Dep: 11.12.2026 18:50 · Arr: 11.12.2026 19:20' }
];
  /* Larnaca (LCA) — Comfort outbound Emirates via Dubai; shared Air Arabia for Tomorrowland */
const FLIGHT_LCA_OUTBOUND_COMFORT = [
  { titleTr: 'Gidiş uçuşu 1', titleEn: 'Outbound flight 1',
    route: 'Larnaca (LCA) → Dubai (DXB) · Emirates',
    timeTr: 'Kalkış: 02.12.2026 19:40 · Varış: 03.12.2026 00:55 (+1 gün)',
    timeEn: 'Dep: 02.12.2026 19:40 · Arr: 03.12.2026 00:55 (+1 day)' },
  { titleTr: 'Dubai aktarma', titleEn: 'Dubai layover',
    route: 'Dubai (DXB) — bekleme ~2s 05dk',
    timeTr: 'Aktarma',
    timeEn: 'Layover' },
  { titleTr: 'Gidiş uçuşu 2', titleEn: 'Outbound flight 2',
    route: 'Dubai (DXB) → Phuket (HKT) · Emirates',
    timeTr: 'Kalkış: 03.12.2026 03:00 · Varış: 03.12.2026 12:05',
    timeEn: 'Dep: 03.12.2026 03:00 · Arr: 03.12.2026 12:05' }
];
const FLIGHT_LCA_OUTBOUND = [
  { titleTr: 'Gidiş — bağlantı', titleEn: 'Outbound — connection',
    route: 'Larnaca (LCA) → Athens (ATH)',
    timeTr: 'Atina aktarması · ~1s 45dk bekleme',
    timeEn: 'Athens connection · ~1h 45m wait' },
  { titleTr: 'Gidiş uçuşu 1', titleEn: 'Outbound flight 1',
    route: 'Athens (ATH) → Sharjah (SHJ) · Air Arabia',
    timeTr: 'Kalkış: 02.12.2026 13:45 · Varış: 02.12.2026 20:15',
    timeEn: 'Dep: 02.12.2026 13:45 · Arr: 02.12.2026 20:15' },
  { titleTr: 'Sharjah aktarma', titleEn: 'Sharjah layover',
    route: 'Sharjah (SHJ) — bekleme ~4s 40dk',
    timeTr: 'Aktarma',
    timeEn: 'Layover' },
  { titleTr: 'Gidiş uçuşu 2', titleEn: 'Outbound flight 2',
    route: 'Sharjah (SHJ) → Phuket (HKT) · Air Arabia',
    timeTr: 'Kalkış: 03.12.2026 00:55 · Varış: 03.12.2026 10:10',
    timeEn: 'Dep: 03.12.2026 00:55 · Arr: 03.12.2026 10:10' }
];
const FLIGHT_LCA_BACKPACK_OUTBOUND = [
  { titleTr: 'Gidiş uçuşu 1', titleEn: 'Outbound flight 1',
    route: 'Larnaca (LCA) → Atina (ATH) · Wizz Air',
    timeTr: 'Kalkış: 02.12.2026 06:40 · Varış: 02.12.2026 08:40',
    timeEn: 'Dep: 02.12.2026 06:40 · Arr: 02.12.2026 08:40' },
  { titleTr: 'Atina aktarma', titleEn: 'Athens layover',
    route: 'Atina (ATH) — bekleme ~5s 05dk',
    timeTr: 'Aktarma',
    timeEn: 'Layover' },
  { titleTr: 'Gidiş uçuşu 2', titleEn: 'Outbound flight 2',
    route: 'Atina (ATH) → Sharjah (SHJ) · Air Arabia',
    timeTr: 'Kalkış: 02.12.2026 13:45 · Varış: 02.12.2026 20:15',
    timeEn: 'Dep: 02.12.2026 13:45 · Arr: 02.12.2026 20:15' },
  { titleTr: 'Dubai aktarma', titleEn: 'Dubai layover',
    route: 'Sharjah (SHJ) — bekleme ~4s 40dk',
    timeTr: 'Aktarma',
    timeEn: 'Layover' },
  { titleTr: 'Gidiş uçuşu 3', titleEn: 'Outbound flight 3',
    route: 'Sharjah (SHJ) → Phuket (HKT) · Air Arabia',
    timeTr: 'Kalkış: 03.12.2026 00:55 · Varış: 03.12.2026 10:10',
    timeEn: 'Dep: 03.12.2026 00:55 · Arr: 03.12.2026 10:10' }
];
const FLIGHT_LCA_RETURN_BACKPACK = [
  { titleTr: 'Dönüş uçuşu 1', titleEn: 'Return flight 1',
    route: 'Bangkok (BKK) → Doha (DOH) · Qatar Airways',
    timeTr: 'Kalkış: 11.12.2026 20:30 · Varış: 11.12.2026 23:55',
    timeEn: 'Dep: 11.12.2026 20:30 · Arr: 11.12.2026 23:55' },
  { titleTr: 'Doha aktarma', titleEn: 'Doha layover',
    route: 'Doha (DOH) — bekleme ~8s 30dk',
    timeTr: 'Aktarma',
    timeEn: 'Layover' },
  { titleTr: 'Dönüş uçuşu 2', titleEn: 'Return flight 2',
    route: 'Doha (DOH) → Larnaca (LCA) · Qatar Airways',
    timeTr: 'Kalkış: 12.12.2026 08:25 · Varış: 12.12.2026 11:00',
    timeEn: 'Dep: 12.12.2026 08:25 · Arr: 12.12.2026 11:00' }
];
const FLIGHT_LCA_RETURN_COMFORT = [
  { titleTr: 'Dönüş uçuşu 1', titleEn: 'Return flight 1',
    route: 'Bangkok (BKK) → Doha (DOH) · Qatar Airways',
    timeTr: 'Kalkış: 11.12.2026 03:00 · Varış: 11.12.2026 06:25',
    timeEn: 'Dep: 11.12.2026 03:00 · Arr: 11.12.2026 06:25' },
  { titleTr: 'Doha aktarma', titleEn: 'Doha layover',
    route: 'Doha (DOH) — bekleme ~2s',
    timeTr: 'Aktarma',
    timeEn: 'Layover' },
  { titleTr: 'Dönüş uçuşu 2', titleEn: 'Return flight 2',
    route: 'Doha (DOH) → Larnaca (LCA) · Qatar Airways',
    timeTr: 'Kalkış: 11.12.2026 08:25 · Varış: 11.12.2026 11:00',
    timeEn: 'Dep: 11.12.2026 08:25 · Arr: 11.12.2026 11:00' }
];
const FLIGHT_LCA_RETURN_COMFORT_TML = [
  { titleTr: 'Dönüş uçuşu 1', titleEn: 'Return flight 1',
    route: 'Bangkok (BKK) → Doha (DOH) · Qatar Airways',
    timeTr: 'Kalkış: 14.12.2026 03:00 · Varış: 14.12.2026 06:25',
    timeEn: 'Dep: 14.12.2026 03:00 · Arr: 14.12.2026 06:25' },
  { titleTr: 'Doha aktarma', titleEn: 'Doha layover',
    route: 'Doha (DOH) — bekleme ~2s',
    timeTr: 'Aktarma',
    timeEn: 'Layover' },
  { titleTr: 'Dönüş uçuşu 2', titleEn: 'Return flight 2',
    route: 'Doha (DOH) → Larnaca (LCA) · Qatar Airways',
    timeTr: 'Kalkış: 14.12.2026 08:25 · Varış: 14.12.2026 11:00',
    timeEn: 'Dep: 14.12.2026 08:25 · Arr: 14.12.2026 11:00' }
];
  /* Helsinki (HEL) — Finnair direct outbound; return via IST or hidden-city */
const FLIGHT_HEL_OUTBOUND = [
  { titleTr: 'Gidiş uçuşu', titleEn: 'Outbound flight',
    route: 'Helsinki (HEL) → Phuket (HKT) · Finnair',
    timeTr: 'Kalkış: 02.12.2026 16:35 · Varış: 03.12.2026 09:00 (+1 gün)',
    timeEn: 'Dep: 02.12.2026 16:35 · Arr: 03.12.2026 09:00 (+1 day)' },
  { titleTr: 'Uçuş bilgisi', titleEn: 'Flight info',
    route: 'Direkt · ~11s 25dk',
    timeTr: 'Finnair · direkt',
    timeEn: 'Finnair · non-stop' }
];
const FLIGHT_HEL_RETURN = [
  { titleTr: 'Dönüş uçuşu', titleEn: 'Return flight',
    route: 'Bangkok (BKK) → Helsinki (HEL) · Finnair',
    timeTr: 'Kalkış: 11.12.2026 11:15 · Varış: 11.12.2026 18:50',
    timeEn: 'Dep: 11.12.2026 11:15 · Arr: 11.12.2026 18:50' },
  { titleTr: 'Uçuş bilgisi', titleEn: 'Flight info',
    route: 'Direkt · ~12s 35dk',
    timeTr: 'Finnair · direkt',
    timeEn: 'Finnair · non-stop' }
];
const FLIGHT_HEL_RETURN_TML = [
  { titleTr: 'Dönüş uçuşu', titleEn: 'Return flight',
    route: 'Bangkok (BKK) → Helsinki (HEL) · Finnair',
    timeTr: 'Kalkış: 14.12.2026 11:15 · Varış: 14.12.2026 18:50',
    timeEn: 'Dep: 14.12.2026 11:15 · Arr: 14.12.2026 18:50' },
  { titleTr: 'Uçuş bilgisi', titleEn: 'Flight info',
    route: 'Direkt · ~12s 35dk',
    timeTr: 'Finnair · direkt',
    timeEn: 'Finnair · non-stop' }
];
const FLIGHT_HEL_BACKPACK_OUTBOUND = [
  { titleTr: 'Gidiş uçuşu 1', titleEn: 'Outbound flight 1',
    route: 'Helsinki (HEL) → İstanbul (IST) · Turkish Airlines',
    timeTr: 'Kalkış: 02.12.2026 12:30 · Varış: 02.12.2026 17:15',
    timeEn: 'Dep: 02.12.2026 12:30 · Arr: 02.12.2026 17:15' },
  { titleTr: 'İstanbul aktarma', titleEn: 'Istanbul layover',
    route: 'İstanbul (IST) — bekleme ~8s 45dk',
    timeTr: 'Aktarma',
    timeEn: 'Layover' },
  { titleTr: 'Gidiş uçuşu 2', titleEn: 'Outbound flight 2',
    route: 'İstanbul (IST) → Phuket (HKT) · Turkish Airlines',
    timeTr: 'Kalkış: 03.12.2026 02:00 · Varış: 03.12.2026 15:50',
    timeEn: 'Dep: 03.12.2026 02:00 · Arr: 03.12.2026 15:50' }
];
const FLIGHT_HEL_BACKPACK_RETURN = [
  { titleTr: 'Dönüş uçuşu 1', titleEn: 'Return flight 1',
    route: 'Bangkok (BKK) → Stockholm (ARN) · Norse Atlantic Airways',
    timeTr: 'Kalkış: 11.12.2026 06:00 · Varış: 11.12.2026 12:55',
    timeEn: 'Dep: 11.12.2026 06:00 · Arr: 11.12.2026 12:55' },
  { titleTr: 'Stockholm aktarma', titleEn: 'Stockholm layover',
    route: 'Stockholm Arlanda (ARN) — bekleme ~4s 25dk',
    timeTr: 'Aktarma',
    timeEn: 'Layover' },
  { titleTr: 'Dönüş uçuşu 2', titleEn: 'Return flight 2',
    route: 'Stockholm (ARN) → Helsinki (HEL) · Norwegian Air Sweden',
    timeTr: 'Kalkış: 11.12.2026 17:20 · Varış: 11.12.2026 19:20',
    timeEn: 'Dep: 11.12.2026 17:20 · Arr: 11.12.2026 19:20' }
];
  /* London — Comfort (LGW out · LHR back) */
const FLIGHT_LON_COMFORT_OUTBOUND = [
  { titleTr: 'Gidiş uçuşu 1', titleEn: 'Outbound flight 1',
    route: 'Londra Gatwick (LGW) → Doha (DOH) · Qatar Airways',
    timeTr: 'Kalkış: 02.12.2026 08:40 · Varış: 02.12.2026 18:15',
    timeEn: 'Dep: 02.12.2026 08:40 · Arr: 02.12.2026 18:15' },
  { titleTr: 'Doha aktarma', titleEn: 'Doha layover',
    route: 'Doha (DOH) — bekleme ~2s 05dk',
    timeTr: 'Aktarma',
    timeEn: 'Layover' },
  { titleTr: 'Gidiş uçuşu 2', titleEn: 'Outbound flight 2',
    route: 'Doha (DOH) → Phuket (HKT) · Qatar Airways',
    timeTr: 'Kalkış: 02.12.2026 20:20 · Varış: 03.12.2026 06:50 (+1 gün)',
    timeEn: 'Dep: 02.12.2026 20:20 · Arr: 03.12.2026 06:50 (+1 day)' }
];
const FLIGHT_LON_COMFORT_RETURN = [
  { titleTr: 'Dönüş uçuşu', titleEn: 'Return flight',
    route: 'Bangkok (BKK) → Londra (LHR) · EVA Air',
    timeTr: 'Kalkış: 11.12.2026 12:40 · Varış: 11.12.2026 19:05',
    timeEn: 'Dep: 11.12.2026 12:40 · Arr: 11.12.2026 19:05' },
  { titleTr: 'Uçuş bilgisi', titleEn: 'Flight info',
    route: 'Direkt · ~13s 25dk',
    timeTr: 'EVA Air · direkt',
    timeEn: 'EVA Air · non-stop' }
];
  /* London (LHR) — Backpacking */
const FLIGHT_LON_BACKPACK_OUTBOUND = [
  { titleTr: 'Gidiş uçuşu 1', titleEn: 'Outbound flight 1',
    route: 'Londra (LHR) → Doha (DOH) · Qatar Airways',
    timeTr: 'Kalkış: 02.12.2026 08:40 · Varış: 02.12.2026 18:20',
    timeEn: 'Dep: 02.12.2026 08:40 · Arr: 02.12.2026 18:20' },
  { titleTr: 'Doha aktarma', titleEn: 'Doha layover',
    route: 'Doha (DOH) — bekleme ~2 saat',
    timeTr: 'Aktarma',
    timeEn: 'Layover' },
  { titleTr: 'Gidiş uçuşu 2', titleEn: 'Outbound flight 2',
    route: 'Doha (DOH) → Phuket (HKT) · Qatar Airways',
    timeTr: 'Kalkış: 02.12.2026 20:20 · Varış: 03.12.2026 06:50',
    timeEn: 'Dep: 02.12.2026 20:20 · Arr: 03.12.2026 06:50' }
];
const FLIGHT_LON_BACKPACK_RETURN = [
  { titleTr: 'Dönüş uçuşu 1', titleEn: 'Return flight 1',
    route: 'Bangkok (BKK) → Kuveyt (KWI) · Kuwait Airways',
    timeTr: 'Kalkış: 11.12.2026 03:00 · Varış: 11.12.2026 06:35',
    timeEn: 'Dep: 11.12.2026 03:00 · Arr: 11.12.2026 06:35' },
  { titleTr: 'Kuveyt aktarma', titleEn: 'Kuwait layover',
    route: 'Kuveyt (KWI) — bekleme ~3s 25dk',
    timeTr: 'Aktarma',
    timeEn: 'Layover' },
  { titleTr: 'Dönüş uçuşu 2', titleEn: 'Return flight 2',
    route: 'Kuveyt (KWI) → Londra (LHR) · Kuwait Airways',
    timeTr: 'Kalkış: 11.12.2026 10:00 · Varış: 11.12.2026 13:45',
    timeEn: 'Dep: 11.12.2026 10:00 · Arr: 11.12.2026 13:45' }
];
  /* Berlin (BER) — Backpacking */
  /* Berlin (BER) — Comfort */
const FLIGHT_BER_COMFORT_OUTBOUND = [
  { titleTr: 'Gidiş uçuşu 1', titleEn: 'Outbound flight 1',
    route: 'Berlin (BER) → İstanbul (IST) · Turkish Airlines',
    timeTr: 'Kalkış: 02.12.2026 14:30 · Varış: 02.12.2026 19:30',
    timeEn: 'Dep: 02.12.2026 14:30 · Arr: 02.12.2026 19:30' },
  { titleTr: 'İstanbul aktarma', titleEn: 'Istanbul layover',
    route: 'İstanbul (IST) — bekleme ~6s 30dk',
    timeTr: 'Aktarma',
    timeEn: 'Layover' },
  { titleTr: 'Gidiş uçuşu 2', titleEn: 'Outbound flight 2',
    route: 'İstanbul (IST) → Phuket (HKT) · Turkish Airlines',
    timeTr: 'Kalkış: 03.12.2026 02:00 · Varış: 03.12.2026 15:50',
    timeEn: 'Dep: 03.12.2026 02:00 · Arr: 03.12.2026 15:50' }
];
const FLIGHT_BER_COMFORT_RETURN = [
  { titleTr: 'Dönüş uçuşu 1', titleEn: 'Return flight 1',
    route: 'Bangkok (BKK) → Doha (DOH) · Qatar Airways',
    timeTr: 'Kalkış: 11.12.2026 09:05 · Varış: 11.12.2026 12:30',
    timeEn: 'Dep: 11.12.2026 09:05 · Arr: 11.12.2026 12:30' },
  { titleTr: 'Doha aktarma', titleEn: 'Doha layover',
    route: 'Doha (DOH) — bekleme ~3s 15dk',
    timeTr: 'Aktarma',
    timeEn: 'Layover' },
  { titleTr: 'Dönüş uçuşu 2', titleEn: 'Return flight 2',
    route: 'Doha (DOH) → Berlin (BER) · Qatar Airways',
    timeTr: 'Kalkış: 11.12.2026 15:45 · Varış: 11.12.2026 19:55',
    timeEn: 'Dep: 11.12.2026 15:45 · Arr: 11.12.2026 19:55' }
];
const FLIGHT_BER_BACKPACK_OUTBOUND = [
  { titleTr: 'Gidiş uçuşu 1', titleEn: 'Outbound flight 1',
    route: 'Berlin (BER) → Amsterdam (AMS) · KLM',
    timeTr: 'Kalkış: 02.12.2026 16:30 · Varış: 02.12.2026 17:55',
    timeEn: 'Dep: 02.12.2026 16:30 · Arr: 02.12.2026 17:55' },
  { titleTr: 'Amsterdam aktarma', titleEn: 'Amsterdam layover',
    route: 'Amsterdam (AMS) — bekleme ~2s 40dk',
    timeTr: 'Aktarma',
    timeEn: 'Layover' },
  { titleTr: 'Gidiş uçuşu 2', titleEn: 'Outbound flight 2',
    route: 'Amsterdam (AMS) → Delhi (DEL) · Air India',
    timeTr: 'Kalkış: 02.12.2026 20:35 · Varış: 03.12.2026 10:00',
    timeEn: 'Dep: 02.12.2026 20:35 · Arr: 03.12.2026 10:00' },
  { titleTr: 'Delhi aktarma', titleEn: 'Delhi layover',
    route: 'Delhi (DEL) — bekleme ~3s 20dk',
    timeTr: 'Aktarma',
    timeEn: 'Layover' },
  { titleTr: 'Gidiş uçuşu 3', titleEn: 'Outbound flight 3',
    route: 'Delhi (DEL) → Phuket (HKT) · Air India',
    timeTr: 'Kalkış: 03.12.2026 13:20 · Varış: 03.12.2026 19:30',
    timeEn: 'Dep: 03.12.2026 13:20 · Arr: 03.12.2026 19:30' }
];
const FLIGHT_BER_BACKPACK_RETURN = [
  { titleTr: 'Dönüş uçuşu 1', titleEn: 'Return flight 1',
    route: 'Bangkok (BKK) → Doha (DOH) · Qatar Airways',
    timeTr: 'Kalkış: 11.12.2026 20:30 · Varış: 11.12.2026 23:55',
    timeEn: 'Dep: 11.12.2026 20:30 · Arr: 11.12.2026 23:55' },
  { titleTr: 'Doha aktarma', titleEn: 'Doha layover',
    route: 'Doha (DOH) — bekleme ~2s 45dk',
    timeTr: 'Aktarma',
    timeEn: 'Layover' },
  { titleTr: 'Dönüş uçuşu 2', titleEn: 'Return flight 2',
    route: 'Doha (DOH) → Berlin (BER) · Qatar Airways',
    timeTr: 'Kalkış: 12.12.2026 02:40 · Varış: 12.12.2026 06:50',
    timeEn: 'Dep: 12.12.2026 02:40 · Arr: 12.12.2026 06:50' }
];
  /* Amsterdam (AMS) — Backpacking */
  /* Amsterdam (AMS) — Comfort */
const FLIGHT_AMS_COMFORT_OUTBOUND = [
  { titleTr: 'Gidiş uçuşu 1', titleEn: 'Outbound flight 1',
    route: 'Amsterdam (AMS) → Delhi (DEL) · Air India',
    timeTr: 'Kalkış: 02.12.2026 20:35 · Varış: 03.12.2026 10:00 (+1 gün)',
    timeEn: 'Dep: 02.12.2026 20:35 · Arr: 03.12.2026 10:00 (+1 day)' },
  { titleTr: 'Delhi aktarma', titleEn: 'Delhi layover',
    route: 'Delhi (DEL) — bekleme ~3s 20dk',
    timeTr: 'Aktarma',
    timeEn: 'Layover' },
  { titleTr: 'Gidiş uçuşu 2', titleEn: 'Outbound flight 2',
    route: 'Delhi (DEL) → Phuket (HKT) · Air India',
    timeTr: 'Kalkış: 03.12.2026 13:20 · Varış: 03.12.2026 19:30',
    timeEn: 'Dep: 03.12.2026 13:20 · Arr: 03.12.2026 19:30' }
];
const FLIGHT_AMS_COMFORT_RETURN = [
  { titleTr: 'Dönüş uçuşu', titleEn: 'Return flight',
    route: 'Bangkok (BKK) → Amsterdam (AMS) · Thai Airways',
    timeTr: 'Kalkış: 11.12.2026 05:00 · Varış: 11.12.2026 11:40',
    timeEn: 'Dep: 11.12.2026 05:00 · Arr: 11.12.2026 11:40' },
  { titleTr: 'Uçuş bilgisi', titleEn: 'Flight info',
    route: 'Direkt · ~12s 40dk',
    timeTr: 'Thai Airways · direkt',
    timeEn: 'Thai Airways · non-stop' }
];
const FLIGHT_AMS_BACKPACK_OUTBOUND = [
  { titleTr: 'Gidiş uçuşu 1', titleEn: 'Outbound flight 1',
    route: 'Amsterdam (AMS) → Delhi (DEL) · Air India',
    timeTr: 'Kalkış: 02.12.2026 20:35 · Varış: 03.12.2026 10:00',
    timeEn: 'Dep: 02.12.2026 20:35 · Arr: 03.12.2026 10:00' },
  { titleTr: 'Delhi aktarma', titleEn: 'Delhi layover',
    route: 'Delhi (DEL) — bekleme ~3s 20dk',
    timeTr: 'Aktarma',
    timeEn: 'Layover' },
  { titleTr: 'Gidiş uçuşu 2', titleEn: 'Outbound flight 2',
    route: 'Delhi (DEL) → Phuket (HKT) · Air India',
    timeTr: 'Kalkış: 03.12.2026 13:20 · Varış: 03.12.2026 19:30',
    timeEn: 'Dep: 03.12.2026 13:20 · Arr: 03.12.2026 19:30' }
];
const FLIGHT_AMS_BACKPACK_RETURN = [
  { titleTr: 'Dönüş uçuşu 1', titleEn: 'Return flight 1',
    route: 'Bangkok (BKK) → Kuveyt (KWI) · Kuwait Airways',
    timeTr: 'Kalkış: 11.12.2026 03:00 · Varış: 11.12.2026 06:35',
    timeEn: 'Dep: 11.12.2026 03:00 · Arr: 11.12.2026 06:35' },
  { titleTr: 'Kuveyt aktarma', titleEn: 'Kuwait layover',
    route: 'Kuveyt (KWI) — bekleme ~1s 55dk',
    timeTr: 'Aktarma',
    timeEn: 'Layover' },
  { titleTr: 'Dönüş uçuşu 2', titleEn: 'Return flight 2',
    route: 'Kuveyt (KWI) → Amsterdam (AMS) · Kuwait Airways',
    timeTr: 'Kalkış: 11.12.2026 08:30 · Varış: 11.12.2026 12:55',
    timeEn: 'Dep: 11.12.2026 08:30 · Arr: 11.12.2026 12:55' }
];
  /* Tomorrowland — return flights (14 Dec, after festival); outbound = Comfort per port */
const FLIGHT_IST_RETURN_TML = [
  { titleTr: 'Dönüş uçuşu', titleEn: 'Return flight',
    route: 'Bangkok (BKK) → İstanbul (IST) · Turkish Airlines TK8548',
    timeTr: 'Kalkış: 14.12.2026 23:45 · Varış: 15.12.2026 06:05 (+1 gün)',
    timeEn: 'Dep: 14.12.2026 23:45 · Arr: 15.12.2026 06:05 (+1 day)' },
  { titleTr: 'Uçuş bilgisi', titleEn: 'Flight info',
    route: 'Direkt · ~10s 20dk',
    timeTr: 'Turkish Airlines · direkt',
    timeEn: 'Turkish Airlines · non-stop' }
];
const FLIGHT_LON_RETURN_TML = [
  { titleTr: 'Dönüş uçuşu', titleEn: 'Return flight',
    route: 'Bangkok (BKK) → Londra Gatwick (LGW) · Norse Atlantic UK',
    timeTr: 'Kalkış: 14.12.2026 12:45 · Varış: 14.12.2026 18:45',
    timeEn: 'Dep: 14.12.2026 12:45 · Arr: 14.12.2026 18:45' },
  { titleTr: 'Uçuş bilgisi', titleEn: 'Flight info',
    route: 'Direkt · ~13 saat',
    timeTr: 'Norse Atlantic UK · direkt',
    timeEn: 'Norse Atlantic UK · non-stop' }
];
const FLIGHT_BER_RETURN_TML = [
  { titleTr: 'Dönüş uçuşu 1', titleEn: 'Return flight 1',
    route: 'Bangkok (BKK) → Doha (DOH) · Qatar Airways',
    timeTr: 'Kalkış: 14.12.2026 20:30 · Varış: 14.12.2026 23:55',
    timeEn: 'Dep: 14.12.2026 20:30 · Arr: 14.12.2026 23:55' },
  { titleTr: 'Doha aktarma', titleEn: 'Doha layover',
    route: 'Doha (DOH) — bekleme ~2s 45dk',
    timeTr: 'Aktarma',
    timeEn: 'Layover' },
  { titleTr: 'Dönüş uçuşu 2', titleEn: 'Return flight 2',
    route: 'Doha (DOH) → Berlin (BER) · Qatar Airways',
    timeTr: 'Kalkış: 15.12.2026 02:40 · Varış: 15.12.2026 06:50',
    timeEn: 'Dep: 15.12.2026 02:40 · Arr: 15.12.2026 06:50' }
];
const FLIGHT_AMS_RETURN_TML = [
  { titleTr: 'Dönüş uçuşu', titleEn: 'Return flight',
    route: 'Bangkok (BKK) → Amsterdam (AMS) · Thai Airways',
    timeTr: 'Kalkış: 14.12.2026 05:00 · Varış: 14.12.2026 11:40',
    timeEn: 'Dep: 14.12.2026 05:00 · Arr: 14.12.2026 11:40' },
  { titleTr: 'Uçuş bilgisi', titleEn: 'Flight info',
    route: 'Direkt · ~12s 40dk',
    timeTr: 'Thai Airways · direkt',
    timeEn: 'Thai Airways · non-stop' }
];
const TML_RETURN_BY_PORT = {
  istanbul: FLIGHT_IST_RETURN_TML,
  ercan: FLIGHT_ECN_RETURN_TML,
  larnaca: FLIGHT_LCA_RETURN_COMFORT_TML,
  helsinki: FLIGHT_HEL_RETURN_TML,
  london: FLIGHT_LON_RETURN_TML,
  berlin: FLIGHT_BER_RETURN_TML,
  amsterdam: FLIGHT_AMS_RETURN_TML
};
function comfortOutboundThroughDomestic(port) {
  const comfort = FLIGHTS_BY_TOUR.phuket[port] || FLIGHTS_BY_TOUR.phuket.istanbul;
  for (let i = 0; i < comfort.length; i++) {
    const f = comfort[i];
    if (/Dönüş/i.test(f.titleTr || "") || /Return/i.test(f.titleEn || "")) {
      return comfort.slice(0, i);
    }
  }
  return comfort.slice();
}
function buildTmlFlightsForPort(port) {
  const p = normalizeDeparturePort(port);
  return comfortOutboundThroughDomestic(p).concat(
    [FLIGHT_TML_TRANSFER],
    TML_RETURN_BY_PORT[p] || TML_RETURN_BY_PORT.istanbul
  );
}
const FLIGHTS_BY_TOUR = {
  phuket: {
    istanbul: [
      { titleTr: 'Gidiş uçuşu', titleEn: 'Outbound flight',
        route: 'İstanbul (IST) → Phuket (HKT) · Turkish Airlines',
        timeTr: 'Kalkış: 02.12.2026 02:00 · Varış: 02.12.2026 15:50',
        timeEn: 'Dep: 02.12.2026 02:00 · Arr: 02.12.2026 15:50' },
      FLIGHT_DOMESTIC_COMFORT,
      { titleTr: 'Dönüş uçuşu', titleEn: 'Return flight',
        route: 'Bangkok (BKK) → İstanbul (IST) · Turkish Airlines TK8548',
        timeTr: 'Kalkış: 11.12.2026 23:45 · Varış: 12.12.2026 06:05',
        timeEn: 'Dep: 11.12.2026 23:45 · Arr: 12.12.2026 06:05' }
    ],
    ercan: FLIGHT_ECN_OUTBOUND.concat([FLIGHT_DOMESTIC_COMFORT], FLIGHT_ECN_RETURN),
    larnaca: FLIGHT_LCA_OUTBOUND_COMFORT.concat([FLIGHT_DOMESTIC_COMFORT], FLIGHT_LCA_RETURN_COMFORT),
    helsinki: FLIGHT_HEL_OUTBOUND.concat([FLIGHT_DOMESTIC_COMFORT], FLIGHT_HEL_RETURN),
    london: FLIGHT_LON_COMFORT_OUTBOUND.concat([FLIGHT_DOMESTIC_COMFORT], FLIGHT_LON_COMFORT_RETURN),
    berlin: FLIGHT_BER_COMFORT_OUTBOUND.concat([FLIGHT_DOMESTIC_COMFORT], FLIGHT_BER_COMFORT_RETURN),
    amsterdam: FLIGHT_AMS_COMFORT_OUTBOUND.concat([FLIGHT_DOMESTIC_COMFORT], FLIGHT_AMS_COMFORT_RETURN)
  },
  backpacking: {
    istanbul: [
      { titleTr: 'Gidiş uçuşu 1', titleEn: 'Outbound flight 1',
        route: 'İstanbul (IST) → Sharjah (SHJ) · Air Arabia',
        timeTr: 'Kalkış: 02.12.2026 14:35 · Varış: 02.12.2026 19:55',
        timeEn: 'Dep: 02.12.2026 14:35 · Arr: 02.12.2026 19:55' },
      { titleTr: 'Dubai aktarma', titleEn: 'Dubai layover',
        route: 'Sharjah (SHJ) — bekleme ~5 saat',
        timeTr: 'Aktarma',
        timeEn: 'Layover' },
      { titleTr: 'Gidiş uçuşu 2', titleEn: 'Outbound flight 2',
        route: 'Sharjah (SHJ) → Phuket (HKT) · Air Arabia',
        timeTr: 'Kalkış: 03.12.2026 00:55 · Varış: 03.12.2026 10:10',
        timeEn: 'Dep: 03.12.2026 00:55 · Arr: 03.12.2026 10:10' },
      FLIGHT_DOMESTIC,
      { titleTr: 'Dönüş uçuşu 1', titleEn: 'Return flight 1',
        route: 'Bangkok (BKK) → Doha (DOH) · Qatar Airways',
        timeTr: 'Kalkış: 11.12.2026 03:00 · Varış: 11.12.2026 06:25',
        timeEn: 'Dep: 11.12.2026 03:00 · Arr: 11.12.2026 06:25' },
      { titleTr: 'Doha aktarma', titleEn: 'Doha layover',
        route: 'Doha (DOH) — bekleme ~1s 05dk',
        timeTr: 'Aktarma',
        timeEn: 'Layover' },
      { titleTr: 'Dönüş uçuşu 2', titleEn: 'Return flight 2',
        route: 'Doha (DOH) → İstanbul (SAW) · Qatar Airways',
        timeTr: 'Kalkış: 11.12.2026 07:30 · Varış: 11.12.2026 12:10',
        timeEn: 'Dep: 11.12.2026 07:30 · Arr: 11.12.2026 12:10' }
    ],
    ercan: FLIGHT_ECN_OUTBOUND_BACKPACK.concat([FLIGHT_DOMESTIC], FLIGHT_ECN_RETURN_BACKPACK),
    larnaca: FLIGHT_LCA_BACKPACK_OUTBOUND.concat([FLIGHT_DOMESTIC], FLIGHT_LCA_RETURN_BACKPACK),
    helsinki: FLIGHT_HEL_BACKPACK_OUTBOUND.concat([FLIGHT_DOMESTIC], FLIGHT_HEL_BACKPACK_RETURN),
    london: FLIGHT_LON_BACKPACK_OUTBOUND.concat([FLIGHT_DOMESTIC], FLIGHT_LON_BACKPACK_RETURN),
    berlin: FLIGHT_BER_BACKPACK_OUTBOUND.concat([FLIGHT_DOMESTIC], FLIGHT_BER_BACKPACK_RETURN),
    amsterdam: FLIGHT_AMS_BACKPACK_OUTBOUND.concat([FLIGHT_DOMESTIC], FLIGHT_AMS_BACKPACK_RETURN)
  },
  /* tomorrowland: built via buildTmlFlightsForPort() — Comfort outbound + 14 Dec return */
};

/* ─── TOUR METADATA — hero/sidebar dynamic content ─────────────────── */
const TOURS = {
  backpacking: {
    badge:    { tr: 'Backpacking style', en: 'Backpacking style' },
    title:    { tr: 'Phuket & Bangkok · Backpacking Style',
                en: 'Phuket & Bangkok · Backpacking Style' },
    heroImg:  'backpacking-card.webp',
    heroAlt:  { tr: 'Backpacking style seyahat', en: 'Backpacking style travel' },
    routesByPort: {
      istanbul: { tr: 'İstanbul → Phuket, Bangkok', en: 'Istanbul → Phuket, Bangkok' },
      ercan:    { tr: 'Ercan → Phuket, Bangkok', en: 'Ercan → Phuket, Bangkok' },
      larnaca:  { tr: 'Larnaca → Phuket, Bangkok', en: 'Larnaca → Phuket, Bangkok' },
      helsinki: { tr: 'Helsinki → Phuket, Bangkok', en: 'Helsinki → Phuket, Bangkok' },
      london:   { tr: 'Londra → Phuket, Bangkok', en: 'London → Phuket, Bangkok' },
      berlin:   { tr: 'Berlin → Phuket, Bangkok', en: 'Berlin → Phuket, Bangkok' },
      amsterdam: { tr: 'Amsterdam → Phuket, Bangkok', en: 'Amsterdam → Phuket, Bangkok' }
    },
    duration: { tr: '7 gece 8 gün', en: '7 nights 8 days' },
    dates:    { tr: '02 Aralık 2026 – 11 Aralık 2026 · hostel konaklama',
                en: '02 December 2026 – 11 December 2026 · hostel stays' },
    breadcrumb: { tr: 'Phuket & Bangkok · Backpacking', en: 'Phuket & Bangkok · Backpacking' },
    dateOptions: { tr: ['02 – 11 Aralık 2026'], en: ['02 – 11 December 2026'] },
    pricesByPort: {
      istanbul: { eur: 1090 },
      amsterdam: { eur: 1090 },
      ercan:    { eur: 1390 },
      larnaca:  { eur: 1390 },
      helsinki: { eur: 1390 },
      london:   { eur: 1199 },
      berlin:   { eur: 1399 }
    },
    emailSubject: 'Phuket%20Backpacking%20Style%20Rezervasyonu'
  },
  phuket: {
    badge:    { tr: 'Comfort', en: 'Comfort' },
    title:    { tr: 'Phuket & Bangkok · Comfort',
                en: 'Phuket & Bangkok · Comfort' },
    heroImg:  'comfort-card.avif',
    heroAlt:  { tr: 'Phuket plajı ve tropikal deniz', en: 'Phuket beach and tropical sea' },
    routesByPort: {
      istanbul: { tr: 'İstanbul → Phuket, Bangkok', en: 'Istanbul → Phuket, Bangkok' },
      ercan:    { tr: 'Ercan → Phuket, Bangkok', en: 'Ercan → Phuket, Bangkok' },
      larnaca:  { tr: 'Larnaca → Phuket, Bangkok', en: 'Larnaca → Phuket, Bangkok' },
      helsinki: { tr: 'Helsinki → Phuket, Bangkok', en: 'Helsinki → Phuket, Bangkok' },
      london:   { tr: 'Londra → Phuket, Bangkok', en: 'London → Phuket, Bangkok' },
      berlin:   { tr: 'Berlin → Phuket, Bangkok', en: 'Berlin → Phuket, Bangkok' },
      amsterdam: { tr: 'Amsterdam → Phuket, Bangkok', en: 'Amsterdam → Phuket, Bangkok' }
    },
    duration: { tr: '9 gece 10 gün', en: '9 nights 10 days' },
    dates:    { tr: '02 Aralık 2026 – 11 Aralık 2026',
                en: '02 December 2026 – 11 December 2026' },
    breadcrumb: { tr: 'Phuket & Bangkok · Comfort', en: 'Phuket & Bangkok · Comfort' },
    dateOptions: { tr: ['02 – 11 Aralık 2026'], en: ['02 – 11 December 2026'] },
    pricesByPort: {
      istanbul: { eur: 1690 },
      ercan:    { eur: 1790 },
      larnaca:  { eur: 2090 },
      helsinki: { eur: 2190 },
      london:   { eur: 1690 },
      berlin:   { eur: 1790 },
      amsterdam: { eur: 1690 }
    },
    emailSubject: 'Phuket%20%26%20Bangkok%20Tur%20Rezervasyonu'
  },
  tomorrowland: {
    badge:    { tr: 'Luxury · Festival paketi', en: 'Luxury · Festival package' },
    title:    { tr: 'Phuket, Bangkok & Tomorrowland · Luxury',
                en: 'Phuket, Bangkok & Tomorrowland · Luxury' },
    heroImg:  'tomorrowland-card.jpg',
    heroAlt:  { tr: 'Tomorrowland festival', en: 'Tomorrowland festival' },
    routesByPort: {
      istanbul: { tr: 'İstanbul → Phuket, Bangkok → Tomorrowland', en: 'Istanbul → Phuket, Bangkok → Tomorrowland' },
      ercan:    { tr: 'Ercan → Phuket, Bangkok → Tomorrowland', en: 'Ercan → Phuket, Bangkok → Tomorrowland' },
      larnaca:  { tr: 'Larnaca → Phuket, Bangkok → Tomorrowland', en: 'Larnaca → Phuket, Bangkok → Tomorrowland' },
      helsinki: { tr: 'Helsinki → Phuket, Bangkok → Tomorrowland', en: 'Helsinki → Phuket, Bangkok → Tomorrowland' },
      london:   { tr: 'Londra → Phuket, Bangkok → Tomorrowland', en: 'London → Phuket, Bangkok → Tomorrowland' },
      berlin:   { tr: 'Berlin → Phuket, Bangkok → Tomorrowland', en: 'Berlin → Phuket, Bangkok → Tomorrowland' },
      amsterdam: { tr: 'Amsterdam → Phuket, Bangkok → Tomorrowland', en: 'Amsterdam → Phuket, Bangkok → Tomorrowland' }
    },
    duration: { tr: '10 gece 11 gün', en: '10 nights 11 days' },
    dates:    { tr: '02 Aralık 2026 – 14 Aralık 2026',
                en: '02 December 2026 – 14 December 2026' },
    breadcrumb: { tr: 'Phuket, Bangkok & Tomorrowland',
                  en: 'Phuket, Bangkok & Tomorrowland' },
    dateOptions: { tr: ['02 – 14 Aralık 2026'], en: ['02 – 14 December 2026'] },
    pricesByPort: {
      istanbul: { eur: 2590 },
      ercan:    { eur: 2690 },
      larnaca:  { eur: 2590 },
      helsinki: { eur: 2790 },
      london:   { eur: 2490 },
      berlin:   { eur: 2790 },
      amsterdam: { eur: 2690 }
    },
    emailSubject: 'Tomorrowland%20Thailand%20Paketi'
  }
};

function formatMoneyDots(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function formatEurDisplay(n) {
  return "€ " + formatMoneyDots(n);
}
const COUPLE_PRICE_OFFSET_EUR = 100;
function normalizePackageType(tourKey) {
  if (tourKey === "backpacking") return "backpacking";
  if (tourKey === "tomorrowland") return "tomorrowland";
  if (tourKey === "phuket") return "comfort";
  return "comfort";
}
function calculateSharedRoomPrice(packageType, soloPrice) {
  if (packageType === "backpacking") return soloPrice;
  if (
    packageType === "comfort" ||
    packageType === "luxury" ||
    packageType === "tomorrowland"
  ) {
    return soloPrice - COUPLE_PRICE_OFFSET_EUR;
  }
  return soloPrice;
}
function getSoloPriceEur(tourKey, port) {
  return getTourPriceFor(tourKey, port).eur;
}
function supportsCouplePricing(tourKey) {
  return tourKey !== "backpacking";
}
function getEffectivePricingMode(tourKey) {
  if (!supportsCouplePricing(tourKey)) return "solo";
  return currentPricingMode;
}
function getDisplayedPriceEur(tourKey, port) {
  const solo = getSoloPriceEur(tourKey, port);
  if (getEffectivePricingMode(tourKey) === "solo") return solo;
  return calculateSharedRoomPrice(normalizePackageType(tourKey), solo);
}
const DEPARTURE_PORT_LABELS = {
  istanbul: { tr: "İstanbul (SAW)", en: "Istanbul (SAW)" },
  ercan: { tr: "Ercan (ECN)", en: "Ercan (ECN)" },
  larnaca: { tr: "Larnaca (LCA)", en: "Larnaca (LCA)" },
  helsinki: { tr: "Helsinki (HEL)", en: "Helsinki (HEL)" },
  london: { tr: "Londra (LHR)", en: "London (LHR)" },
  berlin: { tr: "Berlin (BER)", en: "Berlin (BER)" },
  amsterdam: { tr: "Amsterdam (AMS)", en: "Amsterdam (AMS)" }
};
const PRICING_MODE_LABELS = {
  solo: { tr: "Tek kişi", en: "Single" },
  shared: { tr: "Çift kişi", en: "Couple" }
};
let currentPricingMode = "solo";
function normalizeDeparturePort(port) {
  if (port === "ercan" || port === "larnaca" || port === "helsinki" || port === "london" || port === "berlin" || port === "amsterdam") return port;
  return "istanbul";
}

function getFlightsForTourPort(tour, port) {
  const p = normalizeDeparturePort(port);
  if (tour === "tomorrowland") return buildTmlFlightsForPort(p);
  const byTour = FLIGHTS_BY_TOUR[tour] || FLIGHTS_BY_TOUR.phuket;
  return byTour[p] || byTour.istanbul;
}

function isFlightLayoverLeg(leg) {
  const tr = (leg.titleTr || "").toLowerCase();
  const en = (leg.titleEn || "").toLowerCase();
  return (
    tr.indexOf("aktarma") >= 0 ||
    en.indexOf("layover") >= 0 ||
    en.indexOf("connection") >= 0
  );
}

function isFlightDomesticLeg(leg) {
  const r = (leg.route || "").toLowerCase();
  return (
    /phuket.*bangkok|bangkok.*phuket|iç hat|domestic|pattaya/.test(r) ||
    /fd3014/.test(r)
  );
}

function isFlightInfoLeg(leg) {
  const tr = (leg.titleTr || "").toLowerCase();
  const en = (leg.titleEn || "").toLowerCase();
  return tr.indexOf("bilgisi") >= 0 || en.indexOf("info") >= 0;
}

function parseCityFromRoutePart(part) {
  const m = (part || "").trim().match(/([^(→]+?)\s*\(/);
  return m ? m[1].trim() : (part || "").trim();
}

function parseOriginCity(route) {
  return parseCityFromRoutePart((route || "").split("→")[0]);
}

function parseDestinationCity(route) {
  const right = (route || "").split("→")[1];
  return parseCityFromRoutePart(right || "");
}

function narrativeCityName(city, lang) {
  const c = (city || "").trim();
  if (/sabiha|istanbul/i.test(c)) return lang === "en" ? "Istanbul" : "İstanbul";
  if (/kuwait|kuveyt/i.test(c)) return lang === "en" ? "Kuwait" : "Kuveyt";
  if (/londra|london/i.test(c)) return lang === "en" ? "London" : "Londra";
  if (/berlin/i.test(c)) return "Berlin";
  if (/amsterdam/i.test(c)) return "Amsterdam";
  if (/helsinki/i.test(c)) return "Helsinki";
  if (/ercan/i.test(c)) return "Ercan";
  if (/larnaca/i.test(c)) return "Larnaca";
  if (/kuala/i.test(c)) return lang === "en" ? "Kuala Lumpur" : "Kuala Lumpur";
  if (/doha/i.test(c)) return lang === "en" ? "Doha" : "Doha";
  if (/dubai|sharjah/i.test(c)) return lang === "en" ? "Dubai" : "Dubai";
  if (/delhi/i.test(c)) return lang === "en" ? "Delhi" : "Delhi";
  if (/atina|athens/i.test(c)) return lang === "en" ? "Athens" : "Atina";
  return c;
}

function layoverCityFromLeg(leg, lang) {
  const route = leg.route || "";
  let city;
  if (route.indexOf("—") >= 0) city = parseCityFromRoutePart(route.split("—")[0]);
  else city = parseOriginCity(route);
  return narrativeCityName(city, lang);
}

function splitInternationalFlightLegs(flights) {
  const domesticIdx = flights.findIndex(isFlightDomesticLeg);
  const outboundEnd = domesticIdx >= 0 ? domesticIdx : flights.length;
  const outbound = flights.slice(0, outboundEnd);
  const afterDomestic =
    domesticIdx >= 0 ? flights.slice(domesticIdx + 1) : [];
  return { outbound: outbound, returnLegs: afterDomestic };
}

function outboundLayoverCities(outbound, lang) {
  return outbound
    .filter(isFlightLayoverLeg)
    .map(function (leg) {
      return layoverCityFromLeg(leg, lang);
    });
}

function returnLayoverCities(returnLegs, lang) {
  return returnLegs
    .filter(isFlightLayoverLeg)
    .map(function (leg) {
      return layoverCityFromLeg(leg, lang);
    });
}

function firstOutboundFlightLeg(outbound) {
  return outbound.find(function (leg) {
    return !isFlightLayoverLeg(leg) && !isFlightInfoLeg(leg);
  });
}

function lastReturnFlightLeg(returnLegs) {
  const flightLegs = returnLegs.filter(function (leg) {
    return !isFlightLayoverLeg(leg) && !isFlightInfoLeg(leg);
  });
  return flightLegs.length ? flightLegs[flightLegs.length - 1] : null;
}

function departureAirportLabel(firstLeg, lang) {
  const city = narrativeCityName(
    parseOriginCity(firstLeg ? firstLeg.route : ""),
    lang
  );
  if (lang === "en") return city ? city + " Airport" : "the airport";
  return city ? city + " Havalimanı" : "havalimanı";
}

function outboundConnectionsPhrase(layovers, lang) {
  if (!layovers.length) {
    return lang === "en" ? "On our direct flight," : "Direkt uçuşumuzla";
  }
  if (lang === "en") {
    if (layovers.length === 1) return "After our " + layovers[0] + " layover,";
    if (layovers.length === 2)
      return "After " + layovers[0] + " and " + layovers[1] + " layovers,";
    const last = layovers[layovers.length - 1];
    const rest = layovers.slice(0, -1).join(", ");
    return "After " + rest + " and " + last + " layovers,";
  }
  if (layovers.length === 1) return layovers[0] + " aktarmasının ardından";
  if (layovers.length === 2)
    return layovers[0] + " ve " + layovers[1] + " aktarmalarının ardından";
  const lastTr = layovers[layovers.length - 1];
  const restTr = layovers.slice(0, -1).join(", ");
  return restTr + " ve " + lastTr + " aktarmalarının ardından";
}

function returnTransitPhrase(layovers, lang) {
  if (!layovers.length) {
    return lang === "en" ? "direct return" : "direkt dönüş";
  }
  if (lang === "en") {
    if (layovers.length === 1) return layovers[0] + " layover";
    if (layovers.length === 2) return layovers[0] + " and " + layovers[1] + " layover";
    const last = layovers[layovers.length - 1];
    return layovers.slice(0, -1).join(", ") + " and " + last + " layover";
  }
  if (layovers.length === 1) return layovers[0] + " aktarmalı";
  if (layovers.length === 2) return layovers[0] + " ve " + layovers[1] + " aktarmalı";
  const lastTr = layovers[layovers.length - 1];
  return layovers.slice(0, -1).join(", ") + " ve " + lastTr + " aktarmalı";
}

function getFlightNarrativeTokens(tour, port, lang) {
  const flights = getFlightsForTourPort(tour, port);
  const split = splitInternationalFlightLegs(flights);
  const outFirst = firstOutboundFlightLeg(split.outbound);
  const retLast = lastReturnFlightLeg(split.returnLegs);
  const outLayovers = outboundLayoverCities(split.outbound, lang);
  const retLayovers = returnLayoverCities(split.returnLegs, lang);
  const arrivalCity = narrativeCityName(
    retLast
      ? parseDestinationCity(retLast.route)
      : parseOriginCity(outFirst ? outFirst.route : ""),
    lang
  );
  return {
    DEPARTURE_AIRPORT: departureAirportLabel(outFirst, lang),
    OUTBOUND_CONNECTIONS: outboundConnectionsPhrase(outLayovers, lang),
    RETURN_TRANSIT: returnTransitPhrase(retLayovers, lang),
    ARRIVAL_CITY: arrivalCity || (lang === "en" ? "home" : "varış noktamız")
  };
}

function resolveNarrativeFlightTokens(html, tour, port, lang) {
  if (!html || html.indexOf("{{") < 0) return html;
  const tokens = getFlightNarrativeTokens(tour, port, lang);
  return html
    .replace(/\{\{DEPARTURE_AIRPORT\}\}/g, tokens.DEPARTURE_AIRPORT)
    .replace(/\{\{OUTBOUND_CONNECTIONS\}\}/g, tokens.OUTBOUND_CONNECTIONS)
    .replace(/\{\{RETURN_TRANSIT\}\}/g, tokens.RETURN_TRANSIT)
    .replace(/\{\{ARRIVAL_CITY\}\}/g, tokens.ARRIVAL_CITY);
}

function applyNarrativeFlightTokens(days, tour, port, lang) {
  return days.map(function (d) {
    if (!d.dayNarrative) return d;
    return Object.assign({}, d, {
      dayNarrative: resolveNarrativeFlightTokens(
        d.dayNarrative,
        tour,
        port,
        lang
      )
    });
  });
}

function getTourPriceFor(tourKey, port) {
  const t = TOURS[tourKey] || TOURS.phuket;
  const p = normalizeDeparturePort(port);
  return (t.pricesByPort && t.pricesByPort[p]) || t.pricesByPort.istanbul;
}
function getMinTourPriceEur(tourKey) {
  const t = TOURS[tourKey];
  if (!t || !t.pricesByPort) return 0;
  return Math.min(
    ...Object.keys(t.pricesByPort).map((p) => getDisplayedPriceEur(tourKey, p))
  );
}
function animatePriceElement(el, newText) {
  if (!el) return;
  if (el.textContent.trim() === newText) return;
  el.classList.add("is-updating");
  window.setTimeout(function () {
    el.textContent = newText;
    el.classList.remove("is-updating");
  }, 140);
}
function syncPricingModeButtons() {
  document.querySelectorAll(".price-mode__option").forEach(function (btn) {
    const active = btn.getAttribute("data-pricing-mode") === currentPricingMode;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });
}
function updatePricingModeVisibility() {
  const wrap = document.getElementById("pricing-mode-wrap");
  if (wrap) wrap.hidden = !supportsCouplePricing(currentTour);
  if (!supportsCouplePricing(currentTour) && currentPricingMode !== "solo") {
    currentPricingMode = "solo";
    syncPricingModeButtons();
  }
}
function setPricingMode(mode) {
  if (mode !== "solo" && mode !== "shared") return;
  if (mode === "shared" && !supportsCouplePricing(currentTour)) return;
  if (currentPricingMode === mode) return;
  currentPricingMode = mode;
  syncPricingModeButtons();
  updatePriceDisplays();
  if (typeof refreshChatPriceSummary === "function") refreshChatPriceSummary();
}
function updatePriceDisplays() {
  updatePricingModeVisibility();
  const displayed = getDisplayedPriceEur(currentTour, currentDeparturePort);
  const priceText = formatEurDisplay(displayed);
  animatePriceElement(document.getElementById("price-card-eur"), priceText);
  const tmlPriceEl = document.getElementById("tml-price-amount");
  if (tmlPriceEl) {
    const tmlDisplayed = getDisplayedPriceEur("tomorrowland", currentDeparturePort);
    animatePriceElement(tmlPriceEl, formatEurDisplay(tmlDisplayed));
  }
}
const PRICE_DISCLAIMER = {
  tr: "ℹ️ Gösterilen fiyatlar değişebilir. Kesin konaklama ve uçuş bilgileri rezervasyon / tur teyidinde paylaşılır; bagaj, vergi ve benzeri küçük ek ücretler ayrıca yansıyabilir.",
  en: "ℹ️ Prices shown are indicative and may change. Exact accommodation and flight details are shared upon booking / tour confirmation; minor add-ons such as extra baggage or airport taxes may apply."
};
function getPriceDisclaimer(lang) {
  return PRICE_DISCLAIMER[lang === "en" ? "en" : "tr"];
}
function formatChatPriceSummary(lang) {
  const bp = getMinTourPriceEur("backpacking");
  const cf = getMinTourPriceEur("phuket");
  const tml = getMinTourPriceEur("tomorrowland");
  const disc = getPriceDisclaimer(lang);
  const modeSuffix =
    supportsCouplePricing(currentTour) && currentPricingMode === "shared"
      ? lang === "en"
        ? " · Couple"
        : " · Çift kişi"
      : "";
  if (lang === "en") {
    return (
      "💰 Backpacking style from " +
      formatEurDisplay(bp) +
      ", Comfort from " +
      formatEurDisplay(cf) +
      ", Luxury (Tomorrowland) from " +
      formatEurDisplay(tml) +
      " per person" +
      modeSuffix +
      ".\n\n" +
      disc +
      "\n\nWant more details?"
    );
  }
  return (
    "💰 Backpacking style " +
    formatEurDisplay(bp) +
    ", Comfort " +
    formatEurDisplay(cf) +
    ", Luxury (Tomorrowland) " +
    formatEurDisplay(tml) +
    " kişi başı ’dan itibaren" +
    modeSuffix +
    ".\n\n" +
    disc +
    "\n\nDetaylı bilgi ister misiniz?"
  );
}
function refreshChatPriceSummary() {
  if (typeof chatFlow_tr === "undefined") return;
  chatFlow_tr.price.message = formatChatPriceSummary("tr");
  chatFlow_en.price.message = formatChatPriceSummary("en");
  if (typeof chatFlowCur === "function") chatFlow = chatFlowCur();
}
let currentTour = 'phuket';
let currentDeparturePort = 'istanbul';
let pendingTourHash = null;

function T() { return TOURS[currentTour] || TOURS.phuket; }
function getTourFlights() {
  const port = normalizeDeparturePort(currentDeparturePort);
  if (currentTour === "tomorrowland") {
    return buildTmlFlightsForPort(port);
  }
  const byTour = FLIGHTS_BY_TOUR[currentTour] || FLIGHTS_BY_TOUR.phuket;
  return byTour[port] || byTour.istanbul;
}
function isReturnFlightLeg(f) {
  return /Dönüş/i.test(f.titleTr || "") || /Return/i.test(f.titleEn || "");
}
function isDomesticFlightLeg(f) {
  return /İç hat/i.test(f.titleTr || "") || /Domestic flight/i.test(f.titleEn || "");
}
function groupFlightsByDirection(flights) {
  const splitIdx = flights.findIndex(isReturnFlightLeg);
  const outbound = splitIdx === -1 ? flights.slice() : flights.slice(0, splitIdx);
  const ret = splitIdx === -1 ? [] : flights.slice(splitIdx);
  const domesticIdx = outbound.findIndex(isDomesticFlightLeg);
  if (domesticIdx === -1) return { outbound, domestic: [], return: ret };
  return {
    outbound: outbound.slice(0, domesticIdx),
    domestic: outbound.slice(domesticIdx, domesticIdx + 1),
    return: ret
  };
}
function isLayoverLeg(f) {
  return /aktarma|layover/i.test(f.titleTr || "") || /aktarma|layover/i.test(f.titleEn || "");
}
function flightGroupSummary(legs, lang) {
  if (!legs.length) return "";
  const main = legs.find(function (f) {
    return /→/.test(f.route) && !isLayoverLeg(f);
  });
  const layovers = legs.filter(isLayoverLeg).length;
  let summary = main ? main.route.split("·")[0].trim() : legs[0].route;
  if (layovers > 0) {
    summary += lang === "en"
      ? " · " + layovers + " stopover" + (layovers > 1 ? "s" : "")
      : " · " + layovers + " aktarma";
  }
  return summary;
}
function renderFlightLegDetail(f, lang) {
  const layover = isLayoverLeg(f);
  const label = lang === "en" ? f.titleEn : f.titleTr;
  const time = lang === "en" ? f.timeEn : f.timeTr;
  return (
    '<div class="flight-leg' + (layover ? " flight-leg--layover" : "") + '">' +
    (layover ? '<span class="flight-leg__tag">' + escapeHtml(label) + "</span>" : "") +
    '<div class="flight-leg__route">' + escapeHtml(f.route) + "</div>" +
    '<div class="flight-leg__time">' + escapeHtml(time) + "</div></div>"
  );
}
const FLIGHT_PLANE_SVG =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>';
function renderFlightGroup(key, legs, lang) {
  if (!legs.length) return "";
  const title =
    key === "return"
      ? lang === "en"
        ? "Return flight"
        : "Dönüş uçuşu"
      : key === "domestic"
        ? lang === "en"
          ? "Domestic flight"
          : "İç hat uçuşu"
      : lang === "en"
        ? "Outbound flight"
        : "Gidiş uçuşu";
  const summary = flightGroupSummary(legs, lang);
  const details = legs.map(function (f) {
    return renderFlightLegDetail(f, lang);
  }).join("");
  return (
    '<div class="flight-group">' +
    '<button type="button" class="flight-group__toggle" aria-expanded="false">' +
    '<span class="flight-group__head"><span class="flight-group__icon">' +
    FLIGHT_PLANE_SVG +
    '</span><span class="flight-group__title">' +
    escapeHtml(title) +
    "</span></span>" +
    '<span class="flight-group__summary">' +
    escapeHtml(summary) +
    '</span><span class="flight-group__chevron" aria-hidden="true"></span>' +
    "</button>" +
    '<div class="flight-group__details" hidden>' +
    details +
    "</div></div>"
  );
}
function renderFlightGroupsHTML(flights, lang) {
  const g = groupFlightsByDirection(flights);
  return (
    renderFlightGroup("outbound", g.outbound, lang) +
    renderFlightGroup("domestic", g.domestic, lang) +
    renderFlightGroup("return", g.return, lang)
  );
}
function getTourRoute(lang) {
  const t = T();
  const port = normalizeDeparturePort(currentDeparturePort);
  const routes = t.routesByPort || {};
  return (routes[port] || routes.istanbul || {})[lang] || '';
}
function buildFlightsProse(flights, lang) {
  const isEn = lang === "en";
  const groups = renderFlightGroupsHTML(flights, lang);
  const baggage = isEn
    ? '<h3>Baggage</h3><ul><li><strong>International:</strong> 7 kg cabin baggage included · 20 kg checked baggage extra</li><li><strong>Domestic (Thai AirAsia):</strong> 7 kg cabin baggage included · 20 kg checked baggage extra</li></ul>'
    : '<h3>Bagaj bilgisi</h3><ul><li><strong>Uluslararası:</strong> 7 kg kabin bagajı dahil · 20 kg kayıtlı bagaj ek ücretlidir (ekonomi)</li><li><strong>İç hat (Thai AirAsia):</strong> 7 kg kabin bagajı dahil · 20 kg kayıtlı bagaj ek ücretlidir</li></ul>';
  const flightNotes = isEn ? flightNotesHtml_en : flightNotesHtml;
  const note = isEn
    ? '<p style="font-size:0.85rem;color:var(--text-muted)">Exact flight info is shared upon tour confirmation.</p>'
    : '<p style="font-size:0.85rem;color:var(--text-muted)">Kesin uçuş bilgisi tur teyidinde paylaşılır.</p>';
  return (
    (isEn ? "<h3>Flights</h3>" : "<h3>Uçuşlar</h3>") +
    '<p style="font-size:0.85rem;color:var(--text-muted);margin:0 0 0.75rem">' +
    (isEn ? "Tap a flight to see legs and layover details." : "Detay ve aktarma bilgisi için uçuşa tıklayın.") +
    "</p>" +
    groups +
    baggage +
    flightNotes +
    note
  );
}
function applyTmlHotelNames(days) {
  const pairs = [
    ["Thanthip Beach Resort Patong", "SKYVIEW Resort Phuket Patong Beach"],
    ["Thanthip Beach Resort", "SKYVIEW Resort Phuket Patong Beach"],
    ["Thanthip", "SKYVIEW Resort Patong"],
    ["Solitaire Bangkok Sukhumvit 11", "Grande Centre Point Prestige Bangkok"],
    ["Solitaire Bangkok", "Grande Centre Point Prestige Bangkok"],
    ["Solitaire Sukhumvit 11", "Grande Centre Point Prestige Bangkok"],
    ["Grande Centre Point Pattaya", "Royal Cliff Beach Terrace Pattaya"],
    ["Solitaire", "Grande Centre Point Prestige"]
  ];
  return days.map(function (d) {
    const copy = Object.assign({}, d);
    ["summary", "content", "route"].forEach(function (key) {
      if (!copy[key]) return;
      let text = copy[key];
      pairs.forEach(function (p) {
        text = text.split(p[0]).join(p[1]);
      });
      copy[key] = text;
    });
    return copy;
  });
}
function progData(forcedLang) {
  const lang = forcedLang || L();
  let days;
  if (currentTour === "tomorrowland") {
    days = applyTmlHotelNames(
      withDeparturePort(
        lang === "en" ? programDays_tml_en : programDays_tml,
        lang,
        "tomorrowland"
      )
    );
  } else if (currentTour === "backpacking") {
    days = withDeparturePort(
      lang === "en" ? programDays_en : programDays,
      lang,
      "backpacking"
    );
  } else {
    days = withDeparturePort(
      lang === "en" ? programDays_en : programDays,
      lang,
      "phuket"
    );
  }
  return applyNarrativeFlightTokens(
    mergeProgramSchedule(days, lang, currentTour),
    currentTour,
    currentDeparturePort,
    lang
  );
}
function sidebarIncList() {
  if (currentTour === "tomorrowland") return L() === "en" ? sidebarIncluded_tml_en : sidebarIncluded_tml;
  if (currentTour === "backpacking") return L() === "en" ? sidebarIncluded_backpack_en : sidebarIncluded_backpack;
  return L() === "en" ? sidebarIncluded_en : sidebarIncluded;
}
function incBottomList() {
  if (currentTour === 'tomorrowland') return L() === 'en' ? includedBottom_tml_en : includedBottom_tml;
  return L() === 'en' ? includedBottom_en : includedBottom;
}
function excBottomList() {
  if (currentTour === 'tomorrowland') return L() === 'en' ? excludedBottom_tml_en : excludedBottom_tml;
  return L() === 'en' ? excludedBottom_en : excludedBottom;
}
function generalHtmlGet() {
  if (currentTour === 'tomorrowland') return L() === 'en' ? generalHtml_tml_en : generalHtml_tml;
  return L() === 'en' ? generalHtml_en : generalHtml;
}
function importantInfoGet() {
  return L() === 'en' ? importantInfoHtml_en : importantInfoHtml;
}
function hotelsHtmlGet() {
  if (currentTour === "tomorrowland") return L() === "en" ? accommodationHtml_tml_en : accommodationHtml_tml;
  if (currentTour === "backpacking") return L() === "en" ? accommodationHtml_backpack_en : accommodationHtml_backpack;
  return L() === "en" ? accommodationHtml_en : accommodationHtml;
}
function flightsHtmlGet() {
  return buildFlightsProse(getTourFlights(), L());
}
function photosGet() {
  return currentTour === 'tomorrowland' ? photos_tml : photos;
}

/* Update hero/breadcrumb/sidebar based on currentTour */
function updateTourMeta() {
  const t = T();
  const lang = L();
  const setText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };

  setText('tour-hero-badge',      t.badge[lang]);
  setText('tour-hero-title',      t.title[lang]);
  setText('tour-hero-route',      getTourRoute(lang));
  setText('tour-hero-duration',   t.duration[lang]);
  setText('tour-hero-dates',      t.dates[lang]);
  setText('tour-breadcrumb-title', t.breadcrumb[lang]);

  const heroBg = document.getElementById('tour-hero-bg');
  if (heroBg) {
    heroBg.style.backgroundImage =
      "linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.25)), url('" + t.heroImg + "')";
    heroBg.style.backgroundSize = 'cover';
    heroBg.style.backgroundPosition = 'center';
    heroBg.setAttribute('aria-label', t.heroAlt[lang]);
  }

  // Date dropdown
  const dateSel = document.getElementById('tour-date-select');
  if (dateSel) {
    dateSel.innerHTML = t.dateOptions[lang]
      .map((d) => '<option>' + d + '</option>').join('');
  }

  updatePriceDisplays();
  const portSel = document.getElementById('departure-port-select');
  if (portSel) portSel.value = currentDeparturePort;

  // Flight block
  const flightBlock = document.getElementById("sidebar-flight-block");
  if (flightBlock) {
    const html = renderFlightGroupsHTML(getTourFlights(), lang);
    const note = lang === "en"
      ? "Exact flights and hotels are confirmed upon booking. Package price may vary; extra baggage, taxes and similar minor charges may apply."
      : "Kesin uçuş ve otel bilgisi rezervasyon / tur teyidinde paylaşılır. Paket fiyatı değişebilir; bagaj, vergi ve benzeri küçük ek ücretler ayrıca yansıyabilir.";
    flightBlock.innerHTML =
      html +
      '<p style="font-size:0.7rem;color:var(--text-muted);margin:0.35rem 0 0;line-height:1.4">' +
      note +
      "</p>";
  }

  // Update reserve button email subject
  const reserveBtn = document.getElementById('open-reserve');
  if (reserveBtn) reserveBtn.setAttribute('data-email-subject', t.emailSubject);
}

/* ─── Nationality / Thailand visa info ─────────────────────────────── */
const VISA_RULES = {
  'visa-free':   { class: 'visa-free', tr_dur: '60 gün', en_dur: '60 days',
    tr: '60 gün vize muafiyeti — ücretsiz, havalimanında otomatik damga',
    en: '60-day visa exemption — free of charge, stamped on arrival' },
  'voa':         { class: 'voa', tr_dur: '15 gün', en_dur: '15 days',
    tr: 'Havalimanında vize (Visa on Arrival) — 15 gün, ~2.000 THB ücret',
    en: 'Visa on Arrival — 15 days, fee ~2,000 THB' },
  'evisa':       { class: 'evisa', tr_dur: '60 gün', en_dur: '60 days',
    tr: 'Önceden e-vize başvurusu gerekli (online)',
    en: 'E-Visa application required in advance (online)' },
  'required':    { class: 'required', tr_dur: '—', en_dur: '—',
    tr: 'Önceden konsoloslukta vize başvurusu zorunlu',
    en: 'Visa must be obtained from a Thai consulate in advance' }
};

// 100+ countries with Thailand visa status (correct per 2024-2025 policy)
const NATIONALITIES = [
  { code:'AL', tr:'Arnavutluk', en:'Albania', flag:'🇦🇱', visa:'visa-free' },
  { code:'DZ', tr:'Cezayir', en:'Algeria', flag:'🇩🇿', visa:'evisa' },
  { code:'AD', tr:'Andorra', en:'Andorra', flag:'🇦🇩', visa:'visa-free' },
  { code:'AR', tr:'Arjantin', en:'Argentina', flag:'🇦🇷', visa:'visa-free' },
  { code:'AM', tr:'Ermenistan', en:'Armenia', flag:'🇦🇲', visa:'evisa' },
  { code:'AU', tr:'Avustralya', en:'Australia', flag:'🇦🇺', visa:'visa-free' },
  { code:'AT', tr:'Avusturya', en:'Austria', flag:'🇦🇹', visa:'visa-free' },
  { code:'AZ', tr:'Azerbaycan', en:'Azerbaijan', flag:'🇦🇿', visa:'evisa' },
  { code:'BH', tr:'Bahreyn', en:'Bahrain', flag:'🇧🇭', visa:'visa-free' },
  { code:'BD', tr:'Bangladeş', en:'Bangladesh', flag:'🇧🇩', visa:'voa' },
  { code:'BY', tr:'Belarus', en:'Belarus', flag:'🇧🇾', visa:'evisa' },
  { code:'BE', tr:'Belçika', en:'Belgium', flag:'🇧🇪', visa:'visa-free' },
  { code:'BT', tr:'Bhutan', en:'Bhutan', flag:'🇧🇹', visa:'voa' },
  { code:'BO', tr:'Bolivya', en:'Bolivia', flag:'🇧🇴', visa:'evisa' },
  { code:'BA', tr:'Bosna-Hersek', en:'Bosnia and Herzegovina', flag:'🇧🇦', visa:'evisa' },
  { code:'BR', tr:'Brezilya', en:'Brazil', flag:'🇧🇷', visa:'visa-free' },
  { code:'BN', tr:'Brunei', en:'Brunei', flag:'🇧🇳', visa:'visa-free' },
  { code:'BG', tr:'Bulgaristan', en:'Bulgaria', flag:'🇧🇬', visa:'visa-free' },
  { code:'KH', tr:'Kamboçya', en:'Cambodia', flag:'🇰🇭', visa:'visa-free' },
  { code:'CA', tr:'Kanada', en:'Canada', flag:'🇨🇦', visa:'visa-free' },
  { code:'CL', tr:'Şili', en:'Chile', flag:'🇨🇱', visa:'visa-free' },
  { code:'CN', tr:'Çin', en:'China', flag:'🇨🇳', visa:'visa-free' },
  { code:'CO', tr:'Kolombiya', en:'Colombia', flag:'🇨🇴', visa:'visa-free' },
  { code:'CR', tr:'Kosta Rika', en:'Costa Rica', flag:'🇨🇷', visa:'visa-free' },
  { code:'HR', tr:'Hırvatistan', en:'Croatia', flag:'🇭🇷', visa:'visa-free' },
  { code:'CY', tr:'Kıbrıs', en:'Cyprus', flag:'🇨🇾', visa:'visa-free' },
  { code:'CZ', tr:'Çekya', en:'Czech Republic', flag:'🇨🇿', visa:'visa-free' },
  { code:'DK', tr:'Danimarka', en:'Denmark', flag:'🇩🇰', visa:'visa-free' },
  { code:'DO', tr:'Dominik Cumhuriyeti', en:'Dominican Republic', flag:'🇩🇴', visa:'visa-free' },
  { code:'EC', tr:'Ekvador', en:'Ecuador', flag:'🇪🇨', visa:'visa-free' },
  { code:'EG', tr:'Mısır', en:'Egypt', flag:'🇪🇬', visa:'evisa' },
  { code:'SV', tr:'El Salvador', en:'El Salvador', flag:'🇸🇻', visa:'visa-free' },
  { code:'EE', tr:'Estonya', en:'Estonia', flag:'🇪🇪', visa:'visa-free' },
  { code:'FJ', tr:'Fiji', en:'Fiji', flag:'🇫🇯', visa:'visa-free' },
  { code:'FI', tr:'Finlandiya', en:'Finland', flag:'🇫🇮', visa:'visa-free' },
  { code:'FR', tr:'Fransa', en:'France', flag:'🇫🇷', visa:'visa-free' },
  { code:'GE', tr:'Gürcistan', en:'Georgia', flag:'🇬🇪', visa:'visa-free' },
  { code:'DE', tr:'Almanya', en:'Germany', flag:'🇩🇪', visa:'visa-free' },
  { code:'GR', tr:'Yunanistan', en:'Greece', flag:'🇬🇷', visa:'visa-free' },
  { code:'GT', tr:'Guatemala', en:'Guatemala', flag:'🇬🇹', visa:'visa-free' },
  { code:'HN', tr:'Honduras', en:'Honduras', flag:'🇭🇳', visa:'visa-free' },
  { code:'HK', tr:'Hong Kong', en:'Hong Kong', flag:'🇭🇰', visa:'visa-free' },
  { code:'HU', tr:'Macaristan', en:'Hungary', flag:'🇭🇺', visa:'visa-free' },
  { code:'IS', tr:'İzlanda', en:'Iceland', flag:'🇮🇸', visa:'visa-free' },
  { code:'IN', tr:'Hindistan', en:'India', flag:'🇮🇳', visa:'visa-free' },
  { code:'ID', tr:'Endonezya', en:'Indonesia', flag:'🇮🇩', visa:'visa-free' },
  { code:'IR', tr:'İran', en:'Iran', flag:'🇮🇷', visa:'required' },
  { code:'IQ', tr:'Irak', en:'Iraq', flag:'🇮🇶', visa:'required' },
  { code:'IE', tr:'İrlanda', en:'Ireland', flag:'🇮🇪', visa:'visa-free' },
  { code:'IL', tr:'İsrail', en:'Israel', flag:'🇮🇱', visa:'visa-free' },
  { code:'IT', tr:'İtalya', en:'Italy', flag:'🇮🇹', visa:'visa-free' },
  { code:'JM', tr:'Jamaika', en:'Jamaica', flag:'🇯🇲', visa:'visa-free' },
  { code:'JP', tr:'Japonya', en:'Japan', flag:'🇯🇵', visa:'visa-free' },
  { code:'JO', tr:'Ürdün', en:'Jordan', flag:'🇯🇴', visa:'visa-free' },
  { code:'KZ', tr:'Kazakistan', en:'Kazakhstan', flag:'🇰🇿', visa:'visa-free' },
  { code:'KE', tr:'Kenya', en:'Kenya', flag:'🇰🇪', visa:'evisa' },
  { code:'KW', tr:'Kuveyt', en:'Kuwait', flag:'🇰🇼', visa:'visa-free' },
  { code:'KG', tr:'Kırgızistan', en:'Kyrgyzstan', flag:'🇰🇬', visa:'evisa' },
  { code:'LA', tr:'Laos', en:'Laos', flag:'🇱🇦', visa:'visa-free' },
  { code:'LV', tr:'Letonya', en:'Latvia', flag:'🇱🇻', visa:'visa-free' },
  { code:'LB', tr:'Lübnan', en:'Lebanon', flag:'🇱🇧', visa:'required' },
  { code:'LI', tr:'Liechtenstein', en:'Liechtenstein', flag:'🇱🇮', visa:'visa-free' },
  { code:'LT', tr:'Litvanya', en:'Lithuania', flag:'🇱🇹', visa:'visa-free' },
  { code:'LU', tr:'Lüksemburg', en:'Luxembourg', flag:'🇱🇺', visa:'visa-free' },
  { code:'MO', tr:'Makao', en:'Macao', flag:'🇲🇴', visa:'visa-free' },
  { code:'MY', tr:'Malezya', en:'Malaysia', flag:'🇲🇾', visa:'visa-free' },
  { code:'MV', tr:'Maldivler', en:'Maldives', flag:'🇲🇻', visa:'visa-free' },
  { code:'MT', tr:'Malta', en:'Malta', flag:'🇲🇹', visa:'visa-free' },
  { code:'MU', tr:'Mauritius', en:'Mauritius', flag:'🇲🇺', visa:'visa-free' },
  { code:'MX', tr:'Meksika', en:'Mexico', flag:'🇲🇽', visa:'visa-free' },
  { code:'MD', tr:'Moldova', en:'Moldova', flag:'🇲🇩', visa:'visa-free' },
  { code:'MC', tr:'Monako', en:'Monaco', flag:'🇲🇨', visa:'visa-free' },
  { code:'MN', tr:'Moğolistan', en:'Mongolia', flag:'🇲🇳', visa:'visa-free' },
  { code:'ME', tr:'Karadağ', en:'Montenegro', flag:'🇲🇪', visa:'visa-free' },
  { code:'MA', tr:'Fas', en:'Morocco', flag:'🇲🇦', visa:'visa-free' },
  { code:'NL', tr:'Hollanda', en:'Netherlands', flag:'🇳🇱', visa:'visa-free' },
  { code:'NZ', tr:'Yeni Zelanda', en:'New Zealand', flag:'🇳🇿', visa:'visa-free' },
  { code:'NI', tr:'Nikaragua', en:'Nicaragua', flag:'🇳🇮', visa:'visa-free' },
  { code:'NG', tr:'Nijerya', en:'Nigeria', flag:'🇳🇬', visa:'evisa' },
  { code:'MK', tr:'Kuzey Makedonya', en:'North Macedonia', flag:'🇲🇰', visa:'visa-free' },
  { code:'NO', tr:'Norveç', en:'Norway', flag:'🇳🇴', visa:'visa-free' },
  { code:'OM', tr:'Umman', en:'Oman', flag:'🇴🇲', visa:'visa-free' },
  { code:'PK', tr:'Pakistan', en:'Pakistan', flag:'🇵🇰', visa:'voa' },
  { code:'PA', tr:'Panama', en:'Panama', flag:'🇵🇦', visa:'visa-free' },
  { code:'PE', tr:'Peru', en:'Peru', flag:'🇵🇪', visa:'visa-free' },
  { code:'PH', tr:'Filipinler', en:'Philippines', flag:'🇵🇭', visa:'visa-free' },
  { code:'PL', tr:'Polonya', en:'Poland', flag:'🇵🇱', visa:'visa-free' },
  { code:'PT', tr:'Portekiz', en:'Portugal', flag:'🇵🇹', visa:'visa-free' },
  { code:'QA', tr:'Katar', en:'Qatar', flag:'🇶🇦', visa:'visa-free' },
  { code:'RO', tr:'Romanya', en:'Romania', flag:'🇷🇴', visa:'visa-free' },
  { code:'RU', tr:'Rusya', en:'Russia', flag:'🇷🇺', visa:'visa-free' },
  { code:'SM', tr:'San Marino', en:'San Marino', flag:'🇸🇲', visa:'visa-free' },
  { code:'SA', tr:'Suudi Arabistan', en:'Saudi Arabia', flag:'🇸🇦', visa:'visa-free' },
  { code:'RS', tr:'Sırbistan', en:'Serbia', flag:'🇷🇸', visa:'visa-free' },
  { code:'SC', tr:'Seyşeller', en:'Seychelles', flag:'🇸🇨', visa:'visa-free' },
  { code:'SG', tr:'Singapur', en:'Singapore', flag:'🇸🇬', visa:'visa-free' },
  { code:'SK', tr:'Slovakya', en:'Slovakia', flag:'🇸🇰', visa:'visa-free' },
  { code:'SI', tr:'Slovenya', en:'Slovenia', flag:'🇸🇮', visa:'visa-free' },
  { code:'ZA', tr:'Güney Afrika', en:'South Africa', flag:'🇿🇦', visa:'visa-free' },
  { code:'KR', tr:'Güney Kore', en:'South Korea', flag:'🇰🇷', visa:'visa-free' },
  { code:'ES', tr:'İspanya', en:'Spain', flag:'🇪🇸', visa:'visa-free' },
  { code:'LK', tr:'Sri Lanka', en:'Sri Lanka', flag:'🇱🇰', visa:'visa-free' },
  { code:'SE', tr:'İsveç', en:'Sweden', flag:'🇸🇪', visa:'visa-free' },
  { code:'CH', tr:'İsviçre', en:'Switzerland', flag:'🇨🇭', visa:'visa-free' },
  { code:'SY', tr:'Suriye', en:'Syria', flag:'🇸🇾', visa:'required' },
  { code:'TW', tr:'Tayvan', en:'Taiwan', flag:'🇹🇼', visa:'visa-free' },
  { code:'TH', tr:'Tayland', en:'Thailand', flag:'🇹🇭', visa:'visa-free' },
  { code:'TT', tr:'Trinidad ve Tobago', en:'Trinidad and Tobago', flag:'🇹🇹', visa:'visa-free' },
  { code:'TN', tr:'Tunus', en:'Tunisia', flag:'🇹🇳', visa:'visa-free' },
  { code:'TR', tr:'Türkiye', en:'Turkey', flag:'🇹🇷', visa:'visa-free' },
  { code:'UA', tr:'Ukrayna', en:'Ukraine', flag:'🇺🇦', visa:'visa-free' },
  { code:'AE', tr:'Birleşik Arap Emirlikleri', en:'United Arab Emirates', flag:'🇦🇪', visa:'visa-free' },
  { code:'GB', tr:'Birleşik Krallık', en:'United Kingdom', flag:'🇬🇧', visa:'visa-free' },
  { code:'US', tr:'Amerika Birleşik Devletleri', en:'United States', flag:'🇺🇸', visa:'visa-free' },
  { code:'UY', tr:'Uruguay', en:'Uruguay', flag:'🇺🇾', visa:'visa-free' },
  { code:'UZ', tr:'Özbekistan', en:'Uzbekistan', flag:'🇺🇿', visa:'visa-free' },
  { code:'VE', tr:'Venezuela', en:'Venezuela', flag:'🇻🇪', visa:'visa-free' },
  { code:'VN', tr:'Vietnam', en:'Vietnam', flag:'🇻🇳', visa:'visa-free' },
  { code:'YE', tr:'Yemen', en:'Yemen', flag:'🇾🇪', visa:'required' }
];

let selectedNat = null;
try { selectedNat = localStorage.getItem('gezeceyik-nat'); } catch (e) {}

function natName(n)         { return L() === 'en' ? n.en : n.tr; }
function visaText(rule)     { return L() === 'en' ? rule.en : rule.tr; }
function visaBadgeLabel(k)  {
  const isEn = L() === 'en';
  if (k === 'visa-free') return isEn ? 'Visa-free' : 'Vizesiz';
  if (k === 'voa')       return isEn ? 'On arrival' : 'Havalimanında';
  if (k === 'evisa')     return isEn ? 'E-Visa'    : 'E-Vize';
  if (k === 'required')  return isEn ? 'Visa req.' : 'Vize gerekli';
  return '';
}

function natLabels() {
  const isEn = L() === 'en';
  return {
    visa:     isEn ? 'Visa'     : 'Vize',
    duration: isEn ? 'Stay'     : 'Süre',
    passport: isEn ? 'Passport' : 'Pasaport',
    passportReq: isEn ? '6 months validity from entry date'
                      : 'Giriş tarihinden itibaren 6 ay geçerli',
    entryForm: isEn ? 'Entry form' : 'Giriş formu',
    noResults: isEn ? 'No country found' : 'Ülke bulunamadı'
  };
}

function buildImmigrationFormDetail(nat) {
  const isEn = L() === "en";
  const tdac =
    '<a href="' +
    TDAC_ARRIVAL_CARD_URL +
    '" target="_blank" rel="noopener noreferrer"><strong>Digital Arrival Card</strong></a>';
  const parts = [];
  if (nat.visa === "evisa") {
    const evisa =
      '<a href="' +
      THAILAND_EVISA_URL +
      '" target="_blank" rel="noopener noreferrer">' +
      (isEn ? "Thailand E-Visa" : "Tayland e-Vizesi") +
      "</a>";
    parts.push(
      isEn
        ? "Apply for " + evisa + " online before travel"
        : "Seyahat öncesi " + evisa + " başvurusu (online)"
    );
  }
  parts.push(
    isEn
      ? "Mandatory " + tdac + " for Thailand entry"
      : "Tayland girişinde zorunlu " + tdac
  );
  return parts.join(" · ");
}

function renderNatInfo() {
  const info = document.getElementById('nat-info');
  if (!selectedNat) { info.hidden = true; info.innerHTML = ''; return; }
  const nat = NATIONALITIES.find((n) => n.code === selectedNat);
  if (!nat) { info.hidden = true; info.innerHTML = ''; return; }
  const rule = VISA_RULES[nat.visa];
  const dur  = L() === 'en' ? rule.en_dur : rule.tr_dur;
  const lbl  = natLabels();
  info.hidden = false;
  const entryFormRow =
    '<div class="nat-info__row"><strong>' +
    lbl.entryForm +
    '</strong><span>' +
    buildImmigrationFormDetail(nat) +
    "</span></div>";
  info.innerHTML = `
    <div class="nat-info__head">
      <span class="nat-info__flag">${nat.flag}</span>
      <span class="nat-info__country">${natName(nat)}</span>
      <span class="nat-info__badge nat-info__badge--${rule.class}">${visaBadgeLabel(nat.visa)}</span>
    </div>
    <div class="nat-info__row"><strong>${lbl.visa}</strong><span>${visaText(rule)}</span></div>
    <div class="nat-info__row"><strong>${lbl.duration}</strong><span>${dur}</span></div>
    <div class="nat-info__row"><strong>${lbl.passport}</strong><span>${lbl.passportReq}</span></div>
    ${entryFormRow}
  `;
}

function renderNatDropdown(query) {
  const list = document.getElementById('nat-list');
  const q = (query || '').trim().toLowerCase();
  const lbl = natLabels();
  const items = NATIONALITIES
    .filter((n) => {
      if (!q) return true;
      const a = n.tr.toLowerCase();
      const b = n.en.toLowerCase();
      return a.startsWith(q) || b.startsWith(q) || a.includes(q) || b.includes(q);
    })
    .sort((a, b) => natName(a).localeCompare(natName(b)))
    .slice(0, 100);

  if (items.length === 0) {
    list.innerHTML = `<li class="nat-empty">${lbl.noResults}</li>`;
  } else {
    list.innerHTML = items.map((n, i) =>
      `<li role="option" data-code="${n.code}" data-idx="${i}"><span class="nat-flag">${n.flag}</span><span>${natName(n)}</span></li>`
    ).join('');
  }
  list.hidden = false;
}

(function initNatSearch() {
  const input  = document.getElementById('nat-input');
  const list   = document.getElementById('nat-list');
  const clear  = document.getElementById('nat-clear');
  if (!input || !list) return;

  function setSelectedFromCode(code) {
    const nat = NATIONALITIES.find((n) => n.code === code);
    if (!nat) return;
    selectedNat = code;
    try { localStorage.setItem('gezeceyik-nat', code); } catch (e) {}
    input.value = natName(nat);
    clear.hidden = false;
    list.hidden = true;
    renderNatInfo();
  }

  input.addEventListener('focus', () => renderNatDropdown(input.value));
  input.addEventListener('input', () => {
    clear.hidden = !input.value;
    renderNatDropdown(input.value);
  });
  input.addEventListener('blur', () => {
    // Delay to allow click event on dropdown
    setTimeout(() => { list.hidden = true; }, 150);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { list.hidden = true; input.blur(); }
    if (e.key === 'Enter') {
      const first = list.querySelector('li[data-code]');
      if (first) { setSelectedFromCode(first.getAttribute('data-code')); e.preventDefault(); }
    }
  });
  list.addEventListener('mousedown', (e) => {
    // mousedown fires before blur, so we can pick selection
    const li = e.target.closest('li[data-code]');
    if (li) setSelectedFromCode(li.getAttribute('data-code'));
  });
  clear.addEventListener('click', () => {
    selectedNat = null;
    try { localStorage.removeItem('gezeceyik-nat'); } catch (e) {}
    input.value = '';
    clear.hidden = true;
    list.hidden = true;
    renderNatInfo();
  });

  // Restore saved selection on first render
  if (selectedNat) {
    const nat = NATIONALITIES.find((n) => n.code === selectedNat);
    if (nat) {
      input.value = natName(nat);
      clear.hidden = false;
      renderNatInfo();
    }
  }

  // Re-render on language change
  document.addEventListener('gezeceyik-lang', () => {
    if (selectedNat) {
      const nat = NATIONALITIES.find((n) => n.code === selectedNat);
      if (nat) input.value = natName(nat);
    }
    renderNatInfo();
  });
})();
function photoAlt(p)     { return L() === 'en' && p.altEn ? p.altEn  : p.alt; }
function dayLabel()      { return L() === 'en' ? 'Day' : 'Tur günü'; }

function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function renderTimeline(forcedLang) {
  const root = document.getElementById("timeline-root");
  if (!root) return;
  const lang = forcedLang || L();
  const days = progData(lang);
  const dayWord = lang === "en" ? "DAY" : "GÜN";
  const openLabel = lang === "en" ? "open details" : "detayları aç";
  const dayNounLong = lang === "en" ? "Day" : "Gün";
  const optPill = lang === "en" ? "Optional · extra" : "Opsiyonel · ek ücret";
  root.innerHTML = days
    .map((d) => {
      const summaryHtml = escapeHtml(d.summary).replace(/\n/g, "<br>");
      const label = `${dayNounLong} ${d.n}: ${d.route} — ${openLabel}`;
      const pill = d.optional ? `<span class="timeline__optional-pill">${optPill}</span>` : '';
      return `
        <li class="timeline__item">
          <div class="timeline__marker">${d.n}.<br>${dayWord}</div>
          <button type="button" class="timeline__card" data-day="${d.n}" aria-label="${escapeHtml(label)}">
            <h3 class="timeline__route">${escapeHtml(d.route)}${pill}</h3>
            <p class="timeline__text">${summaryHtml}</p>
          </button>
        </li>`;
    })
    .join("");

  root.querySelectorAll(".timeline__card").forEach((btn) => {
    btn.addEventListener("click", () => openDayModal(Number(btn.dataset.day)));
  });
}

const dayModalEl = document.getElementById("dayModal");
const dayModalContainerEl = document.getElementById("dayModalContainer");
const dayModalScaleWrapEl = document.getElementById("dayModalScaleWrap");
const dayModalCloseBtn = document.getElementById("day-modal-close");
const modalFigureEl = document.getElementById("modalFigure");
const modalImageEl = document.getElementById("modalImage");
const modalOptionalEl = document.getElementById("modalOptionalNotice");
const modalContentFootEl = document.getElementById("modalContentFoot");
const modalContentRestEl = document.getElementById("modalContentRest");
const modalDayProgramEl = document.getElementById("modalDayProgram");
const modalDayProgramPanelEl = document.getElementById("modalDayProgramPanel");
const modalDayProgramLabelEl = document.getElementById("modalDayProgramLabel");
const modalDayDetailsEl = document.getElementById("modalDayDetails");
const modalDayDetailsPanelEl = document.getElementById("modalDayDetailsPanel");
const modalDayDetailsLabelEl = document.getElementById("modalDayDetailsLabel");

function resetDayModalScroll() {
  if (dayModalScaleWrapEl) dayModalScaleWrapEl.scrollTop = 0;
}

function fitDayModalToViewport() {
  resetDayModalScroll();
}

window.addEventListener("resize", function () {
  if (!dayModalEl.hidden) resetDayModalScroll();
});

function openDayModal(dayNumber) {
  const day = progData().find((d) => d.n === dayNumber);
  if (!day) return;

  document.getElementById("modalDayNumber").textContent = String(dayNumber);
  document.getElementById("modalTitle").textContent = day.route;
  document.getElementById("modalDate").textContent = day.date;

  const contentParts = extractProgramAccordion(day.content);
  const restSplit = splitDayModalContent(contentParts.after);
  let restMain = restSplit.main;
  if (restMain && day.dayNarrative && (dayNumber === 1 || dayNumber === 9)) {
    restMain = restMain
      .replace(
        /<p><strong>(?:Gidiş uçuşları|Outbound flights|Dönüş|Return)[^<]*<\/strong>[^<]*<\/p>\s*<ul>[\s\S]*?<\/ul>/gi,
        ""
      )
      .replace(
        /<p><strong>(?:Gidiş|Outbound|Dönüş|Return)[^<]*<\/strong>[^<]*<\/p>\s*<ul>[\s\S]*?<\/ul>/gi,
        ""
      )
      .trim();
  }
  document.getElementById("modalContent").innerHTML = contentParts.intro;

  if (modalDayProgramEl && modalDayProgramPanelEl && contentParts.programHtml) {
    modalDayProgramPanelEl.innerHTML = contentParts.programHtml;
    modalDayProgramEl.hidden = false;
    if (modalDayProgramLabelEl) {
      modalDayProgramLabelEl.textContent = L() === "en" ? "Program" : "Program";
    }
  } else if (modalDayProgramEl) {
    modalDayProgramEl.hidden = true;
    if (modalDayProgramPanelEl) modalDayProgramPanelEl.innerHTML = "";
  }
  if (modalContentRestEl) {
    if (restMain) {
      modalContentRestEl.innerHTML = restMain;
      modalContentRestEl.hidden = false;
    } else {
      modalContentRestEl.innerHTML = "";
      modalContentRestEl.hidden = true;
    }
  }
  if (modalContentFootEl) {
    if (restSplit.foot) {
      modalContentFootEl.innerHTML = restSplit.foot;
      modalContentFootEl.hidden = false;
    } else {
      modalContentFootEl.innerHTML = "";
      modalContentFootEl.hidden = true;
    }
  }

  if (modalDayDetailsEl && modalDayDetailsPanelEl && day.dayNarrative) {
    modalDayDetailsPanelEl.innerHTML = day.dayNarrative;
    modalDayDetailsEl.hidden = false;
    if (modalDayDetailsLabelEl) {
      modalDayDetailsLabelEl.textContent =
        L() === "en" ? "Day details" : "Gün detayları";
    }
  } else if (modalDayDetailsEl) {
    modalDayDetailsEl.hidden = true;
    if (modalDayDetailsPanelEl) modalDayDetailsPanelEl.innerHTML = "";
  }

  if (day.optional) {
    const isEn = L() === 'en';
    const title   = isEn ? 'Optional tour — extra cost' : 'Opsiyonel tur — ek ücretli';
    const message = isEn
      ? "This day's tour is optional. Guests who'd like to join can attend for an additional cost. Those who prefer free time can stay at the hotel or explore on their own."
      : 'Bu günün turu opsiyoneldir. Katılmak isteyen misafirler ek ücretle katılabilir. Serbest zaman tercih edenler otelde kalabilir veya kendi başlarına şehri keşfedebilir.';
    modalOptionalEl.innerHTML = `
      <div class="day-modal__optional-notice">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <div>
          <strong>${title}</strong>
          <p>${message}</p>
        </div>
      </div>`;
    modalOptionalEl.hidden = false;
  } else {
    modalOptionalEl.innerHTML = '';
    modalOptionalEl.hidden = true;
  }

  if (day.image && day.image.src) {
    modalImageEl.src = day.image.src;
    modalImageEl.alt =
      L() === "en" && day.image.altEn ? day.image.altEn : day.image.alt || (L() === "en" ? "Tour day photo" : "Tur günü görseli");
    modalImageEl.style.objectPosition =
      day.image.objectPosition || "";
    modalFigureEl.hidden = false;
  } else {
    modalFigureEl.hidden = true;
    modalImageEl.removeAttribute("src");
    modalImageEl.alt = L() === "en" ? "Tour day photo" : "Tur günü görseli";
  }

  dayModalEl.hidden = false;
  requestAnimationFrame(function () {
    dayModalEl.classList.add("is-open");
    requestAnimationFrame(fitDayModalToViewport);
  });
  if (modalImageEl) {
    modalImageEl.addEventListener("load", fitDayModalToViewport, { once: true });
  }
  document.body.classList.add("day-modal-open");
}

function closeDayModal() {
  resetDayModalScroll();
  dayModalEl.classList.remove("is-open");
  setTimeout(() => {
    dayModalEl.hidden = true;
  }, 300);
  document.body.classList.remove("day-modal-open");
}

function handleDayModalCloseClick(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  closeDayModal();
}

if (dayModalCloseBtn) {
  dayModalCloseBtn.addEventListener("click", handleDayModalCloseClick);
}

if (dayModalEl) {
  dayModalEl.addEventListener("click", function (e) {
    if (e.target === dayModalEl) closeDayModal();
  });
}

if (dayModalContainerEl) {
  dayModalContainerEl.addEventListener("click", function (e) {
    e.stopPropagation();
  });
}

function fillLists() {
  document.getElementById("list-included-bottom").innerHTML = incBottomList()
    .map((t) => `<li>${escapeHtml(t)}</li>`)
    .join("");
  document.getElementById("list-excluded-bottom").innerHTML = excBottomList()
    .map((t) => `<li>${escapeHtml(t)}</li>`)
    .join("");
  document.getElementById("general-prose").innerHTML = generalHtmlGet().trim();
  const importantProse = document.getElementById("important-prose");
  if (importantProse) importantProse.innerHTML = importantInfoGet().trim();
  const hotelsProse  = document.getElementById("hotels-prose");
  const flightsProse = document.getElementById("flights-prose");
  if (hotelsProse)  hotelsProse.innerHTML  = hotelsHtmlGet().trim();
  if (flightsProse) flightsProse.innerHTML = flightsHtmlGet().trim();
  document.getElementById("photo-grid-root").innerHTML = photosGet()
    .map(
      (p) =>
        `<a href="${escapeHtml(p.href)}" target="_blank" rel="noopener noreferrer"><img src="${escapeHtml(p.src)}" alt="${escapeHtml(photoAlt(p))}" loading="lazy" width="800" height="600" /></a>`
    )
    .join("");
}

// Re-render dynamic content when language changes
document.addEventListener("gezeceyik-lang", function (e) {
  const lang = (e.detail && e.detail.lang) || L();
  updateTourMeta();
  renderTimeline(lang);
  fillLists();
  const modalDayNum = document.getElementById("modalDayNumber");
  if (dayModalEl && !dayModalEl.hidden && modalDayNum && modalDayNum.textContent) {
    openDayModal(Number(modalDayNum.textContent));
  }
});

const tabs = document.querySelectorAll(".tour-tabs [role='tab']");
const panels = {
  program: document.getElementById("panel-program"),
  hotels:  document.getElementById("panel-hotels"),
  flights: document.getElementById("panel-flights"),
  general: document.getElementById("panel-general"),
  photos:  document.getElementById("panel-photos"),
  important: document.getElementById("panel-important")
};

function activateTab(id) {
  const map = {
    "tab-program": "program",
    "tab-hotels":  "hotels",
    "tab-flights": "flights",
    "tab-general": "general",
    "tab-photos":  "photos",
    "tab-important": "important"
  };
  const key = map[id];
  tabs.forEach((t) => {
    const on = t.id === id;
    t.setAttribute("aria-selected", on);
  });
  Object.entries(panels).forEach(([k, el]) => {
    const on = k === key;
    el.classList.toggle("is-active", on);
  });
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => activateTab(tab.id));
});

document.addEventListener("click", function (e) {
  const flightBtn = e.target.closest(".flight-group__toggle");
  if (flightBtn) {
    e.preventDefault();
    const open = flightBtn.getAttribute("aria-expanded") === "true";
    flightBtn.setAttribute("aria-expanded", open ? "false" : "true");
    const det = flightBtn.nextElementSibling;
    if (det && det.classList.contains("flight-group__details")) det.hidden = open;
    return;
  }
  const inclBtn = e.target.closest(".price-inclusion__toggle");
  if (!inclBtn) return;
  e.preventDefault();
  const inclOpen = inclBtn.getAttribute("aria-expanded") === "true";
  inclBtn.setAttribute("aria-expanded", inclOpen ? "false" : "true");
  const panelId = inclBtn.getAttribute("aria-controls");
  const panel = panelId ? document.getElementById(panelId) : null;
  if (panel) panel.hidden = inclOpen;
});

const overlay = document.getElementById("modal-overlay");
const modalClose = document.getElementById("modal-close");
const reserveForm = document.getElementById("reserve-form");
const modalSuccess = document.getElementById("modal-success");
const modalError = document.getElementById("modal-error");

function openModal() {
  overlay.hidden = false;
  overlay.classList.add("is-open");
  document.body.classList.add("modal-open");
  modalSuccess.classList.remove("is-visible");
  if (modalError) {
    modalError.classList.remove("is-visible");
    modalError.textContent = "";
  }
  reserveForm.style.display = "block";
  reserveForm.reset();
  document.getElementById("reserve-guests").value = "1";
  populateReserveTourSelect();
  populateReservePaymentSelect();
  const tourSel = document.getElementById("reserve-tour");
  renderReserveAddons(tourSel ? tourSel.value : currentTour);
}
function closeModal() {
  overlay.classList.remove("is-open");
  document.body.classList.remove("modal-open");
  setTimeout(() => {
    overlay.hidden = true;
  }, 300);
}

document.getElementById("open-reserve").addEventListener("click", openModal);
const openReserveTml = document.getElementById("open-reserve-tml");
if (openReserveTml) openReserveTml.addEventListener("click", openModal);
const reserveTourSel = document.getElementById("reserve-tour");
if (reserveTourSel) {
  reserveTourSel.addEventListener("change", function () {
    renderReserveAddons(reserveTourSel.value);
  });
}
modalClose.addEventListener("click", closeModal);
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closeModal();
});

reserveForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  if (!reserveForm.checkValidity()) {
    reserveForm.reportValidity();
    return;
  }
  const name = document.getElementById("reserve-name").value.trim();
  const email = document.getElementById("reserve-email").value.trim();
  const phone = document.getElementById("reserve-phone").value.trim();
  const guests = document.getElementById("reserve-guests").value;
  const tour = document.getElementById("reserve-tour").value;
  const payment = document.getElementById("reserve-payment").value;
  const paymentLabel = getPaymentLabel(payment);
  const message = document.getElementById("reserve-message").value.trim();
  const addons = getSelectedReserveAddons();
  const checkedBaggage = document.getElementById("reserve-checked-baggage")?.checked || false;
  const submitBtn = document.getElementById("reserve-submit-btn");
  const lang = L();
  if (submitBtn) submitBtn.disabled = true;
  if (modalError) {
    modalError.classList.remove("is-visible");
    modalError.textContent = "";
  }
  try {
    await sendInquiryEmail({
      subject:
        (lang === "en" ? "gezeceyik Booking — " : "gezeceyik Rezervasyon — ") + name,
      name: name,
      email: email,
      phone: phone,
      message: buildReserveMessage({
        name: name,
        email: email,
        phone: phone,
        guests: guests,
        tour: tour,
        paymentLabel: paymentLabel,
        checkedBaggage: checkedBaggage,
        addons: addons,
        message: message
      })
    });
  reserveForm.style.display = "none";
  modalSuccess.classList.add("is-visible");
  } catch (err) {
    if (modalError) {
      modalError.textContent =
        err.message ||
        (lang === "en"
          ? "Could not send. Please try again or email " + INQUIRY_EMAIL
          : "Gönderilemedi. Tekrar deneyin veya " + INQUIRY_EMAIL + " adresine yazın.");
      modalError.classList.add("is-visible");
    }
  }
  if (submitBtn) submitBtn.disabled = false;
});

document.addEventListener("click", (e) => {
  const chatWidgetEl = document.getElementById("chatWidget");
  if (
    chatWidgetEl &&
    chatWidgetEl.classList.contains("active") &&
    !chatWidgetEl.contains(e.target)
  ) {
    toggleChat();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (departureModal && departureModal.classList.contains("is-open")) {
    closeDepartureModal();
    return;
  }
  if (dayModalEl && !dayModalEl.hidden && dayModalEl.classList.contains("is-open")) {
    closeDayModal();
    return;
  }
  if (overlay.classList.contains("is-open")) closeModal();
  const chatWidgetEscape = document.getElementById("chatWidget");
  if (chatWidgetEscape && chatWidgetEscape.classList.contains("active")) {
    toggleChat();
  }
});

const landingEl = document.getElementById("landing");
const tourFullEl = document.getElementById("tour-full");
const openTourBtn = document.getElementById("open-tour-detail");
const openBackpackingBtn = document.getElementById("open-tour-backpacking");
const backLandingBtn = document.getElementById("back-to-landing");
const siteBrand = document.getElementById("site-brand");

const openTomorrowlandBtn = document.getElementById("open-tomorrowland-detail");
const departureModal = document.getElementById("departure-modal");
const departureClose = document.getElementById("departure-close");
const departurePortSelect = document.getElementById("departure-port-select");

try {
  const savedPort = localStorage.getItem('gezeceyik-departure');
  if (savedPort === 'ercan' || savedPort === 'larnaca' || savedPort === 'helsinki' || savedPort === 'istanbul' || savedPort === 'london' || savedPort === 'berlin' || savedPort === 'amsterdam') {
    currentDeparturePort = savedPort;
  }
} catch (e) {}

function openDepartureModal(hash) {
  pendingTourHash = hash;
  if (!departureModal) {
    navigateToTourHash(hash);
    return;
  }
  departureModal.hidden = false;
  requestAnimationFrame(function () {
    departureModal.classList.add('is-open');
  });
  document.body.classList.add('departure-open');
}

function closeDepartureModal() {
  if (!departureModal) return;
  departureModal.classList.remove('is-open');
  document.body.classList.remove('departure-open');
  setTimeout(function () {
    if (!departureModal.classList.contains('is-open')) departureModal.hidden = true;
  }, 280);
  pendingTourHash = null;
}

function setDeparturePort(port) {
  currentDeparturePort = normalizeDeparturePort(port);
  try { localStorage.setItem('gezeceyik-departure', currentDeparturePort); } catch (e) {}
  if (departurePortSelect) departurePortSelect.value = currentDeparturePort;
}

function navigateToTourHash(hash) {
  if (location.hash !== hash) history.pushState(null, '', hash);
  syncViewFromHash();
  window.scrollTo(0, 0);
}

function confirmDepartureAndOpen(port) {
  const hash = pendingTourHash;
  setDeparturePort(port);
  closeDepartureModal();
  if (hash) navigateToTourHash(hash);
}

if (departureModal) {
  departureModal.querySelectorAll('.departure-option').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      confirmDepartureAndOpen(btn.getAttribute('data-port'));
    });
  });
  if (departureClose) departureClose.addEventListener('click', closeDepartureModal);
  departureModal.addEventListener('click', function (e) {
    if (e.target === departureModal) closeDepartureModal();
  });
}

if (departurePortSelect) {
  departurePortSelect.addEventListener('change', function () {
    setDeparturePort(departurePortSelect.value);
    updateTourMeta();
    renderTimeline(L());
    fillLists();
  });
}

document.addEventListener("click", function (e) {
  const modeBtn = e.target.closest("[data-pricing-mode]");
  if (!modeBtn || !modeBtn.classList.contains("price-mode__option")) return;
  const mode = modeBtn.getAttribute("data-pricing-mode");
  if (mode === "shared" && modeBtn.closest("#pricing-mode-wrap") && !supportsCouplePricing(currentTour)) return;
  e.preventDefault();
  setPricingMode(mode);
});

function syncViewFromHash() {
  const hash = location.hash;
  const isBackpacking = hash === "#tur-backpacking";
  const isComfort = hash === "#tur";
  const isTml = hash === "#tomorrowland";
  const showTour = isBackpacking || isComfort || isTml;

  if (isTml) currentTour = "tomorrowland";
  else if (isBackpacking) currentTour = "backpacking";
  else currentTour = "phuket";

  landingEl.hidden = showTour;
  tourFullEl.hidden = !showTour;
  backLandingBtn.hidden = !showTour;
  if (openBackpackingBtn) openBackpackingBtn.setAttribute("aria-expanded", isBackpacking ? "true" : "false");
  openTourBtn.setAttribute("aria-expanded", isComfort ? "true" : "false");
  if (openTomorrowlandBtn) openTomorrowlandBtn.setAttribute("aria-expanded", isTml ? "true" : "false");
  document.body.classList.toggle("view-tour", showTour);
  document.body.classList.toggle("view-home", !showTour);
  document.body.classList.toggle("tour-detail-page", showTour);
  document.body.classList.toggle("on-detail-page", showTour);
  document.body.classList.toggle("tour-tml", isTml);
  document.body.classList.toggle("tour-backpacking", isBackpacking);

  if (showTour) {
    updateTourMeta();
    renderTimeline(L());
    fillLists();
  }

  document.dispatchEvent(new CustomEvent("gezeceyik-view", { detail: { tour: showTour, currentTour: currentTour } }));
}

if (openBackpackingBtn) {
  openBackpackingBtn.addEventListener("click", function (e) {
    e.preventDefault();
    openDepartureModal("#tur-backpacking");
  });
}

openTourBtn.addEventListener("click", function (e) {
  e.preventDefault();
  openDepartureModal("#tur");
});

if (openTomorrowlandBtn) {
  openTomorrowlandBtn.addEventListener("click", function (e) {
    e.preventDefault();
    openDepartureModal("#tomorrowland");
  });
}

backLandingBtn.addEventListener("click", () => {
  if (location.hash) {
    history.pushState(null, "", location.pathname + location.search);
  }
  syncViewFromHash();
  window.scrollTo(0, 0);
});

siteBrand.addEventListener("click", (e) => {
  if (!tourFullEl.hidden) {
    e.preventDefault();
    if (location.hash) {
      history.pushState(null, "", location.pathname + location.search);
    }
    syncViewFromHash();
    window.scrollTo(0, 0);
  }
});

window.addEventListener("popstate", () => {
  syncViewFromHash();
  window.scrollTo(0, 0);
});

// Tomorrowland modal removed — package now uses full detail page (#tomorrowland hash).
(function removeTmlModal() {
  const overlay = document.getElementById("tomorrowland-modal");
  if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
})();

// Initial render — sync route first so price matrix visibility matches view
syncPricingModeButtons();
syncViewFromHash();
updateTourMeta();
renderTimeline(L());
fillLists();

/* ─── i18n: TR / EN language switcher ─────────────────────────────── */
function applyTranslations() {
  const lang = L();
  document.documentElement.lang = lang === "en" ? "en" : "tr";
  document.title =
    lang === "en"
      ? "Gezeceyik | Phuket & Bangkok Tours — Kıbrıslı Gezgin"
      : "Gezeceyik | Phuket & Bangkok Turları — Kıbrıslı Gezgin";
  const metaDesc = document.getElementById("meta-description");
  if (metaDesc) {
    metaDesc.setAttribute(
      "content",
      lang === "en"
        ? "Thailand tours with Kıbrıslı Gezgin: Phuket, Bangkok and Tomorrowland. Backpacking and comfort packages with flights and hotels. Request a booking quote."
        : "Kıbrıslı Gezgin ile Tayland turları: Phuket, Bangkok ve Tomorrowland. Backpacking ve comfort paketler, uçuş ve konaklama dahil. Rezervasyon talebi için hemen inceleyin."
    );
  }
  const ogTitle = document.getElementById("og-title");
  const ogDesc = document.getElementById("og-description");
  const twTitle = document.getElementById("twitter-title");
  const twDesc = document.getElementById("twitter-description");
  if (ogTitle) {
    ogTitle.setAttribute(
      "content",
      lang === "en" ? "Gezeceyik | Phuket & Bangkok Tours" : "Gezeceyik | Phuket & Bangkok Turları"
    );
  }
  if (ogDesc) {
    ogDesc.setAttribute(
      "content",
      lang === "en"
        ? "Thailand tours with Kıbrıslı Gezgin: Phuket, Bangkok and Tomorrowland."
        : "Kıbrıslı Gezgin ile Tayland turları: Phuket, Bangkok ve Tomorrowland."
    );
  }
  if (twTitle) twTitle.setAttribute("content", document.title);
  if (twDesc && metaDesc) twDesc.setAttribute("content", metaDesc.getAttribute("content"));
  // Text content: elements with data-tr + data-en
  document.querySelectorAll("[data-tr][data-en]").forEach(function (el) {
    const v = el.getAttribute("data-" + lang);
    if (v !== null) el.textContent = v;
  });
  // aria-label on decorative tour card images
  document.querySelectorAll("[data-tr-aria-label][data-en-aria-label]").forEach(function (el) {
    const v = el.getAttribute("data-" + lang + "-aria-label");
    if (v !== null) el.setAttribute("aria-label", v);
  });
  // Attribute translation (e.g., placeholder, aria-label)
  document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
    const spec = el.getAttribute("data-i18n-attr");
    const val = el.getAttribute("data-" + lang + "-" + spec);
    if (val !== null) el.setAttribute(spec, val);
  });
  // Re-render tour-specific content (hero, sidebar, timeline, panels) for new language
  if (typeof updateTourMeta === "function") updateTourMeta();
  if (typeof refreshChatPriceSummary === "function") refreshChatPriceSummary();
  if (typeof renderTimeline === "function") renderTimeline(lang);
  if (typeof fillLists === "function") fillLists();
  if (document.getElementById("reserve-tour")) {
    populateReserveTourSelect();
    populateReservePaymentSelect();
    const rTour = document.getElementById("reserve-tour");
    renderReserveAddons(rTour ? rTour.value : currentTour);
  }
  // Notify scripts that render dynamic content
  document.dispatchEvent(new CustomEvent('gezeceyik-lang', { detail: { lang } }));
}
const langSwitchBtn = document.getElementById('lang-switch');
if (langSwitchBtn) {
  langSwitchBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-lang') || 'tr';
    const next = current === 'en' ? 'tr' : 'en';
    document.documentElement.setAttribute('data-lang', next);
    try { localStorage.setItem('gezeceyik-lang', next); } catch (e) {}
    applyTranslations();
  });
}
applyTranslations();
