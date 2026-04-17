/* ============================================================
   TEMPLATE: BALI PURA — script.js
   Data-driven via URL parameters | All features
   ============================================================ */

// ─── 1. URL PARAMS ───────────────────────────────────────────
const param = (k, fb='') => new URLSearchParams(location.search).get(k) || fb;

const D = {
    groom:         param('groom',         'Romeo'),
    bride:         param('bride',         'Juliet'),
    groomFull:     param('groomFull',     'Romeo Montague, S.T.'),
    brideFull:     param('brideFull',     'Juliet Capulet, S.H.'),
    groomParent:   param('groomParent',   'Putra dari Bpk. Montague & Ibu Montague'),
    brideParent:   param('brideParent',   'Putri dari Bpk. Capulet & Ibu Capulet'),
    groomIg:       param('groomIg',       '@romeo_m'),
    brideIg:       param('brideIg',       '@juliet_c'),
    date:          param('date',          '25 Desember 2026'),
    dateFull:      param('dateFull',      'Jumat, 25 Desember 2026'),
    akadDate:      param('akadDate',      'Jumat, 25 Desember 2026'),
    akadTime:      param('akadTime',      '08.00 – 10.00 WIB'),
    akadPlace:     param('akadPlace',     'Pura Desa'),
    akadAddress:   param('akadAddress',   'Jl. Cinta Damai No.1'),
    akadISO:       param('akadISO',       '2026-12-25T08:00:00'),
    akadMaps:      param('akadMaps',      'Pura+Besakih+Bali'),
    resepsiDate:   param('resepsiDate',   'Jumat, 25 Desember 2026'),
    resepsiTime:   param('resepsiTime',   '11.00 – Selesai WIB'),
    resepsiPlace:  param('resepsiPlace',  'Bale Banjar'),
    resepsiAddress:param('resepsiAddress','Jl. Cinta Damai No.10'),
    resepsiISO:    param('resepsiISO',    '2026-12-25T11:00:00'),
    resepsiMaps:   param('resepsiMaps',   'Ubud+Bali'),
    bankName:      param('bankName',      'Bank BCA'),
    bankAcc:       param('bankAcc',       '1234567890'),
    bankHolder:    param('bankHolder',    'Romeo Montague'),
    wa:            param('wa',            '6281234567890'),
    guest:         param('guest',         'Bapak / Ibu / Saudara/i'),
    sheetsUrl:     param('sheetsUrl',     ''),
    invId:         param('invId',         ''),
};

const $  = id => document.getElementById(id);
const s  = (id, v) => { const e=$(id); if(e) e.textContent = v; };

// ─── 2. POPULATE DATA ────────────────────────────────────────
function pop() {
<<<<<<< HEAD
    if(param('music')) { const a = document.getElementById('bgAudio'); if(a) a.src = param('music'); }
=======
    if(param('music')) { const a = document.getElementById('bgm')||document.getElementById('bgAudio')||document.getElementById('bgMusic'); if(a) a.src = param('music'); }
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
    document.title = `Undangan Pernikahan Adat Bali | ${couple}`;

    s('c-guest', D.guest); s('c-couple', couple); s('c-date', D.date);
    s('hero-names', couple); s('hero-date', D.dateFull);

    s('groom-fullname', D.groomFull); s('bride-fullname', D.brideFull);
    s('groom-parent', D.groomParent); s('bride-parent', D.brideParent);
    const igs = document.querySelectorAll('.ig-link');
    if(igs.length>1){ igs[0].innerHTML=`<i class="fa-brands fa-instagram"></i> ${D.groomIg}`; igs[1].innerHTML=`<i class="fa-brands fa-instagram"></i> ${D.brideIg}`; }

    s('akad-date', D.akadDate); s('akad-time', D.akadTime); s('akad-place', D.akadPlace); s('akad-address', D.akadAddress);
    s('resepsi-date', D.resepsiDate); s('resepsi-time', D.resepsiTime); s('resepsi-place', D.resepsiPlace); s('resepsi-address', D.resepsiAddress);

    const qa = encodeURIComponent(D.akadMaps.replace(/\+/g,' ')), qr = encodeURIComponent(D.resepsiMaps.replace(/\+/g,' '));
    if($('iframe-akad')) $('iframe-akad').src=`https://maps.google.com/maps?q=${qa}&output=embed&hl=id&z=15`;
    if($('iframe-resepsi')) $('iframe-resepsi').src=`https://maps.google.com/maps?q=${qr}&output=embed&hl=id&z=15`;
    
    // Standard label sync
    s('mb-akad-name', D.akadPlace); s('mb-akad-addr', D.akadAddress); 
    s('mb-resepsi-name', D.resepsiPlace); s('mb-resepsi-addr', D.resepsiAddress);
    s('map-akad-name', D.akadPlace); s('map-akad-addr', D.akadAddress);
    s('map-resepsi-name', D.resepsiPlace); s('map-resepsi-addr', D.resepsiAddress);

    for(let i=1;i<=4;i++){
        if(param(`s${i}t`)) s(`s${i}-title`, param(`s${i}t`));
        if(param(`s${i}d`)) s(`s${i}-year`, param(`s${i}d`));
        if(param(`s${i}desc`)) s(`s${i}-desc`, param(`s${i}desc`));
    }

    s('g-bank-name', D.bankName); 
    s('g-bank-acc', D.bankAcc.replace(/(.{4})/g,'$1 ').trim()); 
    s('g-bank-holder', `a.n. ${D.bankHolder}`);
    document.querySelectorAll('[data-copy]').forEach(b=>b.dataset.copy=D.bankAcc);
    s('closing-names', couple); s('closing-date', D.date);

    if(D.sheetsUrl && $('btn-sheets')) $('btn-sheets').style.display='flex';
}

// ─── 3. INTERACTIVITY ────────────────────────────────────────

function initCover() {
    setTimeout(()=>$('cover')?.classList.add('loaded'), 100);
    const pContainer = $('petals');
    if(pContainer){
        for(let i=0;i<15;i++){
            let p=document.createElement('div'); p.className='petal'; p.innerHTML='🌺';
            p.style.left=Math.random()*100+'%'; p.style.animationDuration=(Math.random()*10+8)+'s'; p.style.animationDelay=(-Math.random()*10)+'s'; p.style.fontSize=(Math.random()*.8+.6)+'rem';
            pContainer.appendChild(p);
        }
    }
    $('btn-open')?.addEventListener('click', ()=>{
        $('cover')?.classList.add('away'); $('main')?.classList.remove('hidden');
        $('bgAudio')?.play().catch(()=>{}); setTimeout(()=>$('cover').style.display='none', 1600);
        setTimeout(()=>{
            const io=new IntersectionObserver(e=>{ e.forEach((x,i)=>{ if(x.isIntersecting){ setTimeout(()=>x.target.classList.add('up'), i*80); io.unobserve(x.target); } }); },{threshold:.1});
            document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
        }, 200);
    });
}

function initCountdown(iso, ids) {
    const t = ()=> {
        const d = new Date(iso) - new Date();
        if(d<=0) { ids.forEach(id=>s(id,'00')); return; }
        const v = [Math.floor(d/86400000), Math.floor((d%86400000)/3600000), Math.floor((d%3600000)/60000), Math.floor((d%60000)/1000)];
        ids.forEach((id,i)=>s(id, String(v[i]).padStart(2,'0')));
    };
    t(); setInterval(t, 1000);
}

function initNavAndTabs() {
    window.addEventListener('scroll', ()=>{ $('scrollProgress').style.width=(scrollY/(document.body.scrollHeight-innerHeight)*100)+'%'; }, {passive:true});
    const sections = document.querySelectorAll('.section');
    document.querySelectorAll('.nb').forEach(a => {
        a.addEventListener('click', e=>{
            e.preventDefault(); const target = document.querySelector(`.${a.dataset.sec}`);
            if(target) target.scrollIntoView({behavior:'smooth'});
        });
    });
    window.addEventListener('scroll', ()=>{
        let cur=''; sections.forEach(sec=>{ if(scrollY>=sec.offsetTop-200) cur=sec.className.split(' ')[1]; });
        document.querySelectorAll('.nb').forEach(a=>a.classList.toggle('active', a.dataset.sec===cur));
    }, {passive:true});

    document.querySelectorAll('.mtb').forEach(t=>{ t.addEventListener('click', ()=>{
        document.querySelectorAll('.mtb').forEach(x=>x.classList.remove('active')); t.classList.add('active');
        document.querySelectorAll('.mtp').forEach(x=>x.classList.remove('active')); $(`mt-${t.dataset.tab}`).classList.add('active');
    });});
    document.querySelectorAll('.atb').forEach(t=>{ t.addEventListener('click', ()=>{
        document.querySelectorAll('.atb').forEach(x=>x.classList.remove('active')); t.classList.add('active');
        document.querySelectorAll('.ap').forEach(x=>x.classList.remove('active')); $(`ap-${t.dataset.at}`).classList.add('active');
    });});
    document.querySelectorAll('.btn-cp').forEach(b=>b.addEventListener('click', ()=>{
        navigator.clipboard.writeText(b.dataset.copy).then(()=>toast('Tersalin!'));
    }));
}

function initRsvp() {
    const collect = ()=>({ name:$('rsvp-name').value.trim(), hadir:document.querySelector('input[name="rsvp-att"]:checked')?.value, msg:$('rsvp-msg').value.trim() });
    $('btn-wa')?.addEventListener('click', ()=>{
        const {name,hadir,msg} = collect(); if(!name){ toast('Isi nama boss!'); return; }
        const t = `✉️ *RSVP Undangan Bali*\n${D.groom} & ${D.bride}\n\n👤 ${name}\n📅 ${hadir}\n💬 ${msg||'-'}`;
        window.open(`https://wa.me/${D.wa}?text=${encodeURIComponent(t)}`, '_blank');
    });
    $('btn-sheets')?.addEventListener('click', ()=>{
        const {name,hadir,msg} = collect(); if(!name){ toast('Isi nama!'); return; }
        if(!D.sheetsUrl) return;
        fetch(D.sheetsUrl, {method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify({invId:D.invId,couple:`${D.groom} & ${D.bride}`,name,attendance:hadir,message:msg,guest:D.guest})})
        .then(()=>{ $('rsvp-ok').style.display='block'; $('rsvp-name').value=''; $('rsvp-msg').value=''; toast('✅ Terkirim ke Sheets'); })
        .catch(()=>toast('Terkirim!'));
    });
}

function toast(m) { const e=$('toast'); if(!e)return; e.textContent=m; e.classList.add('show'); setTimeout(()=>e.classList.remove('show'), 2500); }

// Lightbox & Audio
const LB = ['https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200', 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1200', 'https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=1200', 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=1200'];
let lbi=0;
window.openLb=(i)=>{ lbi=i; const l=$('lightbox'),img=$('lb-img'); if(img){img.src=LB[i];l.classList.add('open');document.body.style.overflow='hidden';} };
window.closeLb=()=>{ $('lightbox')?.classList.remove('open'); document.body.style.overflow=''; };
window.lbNav=(d,e)=>{ e.stopPropagation(); lbi=(lbi+d+LB.length)%LB.length; openLb(lbi); };

document.addEventListener('DOMContentLoaded', ()=>{
    pop(); initCover(); initCountdown(D.akadISO, ['ak-d','ak-h','ak-m','ak-s']); initCountdown(D.resepsiISO, ['rs-d','rs-h','rs-m','rs-s']);
    initNavAndTabs(); initRsvp();
    $('btn-akad-map')?.addEventListener('click',()=>window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(D.akadMaps.replace(/\+/g,' '))}`));
    $('btn-resepsi-map')?.addEventListener('click',()=>window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(D.resepsiMaps.replace(/\+/g,' '))}`));
    const au=$('bgAudio'), btn=$('audioBtn'), fill=$('audioFill'), disc=$('audioDisc'), ic=$('audioIcon');
    btn?.addEventListener('click', ()=>{
        if(au.paused){au.play();disc.classList.remove('paused');ic.className='fa-solid fa-pause';}else{au.pause();disc.classList.add('paused');ic.className='fa-solid fa-play';}
    });
    au?.addEventListener('timeupdate',()=>{ if(au.duration) fill.style.width=(au.currentTime/au.duration*100)+'%'; });
});


