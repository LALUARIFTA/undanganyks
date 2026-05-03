import { supabase } from '../src/lib/supabase.js';

/* ============================================================
   LUMINA INVITES — USER DASHBOARD SCRIPT
   Authentication: Supabase Auth
   ============================================================ */

let authMode = 'login'; // 'login' or 'signup'

const TEMPLATE_PATHS = {
    midnight: '/templates/wedding-midnight/index.html',
    blossom:  '/templates/wedding-blossom/index.html',
    rustic:   '/templates/wedding-rustic/index.html',
    jawa:     '/templates/wedding-jawa/index.html',
    bali:     '/templates/wedding-bali/index.html',
    aether:   '/templates/wedding-aether/index.html',
    premium:  '/templates/wedding-premium/index.html',
};
const TEMPLATE_META = {
    midnight: { icon: '🌙', color: 'rgba(212,175,55,0.25)', label: 'Midnight Gold' },
    blossom:  { icon: '🌸', color: 'rgba(244,114,182,0.25)', label: 'Blossom Blush' },
    rustic:   { icon: '🌿', color: 'rgba(168,162,158,0.25)', label: 'Rustic Garden' },
    jawa:     { icon: '🏯', color: 'rgba(185,28,28,0.25)',   label: 'Jawa Kraton'   },
    bali:     { icon: '🌺', color: 'rgba(20,184,166,0.25)',  label: 'Bali Pura'     },
    aether:   { icon: '✨', color: 'rgba(124,58,237,0.25)',  label: '3D Aether'     },
    premium:  { icon: '💎', color: 'rgba(79,70,229,0.25)',  label: 'Premium Luxe'  },
};

// ─── State
let currentTemplate = 'midnight';
let currentUrl      = '';
let debounceTimer   = null;
let isInitialized   = false;
let editingId       = null;
let currentUserId   = 'guest';

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
// ════════════════════════════════════════════════════════════
// 1. LOGIN / LOGOUT (Supabase Auth - Admin Only)
// ════════════════════════════════════════════════════════════
async function handleAuth() {
    const email = val('loginEmail');
    const password = val('loginPassword');
    const err = $('loginError');
    const btn = $('btnLogin');
    const btnText = $('btnText');

    if (!email || !password) { 
        toast('⚠️ Mohon isi Email dan Password'); 
        if (err) err.textContent = 'Mohon isi Email dan Password';
        return; 
    }

    btn.disabled = true;
    const originalText = btnText.innerHTML;
    btnText.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Memuat...';

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        
        if (error) throw error;
        
        toast('✅ Berhasil Masuk!');
        setTimeout(() => window.location.reload(), 800);
    } catch (error) {
        console.error('Auth Error:', error);
        let msg = error.message;

        if (msg.includes('Invalid login credentials')) {
            msg = '❌ Email atau Password salah!';
        }

        if (err) err.textContent = msg;
        toast(msg);
        setTimeout(() => { if (err) err.textContent = ''; }, 5000);
    } finally {
        btn.disabled = false;
        btnText.innerHTML = originalText;
    }
}

async function doLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) toast(`❌ Logout error: ${error.message}`);
    else window.location.reload();
}

async function initAuth() {
    const loginScreen = $('loginScreen');
    const dashboard = $('dashboard');

    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session && session.user) {
            // User is logged in
            currentUserId = session.user.id;
            if (loginScreen) loginScreen.style.display = 'none';
            if (dashboard) dashboard.classList.remove('hidden');
            
            set('displayUserEmail', session.user.email);
            onDashboardReady();
            
            // Listener for logout button
            $('btnLogout')?.addEventListener('click', doLogout);
        } else {
            // Not logged in
            if (loginScreen) loginScreen.style.display = 'flex';
            if (dashboard) dashboard.classList.add('hidden');
            
            set('displayUserEmail', 'Belum Login');
            
            // Listeners for login UI
            $('btnLogin')?.addEventListener('click', handleAuth);
            $('loginPassword')?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleAuth();
            });
        }
    } catch (err) {
        console.error('Auth Init Error:', err);
    }
    
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
            set('displayUserEmail', session.user.email);
        } else if (event === 'SIGNED_OUT') {
            editingId = null;
            window.location.reload();
        }
    });
}


// ════════════════════════════════════════════════════════════
// 2. LIVE EDITOR SETUP
// ════════════════════════════════════════════════════════════

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
        debounceTimer = setTimeout(() => { updatePreview(); saveDraft(); }, 600);
        
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

    // Device switcher (Hanya untuk mode desktop/mobile)
    document.querySelectorAll('.pdev-btn[data-mode]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.pdev-btn[data-mode]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const wrap  = $('previewFrameWrap');
            const frame = $('previewIframe');
            const isMobile = btn.dataset.mode === 'mobile';
            wrap?.classList.toggle('mobile-mode', isMobile);
            if (frame) frame.style.width = isMobile ? '430px' : '100%';
        });
    });

    // Layout Swapper (Setel Kiri/Kanan)
    const editorPage = $('page-editor');
    const btnSwap = $('btnSwapLayout');
    const isRtl = localStorage.getItem('lumina_editor_layout') === 'rtl';
    
    if (isRtl && editorPage) {
        editorPage.classList.add('rtl-layout');
        btnSwap?.classList.add('active');
    }

    btnSwap?.addEventListener('click', () => {
        const currentlyRtl = editorPage?.classList.toggle('rtl-layout');
        btnSwap.classList.toggle('active', currentlyRtl);
        localStorage.setItem('lumina_editor_layout', currentlyRtl ? 'rtl' : 'ltr');
        toast(currentlyRtl ? '🔄 Layout: Preview di Kiri' : '🔄 Layout: Preview di Kanan');
    });

    // Generate Link
    $('btnGenLink')?.addEventListener('click', () => {
        currentUrl = buildUrl();
        const el = $('generatedUrl');
        if (el) el.innerHTML = `<a href="${currentUrl}" target="_blank" style="color:#60a5fa;word-break:break-all">${currentUrl}</a>`;
        $('btnCopyLink')?.removeAttribute('disabled');
        $('btnShareWa')?.removeAttribute('disabled');
        toast('✅ Link berhasil di-generate!');
    });

    // Copy Link
    $('btnCopyLink')?.addEventListener('click', () => {
        if (!currentUrl) return;
        navigator.clipboard.writeText(currentUrl).then(() => toast('📋 Link berhasil disalin!'));
    });

    // Share WA
    $('btnShareWa')?.addEventListener('click', () => {
        if (!currentUrl) return;
        const groom = val('f-groom') || 'Mempelai Pria';
        const bride = val('f-bride') || 'Mempelai Wanita';
        const text = `Kepada Yth.\nBapak/Ibu/Saudara/i\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:\n\n*${groom} & ${bride}*\n\nBerikut link undangan kami:\n${currentUrl}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.\n\nTerima kasih.`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    });

    // Open in new tab
    $('btnOpenNewTab')?.addEventListener('click', () => {
        const url = buildUrl();
        if (url) window.open(url, '_blank');
    });

    // Save invitation
    $('btnSaveInv')?.addEventListener('click', saveInvitation);
    $('btnResetEditor')?.addEventListener('click', resetEditor);

    // Auto-save draft every 30 seconds
    setInterval(saveDraft, 30000);

    // Restore draft if not editing a saved invitation
    if (!editingId) restoreDraft();

    // Initial preview
    updatePreview();
}

// ── Auto-Save Draft ──
function saveDraft() {
    if (currentUserId === 'guest') return; // Don't save draft for guests
    const rawForm = Object.fromEntries(buildParams().entries());
    rawForm._template = currentTemplate;
    rawForm._editingId = editingId || '';
    localStorage.setItem(`lumina_draft_${currentUserId}`, JSON.stringify(rawForm));
}

function restoreDraft() {
    if (currentUserId === 'guest') return;
    try {
        const draft = JSON.parse(localStorage.getItem(`lumina_draft_${currentUserId}`));
        if (!draft || !draft.groom) return; // No draft or empty draft

        // Don't restore if we are editing a saved invitation
        if (draft._editingId) return;

        const fields = {
            'f-groom': draft.groom, 'f-bride': draft.bride,
            'f-groomFull': draft.groomFull, 'f-brideFull': draft.brideFull,
            'f-groomParent': draft.groomParent, 'f-brideParent': draft.brideParent,
            'f-groomIg': draft.groomIg, 'f-brideIg': draft.brideIg,
            'f-date': draft.date, 'f-dateFull': draft.dateFull,
            'f-akadDate': draft.akadDate, 'f-akadTime': draft.akadTime,
            'f-akadPlace': draft.akadPlace, 'f-akadAddress': draft.akadAddress,
            'f-akadISO': draft.akadISO, 'f-akadMaps': draft.akadMaps,
            'f-resepsiDate': draft.resepsiDate, 'f-resepsiTime': draft.resepsiTime,
            'f-resepsiPlace': draft.resepsiPlace, 'f-resepsiAddress': draft.resepsiAddress,
            'f-resepsiISO': draft.resepsiISO, 'f-resepsiMaps': draft.resepsiMaps,
            'f-bankName': draft.bankName, 'f-bankAcc': draft.bankAcc, 'f-bankHolder': draft.bankHolder,
            'f-wa': draft.wa, 'f-guest': draft.guest,
            'f-music': draft.music, 'f-imgHero': draft.hero, 'f-imgPria': draft.imgPria, 'f-imgWanita': draft.imgWanita
        };
        Object.entries(fields).forEach(([id, v]) => { const el = $(id); if (el && v) el.value = v; });

        // Stories
        for (let i = 1; i <= 4; i++) {
            const t = document.querySelector(`.s-title[data-idx="${i}"]`);
            const d = document.querySelector(`.s-date[data-idx="${i}"]`);
            const de = document.querySelector(`.s-desc[data-idx="${i}"]`);
            if (t && draft[`s${i}t`]) t.value = draft[`s${i}t`];
            if (d && draft[`s${i}d`]) d.value = draft[`s${i}d`];
            if (de && draft[`s${i}desc`]) de.value = draft[`s${i}desc`];
        }

        // Gallery
        document.querySelectorAll('.f-gallery').forEach(input => {
            const idx = input.dataset.idx;
            if (draft[`gal${idx}`]) input.value = draft[`gal${idx}`];
        });

        // Template
        if (draft._template) {
            currentTemplate = draft._template;
            document.querySelectorAll('.tpl-opt').forEach(o => o.classList.toggle('selected', o.dataset.tpl === currentTemplate));
        }

        toast('📄 Draft sebelumnya dipulihkan');
    } catch (e) {
        // Silent fail — draft restoration is non-critical
    }
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
// 4. SAVED INVITATIONS (Supabase Database & Storage)
// ════════════════════════════════════════════════════════════
let MEM_SAVED = [];

function initSupabaseFeatures() {
    initUploadHandlers();
    updateSupabaseStatusUI();
    fetchSavedList();
}

function updateSupabaseStatusUI() {
    const statusBox = $('awStatus'); // Keeping the ID for compatibility with HTML
    if (!statusBox) return;
    const span = statusBox.querySelector('span');
    const icon = statusBox.querySelector('i');
    
    if (supabase) {
        statusBox.classList.add('connected');
        statusBox.classList.remove('disconnected');
        span.innerHTML = 'Terhubung ke Supabase';
        statusBox.style.color = '#10b981';
        if (icon) icon.className = 'fa-solid fa-database';
    } else {
        statusBox.classList.remove('connected');
        statusBox.classList.add('disconnected');
        span.innerHTML = 'Supabase tidak terdeteksi';
        statusBox.style.color = '#94a3b8';
    }
}

function initUploadHandlers() {
    document.querySelectorAll('.f-upload').forEach(input => {
        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const targetId = input.dataset.target;
            const label = input.closest('.btn-upload');

            label.classList.add('loading');
            label.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';

            try {
                const fileName = `${Date.now()}-${file.name}`;
                const { data, error } = await supabase.storage
                    .from('invitations')
                    .upload(`uploads/${fileName}`, file);

                if (error) throw error;

                const { data: { publicUrl } } = supabase.storage
                    .from('invitations')
                    .getPublicUrl(`uploads/${fileName}`);

                const targetInput = $(targetId);
                if (targetInput) {
                    targetInput.value = publicUrl;
                    updateImagePreviews();
                    updatePreview();
                    toast('✅ Foto berhasil diunggah ke Supabase!');
                }
            } catch (err) {
                console.error('Upload Error:', err);
                toast('❌ Gagal unggah: ' + (err.message || 'Pastikan bucket "invitations" sudah dibuat di Supabase Storage'));
            } finally {
                label.classList.remove('loading');
                label.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i>';
            }
        });
    });
}


async function fetchSavedList() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            renderSavedList();
            return;
        }

        const { data, error } = await supabase
            .from('invitations')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        MEM_SAVED = data.map(doc => ({
            id: doc.id,
            groom: doc.groom,
            bride: doc.bride,
            date: doc.date,
            template: doc.template,
            url: doc.url,
            savedAt: new Date(doc.created_at).toLocaleDateString('id-ID'),
            formData: doc.formData
        }));
        
        setSavedLocal(MEM_SAVED);
        renderSavedList();
    } catch (err) {
        console.error("Supabase Fetch Error", err);
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
    const rawForm = Object.fromEntries(buildParams().entries());
    const btn = $('btnSaveInv');

    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) { 
            toast('⚠️ Anda harus login untuk menyimpan!');
            return; 
        }

        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Menyimpan...';

        const invData = {
            user_id: user.id,
            groom,
            bride,
            date: val('f-date') || "TBD",
            template: currentTemplate,
            url,
            formdata: rawForm
        };

        let result;
        if (editingId) {
            // UPDATE existing
            result = await supabase
                .from('invitations')
                .update(invData)
                .eq('id', editingId)
                .select();
        } else {
            // INSERT new — use .select() to get back the new row's ID
            result = await supabase
                .from('invitations')
                .insert([invData])
                .select();
        }

        if (result.error) throw result.error;

        // Set editingId to the saved row so subsequent saves UPDATE instead of INSERT
        if (result.data && result.data.length > 0) {
            editingId = result.data[0].id;
        }

        await fetchSavedList();
        toast(editingId ? '✅ Undangan berhasil disimpan!' : '💾 Berhasil disimpan di Cloud!');
        
        // Aktifkan tombol Generate Link setelah berhasil simpan
        $('btnGenLink')?.removeAttribute('disabled');
    } catch(err) {
        console.error('Save Error:', err);
        toast('❌ Gagal simpan: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Simpan Undangan';
    }
}

function saveLocalOnly(id, groom, bride, formData, url) {
    const invLocal = {
        id, groom, bride,
        date: formData.date || 'TBD',
        template: currentTemplate,
        url,
        savedAt: new Date().toLocaleDateString('id-ID'),
        formdata: formData
    };

    // Check if we are updating an existing local invitation
    const existingIdx = MEM_SAVED.findIndex(inv => inv.id.toString() === id.toString());
    if (existingIdx !== -1) {
        MEM_SAVED[existingIdx] = invLocal;
    } else {
        MEM_SAVED.push(invLocal);
    }

    editingId = id; // Set editingId so subsequent saves UPDATE this entry
    setSavedLocal(MEM_SAVED);
    renderSavedList();
    
    // Aktifkan tombol Generate Link setelah berhasil simpan lokal
    $('btnGenLink')?.removeAttribute('disabled');
    
    toast(existingIdx !== -1 ? '✅ Undangan berhasil diperbarui!' : '💾 Tersimpan di Lokal!');
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
    if (!confirm('Apakah Anda yakin ingin menghapus undangan ini?')) return;
    
    try {
        const { error } = await supabase
            .from('invitations')
            .delete()
            .eq('id', id);

        if (error) throw error;
        
        await fetchSavedList();
        toast('🗑️ Undangan berhasil dihapus dari Cloud.');
    } catch(err) { 
        console.error('Delete Error:', err);
        toast('❌ Gagal hapus dari Cloud: ' + err.message); 
    }
};

window.loadInvToEditor = function(id) {
    const inv = getSaved().find(i => i.id.toString() === id.toString());
    const rawData = inv?.formdata || inv?.formData;
    if (!inv || !rawData) return;

    editingId = id; // Track that we are editing this specific invitation
    toast('📂 Memuat data undangan ke editor...');

    // Switch to editor
    const editorLink = document.querySelector('.sl[data-page="editor"]');
    if (editorLink) editorLink.click();

    const fd = rawData;
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
    
    // Aktifkan tombol Generate Link karena data sudah ada/pernah disimpan
    $('btnGenLink')?.removeAttribute('disabled');
    $('btnCopyLink')?.setAttribute('disabled', 'true'); // Reset salin link sampai generate baru
    $('btnShareWa')?.setAttribute('disabled', 'true'); // Reset share WA sampai generate baru
    
    updatePreview();
    toast('✅ Data dimuat ke editor!');
};

window.resetEditor = function() {
    if (editingId && !confirm('Mulai membuat undangan baru? (Data yang belum disimpan akan hilang)')) return;
    
    editingId = null;
    $('editorForm')?.reset();
    currentTemplate = 'midnight';
    
    // Reset selection UI
    document.querySelectorAll('.tpl-opt').forEach(o => o.classList.remove('selected'));
    document.querySelector('.tpl-opt[data-tpl="midnight"]')?.classList.add('selected');
    
    updatePreview();
    
    // Disable action buttons
    $('btnGenLink')?.setAttribute('disabled', 'true');
    $('btnCopyLink')?.setAttribute('disabled', 'true');
    $('btnShareWa')?.setAttribute('disabled', 'true');
    $('generatedUrl') ? $('generatedUrl').innerHTML = `<p class="url-ph"><i class="fa-solid fa-arrow-up"></i> Klik "Generate Link" untuk membuat tautan</p>` : null;
    
    // Clear draft
    if (currentUserId !== 'guest') {
        localStorage.removeItem(`lumina_draft_${currentUserId}`);
    }
    
    toast('✨ Siap membuat undangan baru!');
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
// 7. MODALS & NAV
// ════════════════════════════════════════════════════════════
function initModals() {
    const closeAll = () => document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
    
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

    initEditor();
    initGuestList();
    initModals();
    initSupabaseFeatures();
}

document.addEventListener('DOMContentLoaded', initAuth);
