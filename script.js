// === LUMINA INVITES — MAIN LANDING PAGE SCRIPT ===

document.addEventListener('DOMContentLoaded', () => {

    // --- NAVBAR SCROLL ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // --- MOBILE DRAWER ---
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const drawerClose = document.getElementById('drawerClose');
    const drawerOverlay = document.getElementById('drawerOverlay');
    const drawerLinks = document.querySelectorAll('.drawer-link');

    function openDrawer() { mobileDrawer.classList.add('open'); drawerOverlay.classList.add('active'); }
    function closeDrawer() { mobileDrawer.classList.remove('open'); drawerOverlay.classList.remove('active'); }

    mobileMenuToggle.addEventListener('click', openDrawer);
    drawerClose.addEventListener('click', closeDrawer);
    drawerOverlay.addEventListener('click', closeDrawer);
    drawerLinks.forEach(link => link.addEventListener('click', closeDrawer));

    // --- PARTICLE SYSTEM ---
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        const NUM_PARTICLES = 30;
        for (let i = 0; i < NUM_PARTICLES; i++) {
            const p = document.createElement('div');
            p.classList.add('particle');
            const size = Math.random() * 3 + 1;
            const x = Math.random() * 100;
            const duration = Math.random() * 15 + 10;
            const delay = Math.random() * 15;
            const opacity = Math.random() * 0.5 + 0.2;
            p.style.cssText = `
                width: ${size}px; height: ${size}px;
                left: ${x}%;
                animation-duration: ${duration}s;
                animation-delay: -${delay}s;
                opacity: ${opacity};
            `;
            particlesContainer.appendChild(p);
        }
    }

    // --- TEMPLATE FILTER ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const templateCards = document.querySelectorAll('.template-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            templateCards.forEach(card => {
                const categories = card.dataset.category || '';
                const visible = filter === 'all' || categories.includes(filter);
                card.style.transition = 'opacity 0.3s, transform 0.3s';
                card.style.opacity = visible ? '1' : '0.2';
                card.style.transform = visible ? 'scale(1)' : 'scale(0.95)';
                card.style.pointerEvents = visible ? '' : 'none';
            });
        });
    });

    // --- CONTACT FORM (kirim ke WhatsApp) ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = contactForm.querySelector('input[type=text]').value;
            const phone = contactForm.querySelector('input[type=tel]').value;
            const pkg = contactForm.querySelector('select').value;
            const msg = contactForm.querySelector('textarea').value;
            const wa = `Halo Lumina Invites! 👋\n\nSaya tertarik memesan undangan digital:\n\n📝 *Nama:* ${name}\n📱 *No. HP:* ${phone}\n📦 *Paket:* ${pkg}\n💬 *Pesan:* ${msg}`;
            window.open(`https://wa.me/6281234567890?text=${encodeURIComponent(wa)}`, '_blank');
        });
    }

    // --- SCROLL REVEAL (Sederhana tanpa library) ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.feature-card, .template-card, .pricing-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});
