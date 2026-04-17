/* ============================================================
   TEMPLATE: MIDNIGHT GOLD — SCRIPT
   Data-driven via URL parameters | All features included
   ============================================================ */

// ─── 1. URL PARAMETER READER ───────────────────────────────
function param(key, fallback = '') {
    return new URLSearchParams(location.search).get(key) || fallback;
}

const D = {
    // Identitas
    groom:          param('groom',          'Romeo'),
    bride:          param('bride',          'Juliet'),
    groomFull:      param('groomFull',      'Romeo Montague, S.T.'),
    brideFull:      param('brideFull',      'Juliet Capulet, S.H.'),
    groomParent:    param('groomParent',    'Putra dari Bpk. Montague & Ibu Montague'),
    brideParent:    param('brideParent',    'Putri dari Bpk. Capulet & Ibu Capulet'),
    groomIg:        param('groomIg',        '@romeo_m'),
    brideIg:        param('brideIg',        '@juliet_c'),
    // Tanggal & Waktu
    dateDisplay:    param('date',           '25 Desember 2026'),
    dateFull:       param('dateFull',       'Jumat, 25 Desember 2026'),
    // Akad
    akadDate:       param('akadDate',       'Jumat, 25 Desember 2026'),
    akadTime:       param('akadTime',       '08.00 – 10.00 WIB'),
    akadPlace:      param('akadPlace',      'Masjid Agung Verona'),
    akadAddress:    param('akadAddress',    'Jl. Cinta Damai No.1, Italia'),
    akadISO:        param('akadISO',        '2026-12-25T08:00:00'),
    akadMaps:       param('akadMaps',       'Masjid+Agung+Jakarta'),
    // Resepsi
    resepsiDate:    param('resepsiDate',    'Jumat, 25 Desember 2026'),
    resepsiTime:    param('resepsiTime',    '11.00 – Selesai WIB'),
    resepsiPlace:   param('resepsiPlace',   'Grand Verona Ballroom'),
    resepsiAddress: param('resepsiAddress', 'Jl. Cinta Damai No.10, Italia'),
    resepsiISO:     param('resepsiISO',     '2026-12-25T11:00:00'),
    resepsiMaps:    param('resepsiMaps',    'Ritz+Carlton+Jakarta'),
    // Amplop
    bankName:       param('bankName',       'Bank BCA'),
    bankAcc:        param('bankAcc',        '1234567890'),
    bankHolder:     param('bankHolder',     'Romeo Montague'),
    // Lain-lain
    wa:             param('wa',             '6281234567890'),
    guest:          param('guest',          'Bapak / Ibu / Saudara/i'),
    // Google Sheets & RSVP
    sheetsUrl:      param('sheetsUrl',      ''),
    invId:          param('invId',          ''),
};

// ─── 2. DOM SETTER ─────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const setText = (id, val) => { const el=$(id); if(el) el.textContent = val; };
const setHTML = (id, val) => { const el=$(id); if(el) el.innerHTML = val; };

function populateData() {
    const couple = `${D.groom} & ${D.bride}`;

    // Page title
    document.title = `Undangan Pernikahan | ${couple}`;

    // Cover
    setText('c-guest',  D.guest);
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
    document.querySelectorAll('.profile-socials a').forEach((el, i) => {
        el.querySelector('span') || (el.innerHTML = `<i class="fa-brands fa-instagram"></i> ${i===0?D.groomIg:D.brideIg}`);
    });

    // Acara
    setText('akad-date',    D.akadDate);
    setText('akad-time',    D.akadTime);
    setText('akad-place',   D.akadPlace);
    setText('akad-address', D.akadAddress);
    setText('resepsi-date',    D.resepsiDate);
    setText('resepsi-time',    D.resepsiTime);
    setText('resepsi-place',   D.resepsiPlace);
    setText('resepsi-address', D.resepsiAddress);

    // Maps iframe
    const akadQ    = encodeURIComponent(D.akadMaps.replace(/\+/g,' '));
    const resepsiQ = encodeURIComponent(D.resepsiMaps.replace(/\+/g,' '));
    const iframeA  = $('iframe-akad');
    const iframeR  = $('iframe-resepsi');
    if(iframeA)  iframeA.src  = `https://maps.google.com/maps?q=${akadQ}&output=embed&hl=id&z=15`;
    if(iframeR)  iframeR.src  = `https://maps.google.com/maps?q=${resepsiQ}&output=embed&hl=id&z=15`;

    // Location section info bar
    setText('map-akad-name',    D.akadPlace);
    setText('map-akad-addr',    D.akadAddress);
    setText('map-resepsi-name', D.resepsiPlace);
    setText('map-resepsi-addr', D.resepsiAddress);

    // Amplop
    setText('g-bank-name',   D.bankName);
    setText('g-bank-acc',    D.bankAcc.replace(/(.{4})/g,'$1 ').trim());
    setText('g-bank-holder', `a.n. ${D.bankHolder}`);
    const copyBtn = $('btn-copy-acc');
    if(copyBtn) copyBtn.dataset.copy = D.bankAcc;

    // Penutup
    setText('closing-names', couple);
    setText('closing-date',  D.dateDisplay);
    // Our Story
    for (let i = 1; i <= 4; i++) {
        const t    = param(`s${i}t`);
        const d    = param(`s${i}d`);
        const desc = param(`s${i}desc`);
        if (t)    setText(`s${i}-title`, t);
        if (d)    setText(`s${i}-year`,  d);
        if (desc) setText(`s${i}-desc`,  desc);
    }

    // RSVP — Show Sheets button if sheetsUrl is configured
    const sheetsUrl = D.sheetsUrl;
    const sheetsBtn = document.getElementById('btn-send-sheets');
    if (sheetsBtn && sheetsUrl) sheetsBtn.style.display = 'flex';
}


// ─── 3. COVER OPENER ───────────────────────────────────────
function initCover() {
    const cover   = $('cover');
    const main    = $('main');
    const btnOpen = $('btn-open');
    const bgMusic = $('bgMusic');

    // Animate cover BG
    setTimeout(() => cover?.classList.add('loaded'), 100);

    // Spawn particles
    const pc = $('coverParticles');
    if(pc) {
        for(let i=0; i<25; i++) {
            const p = document.createElement('div');
            p.classList.add('c-particle');
            const s = Math.random()*2+1;
            p.style.cssText = `width:${s}px;height:${s}px;left:${Math.random()*100}%;
                animation-duration:${Math.random()*15+10}s;
                animation-delay:-${Math.random()*15}s;`;
            pc.appendChild(p);
        }
    }

    btnOpen?.addEventListener('click', () => {
        cover.classList.add('slide-away');
        main.classList.remove('hidden');
        bgMusic?.play().catch(()=>{});
        setTimeout(() => { cover.style.display='none'; }, 1500);
        // Trigger scroll reveal for first visible elements
        setTimeout(triggerReveal, 300);
    });
}


// ─── 4. SCROLL PROGRESS BAR ────────────────────────────────
function initScrollProgress() {
    const bar = $('scrollProgress');
    if(!bar || !$('main')) return;
    window.addEventListener('scroll', () => {
        const total = document.body.scrollHeight - innerHeight;
        bar.style.width = `${(scrollY / total) * 100}%`;
    }, {passive:true});
}


// ─── 5. SCROLL REVEAL ──────────────────────────────────────
function triggerReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if(entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('visible'), i * 80);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}


// ─── 6. COUNTDOWN TIMERS ───────────────────────────────────
function runCountdown(isoStr, ids) {
    function tick() {
        const diff = new Date(isoStr) - new Date();
        if(diff <= 0) {
            ids.forEach(({id}) => { const e=document.getElementById(id); if(e) e.textContent='00'; });
            return;
        }
        const d = Math.floor(diff/86400000);
        const h = Math.floor((diff%86400000)/3600000);
        const m = Math.floor((diff%3600000)/60000);
        const s = Math.floor((diff%60000)/1000);
        const vals = [d,h,m,s];
        ids.forEach(({id},i) => { const e=document.getElementById(id); if(e) e.textContent=String(vals[i]).padStart(2,'0'); });
    }
    tick();
    setInterval(tick, 1000);
}

function initCountdowns() {
    runCountdown(D.akadISO,    [{id:'ak-d'},{id:'ak-h'},{id:'ak-m'},{id:'ak-s'}]);
    runCountdown(D.resepsiISO, [{id:'rs-d'},{id:'rs-h'},{id:'rs-m'},{id:'rs-s'}]);
}


// ─── 7. MAPS BUTTONS ───────────────────────────────────────
function initMaps() {
    // Location tab switcher
    document.querySelectorAll('.loc-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.loc-tab').forEach(b=>b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.map-tab-content').forEach(t=>t.classList.remove('active'));
            const target = $(`map-tab-${btn.dataset.tab}`);
            if(target) target.classList.add('active');
        });
    });

    // Maps open navigation buttons
    $('btn-maps-akad')?.addEventListener('click', () => {
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(D.akadMaps.replace(/\+/g,' '))}`, '_blank');
    });
    $('btn-maps-resepsi')?.addEventListener('click', () => {
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(D.resepsiMaps.replace(/\+/g,' '))}`, '_blank');
    });

    // Maps btn on event cards
    document.querySelectorAll('.maps-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const q = encodeURIComponent((btn.dataset.place||'').replace(/\+/g,' '));
            window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
        });
    });
}


// ─── 8. SAVE TO CALENDAR ───────────────────────────────────
function initCalendar() {
    document.querySelectorAll('.cal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const isAkad = btn.dataset.field === 'akad';
            const start  = (isAkad ? D.akadISO : D.resepsiISO).replace(/[-:]/g,'').replace('T','T').slice(0,15);
            const title  = encodeURIComponent(`${isAkad?'Akad Nikah':'Resepsi'} ${D.groom} & ${D.bride}`);
            const place  = encodeURIComponent(isAkad ? D.akadPlace : D.resepsiPlace);
            const end    = start; // same day
            window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${start}&location=${place}`, '_blank');
        });
    });
}


// ─── 9. GALLERY LIGHTBOX ───────────────────────────────────
const GALLERY_IMGS = [
    'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=1200&auto=format&fit=crop',
];
let lbIndex = 0;

window.openLightbox = function(idx) {
    lbIndex = idx;
    const lb = $('lightbox');
    const img = $('lb-img');
    const counter = $('lb-counter');
    if(!lb||!img) return;
    img.src = GALLERY_IMGS[idx];
    if(counter) counter.textContent = `${idx+1} / ${GALLERY_IMGS.length}`;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
};
window.closeLightbox = function() {
    const lb = $('lightbox');
    if(lb) lb.classList.remove('open');
    document.body.style.overflow = '';
};
window.lbNav = function(dir) {
    lbIndex = (lbIndex + dir + GALLERY_IMGS.length) % GALLERY_IMGS.length;
    openLightbox(lbIndex);
};
document.addEventListener('keydown', (e) => {
    if(!$('lightbox')?.classList.contains('open')) return;
    if(e.key==='ArrowLeft')  lbNav(-1);
    if(e.key==='ArrowRight') lbNav(1);
    if(e.key==='Escape')     closeLightbox();
});


// ─── 10. GIFT TABS ────────────────────────────────────────
function initGiftTabs() {
    document.querySelectorAll('.gift-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.gift-tab').forEach(t=>t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.gift-panel').forEach(p=>p.classList.remove('active'));
            $(`gpanel-${tab.dataset.gtab}`)?.classList.add('active');
        });
    });
    // Copy rekening
    document.querySelectorAll('[data-copy]').forEach(btn => {
        btn.addEventListener('click', () => {
            navigator.clipboard.writeText(btn.dataset.copy).then(() => toast('✅ Nomor rekening berhasil disalin!'));
        });
    });
}


// ─── 11. RSVP ─────────────────────────────────────────────
function initRsvp() {
    const collect = () => ({
        name:       $('rsvp-name')?.value.trim(),
        hadir:      document.querySelector('input[name="rsvp-attend"]:checked')?.value || '-',
        msg:        $('rsvp-msg')?.value.trim() || '',
    });

    // WhatsApp button
    $('btn-send-rsvp')?.addEventListener('click', () => {
        const { name, hadir, msg } = collect();
        if (!name) { toast('⚠️ Silakan isi nama Anda terlebih dahulu'); return; }
        const text = `✉️ *RSVP & Ucapan Pernikahan*\n📌 ${D.groom} & ${D.bride} (${D.dateDisplay})\n\n👤 *Nama:* ${name}\n📅 *Kehadiran:* ${hadir}\n💬 *Ucapan:* ${msg || '(tidak ada pesan)'}\n\n_Dikirim dari undangan digital_`;
        window.open(`https://wa.me/${D.wa}?text=${encodeURIComponent(text)}`, '_blank');
    });

    // Google Sheets button
    $('btn-send-sheets')?.addEventListener('click', () => {
        const { name, hadir, msg } = collect();
        if (!name) { toast('⚠️ Silakan isi nama Anda terlebih dahulu'); return; }
        if (!D.sheetsUrl) { toast('⚠️ URL Google Sheets belum dikonfigurasi'); return; }

        const payload = {
            invId:      D.invId,
            couple:     `${D.groom} & ${D.bride}`,
            name,
            attendance: hadir,
            message:    msg,
            guest:      D.guest,
        };

        // Send to Google Apps Script (no-cors — fire and forget)
        fetch(D.sheetsUrl, {
            method: 'POST',
            mode:   'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
        .then(() => {
            const successEl = $('rsvp-success');
            if (successEl) successEl.style.display = 'block';
            if ($('rsvp-name'))  $('rsvp-name').value  = '';
            if ($('rsvp-msg'))   $('rsvp-msg').value   = '';
            toast('✅ RSVP berhasil dikirim ke Google Sheets!');
        })
        .catch(() => {
            toast('✅ Terkirim! (cek koneksi jika tidak muncul di Sheets)');
        });
    });
}


// ─── 12. AUDIO PLAYER ─────────────────────────────────────
function initAudio() {
    const music  = $('bgMusic');
    const disc   = $('audioDisc');
    const icon   = $('audioIcon');
    const toggle = $('audioToggle');
    const bar    = $('audioBar');

    if(!music||!toggle) return;

    toggle.addEventListener('click', () => {
        if(music.paused) {
            music.play();
            disc?.classList.remove('paused');
            if(icon) icon.className='fa-solid fa-pause';
        } else {
            music.pause();
            disc?.classList.add('paused');
            if(icon) icon.className='fa-solid fa-play';
        }
    });

    // Update progress bar
    music.addEventListener('timeupdate', () => {
        if(!music.duration) return;
        const pct = (music.currentTime / music.duration) * 100;
        if(bar) bar.style.width = pct + '%';
    });
}


// ─── 13. BOTTOM NAV (SCROLL SPY) ──────────────────────────
function initBottomNav() {
    const navItems = document.querySelectorAll('.bn-item');
    const sections = document.querySelectorAll('.inv-section[id]');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(sec => {
            if(scrollY >= sec.offsetTop - 200) current = sec.id;
        });
        navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.section === current);
        });
    }, {passive:true});

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById(item.dataset.section);
            if(target) target.scrollIntoView({behavior:'smooth'});
        });
    });
}


// ─── 14. TOAST ─────────────────────────────────────────────
function toast(msg, dur=2800) {
    const el = $('toast');
    if(!el) return;
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), dur);
}


// ─── 15. INIT ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    populateData();
    initCover();
    initScrollProgress();
    initCountdowns();
    initMaps();
    initCalendar();
    initGiftTabs();
    initRsvp();
    initAudio();
    initBottomNav();
});
