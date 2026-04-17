/* ============================================================
   TEMPLATE: PREMIUM LUXE — CRYSTAL LUXURY SCRIPT
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // ─── 1. URL PARAMETER READER ───────────────────────────────
    function p(key, fallback = '') {
        const val = new URLSearchParams(location.search).get(key);
        return (val === null) ? fallback : val;
    }

    const D = {
        groom:          p('groom',          'Romeo'),
        bride:          p('bride',          'Juliet'),
        groomFull:      p('groomFull',      'Romeo Montague, S.T.'),
        brideFull:      p('brideFull',      'Juliet Capulet, S.H.'),
        groomParent:    p('groomParent',    'Son of Mr. Montague & Mrs. Montague'),
        brideParent:    p('brideParent',    'Daughter of Mr. Capulet & Mrs. Capulet'),
        groomIg:        p('groomIg',        '@romeo_m'),
        brideIg:        p('brideIg',        '@juliet_c'),
        
        dateDisplay:    p('date',           'Friday, 25 Dec 2026'),
        dateFull:       p('dateFull',       '25 . 12 . 2026'),
        
        akadDate:       p('akadDate',       'Friday, 25 Dec 2026'),
        akadTime:       p('akadTime',       '08:00 AM – 10:00 AM'),
        akadPlace:      p('akadPlace',      'The Grand Cathedral'),
        akadAddress:    p('akadAddress',    'Victory Street No. 1, Italy'),
        akadISO:        p('akadISO',        '2026-12-25T08:00:00'),
        akadMaps:       p('akadMaps',       'The Grand Cathedral'),
        
        resepsiDate:    p('resepsiDate',    'Friday, 25 Dec 2026'),
        resepsiTime:    p('resepsiTime',    '11:00 AM – 02:00 PM'),
        resepsiPlace:   p('resepsiPlace',   'Verona Castle Ballroom'),
        resepsiAddress: p('resepsiAddress', 'Victory Street No. 10, Italy'),
        resepsiISO:     p('resepsiISO',     '2026-12-25T11:00:00'),
        resepsiMaps:    p('resepsiMaps',    'Verona Castle'),
        
        bankName:       p('bankName',       'BANK BCA'),
        bankAcc:        p('bankAcc',        '1234 5678 90'),
        bankHolder:     p('bankHolder',     'Romeo Montague'),
        
        wa:             p('wa',             '6281234567890'),
        guest:          p('guest',          'Bapak / Ibu / Saudara/i'),
        music:          p('music',          'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'),
        sheetsUrl:      p('sheetsUrl',      ''),
        invId:          p('invId',          ''),
    };

    const $ = (id) => document.getElementById(id);
    const setText = (id, val) => { const el=$(id); if(el) el.textContent = val; };

    // ─── 2. POPULATE DATA ───────────────────────────────────────
    function populateData() {
        const couple = `${D.groom} & ${D.bride}`;
        setText('page-title', `Wedding Invitation | ${couple}`);
        setText('c-couple', couple);
        setText('c-guest', D.guest);
        setText('c-date', D.dateDisplay);
        setText('hero-names', couple);
        setText('hero-date', D.dateFull);
        setText('closing-names', couple);
        setText('closing-date', D.dateDisplay.toUpperCase());

        setText('groom-fullname', D.groomFull);
        setText('groom-parent', D.groomParent);
        setText('bride-fullname', D.brideFull);
        setText('bride-parent', D.brideParent);
        if($('groom-ig')) $('groom-ig').innerHTML = `<i class="fa-brands fa-instagram"></i> <span>${D.groomIg}</span>`;
        if($('bride-ig')) $('bride-ig').innerHTML = `<i class="fa-brands fa-instagram"></i> <span>${D.brideIg}</span>`;

        // Photos
        const iParam = (k) => { const v = p(k); return v ? decodeURIComponent(v) : null; };
        const groomImg = iParam('imgPria');
        const brideImg = iParam('imgWanita');
        const heroImg = iParam('hero');
        const mPhotos = document.querySelectorAll('.mempelai-photo-wrap img');
        if(groomImg && mPhotos[0]) mPhotos[0].src = groomImg;
        if(brideImg && mPhotos[1]) mPhotos[1].src = brideImg;
        if(heroImg && document.querySelector('.hero-bg')) document.querySelector('.hero-bg').style.backgroundImage = `url("${heroImg}")`;

        // Events
        setText('akad-date', D.akadDate);
        setText('akad-time', D.akadTime);
        setText('akad-place', D.akadPlace);
        setText('akad-address', D.akadAddress);
        setText('resepsi-date', D.resepsiDate);
        setText('resepsi-time', D.resepsiTime);
        setText('resepsi-place', D.resepsiPlace);
        setText('resepsi-address', D.resepsiAddress);

        if(D.akadMaps) {
            $('btn-akad-maps').onclick = () => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(D.akadMaps)}`, '_blank');
        }
        if(D.resepsiMaps) {
            $('btn-resepsi-maps').onclick = () => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(D.resepsiMaps)}`, '_blank');
        }

        // Gallery
        const galleryImgs = document.querySelectorAll('.galeri-item img');
        for(let i=0; i<6; i++) {
            const url = p(`gal${i+1}`);
            if(url && galleryImgs[i]) galleryImgs[i].src = url;
        }

        // Bank
        setText('g-bank-name', D.bankName);
        setText('g-bank-acc', D.bankAcc);
        setText('g-bank-holder', D.bankHolder);
        if(document.querySelector('.btn-copy')) document.querySelector('.btn-copy').setAttribute('data-copy', D.bankAcc.replace(/\//g,''));

        // Music
        if(D.music && $('bgAudio')) {
            $('bgAudio').src = D.music;
            $('bgAudio').load();
        }

        if(D.sheetsUrl && $('btn-sheets')) $('btn-sheets').style.display = 'block';
    }

    // ─── 3. CORE INTERACTION ────────────────────────────────────
    const cover = $('cover');
    const main = $('main');
    const btnOpen = $('btn-open');
    const audio = $('bgAudio');
    const audioBtn = $('audioBtn');
    const audioIcon = $('audioIcon');
    const audioDisc = $('audioDisc');

    btnOpen?.addEventListener('click', () => {
        cover?.classList.add('away');
        main?.classList.remove('hidden');
        audio?.play().catch(() => {});
        setTimeout(handleReveal, 100);
    });

    audioBtn?.addEventListener('click', () => {
        if(!audio) return;
        if(audio.paused) {
            audio.play();
            if(audioIcon) audioIcon.className = 'fa-solid fa-pause';
            if(audioDisc) audioDisc.style.animationPlayState = 'running';
        } else {
            audio.pause();
            if(audioIcon) audioIcon.className = 'fa-solid fa-play';
            if(audioDisc) audioDisc.style.animationPlayState = 'paused';
        }
    });

    // ─── 4. SCROLL & REVEAL ──────────────────────────────────────
    function handleReveal() {
        const reveals = document.querySelectorAll('.reveal');
        reveals.forEach(el => {
            const windowHeight = window.innerHeight;
            const elementTop = el.getBoundingClientRect().top;
            if(elementTop < windowHeight - 80) el.classList.add('up');
        });
    }

    function scrollSpy() {
        const sections = document.querySelectorAll('section');
        const navItems = document.querySelectorAll('.bn-item');
        let current = "hero";
        sections.forEach(sec => {
            if(pageYOffset >= sec.offsetTop - 200) current = sec.id;
        });
        navItems.forEach(item => {
            item.classList.remove('active');
            if(item.getAttribute('data-sec') === current) item.classList.add('active');
        });
    }

    window.addEventListener('scroll', () => {
        handleReveal();
        scrollSpy();
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        if($('scrollProgress')) $('scrollProgress').style.width = scrolled + "%";
    });

    // ─── 5. COMPONENTS ──────────────────────────────────────────
    // Copy
    document.querySelector('.btn-copy')?.addEventListener('click', function() {
        const num = this.getAttribute('data-copy');
        navigator.clipboard.writeText(num).then(() => {
            const old = this.innerText;
            this.innerText = 'Copied!';
            setTimeout(() => { this.innerText = old; }, 2000);
        });
    });


    // RSVP
    const btnWa = $('btn-wa');
    const btnSheets = $('btn-sheets');

    btnWa?.addEventListener('click', () => {
        const name = $('rsvp-name').value.trim();
        const att = $('rsvp-att').value;
        const msg = $('rsvp-msg').value.trim();
        if(!name) return alert("Please enter your name");
        const text = `Dear ${D.groom} & ${D.bride},\n\nMy name is *${name}* and I'm confirming my attendance: *${att}*.\n\nMessage: ${msg || '-'}\n\nThank you.`;
        window.open(`https://wa.me/${D.wa}?text=${encodeURIComponent(text)}`, '_blank');
    });

<<<<<<< HEAD
    // === 6. INTEGRASI DATA DARI URL (DYNAMIS) ===
    function initDataFromUrl() {
        const params = new URLSearchParams(window.location.search);
        
        const setTxt = (id, key, fallback) => {
            const el = document.getElementById(id);
            if (el) el.textContent = params.get(key) || fallback;
        };

        // Mempelai & Dasar
        setTxt('cover-names', 'groom', 'Romeo');
        const groom = params.get('groom') || 'Romeo';
        const bride = params.get('bride') || 'Juliet';
        document.getElementById('cover-names').textContent = `${groom} & ${bride}`;
        document.getElementById('hero-names').textContent = `${groom} & ${bride}`;
        
        setTxt('hero-date', 'date', '25 Desember 2026');
        setTxt('groom-fullname', 'groomFull', groom + ' Montague');
        setTxt('bride-fullname', 'brideFull', bride + ' Capulet');
        setTxt('groom-parents', 'groomParent', 'Putra dari Bpk. Montague & Ibu Montague');
        setTxt('bride-parents', 'brideParent', 'Putri dari Bpk. Capulet & Ibu Capulet');

        // IG Links
        if(params.get('groomIg')) document.getElementById('groom-ig').innerHTML = `<i class="fa-brands fa-instagram"></i> @${params.get('groomIg')}`;
        if(params.get('brideIg')) document.getElementById('bride-ig').innerHTML = `<i class="fa-brands fa-instagram"></i> @${params.get('brideIg')}`;

        // Acara
        setTxt('akad-date', 'akadDate', 'Jumat, 25 Desember 2026');
        setTxt('akad-location', 'akadPlace', 'Masjid Agung Verona');
        setTxt('resepsi-date', 'resepsiDate', 'Jumat, 25 Desember 2026');
        setTxt('resepsi-location', 'resepsiPlace', 'Grand Verona Castle Ballroom');

        // Foto Utama & Mempelai
        const heroImg = params.get('hero');
        if (heroImg) {
            document.querySelector('.hero-wedding').style.backgroundImage = `url('${heroImg}')`;
        }
        const pImg = params.get('imgPria');
        if (pImg) document.getElementById('img-groom').src = pImg;
        const wImg = params.get('imgWanita');
        if (wImg) document.getElementById('img-bride').src = wImg;

        // Galeri (Momen Bersama)
        const galleryContainer = document.getElementById('gallery-container');
        if (galleryContainer) {
            let galleryHtml = '';
            for (let i = 1; i <= 6; i++) {
                const imgUrl = params.get(`gal${i}`);
                if (imgUrl) {
                    galleryHtml += `
                        <div class="gallery-item">
                            <img src="${imgUrl}" alt="Momen ${i}">
                        </div>`;
                }
            }
            if (galleryHtml) {
                galleryContainer.innerHTML = galleryHtml;
            } else {
                // Sembunyikan section galeri jika tidak ada foto
                document.getElementById('galeri').style.display = 'none';
            }
        }

        // Musik
        const musicUrl = params.get('music');
        if (musicUrl) {
            bgMusic.querySelector('source').src = musicUrl;
            bgMusic.load();
        }
    }

    initDataFromUrl();
=======
    btnSheets?.addEventListener('click', () => {
        const name = $('rsvp-name').value.trim();
        const att = $('rsvp-att').value;
        const msg = $('rsvp-msg').value.trim();
        if(!name) return alert("Please enter your name");
        btnSheets.disabled = true;
        btnSheets.innerText = "Sending...";
        fetch(D.sheetsUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, attendance: att, message: msg, invId: D.invId })
        }).then(() => {
            $('rsvp-ok').style.display = 'block';
            btnSheets.innerText = "Sent Successfully";
        }).catch(() => {
            btnSheets.disabled = false;
            btnSheets.innerText = "Error, try again";
        });
    });

    // Countdown
    function startCD(iso, prefix) {
        const target = new Date(iso).getTime();
        setInterval(() => {
            const diff = target - new Date().getTime();
            if(diff <= 0) return;
            setText(`${prefix}-d`, String(Math.floor(diff / 86400000)).padStart(2, '0'));
            setText(`${prefix}-h`, String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0'));
            setText(`${prefix}-m`, String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'));
            setText(`${prefix}-s`, String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'));
        }, 1000);
    }

    // START
    populateData();
    startCD(D.akadISO, 'ak');
    startCD(D.resepsiISO, 'rs');
>>>>>>> 07d218d (kiw)
});


