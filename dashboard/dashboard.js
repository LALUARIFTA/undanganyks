import { supabase } from '../src/lib/supabase.js';

/* ============================================================
   LUMINA INVITES — USER DASHBOARD SCRIPT
   Authentication: Supabase Auth
   ============================================================ */

let authMode = 'login'; // 'login' or 'signup'

const TEMPLATE_PATHS = {
    midnight: '/templates/wedding-midnight/index.html',
    blossom: '/templates/wedding-blossom/index.html',
    rustic: '/templates/wedding-rustic/index.html',
    jawa: '/templates/wedding-jawa/index.html',
    bali: '/templates/wedding-bali/index.html',
    aether: '/templates/wedding-aether/index.html',
    premium: '/templates/wedding-premium/index.html',
};
const TEMPLATE_META = {
    midnight: { icon: '🌙', color: 'rgba(212,175,55,0.25)', label: 'Midnight Gold' },
    blossom: { icon: '🌸', color: 'rgba(244,114,182,0.25)', label: 'Blossom Blush' },
    rustic: { icon: '🌿', color: 'rgba(168,162,158,0.25)', label: 'Rustic Garden' },
    jawa: { icon: '🏯', color: 'rgba(185,28,28,0.25)', label: 'Jawa Kraton' },
    bali: { icon: '🌺', color: 'rgba(20,184,166,0.25)', label: 'Bali Pura' },
    aether: { icon: '✨', color: 'rgba(124,58,237,0.25)', label: '3D Aether' },
    premium: { icon: '💎', color: 'rgba(79,70,229,0.25)', label: 'Premium Luxe' },
};

// ─── State
let currentTemplate = 'midnight';
let currentUrl = '';
let debounceTimer = null;
let isInitialized = false;
let editingId = null;
let currentUserId = 'guest';

// ─── Utils
const $ = id => document.getElementById(id);
const val = id => { const e = $(id); return e ? e.value.trim() : ''; };
const set = (id, v) => { const e = $(id); if (e) e.textContent = v; };
const setHTML = (id, v) => { const e = $(id); if (e) e.innerHTML = v; };

function toast(msg, dur = 2800) {
    const el = $('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), dur);
}

function getAdaptiveUrl(originalUrl) {
    if (!originalUrl) return '';
    try {
        const uObj = new URL(originalUrl);
        uObj.hostname = window.location.hostname;
        uObj.port = window.location.port;
        uObj.protocol = window.location.protocol;
        return uObj.toString();
    } catch(e) {
        return originalUrl;
    }
}

function getShortUrl(inv) {
    if (!inv) return '';
    if (inv.slug) {
        return `${window.location.origin}/v/index.html?s=${inv.slug}`;
    }
    return getAdaptiveUrl(inv.url);
}

window.copyToClipboard = function(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => toast('📋 Berhasil disalin!')).catch(() => toast('❌ Gagal menyalin'));
    } else {
        let textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            toast('📋 Berhasil disalin!');
        } catch (err) {
            toast('❌ Gagal menyalin');
        }
        textArea.remove();
    }
};

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
window.doLogout = doLogout;

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
        if (e.target && e.target.id === 'f-music') {
            const url = e.target.value;
            let songName = 'Custom Audio';
            try {
                songName = decodeURI(url.split('/').pop().split('.')[0].replace(/%20/g, ' '));
                if (!songName) songName = 'Custom Audio';
            } catch (e) { }

            const adminAudio = $('adminAudio');
            if (adminAudio) {
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
            const wrap = $('previewFrameWrap');
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
        const slug = val('f-slug').trim();
        if (slug) {
            const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
            // In development, origin is likely localhost:5173
            currentUrl = `${window.location.origin}/v/index.html?s=${cleanSlug}`;
        } else {
            currentUrl = buildUrl();
        }

        const el = $('generatedUrl');
        if (el) el.innerHTML = `
            <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px; border: 1px dashed rgba(255,255,255,0.1); margin-bottom: 10px;">
                <p style="font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 5px;">Link Undangan Anda:</p>
                <a href="${currentUrl}" target="_blank" style="color:#60a5fa; word-break:break-all; font-weight: 500;">${currentUrl}</a>
            </div>
        `;
        $('btnCopyLink')?.removeAttribute('disabled');
        $('btnShareWa')?.removeAttribute('disabled');
        toast('✅ Link berhasil di-generate!');
    });

    // Copy Link
    $('btnCopyLink')?.addEventListener('click', () => {
        if (!currentUrl) return;
        window.copyToClipboard(currentUrl);
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
    $('btnTogglePreview')?.addEventListener('click', toggleLivePreview);

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

    // Gallery
    document.querySelectorAll('.f-gallery').forEach(input => {
        const idx = input.dataset.idx;
        const v = input.value.trim();
        if (v) params.set(`gal${idx}`, v);
    });

    return params;
}

function buildUrl() {
    const base = new URL(TEMPLATE_PATHS[currentTemplate], window.location.href).href;
    const params = buildParams();

    // Include the invitation ID if we have one (for RSVP tracking)
    if (editingId) {
        params.set('invId', editingId);
        // Include Supabase credentials for the template to send RSVP back
        params.set('surl', supabase.supabaseUrl);
        params.set('skey', supabase.supabaseKey);
    }

    return `${base}?${params.toString()}`;
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
window.updatePreview = updatePreview;

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
            formdata: doc.formdata
        }));

        setSavedLocal(MEM_SAVED);
        renderSavedList();
        
        // If we are on the guest page, refresh the select dropdown
        if (document.querySelector('.sl[data-page="guest"].active')) {
            populateTamuSelect();
        }

        // ── Auto-load the most recent invitation ──
        if (MEM_SAVED.length > 0 && !editingId) {
            const lastInv = MEM_SAVED[0];
            const draft = JSON.parse(localStorage.getItem(`lumina_draft_${currentUserId}`));
            if (!draft || !draft.groom || draft._editingId) {
                loadInvToEditor(lastInv.id);
            }
        }
    } catch (err) {
        console.error("Supabase Fetch Error", err);
        setSavedLocalFallback();
    }
}

function setSavedLocalFallback() {
    try {
        const key = currentUserId === 'guest' ? 'lumina_invitations' : `lumina_invitations_${currentUserId}`;
        MEM_SAVED = JSON.parse(localStorage.getItem(key)) || [];
    } catch {
        MEM_SAVED = [];
    }
    renderSavedList();
}
function setSavedLocal(data) {
    const key = currentUserId === 'guest' ? 'lumina_invitations' : `lumina_invitations_${currentUserId}`;
    localStorage.setItem(key, JSON.stringify(data));
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

        const slug = val('f-slug').toLowerCase().replace(/[^a-z0-9-]/g, '');

        const invData = {
            user_id: user.id,
            groom,
            bride,
            date: val('f-date') || "TBD",
            template: currentTemplate,
            url,
            slug,
            formdata: rawForm
        };

        // Use upsert with onConflict: 'user_id' to enforce 1 invitation per account
        const result = await supabase
            .from('invitations')
            .upsert(invData, { onConflict: 'user_id' })
            .select();

        if (result.error) throw result.error;

        // Set editingId to the saved row so subsequent saves UPDATE instead of INSERT
        if (result.data && result.data.length > 0) {
            editingId = result.data[0].id;
        }

        await fetchSavedList();
        toast(editingId ? '✅ Undangan berhasil disimpan!' : '💾 Berhasil disimpan di Cloud!');

        // Aktifkan tombol Generate Link setelah berhasil simpan
        $('btnGenLink')?.removeAttribute('disabled');
    } catch (err) {
        console.error('Save Error Details:', err);
        let errorMsg = err.message || 'Kesalahan Database';
        if (err.details) errorMsg += ' (' + err.details + ')';
        if (err.hint) errorMsg += ' - Hint: ' + err.hint;
        toast('❌ Gagal simpan: ' + errorMsg);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Simpan Undangan';
    }
}

function saveLocalOnly(id, groom, bride, formdata, url) {
    const invLocal = {
        id, groom, bride,
        date: formdata.date || 'TBD',
        template: currentTemplate,
        url,
        savedAt: new Date().toLocaleDateString('id-ID'),
        formdata: formdata
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
                <button class="inv-btn-edit" onclick="loadInvToEditor('${inv.id}')" title="Edit Data Undangan"><i class="fa-solid fa-pen"></i> Edit</button>
                <button class="inv-btn-guest" onclick="viewGuestList('${inv.id}')" title="Kelola Daftar Tamu"><i class="fa-solid fa-users"></i> Tamu</button>
                <a href="${inv.url}" target="_blank" class="inv-btn-p" title="Lihat Preview Live"><i class="fa-solid fa-eye"></i> Preview</a>
                <button class="inv-btn-d" onclick="deleteInvitation('${inv.id}')" title="Hapus Undangan"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>`;
    }).join('');
}

window.viewGuestList = function(invId) {
    editingId = invId; 
    
    // Switch to guest page
    const guestLink = document.querySelector('.sl[data-page="guest"]');
    if (guestLink) guestLink.click();
    
    toast('👥 Memuat daftar tamu untuk undangan ini...');
};

window.deleteInvitation = async function (id) {
    if (!confirm('Apakah Anda yakin ingin menghapus undangan ini?')) return;

    try {
        const { error } = await supabase
            .from('invitations')
            .delete()
            .eq('id', id);

        if (error) throw error;

        await fetchSavedList();
        toast('🗑️ Undangan berhasil dihapus dari Cloud.');
    } catch (err) {
        console.error('Delete Error:', err);
        toast('❌ Gagal hapus dari Cloud: ' + err.message);
    }
};

window.loadInvToEditor = function (id) {
    const inv = getSaved().find(i => i.id.toString() === id.toString());
    const rawData = inv?.formdata;
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
        'f-music': fd.music, 'f-imgHero': fd.hero, 'f-imgPria': fd.imgPria, 'f-imgWanita': fd.imgWanita,
        'f-slug': inv.slug || ''
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

window.resetEditor = function () {
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
        if (txt) window.copyToClipboard(txt);
    });

    $('btnExportCsv')?.addEventListener('click', exportGuestCsv);

    $('btnExportTxt')?.addEventListener('click', () => {
        const txt = (window._tamuLinks || []).map(l => `${l.name}\n${l.url}`).join('\n\n');
        if (!txt) return;
        const blob = new Blob([txt], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'daftar-tamu.txt';
        a.click();
    });

    $('btnRefreshGuest')?.addEventListener('click', () => {
        const sel = $('tamuSelectInv');
        if (sel && sel.value) {
            loadGuestsFromCloud(sel.value);
        } else {
            toast('⚠️ Pilih undangan terlebih dahulu');
        }
    });

    $('searchTamu')?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        renderGuestTable(query);
    });

    $('btnAddSingleGuest')?.addEventListener('click', addSingleGuestToCloud);

    // Bulk Import CSV
    $('importTamuCsv')?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const sel = $('tamuSelectInv');
        if (!sel || !sel.value) {
            toast('⚠️ Pilih undangan terlebih dahulu!');
            e.target.value = '';
            return;
        }
        
        const invId = sel.value;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target.result;
            const lines = text.split(/\r?\n/);
            const names = lines
                .map(line => line.split(',')[0].trim().replace(/^"|"$/g, ''))
                .filter(name => name.length > 0 && name.toLowerCase() !== 'nama' && name.toLowerCase() !== 'name');

            if (names.length === 0) {
                toast('⚠️ Tidak ada nama ditemukan di CSV!');
                return;
            }

            await saveMultipleGuestsToCloud(invId, names);
            e.target.value = '';
        };
        reader.readAsText(file);
    });
}

function populateTamuSelect() {
    const sel = $('tamuSelectInv');
    if (!sel) return;
    const saved = getSaved();
    sel.innerHTML = '<option value="">-- Pilih undangan --</option>' + saved.map(i => `<option value="${i.id}">${i.groom} & ${i.bride} (${i.date})</option>`).join('');
    
    // Auto-select if we are already editing an invitation
    if (editingId) {
        const currentInv = saved.find(i => i.id.toString() === editingId.toString());
        if (currentInv) {
            sel.value = currentInv.id;
            $('tamuBaseUrl').value = getShortUrl(currentInv);
            loadGuestsFromCloud(editingId);
        }
    }

    sel.onchange = () => { 
        if (sel.value) {
            const inv = saved.find(i => i.id.toString() === sel.value);
            if (inv) {
                $('tamuBaseUrl').value = getShortUrl(inv); 
                loadGuestsFromCloud(inv.id);
            }
        }
    };
}

async function loadGuestsFromCloud(invId) {
    if (!invId) return;
    try {
        $('tamuResult')?.classList.remove('hidden');
        setHTML('tamuTableBody', `<tr><td colspan="4" style="text-align:center; padding:30px;"><i class="fa-solid fa-spinner fa-spin"></i> Memuat daftar tamu...</td></tr>`);
        
        const { data, error } = await supabase
            .from('guests')
            .select('id, name')
            .eq('invitation_id', invId)
            .order('created_at', { ascending: true });
            
        if (error) throw error;
        
        window._tamuLinks = [];
        const baseUrl = getAdaptiveUrl($('tamuBaseUrl').value);
        
        if (data && data.length > 0) {
            window._tamuLinks = data.map((g, i) => {
                const u = new URL(baseUrl);
                u.searchParams.set('guest', g.name);
                return { no: i + 1, id: g.id, name: g.name, url: u.toString() };
            });
            toast(`📂 Memuat ${data.length} tamu dari Cloud...`);
        }
        
        renderGuestTable();
        set('tamuCount', `${window._tamuLinks.length} Link`);
    } catch (err) {
        console.error('Load Guests Error:', err);
        setHTML('tamuTableBody', `<tr><td colspan="4" style="text-align:center; padding:30px; color:#f43f5e;">Gagal memuat: ${err.message}</td></tr>`);
    }
}

async function addSingleGuestToCloud() {
    const sel = $('tamuSelectInv');
    if (!sel || !sel.value) { toast('⚠️ Pilih undangan terlebih dahulu!'); return; }
    
    const invId = sel.value;
    
    const nameInput = $('newGuestName');
    const name = nameInput.value.trim();
    if (!name) { toast('⚠️ Masukkan nama tamu!'); return; }
    
    const currentGuestsCount = window._tamuLinks ? window._tamuLinks.length : 0;
    if (currentGuestsCount >= 50) {
        toast('⚠️ Kapasitas maksimal adalah 50 tamu!');
        return;
    }
    
    const btn = $('btnAddSingleGuest');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    
    try {
        const { data, error } = await supabase.from('guests').insert([{ invitation_id: invId, name: name }]).select();
        if (error) throw error;
        
        toast(`✅ Tamu "${name}" ditambahkan!`);
        nameInput.value = '';
        await loadGuestsFromCloud(invId);
    } catch (err) {
        console.error('Save Guest Error:', err);
        toast('❌ Gagal menambahkan: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-plus"></i> Tambah';
    }
}

async function saveMultipleGuestsToCloud(invId, namesToAdd) {
    const currentGuestsCount = window._tamuLinks ? window._tamuLinks.length : 0;
    const availableSlots = 50 - currentGuestsCount;
    
    if (availableSlots <= 0) {
        toast('⚠️ Kapasitas maksimal sudah tercapai (50 tamu).');
        return;
    }
    
    let finalNames = namesToAdd;
    if (finalNames.length > availableSlots) {
        toast(`⚠️ Hanya dapat menambah ${availableSlots} tamu lagi. Sisanya akan diabaikan.`);
        finalNames = finalNames.slice(0, availableSlots);
    }
    
    try {
        const insertData = finalNames.map(name => ({
            invitation_id: invId,
            name: name
        }));
        
        const { error } = await supabase.from('guests').insert(insertData);
        if (error) throw error;
        
        toast(`✅ ${finalNames.length} tamu berhasil diimpor!`);
        await loadGuestsFromCloud(invId);
    } catch (err) {
        console.error('Import Guests Error:', err);
        toast('❌ Gagal mengimpor: ' + err.message);
    }
}

async function deleteGuestListFromCloud() {
    const sel = $('tamuSelectInv');
    if (!sel || !sel.value) { toast('⚠️ Pilih undangan terlebih dahulu!'); return; }
    
    if (!confirm('Apakah Anda yakin ingin menghapus SELURUH daftar tamu untuk undangan ini dari Cloud?')) return;
    
    const invId = sel.value;
    
    const btn = $('btnDeleteGuestCloud');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menghapus...';
    
    try {
        const { error } = await supabase.from('guests').delete().eq('invitation_id', invId);
        if (error) throw error;
        
        $('tamuResult')?.classList.add('hidden');
        toast('🗑️ Daftar tamu di Cloud berhasil dihapus!');
        await loadGuestsFromCloud(invId);
    } catch (err) {
        console.error('Delete Guests Error:', err);
        toast('❌ Gagal menghapus: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-trash-can"></i> Hapus Semua';
    }
}

window.deleteGuest = async function(id) {
    if (!confirm('Hapus tamu ini?')) return;
    
    try {
        const { error } = await supabase.from('guests').delete().eq('id', id);
        if (error) throw error;
        
        toast('🗑️ Tamu berhasil dihapus');
        
        const sel = $('tamuSelectInv');
        if (sel && sel.value) await loadGuestsFromCloud(sel.value);
    } catch (err) {
        toast('❌ Gagal menghapus: ' + err.message);
    }
}

function renderGuestTable(filter = '') {
    const links = window._tamuLinks || [];
    const tbody = $('tamuTableBody');
    if (!tbody) return;

    const filtered = filter 
        ? links.filter(l => l.name.toLowerCase().includes(filter))
        : links;

    tbody.innerHTML = filtered.map(l => `
        <tr>
            <td>${l.no}</td>
            <td><strong>${l.name}</strong></td>
            <td class="tamu-link-cell" title="${l.url}">${l.url}</td>
            <td class="tamu-btns">
                <button class="tbl-btn" title="Salin Link" onclick="copyToClipboard('${l.url}')">
                    <i class="fa-regular fa-copy"></i>
                </button>
                <button class="tbl-btn tbl-btn-wa" title="WhatsApp" onclick="window.open('https://wa.me/?text='+encodeURIComponent('Halo *${l.name}*,\\n\\nTanpa mengurangi rasa hormat, kami mengundang Anda ke acara pernikahan kami.\\n\\nLihat undangan:\\n${l.url}'))">
                    <i class="fa-brands fa-whatsapp"></i>
                </button>
                <button class="tbl-btn" title="Hapus Tamu" onclick="deleteGuest('${l.id}')" style="color: #f43f5e; border-color: rgba(244,63,94,0.1);">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        </tr>
    `).join('');

    if (filtered.length === 0 && links.length > 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:30px; color:var(--text-tertiary);">Tidak ada tamu yang cocok dengan pencarian</td></tr>`;
    }
    
    if (links.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:30px; color:var(--text-tertiary);">Belum ada tamu yang ditambahkan. Silakan tambah di atas.</td></tr>`;
    }
}

function exportGuestCsv() {
    const data = window._tamuLinks || [];
    if (!data.length) { toast('⚠️ Generate link tamu dulu!'); return; }

    let csv = 'No,Nama Tamu,Link Undangan\n';
    data.forEach(l => {
        csv += `${l.no},"${l.name}","${l.url}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'daftar-tamu.csv';
    a.click();
    toast('✅ CSV berhasil diunduh!');
}

function printGuestList() {
    const data = window._tamuLinks || [];
    if (!data.length) { toast('⚠️ Generate link tamu dulu!'); return; }

    const groom = val('f-groom') || 'Mempelai Pria';
    const bride = val('f-bride') || 'Mempelai Wanita';

    const printWin = window.open('', '_blank');
    printWin.document.write(`
        <html>
        <head>
            <title>Daftar Hadir Tamu - ${groom} & ${bride}</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
                header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                h1 { margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px; }
                p { margin: 5px 0; opacity: 0.8; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #666; padding: 12px; text-align: left; font-size: 13px; }
                th { background: #f5f5f5; font-weight: bold; text-transform: uppercase; }
                .no { width: 30px; text-align: center; }
                .sign { width: 120px; height: 50px; }
                @media print {
                    @page { margin: 1cm; }
                    body { padding: 0; }
                }
            </style>
        </head>
        <body>
            <header>
                <h1>Daftar Hadir Tamu Undangan</h1>
                <p>Pernikahan: <strong>${groom} & ${bride}</strong></p>
                <p>Hari/Tanggal: ${val('f-date') || '-'}</p>
            </header>
            <table>
                <thead>
                    <tr>
                        <th class="no">No</th>
                        <th>Nama Tamu</th>
                        <th>Alamat / Instansi</th>
                        <th class="sign">Tanda Tangan</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(l => `
                        <tr>
                            <td class="no">${l.no}</td>
                            <td style="font-weight: 500;">${l.name}</td>
                            <td></td>
                            <td class="sign"></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div style="margin-top: 30px; text-align: right; font-size: 12px; opacity: 0.5;">
                Dicetak melalui Lumina Invites Dashboard pada ${new Date().toLocaleString('id-ID')}
            </div>
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(() => window.close(), 500);
                }
            </script>
        </body>
        </html>
    `);
    printWin.document.close();
}

// ════════════════════════════════════════════════════════════
// 7. MODALS & NAV
// ════════════════════════════════════════════════════════════
function initNavigation() {
    document.querySelectorAll('.sl').forEach(link => {
        link.addEventListener('click', (e) => {
            const pageId = link.dataset.page;
            if (!pageId) return;

            // Update UI Active State
            document.querySelectorAll('.sl').forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Switch Page
            document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
            const targetPage = $(`page-${pageId}`);
            if (targetPage) targetPage.classList.add('active');

            // Update Topbar Title
            const titles = { editor: 'Live Editor', saved: 'Undangan Tersimpan', rsvp: 'Data RSVP', guest: 'Daftar Tamu' };
            set('topbarTitle', titles[pageId] || 'Dashboard');

            // Extra logic for specific pages
            if (pageId === 'guest') populateTamuSelect();
            if (pageId === 'rsvp') fetchRsvpData();
        });
    });

    $('btnRefreshRsvp')?.addEventListener('click', fetchRsvpData);
}

async function fetchRsvpData() {
    if (!editingId) {
        setHTML('rsvpTableBody', `<tr><td colspan="4" style="padding:40px; text-align:center; color:var(--text-tertiary);">Silakan simpan atau pilih undangan terlebih dahulu untuk melihat data RSVP</td></tr>`);
        return;
    }

    setHTML('rsvpTableBody', `<tr><td colspan="4" style="padding:40px; text-align:center; color:var(--text-tertiary);"><i class="fa-solid fa-spinner fa-spin"></i> Memuat data...</td></tr>`);

    try {
        const { data, error } = await supabase
            .from('rsvp')
            .select('*')
            .eq('invitation_id', editingId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Stats
        const stats = { hadir: 0, tidak: 0, ragu: 0 };
        data.forEach(r => {
            const h = (r.attendance || '').toLowerCase();
            if (h.includes('tidak')) stats.tidak++;
            else if (h.includes('ragu')) stats.ragu++;
            else if (h.includes('hadir')) stats.hadir++;
        });

        set('stat-hadir', stats.hadir);
        set('stat-tidak', stats.tidak);
        set('stat-ragu', stats.ragu);

        if (data.length === 0) {
            setHTML('rsvpTableBody', `<tr><td colspan="4" style="padding:40px; text-align:center; color:var(--text-tertiary);">Belum ada data RSVP untuk undangan ini.</td></tr>`);
            return;
        }

        let html = '';
        data.forEach(r => {
            const date = new Date(r.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
            const badgeClass = r.attendance.includes('Tidak') ? 'danger' : (r.attendance.includes('Ragu') ? 'warning' : 'success');

            html += `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding:15px 20px; font-size:0.9rem; color:var(--text-secondary);">${date}</td>
                    <td style="padding:15px 20px; font-weight:600; color:#fff;">${r.name}</td>
                    <td style="padding:15px 20px;"><span class="tbadge ${badgeClass}">${r.attendance}</span></td>
                    <td style="padding:15px 20px; color:var(--text-secondary); font-style:italic;">"${r.message || '-'}"</td>
                    <td style="padding:15px 20px; text-align:right;">
                        <button class="btn-s btn-sm" onclick="deleteRsvp('${r.id}')" style="color:#f43f5e; border-color:rgba(244,63,94,0.2);"><i class="fa-solid fa-trash-can"></i></button>
                    </td>
                </tr>
            `;
        });
        setHTML('rsvpTableBody', html);

    } catch (err) {
        console.error('RSVP Fetch Error:', err);
        setHTML('rsvpTableBody', `<tr><td colspan="4" style="padding:40px; text-align:center; color:#f43f5e;">Gagal memuat data: ${err.message}</td></tr>`);
    }
}

window.deleteRsvp = async function (id) {
    if (!confirm('Hapus data RSVP ini?')) return;

    try {
        const { error } = await supabase
            .from('rsvp')
            .delete()
            .eq('id', id);

        if (error) throw error;
        toast('🗑️ RSVP berhasil dihapus');
        fetchRsvpData();
    } catch (err) {
        toast('❌ Gagal menghapus: ' + err.message);
    }
}

function initModals() {
    const closeAll = () => document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));

    document.querySelectorAll('.modal').forEach(m => {
        m.onclick = (e) => { if (e.target === m) closeAll(); };
    });
    document.onkeydown = (e) => { if (e.key === 'Escape') closeAll(); };
}

// ════════════════════════════════════════════════════════════
// 8. IMAGE UPLOADS
// ════════════════════════════════════════════════════════════
function initUploads() {
    document.querySelectorAll('.f-upload').forEach(input => {
        input.addEventListener('change', (e) => handleFileUpload(e, input.dataset.target));
    });
}

async function handleFileUpload(e, targetId) {
    const file = e.target.files[0];
    if (!file) return;

    if (currentUserId === 'guest') {
        toast('⚠️ Silakan login untuk mengunggah foto');
        return;
    }

    const targetInput = $(targetId);
    const label = e.target.parentElement;
    const originalHTML = label.innerHTML;

    label.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    label.style.opacity = '0.5';
    label.style.pointerEvents = 'none';

    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${currentUserId}/${Date.now()}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('invitations')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('invitations')
            .getPublicUrl(filePath);

        if (targetInput) {
            targetInput.value = publicUrl;
            updatePreview();
        }
        toast('✅ Foto berhasil diunggah!');
    } catch (err) {
        console.error('Upload error:', err);
        toast('❌ Gagal unggah: ' + err.message);
    } finally {
        label.innerHTML = originalHTML;
        label.style.opacity = '1';
        label.style.pointerEvents = 'auto';
        // Re-attach listener
        label.querySelector('input').addEventListener('change', (ev) => handleFileUpload(ev, targetId));
    }
}


// ════════════════════════════════════════════════════════════
// BOOTSTRAP
// ════════════════════════════════════════════════════════════
function onDashboardReady() {
    if (isInitialized) return;
    isInitialized = true;

    initNavigation();
    initEditor();
    initUploads();
    initGuestList();
    initModals();
    initSupabaseFeatures();
}

document.addEventListener('DOMContentLoaded', initAuth);

function updateImagePreview(inputId, previewId) {
    const input = $(inputId);
    const container = $(previewId);
    if (!input || !container) return;

    const url = input.value.trim();
    if (url) {
        container.innerHTML = `<img src="${url}" onerror="this.parentElement.classList.remove('show')" onload="this.parentElement.classList.add('show')">`;
    } else {
        container.classList.remove('show');
        container.innerHTML = '';
    }
}

function toggleLivePreview() {
    const editor = $('page-editor');
    const btn = $('btnTogglePreview');
    if (!editor || !btn) return;

    const isHidden = editor.classList.toggle('hide-preview');
    btn.innerHTML = isHidden ? '<i class="fa-solid fa-eye"></i>' : '<i class="fa-solid fa-eye-slash"></i>';
    btn.title = isHidden ? 'Tampilkan Preview' : 'Sembunyikan Preview';
    toast(isHidden ? '👁️ Preview disembunyikan' : '✨ Preview ditampilkan');
}

