/* ============================================================
   TEMPLATE: JAWA KRATON — script.js
   Data-driven via URL parameters | All features
   ============================================================ */

// ─── 1. URL PARAMS ───────────────────────────────────────────
const param = (k, fb='') => new URLSearchParams(location.search).get(k) || fb;

const D = {
    groom:         param('groom',         'Romeo'),
    bride:         param('bride',         'Juliet'),
    groomFull:     param('groomFull',     'Romeo Montague, S.T.'),
    brideFull:     param('brideFull',     'Juliet Capulet, S.H.'),
    groomParent:   param('groomParent',   'Putra saking Bpk. Montague & Ibu Montague'),
    brideParent:   param('brideParent',   'Putri saking Bpk. Capulet & Ibu Capulet'),
    groomIg:       param('groomIg',       '@romeo_m'),
    brideIg:       param('brideIg',       '@juliet_c'),
    date:          param('date',          '25 Desember 2026'),
    dateFull:      param('dateFull',      'Jumat, 25 Desember 2026'),
    akadDate:      param('akadDate',      'Jumat, 25 Desember 2026'),
    akadTime:      param('akadTime',      '08.00 – 10.00 WIB'),
    akadPlace:     param('akadPlace',     'Masjid Agung'),
    akadAddress:   param('akadAddress',   'Jl. Cinta Damai No.1'),
    akadISO:       param('akadISO',       '2026-12-25T08:00:00'),
    akadMaps:      param('akadMaps',      'Masjid+Agung+Semarang'),
    resepsiDate:   param('resepsiDate',   'Jumat, 25 Desember 2026'),
    resepsiTime:   param('resepsiTime',   '11.00 – Selesai WIB'),
    resepsiPlace:  param('resepsiPlace',  'Gedung Sobokartti'),
    resepsiAddress:param('resepsiAddress','Jl. Cinta Damai No.10'),
    resepsiISO:    param('resepsiISO',    '2026-12-25T11:00:00'),
    resepsiMaps:   param('resepsiMaps',   'Gedung+Sobokartti+Semarang'),
    bankName:      param('bankName',      'Bank BCA'),
    bankAcc:       param('bankAcc',       '1234567890'),
    bankHolder:    param('bankHolder',    'Romeo Montague'),
    wa:            param('wa',            '6281234567890'),
    guest:         param('guest',         'Bapak / Ibu / Saudara/i'),
    sheetsUrl:     param('sheetsUrl',     ''),
    invId:         param('invId',         ''),
};

// ─── 2. DOM HELPERS ──────────────────────────────────────────
const $  = id => document.getElementById(id);
const s  = (id, v) => { const e=$(id); if(e) e.textContent = v; };
const h  = (id, v) => { const e=$(id); if(e) e.innerHTML  = v; };

// ─── 3. POPULATE DATA ────────────────────────────────────────
<<<<<<< HEAD
function populateData(){ if(param("music")){const a=document.getElementById("bgm")||document.getElementById("bgAudio")||document.getElementById("bgMusic");if(a){a.src=param("music");let m=param("music").split("/").pop().split(".")[0].replace(/%20/g, " ");let t=document.querySelector(".a-title, .audio-title");if(t)t.textContent=decodeURI(m);}}
    if(param('music')) { const a = document.getElementById('bgAudio'); if(a) a.src = param('music'); }
=======
function populateData(){ 
    if(param("music")){const a=document.getElementById("bgm")||document.getElementById("bgAudio")||document.getElementById("bgMusic");if(a){a.src=param("music");}}
>>>>>>> 07d218d (kiw)
    
    // --- Image Params ---
    const iParam = (k) => { const v = param(k); return v ? decodeURIComponent(v) : null; };
    if (iParam('hero')) {
        document.querySelectorAll('.hero-bg, .hero-batik-bg, .hero-bg-img, .hero-img').forEach(e => {
            if(e.tagName === 'IMG') e.src = iParam('hero'); else e.style.backgroundImage = `url("${iParam('hero')}")`;
        });
    }
<<<<<<< HEAD
    const mPx = document.querySelectorAll('.mempelai-photo img, .profile-photo img, .profile-img img');
=======
    const mPx = document.querySelectorAll('.mempelai-photo img, .profile-photo img, .profile-img img, .p-photo img');
>>>>>>> 07d218d (kiw)
    if (mPx.length >= 2) {
        if (iParam('imgPria')) mPx[0].src = iParam('imgPria');
        if (iParam('imgWanita')) mPx[1].src = iParam('imgWanita');
    }
<<<<<<< HEAD
    const arr = typeof GALLERY_IMGS !== 'undefined' ? GALLERY_IMGS : (typeof LB_IMGS !== 'undefined' ? LB_IMGS : null);
    const tgImg = document.querySelectorAll('.gallery-item img, .galeri-item img, .gallery-img img');
    for (let i = 1; i <= 6; i++) {
        const u = iParam(`gal${i}`);
=======
    const arr = typeof GALLERY_IMGS !== 'undefined' ? GALLERY_IMGS : (typeof LB_IMGS !== 'undefined' ? LB_IMGS : (typeof IMGS !== 'undefined' ? IMGS : null));
    const tgImg = document.querySelectorAll('.gallery-item img, .galeri-item img, .gallery-img img, .gal-item img');
    for (let i = 1; i <= 6; i++) {
        const u = iParam("gal" + i);
>>>>>>> 07d218d (kiw)
        if(u) {
            if(arr && arr[i-1] !== undefined) arr[i-1] = u;
            if(tgImg.length >= i && tgImg[i-1]) tgImg[i-1].src = u;
        }
    }

    const couple = `${D.groom} & ${D.bride}`;
    document.title = `Undangan Pernikahan Adat Jawa | ${couple}`;

    // Text Content Sync
    s('c-guest', D.guest); s('c-couple', couple); s('c-date', D.date);
    s('hero-names', couple); s('hero-date', D.dateFull);
    s('groom-fullname', D.groomFull); s('bride-fullname', D.brideFull);
    s('groom-parent', D.groomParent); s('bride-parent', D.brideParent);
    
    // Socials
    const igs = document.querySelectorAll('.mempelai-ig span');
    if(igs[0]) igs[0].textContent = D.groomIg;
    if(igs[1]) igs[1].textContent = D.brideIg;

    // Events
    s('akad-date', D.akadDate); s('akad-time', D.akadTime); s('akad-place', D.akadPlace); s('akad-address', D.akadAddress);
    s('resepsi-date', D.resepsiDate); s('resepsi-time', D.resepsiTime); s('resepsi-place', D.resepsiPlace); s('resepsi-address', D.resepsiAddress);

    // Maps iframe & labels
    const aq = encodeURIComponent(D.akadMaps.replace(/\+/g,' ')), rq = encodeURIComponent(D.resepsiMaps.replace(/\+/g,' '));
    const ia = $('iframe-akad'), ir = $('iframe-resepsi');
    if(ia) ia.src = `https://maps.google.com/maps?q=${aq}&output=embed&hl=id&z=15`;
    if(ir) ir.src = `https://maps.google.com/maps?q=${rq}&output=embed&hl=id&z=15`;
    
    // Standardizing label sync
    s('map-akad-name', D.akadPlace); s('map-akad-addr', D.akadAddress);
    s('map-resepsi-name', D.resepsiPlace); s('map-resepsi-addr', D.resepsiAddress);
    s('mb-akad-name', D.akadPlace); s('mb-akad-addr', D.akadAddress);
    s('mb-resepsi-name', D.resepsiPlace); s('mb-resepsi-addr', D.resepsiAddress);

    // Our Story
    for(let i=1;i<=4;i++){
        const t=param(`s${i}t`), d=param(`s${i}d`), desc=param(`s${i}desc`);
        if(t)    s(`s${i}-title`, t);
        if(d)    s(`s${i}-year`,  d);
        if(desc) s(`s${i}-desc`,  desc);
    }

    // Gift
    s('g-bank-name', D.bankName); 
    s('g-bank-acc', D.bankAcc.replace(/(.{4})/g,'$1 ').trim()); 
    s('g-bank-holder', `a.n. ${D.bankHolder}`);
    document.querySelectorAll('[data-copy]').forEach(b => b.dataset.copy = D.bankAcc);

    // Closing
    s('closing-names', couple); s('closing-date', D.date);

    if (D.sheetsUrl && $('btn-sheets')) $('btn-sheets').style.display = 'flex';
}

// ─── 4. COVER ────────────────────────────────────────────────
function initCover() {
    const cover = $('cover'), main = $('main'), btn = $('btn-open'), audio = $('bgAudio');
    setTimeout(() => cover?.classList.add('loaded'), 80);

    // Spawn gold particles
    const pc = $('goldParticles');
    if(pc) {
        for(let i=0; i<20; i++){
            const p = document.createElement('div');
            p.className='gp';
            const sz = Math.random()*3+1.5;
            p.style.cssText=`width:${sz}px;height:${sz}px;left:${Math.random()*100}%;
                animation-duration:${Math.random()*12+8}s;
                animation-delay:-${Math.random()*12}s;`;
            pc.appendChild(p);
        }
    }

    btn?.addEventListener('click', () => {
        cover.classList.add('away');
        main.classList.remove('hidden');
        audio?.play().catch(()=>{});
        setTimeout(() => { cover.style.display='none'; }, 1600);
        setTimeout(initScrollReveal, 200);
    });
}

// ─── 5. SCROLL REVEAL ────────────────────────────────────────
function initScrollReveal() {
    const io = new IntersectionObserver((entries) => {
        entries.forEach((e,i) => {
            if(e.isIntersecting){
                setTimeout(() => e.target.classList.add('up'), i * 80);
                io.unobserve(e.target);
            }
        });
    }, { threshold:.1 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

// ─── 6. SCROLL PROGRESS ──────────────────────────────────────
function initScrollProgress() {
    const bar = $('scrollProgress');
    if(!bar) return;
    window.addEventListener('scroll', () => {
        bar.style.width = (scrollY/(document.body.scrollHeight-innerHeight)*100)+'%';
    }, {passive:true});
}

// ─── 7. BOTTOM NAV ───────────────────────────────────────────
function initBottomNav() {
    const items = document.querySelectorAll('.bn-item');
    const sections = document.querySelectorAll('.section');

    items.forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            const secClass = item.dataset.sec;
            const target = secClass === 'hero'
                ? document.querySelector('.hero-section')
                : document.querySelector(`.${secClass}`);
            if(target) target.scrollIntoView({behavior:'smooth'});
        });
    });

    window.addEventListener('scroll', () => {
        let cur = '';
        sections.forEach(sec => { if(scrollY >= sec.offsetTop - 200) cur = sec.className.split(' ')[1]; });
        items.forEach(item => item.classList.toggle('active', item.dataset.sec === cur || (cur==='hero-section' && item.dataset.sec==='hero')));
    }, {passive:true});
}

// ─── 8. COUNTDOWNS ───────────────────────────────────────────
function runCountdown(isoStr, ids) {
    function tick(){
        const diff = new Date(isoStr) - new Date();
        if(diff<=0){ ids.forEach(id => { const e=document.getElementById(id); if(e)e.textContent='00'; }); return; }
        const vals=[Math.floor(diff/86400000),Math.floor((diff%86400000)/3600000),Math.floor((diff%3600000)/60000),Math.floor((diff%60000)/1000)];
        ids.forEach((id,i)=>{ const e=document.getElementById(id); if(e)e.textContent=String(vals[i]).padStart(2,'0'); });
    }
    tick(); setInterval(tick, 1000);
}

// ─── 9. MAPS ─────────────────────────────────────────────────
function initMaps() {
    // Tab switcher
    document.querySelectorAll('.map-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.map-tab').forEach(t=>t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.map-tab-panel').forEach(p=>p.classList.remove('active'));
            $(`mt-${tab.dataset.tab}`)?.classList.add('active');
        });
    });

    $('btn-akad-maps')?.addEventListener('click', () =>
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(D.akadMaps.replace(/\+/g,' '))}`, '_blank'));
    $('btn-resepsi-maps')?.addEventListener('click', () =>
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(D.resepsiMaps.replace(/\+/g,' '))}`, '_blank'));
    $('btn-nav-akad')?.addEventListener('click', () =>
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(D.akadMaps.replace(/\+/g,' '))}`, '_blank'));
    $('btn-nav-resepsi')?.addEventListener('click', () =>
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(D.resepsiMaps.replace(/\+/g,' '))}`, '_blank'));

    // Cal buttons
    document.querySelectorAll('.cal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const isAkad = btn.dataset.field === 'akad';
            const start = (isAkad ? D.akadISO : D.resepsiISO).replace(/[-:]/g,'').slice(0,15);
            const title = encodeURIComponent(`${isAkad?'Akad Nikah':'Resepsi'} ${D.groom} & ${D.bride}`);
            const place = encodeURIComponent(isAkad ? D.akadPlace : D.resepsiPlace);
            window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${start}&location=${place}`, '_blank');
        });
    });
}

// ─── 10. GALLERY ─────────────────────────────────────────────
const LB_IMGS = [
    'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1400',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200',
    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1200',
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=1200',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=1200',
];
let lbIdx = 0;
window.openLb = (i) => { lbIdx=i; const lb=$('lightbox'); const img=$('lb-img'); if(!lb||!img)return; img.src=LB_IMGS[i]; lb.classList.add('open'); document.body.style.overflow='hidden'; };
window.closeLb = () => { $('lightbox')?.classList.remove('open'); document.body.style.overflow=''; };
window.lbNav = (dir, e) => { e.stopPropagation(); lbIdx=(lbIdx+dir+LB_IMGS.length)%LB_IMGS.length; openLb(lbIdx); };

// Drag-to-scroll gallery
function initDragScroll() {
    const el = $('galeriScroll');
    if(!el) return;
    let isDown=false, startX, scrollLeft;
    el.addEventListener('mousedown', e => { isDown=true; el.classList.add('active'); startX=e.pageX-el.offsetLeft; scrollLeft=el.scrollLeft; });
    el.addEventListener('mouseleave', () => isDown=false);
    el.addEventListener('mouseup', () => isDown=false);
    el.addEventListener('mousemove', e => { if(!isDown)return; e.preventDefault(); const x=e.pageX-el.offsetLeft; const walk=(x-startX)*1.5; el.scrollLeft=scrollLeft-walk; });
}

// ─── 11. AMPLOP TABS ─────────────────────────────────────────
function initAmplopTabs() {
    document.querySelectorAll('.amp-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.amp-tab').forEach(t=>t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.amp-panel').forEach(p=>p.classList.remove('active'));
            $(`ap-${tab.dataset.at}`)?.classList.add('active');
        });
    });
    document.querySelectorAll('[data-copy]').forEach(btn => {
        btn.addEventListener('click', () => navigator.clipboard.writeText(btn.dataset.copy).then(()=>toast('✅ Nomor rekening disalin!')));
    });
}

// ─── 12. RSVP ────────────────────────────────────────────────
function initRsvp() {
    const collect = () => ({
        name:  $('rsvp-name')?.value.trim(),
        hadir: document.querySelector('input[name="rsvp-att"]:checked')?.value || '-',
        msg:   $('rsvp-msg')?.value.trim() || '',
    });

    $('btn-wa')?.addEventListener('click', () => {
        const {name, hadir, msg} = collect();
        if(!name){ toast('⚠️ Mohon isi nama Anda terlebih dahulu'); return; }
        const text = `✉️ *RSVP Undangan Pernikahan Adat Jawa*\n📌 ${D.groom} & ${D.bride}\n\n👤 *Nama:* ${name}\n📅 *Kehadiran:* ${hadir}\n💬 *Ucapan:* ${msg||'(tidak ada)'}\n\n_Dikirim dari undangan digital_`;
        window.open(`https://wa.me/${D.wa}?text=${encodeURIComponent(text)}`, '_blank');
    });

    $('btn-sheets')?.addEventListener('click', () => {
        const {name, hadir, msg} = collect();
        if(!name){ toast('⚠️ Mohon isi nama Anda terlebih dahulu'); return; }
        if(!D.sheetsUrl){ toast('⚠️ Google Sheets belum dikonfigurasi'); return; }
        const payload = { invId:D.invId, couple:`${D.groom} & ${D.bride}`, name, attendance:hadir, message:msg, guest:D.guest };
        fetch(D.sheetsUrl, { method:'POST', mode:'no-cors', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
        .then(() => {
            $('rsvp-ok').style.display='block';
            $('rsvp-name').value=''; $('rsvp-msg').value='';
            toast('✅ RSVP terkirim ke Google Sheets!');
        }).catch(() => toast('✅ Terkirim!'));
    });
}

// ─── 13. AUDIO ───────────────────────────────────────────────
function initAudio() {
    const audio=$('bgAudio'), disc=$('audioDisc'), icon=$('audioIcon'), btn=$('audioBtn'), fill=$('audioFill');
    if(!audio||!btn) return;
    btn.addEventListener('click', () => {
        if(audio.paused){ audio.play(); disc?.classList.remove('paused'); if(icon)icon.className='fa-solid fa-pause'; }
        else { audio.pause(); disc?.classList.add('paused'); if(icon)icon.className='fa-solid fa-play'; }
    });
    audio.addEventListener('timeupdate', () => { if(!audio.duration||!fill)return; fill.style.width=(audio.currentTime/audio.duration*100)+'%'; });
}

// ─── 14. TOAST ───────────────────────────────────────────────
function toast(msg, dur=2800) {
    const el=$('toast'); if(!el)return;
    el.textContent=msg; el.classList.add('show');
    setTimeout(()=>el.classList.remove('show'), dur);
}

// ─── 15. TOUCH PARALLAX (mobile) ─────────────────────────────
function initTouchParallax() {
    if(window.innerWidth > 768) return;
    document.querySelectorAll('.hero-names, .hero-eyebrow').forEach(el => {
        window.addEventListener('deviceorientation', e => {
            const x = (e.gamma||0)/30;
            const y = (e.beta||0)/30 - 1;
            el.style.transform = `translate(${x*3}px, ${y*2}px)`;
        }, {passive:true});
    });
}

// ─── 16. INIT ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    populateData();
    initCover();
    initScrollProgress();
    runCountdown(D.akadISO,    ['ak-d','ak-h','ak-m','ak-s']);
    runCountdown(D.resepsiISO, ['rs-d','rs-h','rs-m','rs-s']);
    initMaps();
    initDragScroll();
    initAmplopTabs();
    initRsvp();
    initAudio();
    initBottomNav();
    initTouchParallax();

    document.addEventListener('keydown', e => {
        const lb = $('lightbox');
        if(!lb?.classList.contains('open')) return;
        if(e.key==='ArrowLeft')  lbNav(-1, {stopPropagation:()=>{}});
        if(e.key==='ArrowRight') lbNav(1,  {stopPropagation:()=>{}});
        if(e.key==='Escape')     closeLb();
    });
});


