// Country data
const countryData = {
    spain: {
        title: 'İspanya',
        location: 'Barcelona',
        badge: 'Nisan - Mayıs',
        image: 'barcelona.jpg',
        description: 'İspanya, Akdeniz’in enerjisi, tarihi dokusu ve zengin kültürüyle keşfedilmeyi bekleyen bir ülke. Madrid’in tarihi sarayları ve kültürel merkezleri, Barselona’nın modernist mimarisi ve canlı plajları, Sevilla’nın Endülüs havası ve Granada’nın Alhambra’sı gibi şehirler, her köşede unutulmaz deneyimler sunuyor. Valencia’nın renkli festivalleri ve sahilleri, Toledo’nun tarihi sokakları ve Bilbao’nun modern sanat müzeleri, İspanya’yı hem kültürel hem de doğal güzellikleriyle dolu bir keşif rotasına dönüştürüyor.',
        highlights: [
            { icon: '🏛️', text: 'Tarihi yapılar, kaleler ve modernist mimari' },
            { icon: '🌊', text: 'Akdeniz ve Atlantik sahillerinde plaj keyfi' },
            { icon: '🍷', text: 'Tapas, paella ve bölgesel İspanyol mutfağı' },
            { icon: '🎨', text: 'Sanat galerileri ve kültürel etkinlikler' },
            { icon: '⛪', text: 'Gotik mahalleler ve etkileyici katedraller' },
            { icon: '🚴', text: 'Şehir ve kırsal turları, bisikletle keşif' }
        ]
    },
    vietnam: {
        title: 'Vietnam',
        location: 'Güneydoğu Asya',
        badge: 'Haziran',
        image: 'vietnam.jpg',
        description: 'Doğu’nun mistik havasını ve canlı kültürünü hissettiren Vietnam, nefes kesen doğal güzellikleri, tarihi şehirleri ve zengin mutfağıyla keşfedilmeyi bekliyor. Hanoi’nin tarihi sokaklarından Ha Long Körfezi’nin büyüleyici manzaralarına, Hoi An’ın renkli evlerinden tropikal sahillere kadar unutulmaz bir yolculuk sizi bekliyor.',
        highlights: [
            { icon: '🌊', text: 'Ha Long Körfezi tekne turları ve doğal güzellikler' },
            { icon: '🏯', text: 'Hanoi ve Ho Chi Minh şehir turu' },
            { icon: '🍲', text: 'Vietnam sokak yemekleri ve pho deneyimi' },
            { icon: '🏝️', text: 'Tropikal plajlar ve ada keşifleri' },
            { icon: '🎨', text: 'Hoi An’ın renkli tarihi sokakları ve el sanatları' },
            { icon: '🚲', text: 'Bisiklet turları ve kırsal köy gezileri' }
        ]
    },
    cambodia: {
        title: 'Kamboçya',
        location: 'Güneydoğu Asya',
        badge: 'Temmuz',
        image: 'cambodia.jpg',
        description: 'Tarihin derin izlerini taşıyan Kamboçya, antik tapınakları, mistik kültürü ve tropikal doğasıyla benzersiz bir yolculuk sunuyor. Angkor Wat’ın görkeminden Phnom Penh’in canlı şehir yaşamına, Tonle Sap Gölü’nün huzurundan kırsal köylerin samimiyetine kadar keşfedilecek çok şey var.',
        highlights: [
            { icon: '🛕', text: 'Angkor Wat ve antik tapınaklar keşfi' },
            { icon: '🌿', text: 'Tropikal ormanlar ve doğa yürüyüşleri' },
            { icon: '🏞️', text: 'Tonle Sap Gölü ve su köyleri turu' },
            { icon: '🍲', text: 'Kamboçya mutfağı ve sokak lezzetleri' },
            { icon: '🏘️', text: 'Kırsal köyler ve yerel yaşam deneyimi' },
            { icon: '🎨', text: 'Phnom Penh kültürel turu ve sanat keşfi' }
        ]
    },
    thailand: {
        title: 'Tayland',
        location: 'Güneydoğu Asya',
        badge: 'Ağustos - Eylül',
        image: 'thailand.png',
        description: 'Tropikal cenneti, egzotik kültürü ve sıcakkanlı insanlarıyla Tayland, unutulmaz bir keşif rotası sunuyor. Bangkok’un canlı sokaklarından, Phuket’in bembeyaz plajlarına; Chiang Mai’nin mistik atmosferinden geleneksel masaj ve spa deneyimlerine kadar her adımda farklı bir deneyim yaşayacaksınız.',
        highlights: [
            { icon: '🏖️', text: 'Tropikal plajlar ve ada turları' },
            { icon: '🐘', text: 'Fil bakım merkezleri ziyareti' },
            { icon: '🍲', text: 'Tay mutfağı ve sokak yemekleri' },
            { icon: '🛕', text: 'Altın tapınaklar ve Budist manastırlar' },
            { icon: '💆', text: 'Geleneksel Thai masajı ve spa deneyimi' },
            { icon: '🌴', text: 'Tropikal ormanlar ve doğa yürüyüşleri' }
        ]
    },
    indonesia: {
        title: 'Endonezya',
        location: 'Bali',
        badge: 'Ekim',
        image: 'bali.jpg',
        description: 'Endonezya, binlerce adası, tropikal plajları, ormanları ve zengin kültürüyle keşfedilmeyi bekleyen bir cennet. Bali’nin huzurlu sahilleri ve Ubud’un pirinç tarlaları, Cakarta’nın canlı şehir hayatı, Yogyakarta’nın tarihi tapınakları ve Sumatra ile Sulawesi’nin doğal güzellikleri, her adımda unutulmaz deneyimler sunuyor.',
        highlights: [
            { icon: '🏖️', text: 'Tropikal plajlar ve su sporları' },
            { icon: '🌴', text: 'Tropikal ormanlar ve doğa yürüyüşleri' },
            { icon: '🛕', text: 'Tapınaklar ve kültürel ritüeller' },
            { icon: '💆', text: 'Yoga, spa ve wellness deneyimleri' },
            { icon: '🍲', text: 'Endonezya mutfağı ve sokak lezzetleri' },
            { icon: '🏄', text: 'Sörf ve macera aktiviteleri' }
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
        closeNavMenu();
    });
});

// Mobil menü (hamburger)
const navToggle = document.querySelector('.nav-toggle');
const navBackdrop = document.querySelector('.nav-backdrop');
const navLinks = document.querySelector('.nav-links');

function openNavMenu() {
    document.body.classList.add('nav-open');
    if (navToggle) {
        navToggle.classList.add('is-open');
        navToggle.setAttribute('aria-expanded', 'true');
        navToggle.setAttribute('aria-label', 'Menüyü kapat');
    }
    if (navBackdrop) navBackdrop.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
}

function closeNavMenu() {
    document.body.classList.remove('nav-open');
    if (navToggle) {
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Menüyü aç/kapat');
    }
    if (navBackdrop) navBackdrop.classList.remove('is-visible');
    document.body.style.overflow = '';
}

if (navToggle) {
    navToggle.addEventListener('click', () => {
        if (document.body.classList.contains('nav-open')) {
            closeNavMenu();
        } else {
            openNavMenu();
        }
    });
}

if (navBackdrop) {
    navBackdrop.addEventListener('click', closeNavMenu);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
        closeNavMenu();
    }
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

// Contact tabs
const contactTabsRoot = document.querySelector('[data-contact-tabs]');
if (contactTabsRoot) {
    const tabs = Array.from(contactTabsRoot.querySelectorAll('[data-contact-tab]'));
    const panels = Array.from(contactTabsRoot.querySelectorAll('[data-contact-panel]'));

    function setActive(name) {
        tabs.forEach((t) => {
            const isActive = t.getAttribute('data-contact-tab') === name;
            t.classList.toggle('is-active', isActive);
            t.setAttribute('aria-selected', isActive ? 'true' : 'false');
            t.tabIndex = isActive ? 0 : -1;
        });

        panels.forEach((p) => {
            const isActive = p.getAttribute('data-contact-panel') === name;
            p.classList.toggle('is-active', isActive);
            if (isActive) p.removeAttribute('hidden');
            else p.setAttribute('hidden', '');
        });
    }

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const name = tab.getAttribute('data-contact-tab');
            if (!name) return;
            setActive(name);
        });

        tab.addEventListener('keydown', (e) => {
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
            e.preventDefault();
            const currentIndex = tabs.indexOf(tab);
            const dir = e.key === 'ArrowRight' ? 1 : -1;
            const nextIndex = (currentIndex + dir + tabs.length) % tabs.length;
            tabs[nextIndex]?.focus();
            const nextName = tabs[nextIndex]?.getAttribute('data-contact-tab');
            if (nextName) setActive(nextName);
        });
    });

    // init
    setActive('whatsapp');
}

// Logo click to scroll to top
document.querySelector('.logo').addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

