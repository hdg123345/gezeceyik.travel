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
  
  window.location.href = `mailto:gezeceyik@gmail.com?subject=${subject}&body=${body}`;
  
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
      "💰 Phuket & Bangkok: İstanbul kalkış 1.700 €, Ercan kalkış 1.850 € (TL karşılığı tur sayfasında). Tomorrowland: 2.300 € / 2.450 €. Detaylı bilgi ister misiniz?",
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
        "mailto:gezeceyik@gmail.com?subject=Tayland%20Turu%20Hakkinda&body=Merhaba%2C%20Tayland%20turu%20hakkinda%20bilgi%20almak%20istiyorum.";
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
