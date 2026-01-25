// Country data
const countryData = {
    spain: {
        title: 'İspanya',
        location: 'Barcelona',
        badge: 'Nisan - Mayıs',
        image: 'barcelona.jpg',
        description: 'Barcelona, İspanya\'nın en büyüleyici şehirlerinden biri. Akdeniz\'in kıyısında yer alan bu şehir, mimarisi, kültürü ve yaşam tarzıyla ziyaretçilerini büyülüyor. Antoni Gaudí\'nin eserlerinden, güzel plajlarına, lezzetli mutfağından canlı gece hayatına kadar her şeyi keşfedeceğiz.',
        highlights: [
            { icon: '🏛️', text: 'Sagrada Familia ve Park Güell ziyareti' },
            { icon: '🏖️', text: 'Akdeniz kıyısında plaj aktiviteleri' },
            { icon: '🍷', text: 'Yerel şaraplar ve tapas deneyimi' },
            { icon: '🎨', text: 'Picasso Müzesi ve sanat galerileri' },
            { icon: '⚽', text: 'Camp Nou stadyum turu' },
            { icon: '🌃', text: 'Canlı gece hayatı ve eğlence' }
        ]
    },
    vietnam: {
        title: 'Vietnam',
        location: 'Güneydoğu Asya',
        badge: 'Haziran',
        image: 'vietnam.jpg',
        description: 'Vietnam, zengin tarihi, muhteşem doğası ve lezzetli mutfağıyla Güneydoğu Asya\'nın en çekici destinasyonlarından biri. Hanoi\'den Ho Chi Minh\'e, Ha Long Bay\'den Mekong Deltası\'na kadar bu büyüleyici ülkeyi birlikte keşfedeceğiz.',
        highlights: [
            { icon: '🚣', text: 'Ha Long Bay tekne turu' },
            { icon: '🏮', text: 'Geleneksel pagodalar ve tapınaklar' },
            { icon: '🍜', text: 'Pho ve diğer yerel lezzetler' },
            { icon: '🏍️', text: 'Motorsiklet turları' },
            { icon: '🌾', text: 'Pirinç tarlaları ve kırsal yaşam' },
            { icon: '🛍️', text: 'Geleneksel pazarlar ve alışveriş' }
        ]
    },
    cambodia: {
        title: 'Kamboçya',
        location: 'Güneydoğu Asya',
        badge: 'Temmuz',
        image: 'cambodia.jpg',
        description: 'Kamboçya, antik tapınakları ve zengin kültürel mirasıyla büyüleyici bir ülke. Angkor Wat\'ın görkemli yapılarından, başkent Phnom Penh\'in canlı sokaklarına, Tonlé Sap Gölü\'nün yüzen köylerinden geleneksel dans gösterilerine kadar unutulmaz bir deneyim bizi bekliyor.',
        highlights: [
            { icon: '🏛️', text: 'Angkor Wat kompleksi ziyareti' },
            { icon: '🌅', text: 'Gün doğumu ve gün batımı manzaraları' },
            { icon: '🛶', text: 'Tonlé Sap Gölü tekne turu' },
            { icon: '🕉️', text: 'Budist tapınakları ve manastırlar' },
            { icon: '💃', text: 'Geleneksel Apsara dans gösterileri' },
            { icon: '🍛', text: 'Kamboçya mutfağı ve yerel lezzetler' }
        ]
    },
    thailand: {
        title: 'Tayland',
        location: 'Güneydoğu Asya',
        badge: 'Ağustos',
        image: 'thailand.png',
        description: 'Tayland, tropikal cenneti, egzotik kültürü ve sıcakkanlı insanlarıyla dünyanın en popüler turizm destinasyonlarından biri. Bangkok\'un canlı sokaklarından, Phuket\'in muhteşem plajlarına, Chiang Mai\'nin mistik atmosferinden geleneksel masaj ve spa deneyimlerine kadar her şeyi keşfedeceğiz.',
        highlights: [
            { icon: '🏖️', text: 'Tropikal plajlar ve ada turları' },
            { icon: '🐘', text: 'Fil bakım merkezleri ziyareti' },
            { icon: '🍲', text: 'Tay mutfağı ve sokak yemekleri' },
            { icon: '🛕', text: 'Altın tapınaklar ve Budist manastırlar' },
            { icon: '💆', text: 'Geleneksel Thai masajı' },
            { icon: '🌴', text: 'Tropikal ormanlar ve doğa yürüyüşleri' }
        ]
    }
};

// DOM Elements
const destinationCards = document.querySelectorAll('.destination-card');
const modal = document.getElementById('countryModal');
const modalClose = document.querySelector('.modal-close');
const modalOverlay = document.querySelector('.modal-overlay');
const modalTitle = document.getElementById('modalTitle');
const modalLocation = document.getElementById('modalLocation');
const modalBadge = document.getElementById('modalBadge');
const modalImg = document.getElementById('modalImg');
const modalDescription = document.getElementById('modalDescription');
const modalHighlights = document.getElementById('modalHighlights');

// Open modal function
function openModal(country) {
    const data = countryData[country];
    if (!data) return;

    // Set modal content
    modalTitle.textContent = data.title;
    modalLocation.textContent = data.location;
    modalBadge.textContent = data.badge;
    modalImg.src = data.image;
    modalImg.alt = data.title;
    modalDescription.textContent = data.description;

    // Create highlights
    modalHighlights.innerHTML = '';
    data.highlights.forEach(highlight => {
        const highlightItem = document.createElement('div');
        highlightItem.className = 'highlight-item';
        highlightItem.innerHTML = `
            <span style="font-size: 24px;">${highlight.icon}</span>
            <span>${highlight.text}</span>
        `;
        modalHighlights.appendChild(highlightItem);
    });

    // Show modal with animation
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal function
function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Event listeners for cards
destinationCards.forEach(card => {
    card.addEventListener('click', () => {
        const country = card.getAttribute('data-country');
        openModal(country);
    });

    // Add hover effect
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Close modal events
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.05)';
    }
    
    lastScroll = currentScroll;
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe destination cards
destinationCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(card);
});

// FAQ accordion
const accordion = document.querySelector('[data-accordion]');
if (accordion) {
    const items = Array.from(accordion.querySelectorAll('.faq-item'));

    function closeItem(item) {
        const btn = item.querySelector('.faq-question');
        const panel = item.querySelector('.faq-answer');
        if (!btn || !panel) return;

        item.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        panel.setAttribute('aria-hidden', 'true');
        panel.style.maxHeight = '0px';
    }

    function openItem(item) {
        const btn = item.querySelector('.faq-question');
        const panel = item.querySelector('.faq-answer');
        if (!btn || !panel) return;

        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        panel.setAttribute('aria-hidden', 'false');
        panel.style.maxHeight = `${panel.scrollHeight}px`;
    }

    items.forEach((item) => {
        const btn = item.querySelector('.faq-question');
        const panel = item.querySelector('.faq-answer');
        if (!btn || !panel) return;

        // initialize closed
        closeItem(item);

        btn.addEventListener('click', () => {
            const isOpen = item.classList.contains('is-open');
            items.forEach(closeItem);
            if (!isOpen) openItem(item);
        });
    });

    // Recompute open panel height on resize
    window.addEventListener('resize', () => {
        items.forEach((item) => {
            if (!item.classList.contains('is-open')) return;
            const panel = item.querySelector('.faq-answer');
            if (!panel) return;
            panel.style.maxHeight = `${panel.scrollHeight}px`;
        });
    });
}

// Logo click to scroll to top
document.querySelector('.logo').addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

