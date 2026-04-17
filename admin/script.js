/* ============================================================
   LUMINA INVITES — ADMIN PANEL SCRIPT (FULL REBUILD)
   Features: Live Editor, Guest List, RSVP Dashboard,
             Our Story, Google Sheets Integration
   ============================================================ */

const ADMIN_PASS = 'admin123';
const TEMPLATE_PATHS = {
    midnight: '../templates/wedding-midnight/index.html',
    blossom:  '../templates/wedding-blossom/index.html',
    rustic:   '../templates/wedding-rustic/index.html',
    jawa:     '../templates/wedding-jawa/index.html',
    bali:     '../templates/wedding-bali/index.html',
    aether:   '../templates/wedding-aether/index.html',
    premium:  '../templates/wedding-premium/index.html',
};
const TEMPLATE_META = {
    midnight: { icon: '🌙', color: 'rgba(212,175,55,0.15)', label: 'Midnight Gold' },
    blossom:  { icon: '🌸', color: 'rgba(190,24,93,0.15)',  label: 'Blossom Blush' },
    rustic:   { icon: '🌿', color: 'rgba(160,82,45,0.15)',  label: 'Rustic Garden'  },
    jawa:     { icon: '🏯', color: 'rgba(92,10,20,0.15)',   label: 'Jawa Kraton'    },
    bali:     { icon: '🌺', color: 'rgba(13,77,77,0.15)',   label: 'Bali Pura'      },
    aether:   { icon: '✨', color: 'rgba(212,175,55,0.15)', label: '3D Aether'      },
    premium:  { icon: '💎', color: 'rgba(99,102,241,0.15)', label: 'Premium Luxe'   },
};

// ─── State
let currentTemplate = 'midnight';
let currentUrl      = '';
let debounceTimer   = null;
let rsvpData        = [];
let rsvpSheetsUrl   = localStorage.getItem('lumina_sheets_url') || '';
let isInitialized   = false;

// ─── Utils
const $ = id => document.getElementById(id);
const val = id => { const e = $(id); return e ? e.value.trim() : ''; };
const set = (id, v) => { const e = $(id); if (e) e.textContent = v; };

function toast(msg, dur = 2800) {
    const el = $('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), dur);
}

// ════════════════════════════════════════════════════════════
// 1. LOGIN / LOGOUT
// ════════════════════════════════════════════════════════════
function doLogin() {
    const pw = val('loginPassword');
    const loginScreen = $('loginScreen');
    const dashboard   = $('dashboard');
    const err = $('loginError');
    const inp = $('loginPassword');
    const btn = $('btnLogin');

    if (!pw) { toast('⚠️ Please enter the access key'); return; }

    // Visual feedback
    btn?.classList.add('loading');
    if (btn) btn.disabled = true;

    setTimeout(() => {
        if (pw === ADMIN_PASS) {
            sessionStorage.setItem('lumina_admin', 'true');
            loginScreen?.classList.add('hidden');
            dashboard?.classList.remove('hidden');
            onDashboardReady();
            toast('✅ Access Granted. Welcome back!');
        } else {
            if (err) err.textContent = '❌ Invalid security key. Access denied.';
            if (inp) {
                inp.style.borderColor = 'var(--danger)';
                inp.parentElement.classList.add('shake');
                setTimeout(() => {
                    if (err) err.textContent = '';
                    inp.style.borderColor = '';
                    inp.parentElement.classList.remove('shake');
                }, 2500);
            }
            if (btn) btn.disabled = false;
            btn?.classList.remove('loading');
        }
    }, 800);
}

function initAuth() {
    const loginScreen = $('loginScreen');
    const dashboard   = $('dashboard');

    if (sessionStorage.getItem('lumina_admin') === 'true') {
        loginScreen?.classList.add('hidden');
        dashboard?.classList.remove('hidden');
        onDashboardReady();
    }

    $('btnLogin')?.addEventListener('click', doLogin);
    $('loginPassword')?.addEventListener('keypress', e => { if (e.key === 'Enter') doLogin(); });

    // Interactive Mouse Parallax
    document.addEventListener('mousemove', e => {
        if (sessionStorage.getItem('lumina_admin') === 'true') return;
        const x = (e.clientX / window.innerWidth) - 0.5;
        const y = (e.clientY / window.innerHeight) - 0.5;
        document.documentElement.style.setProperty('--mx', x);
        document.documentElement.style.setProperty('--my', y);
    });

    // Caps Lock Detection
    $('loginPassword')?.addEventListener('keyup', e => {
        const warn = $('capsWarning');
        if (e.getModifierState && e.getModifierState('CapsLock')) {
            warn?.classList.remove('hidden');
        } else {
            warn?.classList.add('hidden');
        }
    });

    // Password Toggle
    $('togglePw')?.addEventListener('click', () => {
        const inp = $('loginPassword');
        const ico = $('togglePw').querySelector('i');
        if (!inp || !ico) return;
        if (inp.type === 'password') {
            inp.type = 'text';
            ico.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            inp.type = 'password';
            ico.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });

    $('btnLogout')?.addEventListener('click', () => {
        sessionStorage.removeItem('lumina_admin');
        window.location.reload();
    });
}

// ════════════════════════════════════════════════════════════
// 2. SIDEBAR NAVIGATION
// ════════════════════════════════════════════════════════════
const PAGE_TITLES = {
    editor:   'Live Editor',
    tamu:     'Daftar Tamu',
    rsvp:     'RSVP Dashboard',
    daftar:   'Undangan Tersimpan',
    template: 'Template Gallery',
    panduan:  'Panduan',
};

function initNav() {
    const links    = document.querySelectorAll('.sl[data-page]');
    const pages    = document.querySelectorAll('.admin-page');
    const sidebar  = $('sidebar');
    const toggle   = $('sidebarToggle');
    const overlay  = $('sidebarOverlay');
    const closeBtn = $('sidebarClose');

    const openSidebar = () => {
        sidebar.classList.add('open');
        overlay?.classList.add('active');
    };
    const closeSidebar = () => {
        sidebar.classList.remove('open');
        overlay?.classList.remove('active');
    };

    toggle?.addEventListener('click', openSidebar);
    overlay?.addEventListener('click', closeSidebar);
    closeBtn?.addEventListener('click', closeSidebar);

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pg = link.dataset.page; // Correctly define pg

            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            pages.forEach(p => p.classList.remove('active'));
            const target = $('page-' + pg);
            if (target) {
                target.classList.add('active');
                set('topbarTitle', PAGE_TITLES[pg] || 'Admin Panel');
            }

            if (window.innerWidth <= 1100) closeSidebar();

            // Page-specific init
            if (pg === 'daftar')   renderSavedList();
            if (pg === 'tamu')     populateTamuSelect();
            if (pg === 'rsvp')     initRsvpDashboard();
        });
    });
}

// ════════════════════════════════════════════════════════════
// 3. LIVE EDITOR
// ════════════════════════════════════════════════════════════
function initEditor() {
    // Template picker
    document.querySelectorAll('.tpl-opt').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.tpl-opt').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            currentTemplate = opt.dataset.tpl;
            schedulePreviewUpdate();
        });
    });

    // Listen to ALL inputs in editor form
    $('editorForm')?.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(updatePreview, 600);
        
        // Handle manual music URL input
        if(e.target && e.target.id === 'f-music') {
            const url = e.target.value;
            let songName = 'Custom Audio';
            try {
                songName = decodeURI(url.split('/').pop().split('.')[0].replace(/%20/g, ' '));
                if (!songName) songName = 'Custom Audio';
            } catch(e) {}
            
            const adminAudio = $('adminAudio');
            if(adminAudio) {
                adminAudio.pause();
                let audioSrc = url;
                if (audioSrc.startsWith('../../')) audioSrc = audioSrc.replace('../../', '../');
                adminAudio.src = audioSrc;
                updatePlayerUI(false, songName);
            }
        }
    });

    // Music Presets
    document.querySelectorAll('.m-p-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // UI Active State
            document.querySelectorAll('.m-p-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const linkInput = $('f-music');
            const adminAudio = $('adminAudio');
            const adminPlayerWrap = $('adminMusicPlayer');

            if (linkInput) {
                linkInput.value = btn.dataset.url;
                updatePreview();
                
                // Local Admin Playback
                if (adminAudio) {
                    let audioSrc = btn.dataset.url;
                    if (audioSrc.startsWith('../../')) {
                        audioSrc = audioSrc.replace('../../', '../');
                    }
                    adminAudio.src = audioSrc;
                    adminAudio.play().then(() => {
                        updatePlayerUI(true, btn.textContent.trim());
                    }).catch(() => {
                        console.log("Autoplay blocked, but UI updated.");
                        updatePlayerUI(false, btn.textContent.trim());
                    });
                }

                toast('🎵 Lagu dipilih: ' + btn.textContent.trim());
            }
        });
    });

    const adminAudio = $('adminAudio');
    const adminPlayerWrap = $('adminMusicPlayer');
    const btnToggleAdminMusic = $('btnToggleAdminMusic');
    const btnStopAdminMusic = $('btnStopAdminMusic');
    const adminMusicControls = $('adminMusicControls');
    const adminMusicLabel = $('adminMusicLabel');
    const adminMusicIcon = $('adminMusicIcon')?.querySelector('i');

    function updatePlayerUI(isPlaying, songName) {
        if (!adminPlayerWrap) return;
        
        if (songName) {
            adminMusicLabel.textContent = 'Memutar: ' + songName;
            adminMusicControls.style.display = 'flex';
            btnToggleAdminMusic.disabled = false;
        }

        if (isPlaying) {
            adminPlayerWrap.classList.add('playing');
            btnToggleAdminMusic.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
            if (adminMusicIcon) adminMusicIcon.className = 'fa-solid fa-compact-disc';
            btnStopAdminMusic.style.display = 'flex';
        } else {
            adminPlayerWrap.classList.remove('playing');
            btnToggleAdminMusic.innerHTML = '<i class="fa-solid fa-play"></i> Play';
            if (adminMusicIcon) adminMusicIcon.className = 'fa-solid fa-music';
        }
    }

    btnToggleAdminMusic?.addEventListener('click', () => {
        if (!adminAudio.src) return;
        if (adminAudio.paused) {
            adminAudio.play();
            updatePlayerUI(true);
        } else {
            adminAudio.pause();
            updatePlayerUI(false);
        }
    });

    btnStopAdminMusic?.addEventListener('click', () => {
        if (adminAudio) {
            adminAudio.pause();
            adminAudio.currentTime = 0;
            adminAudio.removeAttribute('src'); // clear src
            
            adminPlayerWrap?.classList.remove('playing');
            if (adminMusicLabel) adminMusicLabel.textContent = 'Pilih lagu untuk tes suara';
            if (adminMusicIcon) adminMusicIcon.className = 'fa-solid fa-music';
            if (adminMusicControls) adminMusicControls.style.display = 'none';
            btnStopAdminMusic.style.display = 'none';

            document.querySelectorAll('.m-p-btn').forEach(b => b.classList.remove('active'));
        }
    });

    // Device switcher
    document.querySelectorAll('.pdev-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.pdev-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const wrap  = $('previewFrameWrap');
            const frame = $('previewIframe');
            const isMobile = btn.dataset.mode === 'mobile';
            wrap?.classList.toggle('mobile-mode', isMobile);
            if (frame) frame.style.width = isMobile ? '430px' : '100%';
        });
    });

    // Generate Link
    $('btnGenLink')?.addEventListener('click', () => {
        currentUrl = buildUrl();
        const el = $('generatedUrl');
        if (el) el.innerHTML = `<a href="${currentUrl}" target="_blank" style="color:#60a5fa;word-break:break-all">${currentUrl}</a>`;
        $('btnCopyLink')?.removeAttribute('disabled');
        toast('✅ Link berhasil di-generate!');
    });

    // Copy Link
    $('btnCopyLink')?.addEventListener('click', () => {
        if (!currentUrl) return;
        navigator.clipboard.writeText(currentUrl).then(() => toast('📋 Link berhasil disalin!'));
    });

    // Open in new tab
    $('btnOpenNewTab')?.addEventListener('click', () => {
        const url = buildUrl();
        if (url) window.open(url, '_blank');
    });

    // Save invitation
    $('btnSaveInv')?.addEventListener('click', saveInvitation);

    // Initial preview
    updatePreview();
}

function schedulePreviewUpdate() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(updatePreview, 300);
}

function buildParams() {
    const params = new URLSearchParams();
    const fields = {
        groom: 'f-groom', bride: 'f-bride',
        groomFull: 'f-groomFull', brideFull: 'f-brideFull',
        groomParent: 'f-groomParent', brideParent: 'f-brideParent',
        groomIg: 'f-groomIg', brideIg: 'f-brideIg',
        date: 'f-date', dateFull: 'f-dateFull',
        akadDate: 'f-akadDate', akadTime: 'f-akadTime',
        akadPlace: 'f-akadPlace', akadAddress: 'f-akadAddress',
        akadISO: 'f-akadISO', akadMaps: 'f-akadMaps',
        resepsiDate: 'f-resepsiDate', resepsiTime: 'f-resepsiTime',
        resepsiPlace: 'f-resepsiPlace', resepsiAddress: 'f-resepsiAddress',
        resepsiISO: 'f-resepsiISO', resepsiMaps: 'f-resepsiMaps',
        bankName: 'f-bankName', bankAcc: 'f-bankAcc', bankHolder: 'f-bankHolder',
        wa: 'f-wa', guest: 'f-guest',
        sheetsUrl: 'f-sheetsUrl', invId: 'f-invId',
        music: 'f-music',
        hero: 'f-imgHero', imgPria: 'f-imgPria', imgWanita: 'f-imgWanita'
    };
    Object.entries(fields).forEach(([key, id]) => {
        const v = val(id);
        params.set(key, v);
    });

    // Our Story data
    for (let i = 1; i <= 4; i++) {
        const t = document.querySelector(`.s-title[data-idx="${i}"]`)?.value.trim();
        const d = document.querySelector(`.s-date[data-idx="${i}"]`)?.value.trim();
        const desc = document.querySelector(`.s-desc[data-idx="${i}"]`)?.value.trim();
        if (t) params.set(`s${i}t`, t);
        if (d) params.set(`s${i}d`, d);
        if (desc) params.set(`s${i}desc`, desc);
    }

    // Gallery Data
    document.querySelectorAll('.f-gallery').forEach(input => {
        const idx = input.dataset.idx;
        const v = input.value.trim();
        if (v) params.set(`gal${idx}`, v);
    });

    return params;
}

function buildUrl() {
    const base = new URL(TEMPLATE_PATHS[currentTemplate], window.location.href).href;
    return `${base}?${buildParams().toString()}`;
}

function updateImagePreviews() {
    const pairs = [
        ['f-imgHero', 'p-imgHero'],
        ['f-imgPria', 'p-imgPria'],
        ['f-imgWanita', 'p-imgWanita']
    ];
    pairs.forEach(([inputId, previewId]) => {
        const url = val(inputId);
        const box = $(previewId);
        if (box) box.style.backgroundImage = url ? `url("${url}")` : 'none';
    });

    // Gallery Previews
    document.querySelectorAll('.f-gallery').forEach(input => {
        const idx = input.dataset.idx;
        const url = input.value.trim();
        const box = $(`p-gallery-${idx}`);
        if (box) box.style.backgroundImage = url ? `url("${url}")` : 'none';
    });
}

function updatePreview() {
    const iframe = $('previewIframe');
    if (!iframe) return;
    const url = buildUrl();
    iframe.src = url;

    updateImagePreviews();

    const status = $('previewStatus');
    if (status) {
        status.innerHTML = `<span class="pulse-dot"></span> Memperbarui...`;
        setTimeout(() => {
            if (status) status.innerHTML = `<span class="pulse-dot"></span> Live Preview`;
        }, 1500);
    }
}

// ════════════════════════════════════════════════════════════
// 4. SAVED INVITATIONS (Appwrite Cloud + Local Fallback)
// ════════════════════════════════════════════════════════════
let MEM_SAVED = [];
let awClient = null;
let awDb = null;
let awStorage = null;

const awConfig = {
    endpoint:    localStorage.getItem('lumina_aw_endpoint') || 'https://cloud.appwrite.io/v1',
    projectId:   localStorage.getItem('lumina_aw_project') || '',
    databaseId:  localStorage.getItem('lumina_aw_db') || '',
    collectionId:localStorage.getItem('lumina_aw_col') || '',
    bucketId:    localStorage.getItem('lumina_aw_bucket') || '69e1ebb1000fefd0d33a'
};

function initAppwrite() {
    if ($('awEndpoint')) $('awEndpoint').value = awConfig.endpoint;
    if ($('awProject')) $('awProject').value = awConfig.projectId;
    if ($('awDb')) $('awDb').value = awConfig.databaseId;
    if ($('awCol')) $('awCol').value = awConfig.collectionId;
    if ($('awBucket')) $('awBucket').value = awConfig.bucketId;

    $('btnConnectAw')?.addEventListener('click', () => {
        awConfig.endpoint = val('awEndpoint') || 'https://cloud.appwrite.io/v1';
        awConfig.projectId = val('awProject');
        awConfig.databaseId = val('awDb');
        awConfig.collectionId = val('awCol');
        awConfig.bucketId = val('awBucket');
        
        localStorage.setItem('lumina_aw_endpoint', awConfig.endpoint);
        localStorage.setItem('lumina_aw_project', awConfig.projectId);
        localStorage.setItem('lumina_aw_db', awConfig.databaseId);
        localStorage.setItem('lumina_aw_col', awConfig.collectionId);
        localStorage.setItem('lumina_aw_bucket', awConfig.bucketId);
        
        setupAppwriteClient();
        fetchSavedList();
        updateAwStatusUI();
        toast('✅ Config Appwrite & Storage Disimpan!');
    });

    setupAppwriteClient();
    initUploadHandlers();
    updateAwStatusUI();

    if(awConfig.projectId && awConfig.databaseId && awConfig.collectionId) {
        fetchSavedList();
    } else {
        setSavedLocalFallback();
    }
}

function updateAwStatusUI() {
    const statusBox = $('awStatus');
    if (!statusBox) return;
    const span = statusBox.querySelector('span');
    
    if (awClient && awConfig.projectId) {
        statusBox.classList.add('connected');
        statusBox.classList.remove('disconnected');
        span.innerHTML = 'Terhubung ke Appwrite';
        statusBox.style.color = '#10b981';
    } else {
        statusBox.classList.remove('connected');
        statusBox.classList.add('disconnected');
        span.innerHTML = 'Belum terhubung';
        statusBox.style.color = '#94a3b8';
    }
}

function setupAppwriteClient() {
    if (typeof Appwrite === 'undefined') return;
    if (!awConfig.projectId) return;

    try {
        awClient = new Appwrite.Client();
        awClient.setEndpoint(awConfig.endpoint).setProject(awConfig.projectId);
        awStorage = new Appwrite.Storage(awClient);
        if (awConfig.databaseId) {
            awDb = new Appwrite.Databases(awClient);
        }
    } catch(err) {
        console.error('Appwrite Init Error:', err);
    }
}

function initUploadHandlers() {
    document.querySelectorAll('.f-upload').forEach(input => {
        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (!awStorage) setupAppwriteClient();
            if (!awStorage) {
                toast('⚠️ Konfigurasi Appwrite Project ID diperlukan untuk upload!');
                return;
            }

            const bucketId = awConfig.bucketId || '69e1ebb1000fefd0d33a';
            const targetId = input.dataset.target;
            const label = input.closest('.btn-upload');

            label.classList.add('loading');
            try {
                const response = await awStorage.createFile(bucketId, Appwrite.ID.unique(), file);
                const fileUrl = `${awConfig.endpoint}/storage/buckets/${bucketId}/files/${response.$id}/view?project=${awConfig.projectId}&mode=admin`;
                const targetInput = $(targetId);
                if (targetInput) {
                    targetInput.value = fileUrl;
                    updateImagePreviews();
                    updatePreview();
                    toast('✅ Foto berhasil diunggah!');
                }
            } catch (err) {
                console.error('Upload Error:', err);
                toast('❌ Gagal unggah: ' + (err.message || 'Error'));
            } finally {
                label.classList.remove('loading');
            }
        });
    });
}

async function fetchSavedList() {
    if (!awDb || !awConfig.databaseId) {
        setSavedLocalFallback();
        return;
    }
    
    try {
        const response = await awDb.listDocuments(awConfig.databaseId, awConfig.collectionId);
        MEM_SAVED = response.documents.map(doc => ({
            id: doc.$id,
            groom: doc.groom,
            bride: doc.bride,
            date: doc.date,
            template: doc.template,
            url: doc.url,
            savedAt: new Date(doc.$createdAt).toLocaleDateString('id-ID'),
            formData: doc.formData ? JSON.parse(doc.formData) : {}
        }));
        setSavedLocal(MEM_SAVED);
        renderSavedList();
    } catch (err) {
        console.error("Appwrite Fetch Error", err);
        setSavedLocalFallback();
    }
}

function setSavedLocalFallback() {
    try { MEM_SAVED = JSON.parse(localStorage.getItem('lumina_invitations')) || []; } catch { MEM_SAVED = []; }
    renderSavedList();
}
function setSavedLocal(data) {
    localStorage.setItem('lumina_invitations', JSON.stringify(data));
}

function getSaved() { return MEM_SAVED; }

async function saveInvitation() {
    const groom = val('f-groom');
    const bride = val('f-bride');
    if (!groom || !bride) { toast('⚠️ Nama mempelai wajib diisi!'); return; }

    const url = buildUrl();
    const invId = `inv_${Date.now()}`;
    const rawForm = Object.fromEntries(buildParams().entries());
    const fdStr = JSON.stringify(rawForm);

    const invData = {
        uid: invId,
        groom, bride,
        date: val('f-date') || "TBD",
        template: currentTemplate,
        url,
        formData: fdStr
    };

    if (awDb && awConfig.databaseId) {
        try {
            await awDb.createDocument(awConfig.databaseId, awConfig.collectionId, Appwrite.ID.unique(), invData);
            await fetchSavedList();
            toast(`💾 Tersimpan di Cloud!`);
        } catch(err) {
            console.error('Save Error:', err);
            toast('❌ Gagal simpan ke Cloud, menyimpan ke Lokal...');
            saveLocalOnly(invId, groom, bride, rawForm, url);
        }
    } else {
        saveLocalOnly(invId, groom, bride, rawForm, url);
    }
}

function saveLocalOnly(id, groom, bride, formData, url) {
    const invLocal = {
        id, groom, bride,
        date: formData.date || 'TBD',
        template: currentTemplate,
        url,
        savedAt: new Date().toLocaleDateString('id-ID'),
        formData
    };
    MEM_SAVED.push(invLocal);
    setSavedLocal(MEM_SAVED);
    renderSavedList();
    toast(`💾 Tersimpan di Lokal!`);
}

function renderSavedList() {
    const list = $('invList');
    if (!list) return;
    const saved = getSaved();

    set('invTotalStat', `Total: ${saved.length} Undangan`);

    if (!saved.length) {
        list.innerHTML = `<div class="empty-state"><i class="fa-solid fa-box-open"></i><p>Belum ada undangan tersimpan.</p></div>`;
        return;
    }

    list.innerHTML = saved.map(inv => {
        const meta = TEMPLATE_META[inv.template] || TEMPLATE_META.midnight;
        return `
        <div class="inv-card">
            <div class="inv-icon" style="background:${meta.color}">${meta.icon}</div>
            <div class="inv-info">
                <div class="inv-names">${inv.groom} & ${inv.bride}</div>
                <div class="inv-meta">
                    <span><i class="fa-regular fa-calendar"></i> ${inv.date}</span>
                    <span><i class="fa-solid fa-palette"></i> ${meta.label}</span>
                </div>
            </div>
            <div class="inv-actions">
                <button class="inv-btn-edit" onclick="loadInvToEditor('${inv.id}')"><i class="fa-solid fa-pen"></i> Edit</button>
                <a href="${inv.url}" target="_blank" class="inv-btn-p"><i class="fa-solid fa-eye"></i> Preview</a>
                <button class="inv-btn-d" onclick="deleteInvitation('${inv.id}')"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>`;
    }).join('');
}

window.deleteInvitation = async function(id) {
    if (awDb && awConfig.databaseId && id.toString().length > 15) {
        try {
            await awDb.deleteDocument(awConfig.databaseId, awConfig.collectionId, id);
            await fetchSavedList();
            toast('🗑️ Dihapus dari Cloud.');
        } catch(err) { toast('❌ Gagal hapus.'); }
    } else {
        MEM_SAVED = MEM_SAVED.filter(i => i.id.toString() !== id.toString());
        setSavedLocal(MEM_SAVED);
        renderSavedList();
        toast('🗑️ Dihapus.');
    }
};

window.loadInvToEditor = function(id) {
    const inv = getSaved().find(i => i.id.toString() === id.toString());
    if (!inv || !inv.formData) return;

    // Switch to editor
    const editorLink = document.querySelector('.sl[data-page="editor"]');
    if (editorLink) editorLink.click();

    const fd = inv.formData;
    const fields = {
        'f-groom': fd.groom, 'f-bride': fd.bride,
        'f-groomFull': fd.groomFull, 'f-brideFull': fd.brideFull,
        'f-groomParent': fd.groomParent, 'f-brideParent': fd.brideParent,
        'f-groomIg': fd.groomIg, 'f-brideIg': fd.brideIg,
        'f-date': fd.date, 'f-dateFull': fd.dateFull,
        'f-akadDate': fd.akadDate, 'f-akadTime': fd.akadTime,
        'f-akadPlace': fd.akadPlace, 'f-akadAddress': fd.akadAddress,
        'f-akadISO': fd.akadISO, 'f-akadMaps': fd.akadMaps,
        'f-resepsiDate': fd.resepsiDate, 'f-resepsiTime': fd.resepsiTime,
        'f-resepsiPlace': fd.resepsiPlace, 'f-resepsiAddress': fd.resepsiAddress,
        'f-resepsiISO': fd.resepsiISO, 'f-resepsiMaps': fd.resepsiMaps,
        'f-bankName': fd.bankName, 'f-bankAcc': fd.bankAcc, 'f-bankHolder': fd.bankHolder,
        'f-wa': fd.wa, 'f-guest': fd.guest,
        'f-sheetsUrl': fd.sheetsUrl, 'f-invId': fd.invId,
        'f-music': fd.music, 'f-imgHero': fd.hero, 'f-imgPria': fd.imgPria, 'f-imgWanita': fd.imgWanita
    };
    
    Object.entries(fields).forEach(([id, v]) => { const el = $(id); if (el) el.value = v || ''; });
    
    // Stories
    for (let i = 1; i <= 4; i++) {
        const t = document.querySelector(`.s-title[data-idx="${i}"]`);
        const d = document.querySelector(`.s-date[data-idx="${i}"]`);
        const de = document.querySelector(`.s-desc[data-idx="${i}"]`);
        if (t) t.value = fd[`s${i}t`] || '';
        if (d) d.value = fd[`s${i}d`] || '';
        if (de) de.value = fd[`s${i}desc`] || '';
    }

    // Gallery
    document.querySelectorAll('.f-gallery').forEach(input => {
        const idx = input.dataset.idx;
        input.value = fd[`gal${idx}`] || '';
    });

    currentTemplate = inv.template;
    document.querySelectorAll('.tpl-opt').forEach(o => o.classList.toggle('selected', o.dataset.tpl === currentTemplate));
    
    updatePreview();
    toast('✅ Data dimuat ke editor!');
};

// ════════════════════════════════════════════════════════════
// 5. DAFTAR TAMU
// ════════════════════════════════════════════════════════════
function initGuestList() {
    $('btnGenTamu')?.addEventListener('click', generateGuestLinks);
    $('btnCopyAll')?.addEventListener('click', () => {
        const txt = (window._tamuLinks || []).map(l => `${l.name}: ${l.url}`).join('\n');
        if (txt) navigator.clipboard.writeText(txt).then(() => toast('📋 Semua disalin!'));
    });
    $('btnExportTxt')?.addEventListener('click', () => {
        const txt = (window._tamuLinks || []).map(l => `${l.name}\n${l.url}`).join('\n\n');
        if (!txt) return;
        const blob = new Blob([txt], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'daftar-tamu.txt';
        a.click();
    });
}

function populateTamuSelect() {
    const sel = $('tamuSelectInv');
    if (!sel) return;
    const saved = getSaved();
    sel.innerHTML = '<option value="">-- Pilih undangan --</option>' + saved.map(i => `<option value="${i.url}">${i.groom} & ${i.bride} (${i.date})</option>`).join('');
    sel.onchange = () => { if (sel.value) $('tamuBaseUrl').value = sel.value; };
}

function generateGuestLinks() {
    const baseUrl = val('tamuBaseUrl');
    const namesRaw = val('tamuNames');
    if (!baseUrl || !namesRaw) { toast('⚠️ Isi Base URL dan Nama Tamu!'); return; }
    
    const names = namesRaw.split('\n').map(n => n.trim()).filter(Boolean);
    const links = names.map((name, i) => {
        const u = new URL(baseUrl);
        u.searchParams.set('guest', name);
        return { no: i+1, name, url: u.toString() };
    });

    const tbody = $('tamuTableBody');
    if (tbody) {
        tbody.innerHTML = links.map(l => `
            <tr>
                <td>${l.no}</td>
                <td><strong>${l.name}</strong></td>
                <td class="tamu-link-cell">${l.url}</td>
                <td class="tamu-btns">
                    <button class="tbl-btn" onclick="navigator.clipboard.writeText('${l.url}').then(()=>toast('📋 Disalin!'))"><i class="fa-regular fa-copy"></i></button>
                    <button class="tbl-btn tbl-btn-wa" onclick="window.open('https://wa.me/?text='+encodeURIComponent('Halo *${l.name}*,\\nBerikut link undangan pernikahan kami:\\n${l.url}'))"><i class="fa-brands fa-whatsapp"></i></button>
                </td>
            </tr>
        `).join('');
    }
    window._tamuLinks = links;
    set('tamuCount', `${links.length} Link Berhasil`);
    $('tamuResult')?.classList.remove('hidden');
}

// ════════════════════════════════════════════════════════════
// 6. RSVP DASHBOARD
// ════════════════════════════════════════════════════════════
function initRsvpDashboard() {
    if (rsvpSheetsUrl) fetchRsvpData();

    $('btnConnectSheets')?.addEventListener('click', () => {
        const url = val('rsvpSheetsUrl');
        if (!url || !url.startsWith('https://script.google.com')) { toast('⚠️ URL Script tidak valid!'); return; }
        rsvpSheetsUrl = url;
        localStorage.setItem('lumina_sheets_url', url);
        fetchRsvpData();
    });

    $('btnRefreshRsvp')?.addEventListener('click', fetchRsvpData);
    $('btnRefreshRsvpTop')?.addEventListener('click', fetchRsvpData);
    $('rsvpSearch')?.addEventListener('input', renderRsvpTable);
    $('rsvpFilter')?.addEventListener('change', renderRsvpTable);
}

function fetchRsvpData() {
    if (!rsvpSheetsUrl) return;
    toast('🔄 Memuat RSVP...');
    const invId = val('f-invId');
    fetch(rsvpSheetsUrl + (invId ? `?invId=${invId}` : ''))
        .then(res => res.json())
        .then(data => {
            rsvpData = Array.isArray(data) ? data : [];
            renderRsvpStats();
            renderRsvpTable();
            toast('✅ RSVP Dimuat!');
        })
        .catch(() => {
            toast('❌ Gagal ambil data. Gunakan mode demo.');
            rsvpData = [
                { timestamp: '17/04/2026', name: 'Contoh Tamu 1', attendance: 'Hadir', message: 'Selamat!' },
                { timestamp: '17/04/2026', name: 'Contoh Tamu 2', attendance: 'Tidak Hadir', message: 'Maaf ya.' }
            ];
            renderRsvpStats();
            renderRsvpTable();
        });
}

function renderRsvpStats() {
    const t = rsvpData.length, h = rsvpData.filter(d => d.attendance === 'Hadir').length;
    const th = rsvpData.filter(d => d.attendance === 'Tidak Hadir').length, r = rsvpData.filter(d => d.attendance === 'Masih Ragu').length;
    set('stat-total', t); set('stat-hadir', h); set('stat-tidak', th); set('stat-ragu', r);
    const setBar = (id, pid, v) => {
        const el = $(id), pel = $(pid);
        const pct = t ? Math.round((v/t)*100) : 0;
        if(el) el.style.width = pct + '%';
        if(pel) pel.textContent = pct + '%';
    };
    setBar('bar-hadir', 'pct-hadir', h);
    setBar('bar-tidak', 'pct-tidak', th);
    setBar('bar-ragu', 'pct-ragu', r);
}

function renderRsvpTable() {
    const tbody = $('rsvpTableBody'), s = val('rsvpSearch').toLowerCase(), f = val('rsvpFilter');
    if (!tbody) return;
    const filtered = rsvpData.filter(d => (!s || d.name.toLowerCase().includes(s)) && (!f || d.attendance === f));
    tbody.innerHTML = filtered.length ? filtered.map((d, i) => `
        <tr>
            <td>${i+1}</td>
            <td style="font-size:0.7rem">${d.timestamp}</td>
            <td><strong>${d.name}</strong></td>
            <td><span class="status-pill status-${d.attendance === 'Hadir' ? 'hadir' : d.attendance === 'Tidak Hadir' ? 'tidak' : 'ragu'}">${d.attendance}</span></td>
            <td style="font-size:0.8rem">${d.message}</td>
        </tr>
    `).join('') : '<tr><td colspan="5" style="text-align:center;padding:40px">Tidak ada data</td></tr>';
}

// ════════════════════════════════════════════════════════════
// 7. MODALS & NAV
// ════════════════════════════════════════════════════════════
function initModals() {
    const closeAll = () => document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
    
    const btnGuide = $('btnShowGuide');
    if (btnGuide) btnGuide.onclick = () => $('sheetsModal')?.classList.remove('hidden');

    const linkGuide = $('linkSheetsGuide');
    if (linkGuide) linkGuide.onclick = (e) => { e.preventDefault(); $('sheetsModal')?.classList.remove('hidden'); };

    document.querySelectorAll('.modal').forEach(m => {
        m.onclick = (e) => { if (e.target === m) closeAll(); };
    });
    document.onkeydown = (e) => { if (e.key === 'Escape') closeAll(); };
}


// ════════════════════════════════════════════════════════════
// BOOTSTRAP
// ════════════════════════════════════════════════════════════
function onDashboardReady() {
    if (isInitialized) return;
    isInitialized = true;

    initNav();
    initEditor();
    initGuestList();
    initModals();
    initAppwrite();
}

document.addEventListener('DOMContentLoaded', initAuth);
