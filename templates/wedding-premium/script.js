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

    // Fungsi Render Teks Otomatis dari Input
    function updateNames() {
        const groomText = inputGroom.value || 'Groom';
        const brideText = inputBride.value || 'Bride';
        const combined = `${groomText} & ${brideText}`; // Misal: "Andi & Sita"
        
        // Memasukkan Teks ke Elemen Target
        coverNames.textContent = combined;
        heroNames.textContent = combined;
        
        // Untuk nama lengkap kita berikan default nama belakang sementara
        groomFullName.textContent = groomText + " Montague";
        brideFullName.textContent = brideText + " Capulet";
    }

    function updateDate() {
        const dateStr = inputDate.value || '-';
        heroDate.textContent = dateStr;
    }

    // Event Listener `input` akan mendeteksi ketikan huruf per huruf!
    inputGroom.addEventListener('input', updateNames);
    inputBride.addEventListener('input', updateNames);
    inputDate.addEventListener('input', updateDate);

});
