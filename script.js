// PAGE NAVIGATION
function showTourPage() {
  document.getElementById('homepage').style.display = 'none';
  document.getElementById('tourpage').style.display = 'block';
  document.getElementById('world-map').style.display = 'none';
  window.scrollTo(0, 0);
}

function showHomepage() {
  document.getElementById('tourpage').style.display = 'none';
  document.getElementById('homepage').style.display = 'block';
  document.getElementById('world-map').style.display = 'block';
  window.scrollTo(0, 0);
}

// CONTACT FORM
function handleContactSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const name = form.name.value;
  const phone = form.phone.value;
  const email = form.email.value;
  const message = form.message.value;
  
  const subject = encodeURIComponent('gezeceyik - İletişim');
  const body = encodeURIComponent(
    `İsim: ${name}\nTelefon: ${phone}\nE-posta: ${email}\n\nMesaj:\n${message}`
  );
  
  window.location.href = `mailto:gezeceyik1travel@gmail.com?subject=${subject}&body=${body}`;
  
  form.style.display = 'none';
  document.getElementById('formSuccess').style.display = 'block';
}

// WORLD MAP WITH D3.JS
const svg = d3.select("#world-map");
const width = window.innerWidth;
const height = window.innerHeight;

svg.attr("viewBox", `0 0 ${width} ${height}`);

const projection = d3.geoNaturalEarth1()
  .scale(width / 6.3)
  .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);
const tooltip = document.getElementById('country-tooltip');

function drawCityRouteLayer() {
  const istanbulCoords = projection([28.9784, 41.0082]);
  const bangkokCoords = projection([100.5018, 13.7563]);
  if (
    !istanbulCoords ||
    !bangkokCoords ||
    !isFinite(istanbulCoords[0]) ||
    !isFinite(bangkokCoords[0])
  ) {
    return;
  }

  const flightPath = d3.path();
  flightPath.moveTo(istanbulCoords[0], istanbulCoords[1]);
  const midX = (istanbulCoords[0] + bangkokCoords[0]) / 2;
  const midY = (istanbulCoords[1] + bangkokCoords[1]) / 2 - 50;
  flightPath.quadraticCurveTo(midX, midY, bangkokCoords[0], bangkokCoords[1]);

  let layer = svg.select('g.city-route-layer');
  if (layer.empty()) {
    layer = svg.append('g').attr('class', 'city-route-layer');
    layer
      .append('circle')
      .attr('r', 6)
      .attr('fill', '#E76F51')
      .attr('class', 'city-marker istanbul-marker');
    layer
      .append('text')
      .attr('class', 'city-label istanbul-city-label')
      .text('İstanbul');
    layer
      .append('circle')
      .attr('r', 6)
      .attr('fill', '#2D5F5D')
      .attr('class', 'city-marker bangkok-marker');
    layer
      .append('text')
      .attr('class', 'city-label bangkok-city-label')
      .text('Bangkok');
    layer
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', '#E76F51')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('opacity', 0.6)
      .attr('class', 'istanbul-bangkok-flight');
  }

  layer
    .select('.istanbul-marker')
    .attr('cx', istanbulCoords[0])
    .attr('cy', istanbulCoords[1]);
  layer
    .select('.bangkok-marker')
    .attr('cx', bangkokCoords[0])
    .attr('cy', bangkokCoords[1]);
  layer
    .select('.istanbul-city-label')
    .attr('x', istanbulCoords[0] + 12)
    .attr('y', istanbulCoords[1] - 8);
  layer
    .select('.bangkok-city-label')
    .attr('x', bangkokCoords[0] + 12)
    .attr('y', bangkokCoords[1] + 4);
  layer.select('.istanbul-bangkok-flight').attr('d', flightPath.toString());
}

// Ocean background
svg.append("rect")
  .attr("class", "ocean")
  .attr("width", width)
  .attr("height", height);

// Load world map data
d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
  .then(world => {
    const countries = topojson.feature(world, world.objects.countries).features;
    
    svg.selectAll("path.country")
      .data(countries)
      .enter().append("path")
      .attr("class", d => {
        if (d.properties.name === "Thailand") return "country thailand";
        return "country";
      })
      .attr("d", path)
      .on("mousemove", function(event, d) {
        // Check element under cursor
        const elementUnderCursor = document.elementFromPoint(event.clientX, event.clientY);
        
        // ONLY hide tooltip when over .tour-card
        const isOverTourCard = elementUnderCursor && elementUnderCursor.closest('.tour-card');
        
        if (isOverTourCard) {
          tooltip.classList.remove('visible');
          return;
        }
        
        // Show tooltip everywhere else
        tooltip.textContent = d.properties.name;
        tooltip.style.left = (event.clientX + 15) + 'px';
        tooltip.style.top = (event.clientY + 15) + 'px';
        tooltip.classList.add('visible');
      })
      .on("mouseleave", function() {
        tooltip.classList.remove('visible');
      });

    drawCityRouteLayer();
  })
  .catch(err => console.error('Map load error:', err));

// Resize handler
window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  svg.attr("viewBox", `0 0 ${w} ${h}`);
  projection.scale(w / 6.3).translate([w / 2, h / 2]);
  svg.selectAll("path.country").attr("d", path);
  svg.select(".ocean").attr("width", w).attr("height", h);
  drawCityRouteLayer();
});

// Interactive help chat widget (see index.html for duplicate when page uses inline scripts only)
const chatFlow = {
  start: {
    message: "Merhaba! 👋 Size nasıl yardımcı olabiliriz?",
    options: [
      { text: "🌴 Tur hakkında bilgi", next: "tour" },
      { text: "💰 Fiyat ve ödeme", next: "price" },
      { text: "✈️ Uçuş ve konaklama", next: "flight" },
      { text: "📅 Rezervasyon yapmak", next: "reservation" },
      { text: "❓ Diğer sorular", next: "other" }
    ]
  },
  tour: {
    message: "Tayland turumuz hakkında neyi merak ediyorsunuz?",
    options: [
      { text: "📍 Hangi şehirler geziliyor?", next: "tourCities" },
      { text: "🗓️ Tur tarihleri", next: "tourDates" },
      { text: "👥 Kaç kişilik grup?", next: "tourGroup" },
      { text: "📋 Detaylı program", next: "tourProgram" }
    ]
  },
  tourCities: {
    message:
      "Tur kapsamında Phuket (3 gece) ve Bangkok (3 gece) ziyaret ediliyor. Phi Phi Adaları, James Bond Adası, Grand Palace ve Yaowarat dahil 15+ aktivite var.",
    options: [
      { text: "Daha fazla bilgi al", next: "contact" },
      { text: "← Geri dön", next: "tour" }
    ]
  },
  tourDates: {
    message: "🗓️ Tur tarihleri: 2 - 10 Aralık 2026 (7 gece 8 gün) - Aralık ara tatili döneminde.",
    options: [
      { text: "Rezervasyon yap", next: "reservation" },
      { text: "← Geri dön", next: "tour" }
    ]
  },
  tourGroup: {
    message: "👥 Türkiye ve Kıbrıs'tan toplam 10 kişilik özel grup turu. Sınırlı kontenjan!",
    options: [
      { text: "Yer ayırt", next: "reservation" },
      { text: "← Geri dön", next: "tour" }
    ]
  },
  tourProgram: {
    message: "Detaylı 8 günlük program tur sayfasında bulunuyor. Tur kartına tıklayarak inceleyebilirsiniz.",
    options: [
      { text: "Daha fazla soru sor", next: "contact" },
      { text: "← Geri dön", next: "tour" }
    ]
  },
  price: {
    message:
      "💰 Backpacking style 1.090 €, Comfort 1.690 €, Luxury (Tomorrowland) 2.390 € kişi başı ’dan itibaren.\n\nℹ️ Gösterilen fiyatlar değişebilir; kesin konaklama ve uçuş bilgileri rezervasyon / tur teyidinde paylaşılır. Bagaj, vergi ve benzeri küçük ek ücretler ayrıca yansıyabilir.\n\nDetaylı bilgi ister misiniz?",
    options: [
      { text: "Fiyata neler dahil?", next: "priceIncludes" },
      { text: "Ödeme seçenekleri", next: "paymentOptions" },
      { text: "← Ana menü", next: "start" }
    ]
  },
  priceIncludes: {
    message:
      "✅ Fiyata dahil: Uçak biletleri (gidiş-dönüş), 6 gece otel konaklaması, kahvaltılar, tüm transferler, rehberlik ve aktiviteler.",
    options: [
      { text: "Detayları konuş", next: "contact" },
      { text: "← Geri dön", next: "price" }
    ]
  },
  paymentOptions: {
    message: "💳 Taksit ve ödeme seçenekleri için bizimle iletişime geçin - size özel çözümler sunalım.",
    options: [
      { text: "İletişime geç", next: "contact" },
      { text: "← Geri dön", next: "price" }
    ]
  },
  flight: {
    message: "✈️ Uçuş ve konaklama detayları:",
    options: [
      { text: "🛫 Uçuş bilgileri", next: "flightDetails" },
      { text: "🏨 Otel detayları", next: "hotelDetails" },
      { text: "← Ana menü", next: "start" }
    ]
  },
  flightDetails: {
    message:
      "Qatar Airways ile Doha aktarmalı İstanbul-Phuket, Thai AirAsia ile Phuket-Bangkok, Türk Hava Yolları ile Bangkok-İstanbul.",
    options: [
      { text: "Daha fazla soru", next: "contact" },
      { text: "← Geri dön", next: "flight" }
    ]
  },
  hotelDetails: {
    message:
      "🏨 Phuket'te Thanthip Beach Resort (4★) ve Bangkok'ta Solitaire Sukhumvit 11 (4★) - her ikisi de merkezi konumda.",
    options: [
      { text: "Daha fazla soru", next: "contact" },
      { text: "← Geri dön", next: "flight" }
    ]
  },
  reservation: {
    message: "📅 Rezervasyon için bize ulaşın - sizinle birebir ilgilenelim. Hangi kanalı tercih edersiniz?",
    options: [
      { text: "📧 E-posta gönder", action: "email" },
      { text: "📱 Instagram'dan yaz", action: "instagram" },
      { text: "← Ana menü", next: "start" }
    ]
  },
  other: {
    message: "Başka bir sorunuz var mı? Doğrudan bize ulaşın, hemen dönüş yapalım.",
    options: [
      { text: "📧 E-posta gönder", action: "email" },
      { text: "📱 Instagram'dan yaz", action: "instagram" },
      { text: "← Ana menü", next: "start" }
    ]
  },
  contact: {
    message: "Sizinle birebir konuşalım! Hangi kanalı tercih edersiniz?",
    options: [
      { text: "📧 E-posta gönder", action: "email" },
      { text: "📱 Instagram'dan yaz", action: "instagram" },
      { text: "← Ana menü", next: "start" }
    ]
  }
};

let chatHistory = [];

function toggleChat() {
  const widget = document.getElementById("chatWidget");
  const chatIcon = document.getElementById("chatIcon");
  const closeIcon = document.getElementById("closeIcon");
  if (!widget || !chatIcon || !closeIcon) return;

  widget.classList.toggle("active");

  if (widget.classList.contains("active")) {
    chatIcon.style.display = "none";
    closeIcon.style.display = "block";
    if (chatHistory.length === 0) {
      showChatStep("start");
    }
  } else {
    chatIcon.style.display = "block";
    closeIcon.style.display = "none";
  }
}

function showChatStep(stepKey) {
  const step = chatFlow[stepKey];
  if (!step) return;

  const chatBody = document.getElementById("chatBody");
  const chatOptions = document.getElementById("chatOptions");
  const chatBack = document.getElementById("chatBack");
  if (!chatBody || !chatOptions || !chatBack) return;

  const messageDiv = document.createElement("div");
  messageDiv.className = "chat-message";
  messageDiv.textContent = step.message;
  chatBody.appendChild(messageDiv);
  chatBody.scrollTop = chatBody.scrollHeight;

  chatHistory.push(stepKey);

  chatOptions.innerHTML = "";
  step.options.forEach(option => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chat-option";
    if (option.action) btn.classList.add("contact");
    btn.textContent = option.text;
    btn.onclick = () => handleOptionClick(option);
    chatOptions.appendChild(btn);
  });

  chatBack.style.display = chatHistory.length > 1 ? "block" : "none";
}

function handleOptionClick(option) {
  const chatBody = document.getElementById("chatBody");
  if (!chatBody) return;

  const userMsg = document.createElement("div");
  userMsg.className = "chat-message user";
  userMsg.textContent = option.text;
  chatBody.appendChild(userMsg);
  chatBody.scrollTop = chatBody.scrollHeight;

  if (option.action === "email") {
    setTimeout(() => {
      window.location.href =
        "mailto:gezeceyik1travel@gmail.com?subject=Tayland%20Turu%20Hakkinda&body=Merhaba%2C%20Tayland%20turu%20hakkinda%20bilgi%20almak%20istiyorum.";
    }, 400);
  } else if (option.action === "instagram") {
    setTimeout(() => {
      window.open("https://instagram.com/gezeceyik1", "_blank");
    }, 400);
  } else if (option.next) {
    setTimeout(() => showChatStep(option.next), 500);
  }
}

function resetChat() {
  const chatBody = document.getElementById("chatBody");
  if (chatBody) chatBody.innerHTML = "";
  chatHistory = [];
  showChatStep("start");
}

const CURATED_CONFIG = {
  cityBasePrice: {
    amsterdam: 590,
    rotterdam: 540
  },
  pricePerExtraDay: 110,
  addonPrice: 110,
  cityImages: {
    amsterdam: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=1200&auto=format&fit=crop",
    rotterdam: "https://images.unsplash.com/photo-1580996378027-23090c1ef58a?w=1200&auto=format&fit=crop",
    both: "https://images.unsplash.com/photo-1459679749680-18eb1eb37418?w=1200&auto=format&fit=crop"
  },
  cityDetails: {
    amsterdam: {
      title: "Amsterdam",
      subtitle: "Kanallar, müzeler, bisiklet turları"
    },
    rotterdam: {
      title: "Rotterdam",
      subtitle: "Modern mimari, liman, sanat"
    },
    both: {
      title: "Amsterdam & Rotterdam",
      subtitle: "Klasik ve modern Hollanda deneyimi"
    }
  },
  addonsPerCity: {
    amsterdam: [
      { id: "zaandam", emoji: "🏘️", name: "Zaandam", desc: "Tarihi yel değirmenleri" },
      { id: "giethoorn", emoji: "🚣", name: "Giethoorn", desc: "Hollanda'nın Venedik'i" },
      { id: "keukenhof", emoji: "🌷", name: "Keukenhof", desc: "Lale bahçeleri (Mart-Mayıs)" },
      { id: "volendam", emoji: "⚓", name: "Volendam", desc: "Balıkçı köyü ve kostüm" }
    ],
    rotterdam: [
      { id: "kinderdijk", emoji: "💨", name: "Kinderdijk", desc: "UNESCO yel değirmenleri" },
      { id: "delft", emoji: "🎨", name: "Delft", desc: "Vermeer ve Delft çinileri" },
      { id: "denhaag", emoji: "🏛️", name: "Den Haag", desc: "Uluslararası şehir ve sahil" },
      { id: "gouda", emoji: "🧀", name: "Gouda", desc: "Peynir pazarı ve tarih" }
    ]
  }
};

const CURATED_INQUIRY_EMAIL = "gezeceyik1travel@gmail.com";

let selectedCities = ["amsterdam"];
let selectedAddons = [];

function updateCuratedCard() {
  const cityKey = selectedCities.length === 2 ? "both" : selectedCities[0];
  const cityImage = document.getElementById("cityImage");
  const cityTitle = document.getElementById("cityTitle");
  const citySubtitle = document.getElementById("citySubtitle");

  if (cityImage && CURATED_CONFIG.cityImages[cityKey]) {
    cityImage.src = CURATED_CONFIG.cityImages[cityKey];
  }
  if (cityTitle && CURATED_CONFIG.cityDetails[cityKey]) {
    cityTitle.textContent = CURATED_CONFIG.cityDetails[cityKey].title;
  }
  if (citySubtitle && CURATED_CONFIG.cityDetails[cityKey]) {
    citySubtitle.textContent = CURATED_CONFIG.cityDetails[cityKey].subtitle;
  }

  renderAddons();
  updateCuratedSummary();
}

function renderAddons() {
  const grid = document.getElementById("addonsGrid");
  if (!grid) return;

  const addons = [];
  selectedCities.forEach(function (city) {
    if (CURATED_CONFIG.addonsPerCity[city]) {
      CURATED_CONFIG.addonsPerCity[city].forEach(function (addon) {
        if (!addons.find(function (a) {
          return a.id === addon.id;
        })) {
          addons.push(addon);
        }
      });
    }
  });

  const validAddonIds = addons.map(function (a) {
    return a.id;
  });
  selectedAddons = selectedAddons.filter(function (a) {
    return validAddonIds.indexOf(a) !== -1;
  });

  grid.innerHTML = "";
  addons.forEach(function (addon) {
    const isChecked = selectedAddons.indexOf(addon.id) !== -1;
    const label = document.createElement("label");
    label.className = "addon-card";
    label.dataset.addon = addon.id;
    label.innerHTML =
      '<input type="checkbox" ' +
      (isChecked ? "checked" : "") +
      "/>" +
      '<div class="addon-content">' +
      '<span class="addon-emoji">' +
      addon.emoji +
      "</span>" +
      "<div>" +
      '<span class="addon-name">' +
      addon.name +
      "</span>" +
      '<span class="addon-desc">' +
      addon.desc +
      "</span>" +
      "</div>" +
      '<span class="addon-price">+€' +
      CURATED_CONFIG.addonPrice +
      "</span>" +
      "</div>";

    const input = label.querySelector("input");
    input.addEventListener("change", function () {
      if (input.checked) {
        if (selectedAddons.indexOf(addon.id) === -1) selectedAddons.push(addon.id);
      } else {
        const idx = selectedAddons.indexOf(addon.id);
        if (idx !== -1) selectedAddons.splice(idx, 1);
      }
      updateCuratedSummary();
    });

    grid.appendChild(label);
  });
}

function updateCuratedSummary() {
  const basePrice = selectedCities.reduce(function (sum, city) {
    return sum + (CURATED_CONFIG.cityBasePrice[city] || 0);
  }, 0);
  const cityBasePrice = selectedCities.length === 2 ? Math.round(basePrice * 0.85) : basePrice;
  const addonsPrice = selectedAddons.length * CURATED_CONFIG.addonPrice;
  const total = cityBasePrice + addonsPrice;

  const cityName =
    selectedCities.length === 2
      ? "Amsterdam + Rotterdam"
      : selectedCities[0] === "amsterdam"
        ? "Amsterdam"
        : "Rotterdam";

  const summaryCityEl = document.getElementById("summaryCity");
  const summaryDaysEl = document.getElementById("summaryDays");
  const addonsRow = document.getElementById("summaryAddonsRow");
  const addonsSummary = document.getElementById("summaryAddons");
  const totalEl = document.getElementById("summaryTotal");

  if (summaryCityEl) summaryCityEl.textContent = cityName;

  if (summaryDaysEl) summaryDaysEl.textContent = "€" + cityBasePrice;

  const allAddons = [].concat(
    CURATED_CONFIG.addonsPerCity.amsterdam || [],
    CURATED_CONFIG.addonsPerCity.rotterdam || []
  );
  const addonNameMap = {};
  allAddons.forEach(function (a) {
    addonNameMap[a.id] = a.name;
  });

  if (addonsRow && addonsSummary) {
    if (selectedAddons.length === 0) {
      addonsRow.style.display = "none";
      addonsSummary.textContent = "";
    } else {
      const names = selectedAddons
        .map(function (a) {
          return addonNameMap[a] || a;
        })
        .join(", ");
      addonsSummary.textContent = names + " · €" + addonsPrice;
      addonsRow.style.display = "flex";
    }
  }

  if (totalEl) totalEl.textContent = "€" + total;
}

document.querySelectorAll(".city-btn").forEach(function (btn) {
  btn.addEventListener("click", function (e) {
    e.preventDefault();
    const city = btn.dataset.city;
    const input = btn.querySelector("input");
    const idx = selectedCities.indexOf(city);

    if (idx !== -1) {
      if (selectedCities.length === 1) return;
      selectedCities.splice(idx, 1);
      btn.classList.remove("active");
      if (input) input.checked = false;
    } else {
      selectedCities.push(city);
      btn.classList.add("active");
      if (input) input.checked = true;
    }

    updateCuratedCard();
  });
});

const startDateInput = document.getElementById("tripStartDate");
const endDateInput = document.getElementById("tripEndDate");
if (startDateInput && endDateInput) {
  const today = new Date();
  today.setDate(today.getDate() + 14);
  const minDate = today.toISOString().split("T")[0];
  startDateInput.min = minDate;
  endDateInput.min = minDate;

  startDateInput.addEventListener("change", function () {
    if (startDateInput.value) {
      endDateInput.min = startDateInput.value;
      if (endDateInput.value && endDateInput.value < startDateInput.value) {
        endDateInput.value = startDateInput.value;
      }
    }
  });
}

function reserveCurated() {
  const startDate = document.getElementById("tripStartDate").value;
  const endDate = document.getElementById("tripEndDate").value;
  const formatDate = function (d) {
    return new Date(d + "T12:00:00").toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };
  const dateText =
    startDate && endDate
      ? formatDate(startDate) + " - " + formatDate(endDate)
      : startDate
        ? formatDate(startDate) + " tarihinden itibaren"
        : "Esnek";

  const cityName =
    selectedCities.length === 2
      ? "Amsterdam + Rotterdam"
      : selectedCities[0] === "amsterdam"
        ? "Amsterdam"
        : "Rotterdam";

  const allAddons = [].concat(
    CURATED_CONFIG.addonsPerCity.amsterdam || [],
    CURATED_CONFIG.addonsPerCity.rotterdam || []
  );
  const addonNameMap = {};
  allAddons.forEach(function (a) {
    addonNameMap[a.id] = a.name;
  });

  const addonNames =
    selectedAddons.length > 0
      ? selectedAddons
          .map(function (a) {
            return addonNameMap[a] || a;
          })
          .join(", ")
      : "Yok";

  const basePrice = selectedCities.reduce(function (sum, city) {
    return sum + (CURATED_CONFIG.cityBasePrice[city] || 0);
  }, 0);
  const cityBasePrice = selectedCities.length === 2 ? Math.round(basePrice * 0.85) : basePrice;
  const addonsPrice = selectedAddons.length * CURATED_CONFIG.addonPrice;
  const total = cityBasePrice + addonsPrice;

  const subject = encodeURIComponent("Hollanda Turu - Rezervasyon Talebi");
  const body = encodeURIComponent(
    "Merhaba,\n\nHollanda turu için rezervasyon talebi:\n\n" +
      "📍 Destinasyon: " +
      cityName +
      "\n" +
      "📅 Tarih: " +
      dateText +
      "\n" +
      "➕ Ekstra Turlar: " +
      addonNames +
      "\n\n" +
      "💰 Tahmini Toplam: €" +
      total +
      "\n\n" +
      "Detaylı program ve kesin fiyat için lütfen dönüş yapınız.\n\nTeşekkürler."
  );

  window.location.href = "mailto:" + CURATED_INQUIRY_EMAIL + "?subject=" + subject + "&body=" + body;
}

const curatedReserveBtn = document.getElementById("curatedReserveBtn");
if (curatedReserveBtn) curatedReserveBtn.addEventListener("click", reserveCurated);

updateCuratedCard();

document.querySelectorAll(".date-field").forEach((field) => {
  field.addEventListener("click", (e) => {
    const input = field.querySelector(".date-input");
    if (input && e.target !== input) {
      if (typeof input.showPicker === "function") {
        try {
          input.showPicker();
        } catch (err) {
          input.focus();
          input.click();
        }
      } else {
        input.focus();
        input.click();
      }
    }
  });
});

document.querySelectorAll(".date-input").forEach((input) => {
  input.addEventListener("click", function (e) {
    if (typeof this.showPicker === "function") {
      try {
        this.showPicker();
      } catch (err) {
        // Ignore errors
      }
    }
  });

  input.addEventListener("focus", function () {
    if (typeof this.showPicker === "function") {
      try {
        this.showPicker();
      } catch (err) {
        // Ignore errors
      }
    }
  });
});
