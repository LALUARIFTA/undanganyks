/* ============================================================
   TEMPLATE: BATAK NAULI — ULTIMATE SCRIPT
   Data-driven via URL parameters | Reference: Midnight Gold
   ============================================================ */

// ─── 1. URL PARAMETER READER ───────────────────────────────
function param(key, fallback = '') {
    return new URLSearchParams(location.search).get(key) || fallback;
}

const D = {
    // Identitas
    groom:          param('groom',          'Togu'),
    bride:          param('bride',          'Butet'),
    groomFull:      param('groomFull',      'Togu Simanjuntak, S.T.'),
    brideFull:      param('brideFull',      'Butet Br. Panggabean, S.H.'),
    groomParent:    param('groomParent',    'Anak ni Bpk. St. Simanjuntak & Ibu Br. Siahaan'),
    brideParent:    param('brideParent',    'Boru ni Bpk. Panggabean & Ibu Br. Hutauruk'),
    groomIg:        param('groomIg',        '@togu_s'),
    brideIg:        param('brideIg',        '@butet_p'),
    // Tanggal & Waktu
    dateDisplay:    param('date',           '10 Oktober 2026'),
    dateFull:       param('dateFull',       'Sabtu, 10 Oktober 2026'),
    // Akad
    akadDate:       param('akadDate',       'Sabtu, 10 Okt 2026'),
    akadTime:       param('akadTime',       '09.00 - 10.30 WIB'),
    akadPlace:      param('akadPlace',      'HKBP Tarutung Kota'),
    akadAddress:    param('akadAddress',    'Jl. Gereja No. 1, Tarutung'),
    akadISO:        param('akadISO',        '2026-10-10T09:00:00'),
    akadMaps:       param('akadMaps',       'HKBP+Tarutung+Kota'),
    // Resepsi
    resepsiDate:    param('resepsiDate',    'Sabtu, 10 Okt 2026'),
    resepsiTime:    param('resepsiTime',    '11.00 - Selesai'),
    resepsiPlace:   param('resepsiPlace',   'Sopo Godang Tarutung'),
    resepsiAddress: param('resepsiAddress', 'Tarutung, Sumatera Utara'),
    resepsiISO:     param('resepsiISO',     '2026-10-10T11:00:00'),
    resepsiMaps:    param('resepsiMaps',    'Sopo+Godang+Tarutung'),
    // Amplop
    bankName:       param('bankName',       'Bank Mandiri'),
    bankAcc:        param('bankAcc',        '123456789012'),
    bankHolder:     param('bankHolder',     'Togu Simanjuntak'),
    // Lain-lain
    wa:             param('wa',             '6281234567890'),
    guest:          param('guest',          'Bapak / Ibu / Saudara/i'),
    sheetsUrl:      param('sheetsUrl',      ''),
    invId:          param('invId',          ''),
    surl:           param('surl',           ''),
    skey:           param('skey',           ''),
};

// ─── 2. DOM SETTER ─────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const setText = (id, val) => { const el=$(id); if(el) el.textContent = val; };

function populateData(){ 
    if(param("music")){const a=$("bgAudio");if(a){a.src=param("music");}}
    
    // --- Image Params ---
    const iParam = (k) => { const v = param(k); return v ? decodeURIComponent(v) : null; };
    const hero = iParam('hero');
    if (hero) {
        document.querySelectorAll('.hero-bg').forEach(e => {
            e.style.backgroundImage = `url("${hero}")`;
        });
    }
    const mPx = document.querySelectorAll('.mempelai-photo img, .profile-photo img, .p-img, .m-img');
    if (mPx.length >= 2) {
        if (iParam('imgPria')) mPx[0].src = iParam('imgPria');
        if (iParam('imgWanita')) mPx[1].src = iParam('imgWanita');
    }

    // Gallery
    const tgImg = document.querySelectorAll('.g-item img');
    for (let i = 1; i <= 6; i++) {
        const u = iParam("gal" + i);
        if(u) {
            if(typeof LB_IMGS !== 'undefined') LB_IMGS[i-1] = u;
            if(tgImg.length >= i && tgImg[i-1]) tgImg[i-1].src = u;
        }
    }

    const couple = `${D.groom} & ${D.bride}`;
    document.title = `Undangan Pernikahan | ${couple}`;

    // Cover
    setText('c-guest',  param('to', D.guest));
    setText('c-couple', couple);
    setText('c-date',   D.dateDisplay);

    // Hero
    setText('hero-names', couple);
    setText('hero-date',  D.dateFull);

    // Profile
    setText('groom-fullname', D.groomFull);
    setText('bride-fullname', D.brideFull);
    setText('groom-parent',   D.groomParent);
    setText('bride-parent',   D.brideParent);
    
    const setIg=(id,h)=>{const e=$(id);if(e&&h){const s=e.querySelector('span')||e;s.textContent=h;if(e.tagName==='A')e.href=`https://instagram.com/${h.replace('@','')}`}};
    setIg('groom-ig',D.groomIg); setIg('bride-ig',D.brideIg);
    
    // Acara
    setText('akad-date',    D.akadDate);
    setText('akad-time',    D.akadTime);
    setText('akad-place',   D.akadPlace);
    setText('akad-address', D.akadAddress);
    setText('resepsi-date',    D.resepsiDate);
    setText('resepsi-time',    D.resepsiTime);
    setText('resepsi-place',   D.resepsiPlace);
    setText('resepsi-address', D.resepsiAddress);
    
    // Story
    for (let i = 1; i <= 4; i++) {
        const t = param(`s${i}t`), d = param(`s${i}d`), desc = param(`s${i}desc`);
        if (t) setText(`s${i}-title`, t);
        if (d) setText(`s${i}-year`, d);
        if (desc) setText(`s${i}-desc`, desc);
    }

    // Gift
    setText('g-bank-name', D.bankName);
    setText('g-bank-acc', D.bankAcc.replace(/(.{4})/g,'$1 ').trim());
    setText('g-bank-holder', `a.n ${D.bankHolder}`);
    document.querySelectorAll('.btn-copy').forEach(b => b.setAttribute('data-copy', D.bankAcc));

    setText('closing-names', couple);
    setText('closing-date',  D.dateDisplay);
}

function initReveal() {
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if(e.isIntersecting) {
                e.target.classList.add('up');
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

function initCountdown() {
    const target = new Date(D.akadISO).getTime();
    setInterval(() => {
        const now = new Date().getTime();
        const diff = target - now;
        if (diff < 0) return;
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        if ($('days')) $('days').innerText = d < 10 ? '0' + d : d;
        if ($('hours')) $('hours').innerText = h < 10 ? '0' + h : h;
        if ($('minutes')) $('minutes').innerText = m < 10 ? '0' + m : m;
        if ($('seconds')) $('seconds').innerText = s < 10 ? '0' + s : s;
    }, 1000);
}

function initBottomNav() {
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.bn-item');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(s => {
            const top = s.offsetTop;
            if(pageYOffset >= top - 200) current = s.getAttribute('id');
        });
        navItems.forEach(item => {
            item.classList.remove('active');
            if(item.getAttribute('href').substring(1) === current) item.classList.add('active');
        });
        
        // Scroll Progress
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        const bar = $('scrollBar');
        if (bar) bar.style.width = scrolled + "%";
    });
}

const LB_IMGS = [
    'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200',
    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1200',
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=1200',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=1200',
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1200'
];
window.openLb = (i) => { const lb=$('lightbox'); const img=$('lb-img'); img.src=LB_IMGS[i]; lb.style.display='flex'; };
window.closeLb = () => { $('lightbox').style.display='none'; };

function toast(msg, dur=2800) {
    const el = $('toast');
    if(!el) return;
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), dur);
}

document.addEventListener('DOMContentLoaded', () => {
    populateData();
    initReveal();
    initCountdown();
    initBottomNav();

    const cover = $('cover'), main = $('main'), btn = $('btn-open'), audio = $('bgAudio');
    btn?.addEventListener('click', () => {
        cover.classList.add('away');
        main.classList.remove('hidden');
        audio?.play().catch(()=>{});
        setTimeout(() => { cover.style.display='none'; }, 1500);
    });

    const icon = $('audioIcon');
    const disc = document.querySelector('.audio-disc');
    $('audioBtn')?.addEventListener('click', () => {
        if(audio.paused) { 
            audio.play(); 
            icon.className='fa-solid fa-music'; 
            disc.classList.remove('paused');
        } else { 
            audio.pause(); 
            icon.className='fa-solid fa-volume-xmark'; 
            disc.classList.add('paused');
        }
    });

    $('btn-akad-maps')?.addEventListener('click', () => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(D.akadMaps.replace(/\+/g,' '))}`, '_blank'));
    $('btn-resepsi-maps')?.addEventListener('click', () => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(D.resepsiMaps.replace(/\+/g,' '))}`, '_blank'));
    
    // Copy Rekening
    document.querySelectorAll('.btn-copy').forEach(b => {
        b.addEventListener('click', () => {
            const num = b.getAttribute('data-copy');
            navigator.clipboard.writeText(num).then(() => toast('✅ Berhasil disalin'));
        });
    });

    // RSVP WhatsApp
    const btnWa = $('btn-wa');
    if(btnWa) {
        btnWa.addEventListener('click', () => {
            const name = $('rsvp-name').value.trim();
            if(!name){ toast('⚠️ Mohon isi nama Anda'); return; }
            const att = document.querySelector('input[name="att"]:checked').value;
            const text = `Horas! Saya ${name} mengkonfirmasi kehadiran: ${att}\n\nUcapan: ${$('rsvp-msg').value}`;
            window.open(`https://wa.me/${D.wa}?text=${encodeURIComponent(text)}`, '_blank');
        });
    }

    // Cloud RSVP Support
    if (D.invId && D.surl && D.skey) {
        btnWa?.addEventListener('click', async (e) => {
            const name = $('rsvp-name').value.trim();
            if (!name) return;
            const att = document.querySelector('input[name="att"]:checked').value;
            try {
                await fetch(`${D.surl}/rest/v1/rsvp`, {
                    method: 'POST',
                    headers: { 'apikey': D.skey, 'Authorization': `Bearer ${D.skey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ invitation_id: D.invId, name: name, attendance: att, message: $('rsvp-msg').value })
                });
            } catch (err) { console.error(err); }
        });
    }
});
