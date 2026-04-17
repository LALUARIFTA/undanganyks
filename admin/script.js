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
};
const TEMPLATE_META = {
    midnight: { icon: '🌙', color: 'rgba(212,175,55,0.15)', label: 'Midnight Gold' },
    blossom:  { icon: '🌸', color: 'rgba(190,24,93,0.15)',  label: 'Blossom Blush' },
    rustic:   { icon: '🌿', color: 'rgba(160,82,45,0.15)',  label: 'Rustic Garden'  },
    jawa:     { icon: '🏯', color: 'rgba(92,10,20,0.15)',   label: 'Jawa Kraton'    },
    bali:     { icon: '🌺', color: 'rgba(13,77,77,0.15)',   label: 'Bali Pura'      },
};

// ─── State
let currentTemplate = 'midnight';
let currentUrl      = '';
let debounceTimer   = null;
let rsvpData        = [];
let rsvpSheetsUrl   = localStorage.getItem('lumina_sheets_url') || '';

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
function initAuth() {
    const loginScreen = $('loginScreen');
    const dashboard   = $('dashboard');

    if (sessionStorage.getItem('lumina_admin') === 'true') {
        loginScreen.classList.add('hidden');
        dashboard.classList.remove('hidden');
        onDashboardReady();
    }

    $('btnLogin')?.addEventListener('click', doLogin);
    $('loginPassword')?.addEventListener('keypress', e => { if (e.key === 'Enter') doLogin(); });

    function doLogin() {
        const pw = $('loginPassword')?.value;
        if (pw === ADMIN_PASS) {
            sessionStorage.setItem('lumina_admin', 'true');
            loginScreen.classList.add('hidden');
            dashboard.classList.remove('hidden');
            onDashboardReady();
        } else {
            const err = $('loginError');
            if (err) err.textContent = '❌ Password salah. Coba lagi.';
            $('loginPassword').style.borderColor = 'var(--red)';
            setTimeout(() => {
                if (err) err.textContent = '';
                $('loginPassword').style.borderColor = '';
            }, 2500);
        }
    }

    $('btnLogout')?.addEventListener('click', () => {
        sessionStorage.removeItem('lumina_admin');
        dashboard.classList.add('hidden');
        loginScreen.classList.remove('hidden');
        if ($('loginPassword')) $('loginPassword').value = '';
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
    const links   = document.querySelectorAll('.sl[data-page]');
    const pages   = document.querySelectorAll('.admin-page');
    const sidebar = $('sidebar');

    links.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const pg = link.dataset.page;

            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            pages.forEach(p => p.classList.remove('active'));
            $(`page-${pg}`)?.classList.add('active');
            set('topbarTitle', PAGE_TITLES[pg] || '');

            if (window.innerWidth <= 768) sidebar.classList.remove('open');

            // Page-specific init
            if (pg === 'daftar')   renderSavedList();
            if (pg === 'tamu')     populateTamuSelect();
            if (pg === 'rsvp')     initRsvpDashboard();
        });
    });

    $('sidebarToggle')?.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        sidebar.classList.toggle('closed');
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
    $('editorForm')?.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(updatePreview, 600);
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

    // Sheets guide modal
    $('linkSheetsGuide')?.addEventListener('click', e => {
        e.preventDefault();
        $('sheetsModal')?.classList.remove('hidden');
    });

    // Initial preview
    updatePreview();
}

function schedulePreviewUpdate() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(updatePreview, 600);
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
    };
    Object.entries(fields).forEach(([key, id]) => {
        const v = val(id);
        if (v) params.set(key, v);
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

    return params;
}

function buildUrl() {
    const base = new URL(TEMPLATE_PATHS[currentTemplate], window.location.href).href;
    return `${base}?${buildParams().toString()}`;
}

function updatePreview() {
    const iframe = $('previewIframe');
    if (!iframe) return;
    const url = buildUrl();
    iframe.src = url;
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
const awConfig = {
    endpoint:    localStorage.getItem('lumina_aw_endpoint') || 'https://cloud.appwrite.io/v1',
    projectId:   localStorage.getItem('lumina_aw_project') || '',
    databaseId:  localStorage.getItem('lumina_aw_db') || '',
    collectionId:localStorage.getItem('lumina_aw_col') || ''
};

function initAppwrite() {
    if ($('awEndpoint')) $('awEndpoint').value = awConfig.endpoint;
    if ($('awProject')) $('awProject').value = awConfig.projectId;
    if ($('awDb')) $('awDb').value = awConfig.databaseId;
    if ($('awCol')) $('awCol').value = awConfig.collectionId;

    $('btnConnectAw')?.addEventListener('click', () => {
        awConfig.endpoint = val('awEndpoint') || 'https://cloud.appwrite.io/v1';
        awConfig.projectId = val('awProject');
        awConfig.databaseId = val('awDb');
        awConfig.collectionId = val('awCol');
        
        localStorage.setItem('lumina_aw_endpoint', awConfig.endpoint);
        localStorage.setItem('lumina_aw_project', awConfig.projectId);
        localStorage.setItem('lumina_aw_db', awConfig.databaseId);
        localStorage.setItem('lumina_aw_col', awConfig.collectionId);
        
        setupAppwriteClient();
        fetchSavedList();
        toast('✅ Config Appwrite Disimpan!');
    });

    $('btnGuideAw')?.addEventListener('click', () => {
        $('awModal')?.classList.remove('hidden');
    });

    setupAppwriteClient();
    if(awConfig.projectId && awConfig.databaseId && awConfig.collectionId) {
        fetchSavedList();
    } else {
        setSavedLocalFallback();
    }
}

function setupAppwriteClient() {
    if (!awConfig.projectId || typeof Appwrite === 'undefined') return;
    try {
        awClient = new Appwrite.Client();
        awClient.setEndpoint(awConfig.endpoint).setProject(awConfig.projectId);
        awDb = new Appwrite.Databases(awClient);
    } catch(err) {
        console.error("Appwrite Init Error", err);
    }
}

async function fetchSavedList() {
    if (!awDb || !awConfig.databaseId) {
        setSavedLocalFallback();
        return;
    }
    const list = $('invList');
    if (list) list.innerHTML = `<div class="empty-state"><i class="fa-solid fa-cloud-arrow-down" style="color:#fd366e"></i><p>Mengambil data dari Appwrite...</p></div>`;
    
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
        toast('☁️ Appwrite Synced!');
    } catch (err) {
        console.error("Appwrite Fetch Error", err);
        setSavedLocalFallback();
        toast('⚠️ Appwrite Error. Pakai data lokal.');
    }
}

function setSavedLocalFallback() {
    try { MEM_SAVED = JSON.parse(localStorage.getItem('lumina_invitations')) || []; } catch { MEM_SAVED = []; }
    renderSavedList();
}
function setSavedLocal(data) {
    localStorage.setItem('lumina_invitations', JSON.stringify(data));
}

function getSaved() {
    return MEM_SAVED;
}

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
        const btn = $('btnSaveInv');
        const oldTxt = btn.innerHTML;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...`;
        btn.disabled = true;
        try {
            await awDb.createDocument(awConfig.databaseId, awConfig.collectionId, Appwrite.ID.unique(), invData);
            await fetchSavedList();
            toast(`💾 Disimpan ke Appwrite Cloud!`);
        } catch(err) {
            console.error(err);
            toast('❌ Gagal simpan ke Appwrite. Cek console.');
        } finally {
            btn.innerHTML = oldTxt;
            btn.disabled = false;
        }
    } else {
        const invLocal = {
            id: Date.now(),
            groom, bride,
            groomFull: rawForm.groomFull, brideFull: rawForm.brideFull,
            date: rawForm.date,
            template: currentTemplate,
            url,
            savedAt: new Date().toLocaleDateString('id-ID'),
            formData: rawForm
        };
        MEM_SAVED.push(invLocal);
        setSavedLocal(MEM_SAVED);
        renderSavedList();
        toast(`💾 Disimpan ke Local Storage!`);
    }
}

function renderSavedList() {
    const list = $('invList');
    if (!list) return;
    const saved = getSaved();

    if (!saved.length) {
        list.innerHTML = `<div class="empty-state"><i class="fa-solid fa-box-open"></i><p>Belum ada undangan tersimpan.</p><small>Buat undangan di Live Editor lalu klik "Simpan Undangan".</small></div>`;
        return;
    }

    list.innerHTML = saved.map(inv => {
        const meta = TEMPLATE_META[inv.template] || TEMPLATE_META.midnight;
        // inv.id is the Appwrite doc.$id (string) or LocalStorage Date.now() (number)
        return `
        <div class="inv-card">
            <div class="inv-icon" style="background:${meta.color}">${meta.icon}</div>
            <div class="inv-info">
                <div class="inv-names">${inv.groom} & ${inv.bride}</div>
                <div class="inv-meta"><i class="fa-regular fa-calendar"></i> ${inv.date} &nbsp;·&nbsp; Template: <em>${meta.label}</em> &nbsp;·&nbsp; Disimpan: ${inv.savedAt || '-'}</div>
            </div>
            <div class="inv-actions">
                <button class="inv-btn-edit" onclick="loadInvToEditor('${inv.id}')"><i class="fa-solid fa-pen"></i> Edit</button>
                <button class="inv-btn-p" onclick="window.open('${inv.url.replace(/'/g,"\\'")}','_blank')"><i class="fa-solid fa-eye"></i> Preview</button>
                <button class="inv-btn-d" onclick="deleteInvitation('${inv.id}')"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>`;
    }).join('');
}

window.deleteInvitation = async function(id) {
    if (awDb && awConfig.databaseId && typeof id === 'string' && id.length > 15) {
        // Appwrite IDs are usually 20 chars long
        try {
            await awDb.deleteDocument(awConfig.databaseId, awConfig.collectionId, id);
            await fetchSavedList();
            toast('🗑️ Undangan dihapus dari Cloud.');
        } catch(err) {
            console.error(err);
            toast('❌ Gagal hapus dari Appwrite.');
        }
    } else {
        // LocalStorage fallback deletion
        MEM_SAVED = MEM_SAVED.filter(i => String(i.id) !== String(id));
        setSavedLocal(MEM_SAVED);
        renderSavedList();
        toast('🗑️ Undangan dihapus.');
    }
};

window.loadInvToEditor = function(id) {
    const inv = getSaved().find(i => String(i.id) === String(id));
    if (!inv || !inv.formData) return;

    // Switch to editor page
    document.querySelectorAll('.sl[data-page]').forEach(l => l.classList.remove('active'));
    document.querySelector('.sl[data-page="editor"]')?.classList.add('active');
    document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
    $('page-editor')?.classList.add('active');
    set('topbarTitle', 'Live Editor');

    // Fill form fields from saved formData
    const fd = inv.formData;
    const fieldMap = {
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
    };
    Object.entries(fieldMap).forEach(([id, v]) => { const el = $(id); if (el && v) el.value = v; });

    // Fill story fields
    for (let i = 1; i <= 4; i++) {
        const t = document.querySelector(`.s-title[data-idx="${i}"]`);
        const d = document.querySelector(`.s-date[data-idx="${i}"]`);
        const desc = document.querySelector(`.s-desc[data-idx="${i}"]`);
        if (t && fd[`s${i}t`]) t.value = fd[`s${i}t`];
        if (d && fd[`s${i}d`]) d.value = fd[`s${i}d`];
        if (desc && fd[`s${i}desc`]) desc.value = fd[`s${i}desc`];
    }

    // Set template
    currentTemplate = inv.template;
    document.querySelectorAll('.tpl-opt').forEach(o => {
        o.classList.toggle('selected', o.dataset.tpl === currentTemplate);
    });

    updatePreview();
    toast('✅ Data undangan dimuat ke editor!');
};

// ════════════════════════════════════════════════════════════
// 5. DAFTAR TAMU (Guest List Generator)
// ════════════════════════════════════════════════════════════
function initGuestList() {
    $('btnGenTamu')?.addEventListener('click', generateGuestLinks);
    $('btnCopyAll')?.addEventListener('click', copyAllLinks);
    $('btnExportTxt')?.addEventListener('click', exportLinks);
}

function populateTamuSelect() {
    const sel = $('tamuSelectInv');
    if (!sel) return;
    const saved = getSaved();
    sel.innerHTML = '<option value="">-- Pilih undangan --</option>';
    saved.forEach(inv => {
        const opt = document.createElement('option');
        opt.value = inv.url;
        opt.textContent = `${inv.groom} & ${inv.bride} (${inv.date})`;
        sel.appendChild(opt);
    });
    sel.addEventListener('change', () => {
        if (sel.value) $('tamuBaseUrl').value = sel.value;
    });
}

function generateGuestLinks() {
    let baseUrl = val('tamuBaseUrl') || $('tamuSelectInv')?.value;
    if (!baseUrl) { toast('⚠️ Pilih undangan atau isi Base URL terlebih dahulu!'); return; }

    const namesRaw = $('tamuNames')?.value.trim();
    if (!namesRaw) { toast('⚠️ Isi daftar nama tamu terlebih dahulu!'); return; }

    const names = namesRaw.split('\n').map(n => n.trim()).filter(Boolean);
    if (!names.length) { toast('⚠️ Tidak ada nama yang valid!'); return; }

    // Build links
    const links = names.map((name, i) => {
        const url = new URL(baseUrl);
        url.searchParams.set('guest', name);
        return { no: i + 1, name, url: url.toString() };
    });

    // Render table
    const tbody = $('tamuTableBody');
    if (tbody) {
        tbody.innerHTML = links.map(({ no, name, url }) => `
            <tr>
                <td>${no}</td>
                <td><strong>${name}</strong></td>
                <td class="tamu-link-cell" title="${url}">${url}</td>
                <td class="tamu-btns">
                    <button class="tbl-btn tbl-btn-copy" onclick="navigator.clipboard.writeText('${url.replace(/'/g,"\\'")}').then(()=>showToast('📋 Disalin!'))"><i class="fa-regular fa-copy"></i> Salin</button>
                    <button class="tbl-btn tbl-btn-wa" onclick="window.open('https://wa.me/?text='+encodeURIComponent('Kepada Yth: ${name}\\n\\nBerikut link undangan digital Anda:\\n${url.replace(/'/g,"\\'")}'),'_blank')"><i class="fa-brands fa-whatsapp"></i> WA</button>
                    <button class="tbl-btn tbl-btn-eye" onclick="window.open('${url.replace(/'/g,"\\'")}','_blank')"><i class="fa-solid fa-eye"></i></button>
                </td>
            </tr>
        `).join('');
    }
    set('tamuCount', `${links.length} Link Berhasil Di-Generate`);
    $('tamuResult')?.classList.remove('hidden');

    // Store for export
    window._tamuLinks = links;
    toast(`✅ ${links.length} link tamu berhasil di-generate!`);
}

function copyAllLinks() {
    const links = window._tamuLinks || [];
    if (!links.length) return;
    const text = links.map(l => `${l.name}: ${l.url}`).join('\n');
    navigator.clipboard.writeText(text).then(() => toast('📋 Semua link berhasil disalin!'));
}

function exportLinks() {
    const links = window._tamuLinks || [];
    if (!links.length) return;
    const text = links.map(l => `${l.name}\n${l.url}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'daftar-link-tamu.txt';
    a.click();
    toast('📄 File berhasil di-download!');
}

window.showToast = (msg) => toast(msg);

// ════════════════════════════════════════════════════════════
// 6. RSVP DASHBOARD
// ════════════════════════════════════════════════════════════
function initRsvpDashboard() {
    // Pre-fill if URL saved
    if (rsvpSheetsUrl) {
        const input = $('rsvpSheetsUrl');
        if (input) input.value = rsvpSheetsUrl;
        $('rsvpUrlVal') && set('rsvpUrlVal', rsvpSheetsUrl.substring(0, 50) + '...');
        fetchRsvpData();
    }

    $('btnConnectSheets')?.addEventListener('click', () => {
        const url = val('rsvpSheetsUrl');
        if (!url || !url.startsWith('https://script.google.com')) {
            toast('⚠️ Masukkan URL Google Apps Script yang valid!');
            return;
        }
        rsvpSheetsUrl = url;
        localStorage.setItem('lumina_sheets_url', url);
        $('f-sheetsUrl') && ($('f-sheetsUrl').value = url);
        set('rsvpUrlVal', url.substring(0, 50) + '...');
        fetchRsvpData();
    });

    $('btnRefreshRsvp')?.addEventListener('click', fetchRsvpData);

    $('btnOpenSheets')?.addEventListener('click', () => {
        if (rsvpSheetsUrl) {
            window.open(rsvpSheetsUrl, '_blank');
        } else {
            toast('⚠️ Belum ada Google Sheets yang terhubung!');
        }
    });

    $('btnShowGuide')?.addEventListener('click', () => {
        $('sheetsModal')?.classList.remove('hidden');
    });

    // Search & filter
    $('rsvpSearch')?.addEventListener('input', () => renderRsvpTable());
    $('rsvpFilter')?.addEventListener('change', () => renderRsvpTable());

    // If already have data
    if (rsvpData.length) renderRsvpStats();
}

function fetchRsvpData() {
    if (!rsvpSheetsUrl) {
        toast('⚠️ Belum ada URL Google Sheets yang terhubung!');
        return;
    }

    toast('🔄 Memuat data RSVP...');

    const invId = val('f-invId') || localStorage.getItem('last_invId') || '';
    const fetchUrl = rsvpSheetsUrl + (invId ? `?invId=${encodeURIComponent(invId)}` : '');

    fetch(fetchUrl)
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                rsvpData = data;
                renderRsvpStats();
                renderRsvpTable();
                toast(`✅ ${data.length} data RSVP berhasil dimuat!`);
            } else {
                throw new Error('Format data tidak valid');
            }
        })
        .catch(err => {
            console.error('RSVP fetch error:', err);
            toast('❌ Gagal memuat data. Periksa URL dan CORS settings Apps Script.');
            // Show sample data for demo
            rsvpData = getDemoRsvpData();
            renderRsvpStats();
            renderRsvpTable();
        });
}

function getDemoRsvpData() {
    return [
        { timestamp: new Date().toLocaleString('id-ID'), name: 'Bapak Ahmad Fauzi', attendance: 'Hadir', message: 'Selamat menempuh hidup baru, semoga langgeng selalu!' },
        { timestamp: new Date().toLocaleString('id-ID'), name: 'Ibu Siti Rahayu', attendance: 'Hadir', message: 'Semoga menjadi keluarga yang sakinah mawaddah warahmah.' },
        { timestamp: new Date().toLocaleString('id-ID'), name: 'Keluarga Wahyono', attendance: 'Tidak Hadir', message: 'Mohon maaf tidak bisa hadir, semoga bahagia selalu.' },
        { timestamp: new Date().toLocaleString('id-ID'), name: 'Rizky Pratama', attendance: 'Masih Ragu', message: 'Insya Allah hadir, mohon doanya.' },
        { timestamp: new Date().toLocaleString('id-ID'), name: 'Ibu Dewi Sartika', attendance: 'Hadir', message: 'Barakallahu lakuma wa baraka alaykuma.' },
    ];
}

function renderRsvpStats() {
    const total  = rsvpData.length;
    const hadir  = rsvpData.filter(d => d.attendance === 'Hadir').length;
    const tidak  = rsvpData.filter(d => d.attendance === 'Tidak Hadir').length;
    const ragu   = rsvpData.filter(d => d.attendance === 'Masih Ragu').length;

    set('stat-total', total);
    set('stat-hadir', hadir);
    set('stat-tidak', tidak);
    set('stat-ragu',  ragu);

    const pH = total ? Math.round((hadir / total) * 100) : 0;
    const pT = total ? Math.round((tidak / total) * 100) : 0;
    const pR = total ? Math.round((ragu  / total) * 100) : 0;

    const applyBar = (id, pct) => {
        const el = $(id);
        if (el) setTimeout(() => el.style.width = pct + '%', 100);
    };
    applyBar('bar-hadir', pH);
    applyBar('bar-tidak', pT);
    applyBar('bar-ragu',  pR);
    set('pct-hadir', pH + '%');
    set('pct-tidak', pT + '%');
    set('pct-ragu',  pR + '%');
}

function renderRsvpTable() {
    const tbody  = $('rsvpTableBody');
    if (!tbody) return;
    const search = ($('rsvpSearch')?.value || '').toLowerCase();
    const filter = $('rsvpFilter')?.value || '';

    let filtered = rsvpData.filter(d => {
        const matchSearch = !search || (d.name || '').toLowerCase().includes(search) || (d.message || '').toLowerCase().includes(search);
        const matchFilter = !filter || d.attendance === filter;
        return matchSearch && matchFilter;
    });

    if (!filtered.length) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-row"><i class="fa-solid fa-magnifying-glass"></i><br>Tidak ada data yang cocok.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map((d, i) => {
        const att = d.attendance || '-';
        const cls = att === 'Hadir' ? 'att-hadir' : att === 'Tidak Hadir' ? 'att-tidak' : 'att-ragu';
        return `
        <tr>
            <td>${i + 1}</td>
            <td style="white-space:nowrap;font-size:.76rem;color:var(--sec)">${d.timestamp || '-'}</td>
            <td><strong>${d.name || '-'}</strong></td>
            <td><span class="att-badge ${cls}">${att}</span></td>
            <td style="max-width:240px;color:var(--sec);font-size:.8rem">${d.message || '-'}</td>
        </tr>`;
    }).join('');
}

// ════════════════════════════════════════════════════════════
// 7. TEMPLATE GALLERY
// ════════════════════════════════════════════════════════════
window.selectTemplate = function(tpl) {
    currentTemplate = tpl;
    // Switch to editor
    document.querySelectorAll('.sl[data-page]').forEach(l => l.classList.remove('active'));
    document.querySelector('.sl[data-page="editor"]')?.classList.add('active');
    document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
    $('page-editor')?.classList.add('active');
    set('topbarTitle', 'Live Editor');
    // Update picker UI
    document.querySelectorAll('.tpl-opt').forEach(o => o.classList.toggle('selected', o.dataset.tpl === tpl));
    updatePreview();
    toast(`✅ Template "${TEMPLATE_META[tpl]?.label}" dipilih!`);
};

// ════════════════════════════════════════════════════════════
// 8. SHEETS MODAL
// ════════════════════════════════════════════════════════════
function initModals() {
    // Close modal on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', e => {
            if (e.target === modal) modal.classList.add('hidden');
        });
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
        }
    });
}

// ════════════════════════════════════════════════════════════
// 9. BOOTSTRAP
// ════════════════════════════════════════════════════════════
function onDashboardReady() {
    initNav();
    initEditor();
    initGuestList();
    initModals();
    initAppwrite();
}

document.addEventListener('DOMContentLoaded', initAuth);
