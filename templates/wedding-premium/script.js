document.addEventListener('DOMContentLoaded', () => {
    // === 1. DEKLARASI VARIABEL DOM ===
    const btnOpen = document.getElementById('open-invitation-btn');
    const coverScreen = document.getElementById('cover-screen');
    const mainContent = document.getElementById('main-content');
    
    // Audio Player
    const bgMusic = document.getElementById('bg-music');
    const audioControl = document.getElementById('audio-control');
    const audioIcon = audioControl.querySelector('i');
    
    // Interaktif Navigasi Bawah
    const sections = document.querySelectorAll('.invite-section');
    const navItems = document.querySelectorAll('.nav-item');

    // Panel Admin (Menu Modifikasi)
    const adminEditor = document.getElementById('admin-editor');
    const toggleAdminBtn = document.getElementById('toggle-admin');
    
    // Input Admin
    const inputGroom = document.getElementById('input-groom');
    const inputBride = document.getElementById('input-bride');
    const inputDate = document.getElementById('input-date');
    
    // Target Teks di Undangan yang akan diubah Admin
    const coverNames = document.getElementById('cover-names');
    const heroNames = document.getElementById('hero-names');
    const heroDate = document.getElementById('hero-date');
    const groomFullName = document.getElementById('groom-fullname');
    const brideFullName = document.getElementById('bride-fullname');

    // === 2. LOGIKA BUKA UNDANGAN & PLAY MUSIK ===
    btnOpen.addEventListener('click', () => {
        // Efek Transisi Layar Utama
        coverScreen.classList.add('slide-up');
        mainContent.classList.remove('hidden');
        
        // Putar Backsound Musik (Browser biasanya membutuhkan interaksi klik dulu untuk play audio)
        bgMusic.play().catch(err => console.log("Autoplay dicegah oleh browser"));
        
        // Hapus cover dari pembacaan memori agar lebih ringan setelah animasi (1.2 detik)
        setTimeout(() => {
            coverScreen.style.display = 'none';
        }, 1200);
    });

    // === 3. KONTROL AUDIO (ON/OFF) ===
    audioControl.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play();
            audioIcon.classList.add('spin');
            // Menukar icon play menjadi disc yang berputar
            audioIcon.classList.replace('fa-play', 'fa-compact-disc');
            audioControl.style.borderColor = "var(--gold-primary)";
        } else {
            bgMusic.pause();
            audioIcon.classList.remove('spin');
            // Menukar icon disc menjadi tombol play
            audioIcon.classList.replace('fa-compact-disc', 'fa-play');
            audioControl.style.borderColor = "gray";
        }
    });

    // === 4. SISTEM NAVIGASI BAWAH (SCROLL SPY) ===
    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // Jika scroll melewati 1/3 bagian atas section, anggap kita berada di section tersebut
            if (scrollY >= (sectionTop - sectionHeight / 3)) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href').includes(currentSectionId)) {
                item.classList.add('active');
            }
        });
    });

    // === 5. LOGIKA MENU ADMIN (FITUR: MUDAH DIMODIFIKASI) ===
    // Fitur luar biasa ini membaca ketikan di panel dan langsung menampilkannya di undangan!

    // Toggle Sembunyikan/Tampilkan Panel Admin
    toggleAdminBtn.addEventListener('click', () => {
        adminEditor.classList.toggle('hidden-panel');
        const icon = toggleAdminBtn.querySelector('i');
        
        if(adminEditor.classList.contains('hidden-panel')) {
            icon.classList.replace('fa-chevron-down', 'fa-chevron-right');
        } else {
            icon.classList.replace('fa-chevron-right', 'fa-chevron-down');
        }
    });

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
});


