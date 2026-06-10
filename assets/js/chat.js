// Bilingual chat flow — each text has both TR and EN values
const chatFlow_tr = {
  start: { message: "Merhaba! 👋 Size nasıl yardımcı olabiliriz?",
    options: [
      { text: "🌴 Tur hakkında bilgi", next: "tour" },
      { text: "💰 Fiyat ve ödeme", next: "price" },
      { text: "✈️ Uçuş ve konaklama", next: "flight" },
      { text: "📅 Rezervasyon yapmak", next: "reservation" },
      { text: "❓ Diğer sorular", next: "other" }
    ] },
  tour: { message: "Tayland turumuz hakkında neyi merak ediyorsunuz?",
    options: [
      { text: "📍 Hangi şehirler geziliyor?", next: "tourCities" },
      { text: "🗓️ Tur tarihleri", next: "tourDates" },
      { text: "👥 Kaç kişilik grup?", next: "tourGroup" },
      { text: "📋 Detaylı program", next: "tourProgram" }
    ] },
  tourCities: { message: "Tur kapsamında Phuket (3 gece) ve Bangkok (3 gece) ziyaret ediliyor. Phi Phi, James Bond, Khao Sok ve Bangkok şehir turları pakete dahil değildir; programda opsiyonel olarak gösterilir.",
    options: [ { text: "Daha fazla bilgi al", next: "contact" }, { text: "← Geri dön", next: "tour" } ] },
  tourDates: { message: "🗓️ Tur tarihleri: 2 - 11 Aralık 2026 (9 gece 10 gün) - Aralık ara tatili döneminde.",
    options: [ { text: "Rezervasyon yap", next: "reservation" }, { text: "← Geri dön", next: "tour" } ] },
  tourGroup: { message: "👥 Türkiye ve Kıbrıs'tan toplam 10 kişilik özel grup turu. Sınırlı kontenjan!",
    options: [ { text: "Yer ayırt", next: "reservation" }, { text: "← Geri dön", next: "tour" } ] },
  tourProgram: { message: "Detaylı 10 günlük program tur sayfasında bulunuyor. Tur kartına tıklayarak inceleyebilirsiniz.",
    options: [ { text: "Daha fazla soru sor", next: "contact" }, { text: "← Geri dön", next: "tour" } ] },
  price: { message: "",
    options: [ { text: "Fiyata neler dahil?", next: "priceIncludes" }, { text: "Ödeme seçenekleri", next: "paymentOptions" }, { text: "← Ana menü", next: "start" } ] },
  priceIncludes: { message: "✅ Fiyata dahil: Uçak biletleri (gidiş-dönüş), konaklama, kahvaltılar, transferler ve rehberlik. Phi Phi, James Bond, Khao Sok ve Bangkok şehir turları dahil değildir.\n\nℹ️ Gösterilen fiyatlar değişebilir; kesin konaklama ve uçuş detayları rezervasyon sonrası paylaşılır. Bagaj ve vergi gibi küçük ek ücretler ayrıca olabilir.",
    options: [ { text: "Detayları konuş", next: "contact" }, { text: "← Geri dön", next: "price" } ] },
  paymentOptions: { message: "💳 Taksit ve ödeme seçenekleri için bizimle iletişime geçin - size özel çözümler sunalım.",
    options: [ { text: "İletişime geç", next: "contact" }, { text: "← Geri dön", next: "price" } ] },
  flight: { message: "✈️ Uçuş ve konaklama detayları:",
    options: [ { text: "🛫 Uçuş bilgileri", next: "flightDetails" }, { text: "🏨 Otel detayları", next: "hotelDetails" }, { text: "← Ana menü", next: "start" } ] },
  flightDetails: { message: "Qatar Airways ile Doha aktarmalı İstanbul-Phuket, Thai AirAsia ile Phuket-Bangkok, Türk Hava Yolları ile Bangkok-İstanbul.",
    options: [ { text: "Daha fazla soru", next: "contact" }, { text: "← Geri dön", next: "flight" } ] },
  hotelDetails: { message: "🏨 Phuket'te Thanthip Beach Resort (4★) ve Bangkok'ta Solitaire Sukhumvit 11 (4★) - her ikisi de merkezi konumda.",
    options: [ { text: "Daha fazla soru", next: "contact" }, { text: "← Geri dön", next: "flight" } ] },
  reservation: { message: "📅 Rezervasyon için bize ulaşın - sizinle birebir ilgilenelim. Hangi kanalı tercih edersiniz?",
    options: [ { text: "📧 E-posta gönder", action: "email" }, { text: "💬 WhatsApp", action: "whatsapp" }, { text: "📱 Instagram'dan yaz", action: "instagram" }, { text: "← Ana menü", next: "start" } ] },
  other: { message: "Başka bir sorunuz var mı? Doğrudan bize ulaşın, hemen dönüş yapalım.",
    options: [ { text: "📧 E-posta gönder", action: "email" }, { text: "💬 WhatsApp", action: "whatsapp" }, { text: "📱 Instagram'dan yaz", action: "instagram" }, { text: "← Ana menü", next: "start" } ] },
  contact: { message: "Sizinle birebir konuşalım! Hangi kanalı tercih edersiniz?",
    options: [ { text: "📧 E-posta gönder", action: "email" }, { text: "💬 WhatsApp", action: "whatsapp" }, { text: "📱 Instagram'dan yaz", action: "instagram" }, { text: "← Ana menü", next: "start" } ] }
};

const chatFlow_en = {
  start: { message: "Hi! 👋 How can we help you?",
    options: [
      { text: "🌴 About the tour", next: "tour" },
      { text: "💰 Price & payment", next: "price" },
      { text: "✈️ Flights & accommodation", next: "flight" },
      { text: "📅 Make a reservation", next: "reservation" },
      { text: "❓ Other questions", next: "other" }
    ] },
  tour: { message: "What would you like to know about our Thailand tour?",
    options: [
      { text: "📍 Which cities?", next: "tourCities" },
      { text: "🗓️ Tour dates", next: "tourDates" },
      { text: "👥 Group size?", next: "tourGroup" },
      { text: "📋 Detailed program", next: "tourProgram" }
    ] },
  tourCities: { message: "The tour covers Phuket (3 nights) and Bangkok (3 nights). Phi Phi, James Bond Island, Khao Sok and Bangkok city tours are not included; they are shown as optional in the program.",
    options: [ { text: "Get more info", next: "contact" }, { text: "← Back", next: "tour" } ] },
  tourDates: { message: "🗓️ Tour dates: 2 – 11 December 2026 (9 nights 10 days) — during the December mid-term break.",
    options: [ { text: "Book now", next: "reservation" }, { text: "← Back", next: "tour" } ] },
  tourGroup: { message: "👥 Private group of 10 people from Turkey and Cyprus. Limited capacity!",
    options: [ { text: "Reserve a spot", next: "reservation" }, { text: "← Back", next: "tour" } ] },
  tourProgram: { message: "The detailed 10-day program is on the tour page. Click the tour card to view it.",
    options: [ { text: "Ask more", next: "contact" }, { text: "← Back", next: "tour" } ] },
  price: { message: "",
    options: [ { text: "What's included?", next: "priceIncludes" }, { text: "Payment options", next: "paymentOptions" }, { text: "← Main menu", next: "start" } ] },
  priceIncludes: { message: "✅ Included: Round-trip flights, accommodation, breakfasts, transfers and guiding. Phi Phi, James Bond Island, Khao Sok and Bangkok city tours are not included.\n\nℹ️ Prices may change; exact accommodation and flights are confirmed upon booking. Extra baggage, taxes and similar minor charges may apply.",
    options: [ { text: "Discuss details", next: "contact" }, { text: "← Back", next: "price" } ] },
  paymentOptions: { message: "💳 For installment and payment options, please get in touch — we'll offer tailored solutions.",
    options: [ { text: "Get in touch", next: "contact" }, { text: "← Back", next: "price" } ] },
  flight: { message: "✈️ Flight and accommodation details:",
    options: [ { text: "🛫 Flight info", next: "flightDetails" }, { text: "🏨 Hotel info", next: "hotelDetails" }, { text: "← Main menu", next: "start" } ] },
  flightDetails: { message: "Qatar Airways with Doha layover (Istanbul–Phuket), Thai AirAsia (Phuket–Bangkok), Turkish Airlines (Bangkok–Istanbul).",
    options: [ { text: "More questions", next: "contact" }, { text: "← Back", next: "flight" } ] },
  hotelDetails: { message: "🏨 Thanthip Beach Resort (4★) in Phuket and Solitaire Sukhumvit 11 (4★) in Bangkok — both in central locations.",
    options: [ { text: "More questions", next: "contact" }, { text: "← Back", next: "flight" } ] },
  reservation: { message: "📅 Reach out for booking — we'll personally take care of you. Which channel do you prefer?",
    options: [ { text: "📧 Send email", action: "email" }, { text: "💬 WhatsApp", action: "whatsapp" }, { text: "📱 Message on Instagram", action: "instagram" }, { text: "← Main menu", next: "start" } ] },
  other: { message: "Got another question? Reach out directly — we'll reply quickly.",
    options: [ { text: "📧 Send email", action: "email" }, { text: "💬 WhatsApp", action: "whatsapp" }, { text: "📱 Message on Instagram", action: "instagram" }, { text: "← Main menu", next: "start" } ] },
  contact: { message: "Let's talk one-on-one! Which channel do you prefer?",
    options: [ { text: "📧 Send email", action: "email" }, { text: "💬 WhatsApp", action: "whatsapp" }, { text: "📱 Message on Instagram", action: "instagram" }, { text: "← Main menu", next: "start" } ] }
};

refreshChatPriceSummary();

function chatFlowCur() {
  return document.documentElement.getAttribute('data-lang') === 'en' ? chatFlow_en : chatFlow_tr;
}
// Expose under the original name for backward compat
let chatFlow = chatFlowCur();
document.addEventListener('gezeceyik-lang', () => {
  chatFlow = chatFlowCur();
  // Reset chat panel so it picks up new language strings
  if (typeof resetChat === 'function') {
    try { resetChat(); } catch (e) {}
  }
});

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
  step.options.forEach(function (option) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chat-option";
    if (option.action) btn.classList.add("contact");
    btn.textContent = option.text;
    btn.onclick = function () {
      handleOptionClick(option);
    };
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
    setTimeout(function () {
      window.location.href =
        "mailto:gezeceyik1travel@gmail.com?subject=Tayland%20Turu%20Hakkinda&body=Merhaba%2C%20Tayland%20turu%20hakkinda%20bilgi%20almak%20istiyorum.";
    }, 400);
  } else if (option.action === "instagram") {
    setTimeout(function () {
      window.open("https://instagram.com/gezeceyik1", "_blank");
    }, 400);
  } else if (option.action === "whatsapp") {
    setTimeout(function () {
      window.open("https://wa.me/905338386102", "_blank");
    }, 400);
  } else if (option.next) {
    setTimeout(function () {
      showChatStep(option.next);
    }, 500);
  }
}

function resetChat() {
  const chatBody = document.getElementById("chatBody");
  if (chatBody) chatBody.innerHTML = "";
  chatHistory = [];
  showChatStep("start");
}
