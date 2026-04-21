/* ═══════════════════════════════════════════════════════════
   CONFIGURATION GOOGLE SHEETS
   ▸ Remplacez les valeurs ci-dessous après avoir suivi le guide
═══════════════════════════════════════════════════════════ */
const SHEETS_CONFIG = {
  // ID de votre Google Sheet (dans l'URL : /spreadsheets/d/XXXX/edit)
  spreadsheetId: '1rwnYeP8F_Nopmj-x7VNzAyDFVN806ZrSpan54Pjvk4k',

  // Clé API Google (Google Cloud Console → APIs → Sheets API → Credentials)
  apiKey: 'AIzaSyDgnmI6_rie3WANTkQ5O1mM2XyhabOVYEk',

  // Nom de la feuille et plage (adaptez si votre feuille s'appelle autrement)
  range: 'Pharmacies!A:K',

  // URL du Web App Apps Script (pour écriture — laisser vide si lecture seule)
  appsScriptUrl: 'https://script.google.com/macros/s/AKfycby_GxYL6togQwEven1CUu5PW_KPmeJ9N4P3bHdZyWueLOpdO9aTULnxwu_B0jqTPyhRMw/exec',

  // Rafraîchissement automatique toutes les N minutes (0 = désactivé)
  autoRefreshMinutes: 15,
};

/* ═══════════════════════════════════════════════════════════
   MAPPING COLONNES (correspondance avec votre fichier Excel)
   Index 0-basé : col A=0, B=1, C=2 …
═══════════════════════════════════════════════════════════ */
const COL = {
  nom:      1,   // B
  adresse:  2,   // C
  email:    3,   // D
  dept:     4,   // E
  ville:    5,   // F
  quartier: 6,   // G
  tel:      7,   // H
  lat:      8,   // I
  lng:      9,   // J
};

const DEPT_MAP = {
  'Alibori':'Alibori', 'Atakora':'Atacora', 'Atlantique':'Atlantique',
  'Borgou':'Borgou', 'Collines':'Collines', 'Donga':'Donga',
  "Département de l'Ouémé":'Ouémé', 'Kouffo':'Couffo',
  'Littoral':'Littoral', 'Mono':'Mono', 'Plateau':'Plateau', 'Zou':'Zou',
};

/* ═══════════════════════════════════════════════════════════
   HORLOGE
═══════════════════════════════════════════════════════════ */
function updateClock() {
  const now = new Date();
  const days   = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
  const months = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
  document.getElementById('clockDate').textContent =
    days[now.getDay()] + ' ' + String(now.getDate()).padStart(2,'0') + ' ' +
    months[now.getMonth()] + ' ' + now.getFullYear();
  document.getElementById('clockTime').textContent =
    String(now.getHours()).padStart(2,'0') + ':' +
    String(now.getMinutes()).padStart(2,'0') + ':' +
    String(now.getSeconds()).padStart(2,'0');
}
updateClock();
setInterval(updateClock, 1000);

/* ═══════════════════════════════════════════════════════════
   RECHERCHE
═══════════════════════════════════════════════════════════ */
document.getElementById('searchInput').addEventListener('input', function() {
  const icon = document.querySelector('.search-icon');
  if (this.value.length > 0) icon.classList.add('hidden');
  else icon.classList.remove('hidden');
  currentPage = 1;
  applySearch();
});

/* ═══════════════════════════════════════════════════════════
   ÉTAT GLOBAL
═══════════════════════════════════════════════════════════ */
window.pharmacies = [];
const PAGE_SIZE    = 20;
let currentPage    = 1;
let lastFiltered   = [];
let editIndex      = -1;
let pendingImportData = [];

/* ═══════════════════════════════════════════════════════════
   CHARGEMENT DEPUIS GOOGLE SHEETS
═══════════════════════════════════════════════════════════ */

/**
 * Convertit une ligne brute (tableau de valeurs) en objet pharmacie.
 */
function rowToPharmacy(row) {
  const get = (i) => String(row[i] != null ? row[i] : '').trim();
  const nom = get(COL.nom);
  if (!nom) return null;

  const deptRaw = get(COL.dept);
  return {
    nom,
    dept:     DEPT_MAP[deptRaw] || deptRaw,
    ville:    get(COL.ville),
    quartier: get(COL.quartier),
    adresse:  get(COL.adresse),
    tel:      get(COL.tel),
    email:    get(COL.email),
    lat:      get(COL.lat).replace(',', '.'),
    lng:      get(COL.lng).replace(',', '.'),
    // On garde le numéro de ligne Google Sheets pour les écritures (1-basé, +1 pour header)
    _sheetRow: null, // sera assigné dans loadFromSheets
  };
}

/**
 * Charge les données depuis l'API Google Sheets.
 * Appelé au démarrage et lors du rafraîchissement.
 */
async function loadFromSheets(silent = false) {
  if (!SHEETS_CONFIG.spreadsheetId || SHEETS_CONFIG.spreadsheetId === 'VOTRE_SPREADSHEET_ID') {
    // Fallback : tentative de chargement du fichier local (compatibilité)
    await initDataLocal();
    return;
  }

  if (!silent) showLoadingState(true);

  try {
    const url = new URL('https://sheets.googleapis.com/v4/spreadsheets/' +
      encodeURIComponent(SHEETS_CONFIG.spreadsheetId) + '/values/' +
      encodeURIComponent(SHEETS_CONFIG.range));
    url.searchParams.set('key', SHEETS_CONFIG.apiKey);
    url.searchParams.set('valueRenderOption', 'UNFORMATTED_VALUE');
    url.searchParams.set('majorDimension', 'ROWS');

    const res = await fetch(url.toString());

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err.error && err.error.message) || 'HTTP ' + res.status);
    }

    const data = await res.json();
    const rows = data.values || [];

    if (rows.length < 2) {
      window.pharmacies = [];
    } else {
      // Ligne 0 = en-têtes, on commence à 1
      window.pharmacies = rows.slice(1)
        .map((row, i) => {
          const p = rowToPharmacy(row);
          if (p) p._sheetRow = i + 2; // numéro de ligne dans Sheets (1-basé + header)
          return p;
        })
        .filter(Boolean);
    }

    if (!silent) showLoadingState(false);
    updateStatPill();
    currentPage = 1;
    applySearch();
    showSyncBadge('ok', 'Synchronisé · ' + new Date().toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'}));

  } catch (e) {
    showLoadingState(false);
    console.error('Google Sheets error:', e);
    showToast('⚠️ Erreur Sheets : ' + e.message);
    showSyncBadge('error', 'Erreur de synchro');
  }
}

/**
 * Fallback : charge depuis le fichier Excel local (comportement original).
 */
async function initDataLocal() {
  try {
    const res = await fetch('Pharmacies_Benin .xlsx');
    if (!res.ok) throw new Error('Fichier local introuvable');
    const buf  = await res.arrayBuffer();
    const wb   = XLSX.read(new Uint8Array(buf), { type: 'array' });
    const ws   = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

    window.pharmacies = rows.slice(1)
      .filter(r => r[COL.nom])
      .map((r, i) => {
        const p = rowToPharmacy(r);
        if (p) p._sheetRow = i + 2;
        return p;
      })
      .filter(Boolean);
  } catch(e) {
    window.pharmacies = [];
    showToast('⚠️ Impossible de charger les données (local + Sheets).');
  }
  updateStatPill();
  applySearch();
}

/* ── Badge de statut de synchronisation ── */
function showSyncBadge(type, msg) {
  let badge = document.getElementById('syncBadge');
  if (!badge) {
    badge = document.createElement('div');
    badge.id = 'syncBadge';
    badge.style.cssText = [
      'position:fixed', 'bottom:16px', 'right:16px', 'z-index:500',
      'padding:6px 14px', 'border-radius:20px', 'font-size:11px',
      'font-family:DM Sans,sans-serif', 'font-weight:600',
      'letter-spacing:.04em', 'transition:opacity .4s', 'opacity:0',
      'pointer-events:none', 'box-shadow:0 2px 12px rgba(0,0,0,.3)'
    ].join(';');
    document.body.appendChild(badge);
  }
  badge.textContent = msg;
  badge.style.background  = type === 'ok' ? '#1a3a1c' : '#3a1a1a';
  badge.style.color        = type === 'ok' ? '#7ec882'  : '#e07070';
  badge.style.border       = type === 'ok' ? '1px solid #2d6e32' : '1px solid #6e2d2d';
  badge.style.opacity      = '1';
  setTimeout(() => { badge.style.opacity = '0'; }, 3500);
}

/* ── Indicateur de chargement dans le titre du tableau ── */
function showLoadingState(loading) {
  const pill = document.getElementById('statPill');
  if (!pill) return;
  if (loading) {
    pill.textContent = '⟳ Chargement…';
    pill.style.opacity = '.6';
  } else {
    pill.style.opacity = '1';
  }
}

/* ── Bouton rafraîchir (ajouté dynamiquement dans la toolbar) ── */
(function addRefreshButton() {
  // Ne s'affiche que si Sheets est configuré
  if (SHEETS_CONFIG.spreadsheetId === 'VOTRE_SPREADSHEET_ID') return;
  const toolbar = document.querySelector('.toolbar');
  if (!toolbar) return;
  const btn = document.createElement('button');
  btn.className = 'btn-import'; // réutilise le style existant
  btn.title = 'Recharger depuis Google Sheets';
  btn.innerHTML = '<span style="font-size:15px;line-height:1;">⟳</span> Actualiser';
  btn.onclick = () => loadFromSheets(false);
  // Insère avant le bouton "Ajouter"
  const btnAdd = document.querySelector('.btn-add');
  if (btnAdd) toolbar.insertBefore(btn, btnAdd);
  else toolbar.appendChild(btn);
})();

/* ── Rafraîchissement automatique ── */
if (SHEETS_CONFIG.autoRefreshMinutes > 0 &&
    SHEETS_CONFIG.spreadsheetId !== 'VOTRE_SPREADSHEET_ID') {
  setInterval(() => loadFromSheets(true), SHEETS_CONFIG.autoRefreshMinutes * 60 * 1000);
}

/* ═══════════════════════════════════════════════════════════
   ÉCRITURE VERS SHEETS (via Apps Script Web App)
   Appelé uniquement si appsScriptUrl est configuré.
═══════════════════════════════════════════════════════════ */

/**
 * Envoie une action (add / update / delete) au Apps Script.
 */
async function callAppsScript(action, payload) {
  if (!SHEETS_CONFIG.appsScriptUrl) return { ok: false, reason: 'not_configured' };
  try {
    const res = await fetch(SHEETS_CONFIG.appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action, ...payload }),
      redirect: 'follow',
    });
    return await res.json();
  } catch (e) {
    return { ok: false, reason: e.message };
  }
}

/**
 * Sauvegarde d'une pharmacie : écriture dans Sheets si configuré,
 * sinon persistance en mémoire uniquement.
 */
async function saveData() {
  if (SHEETS_CONFIG.appsScriptUrl) {
    // Rechargement depuis Sheets après écriture (les données peuvent avoir changé)
    await loadFromSheets(true);
  }
  // Sinon : les données restent en mémoire jusqu'au prochain rechargement de page.
}

/* ═══════════════════════════════════════════════════════════
   PAGINATION
═══════════════════════════════════════════════════════════ */
function renderPagination(totalItems) {
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const container  = document.getElementById('pagination');
  container.innerHTML = '';
  if (totalPages <= 1) return;

  const prev = document.createElement('button');
  prev.className = 'page-btn';
  prev.textContent = '‹ Préc.';
  prev.disabled = currentPage === 1;
  prev.onclick = () => { currentPage--; applySearch(); };
  container.appendChild(prev);

  let start = Math.max(1, currentPage - 3);
  let end   = Math.min(totalPages, currentPage + 3);
  if (start > 1) {
    container.appendChild(pageBtn(1));
    if (start > 2) { const d = document.createElement('span'); d.className='page-info'; d.textContent='…'; container.appendChild(d); }
  }
  for (let p = start; p <= end; p++) container.appendChild(pageBtn(p));
  if (end < totalPages) {
    if (end < totalPages - 1) { const d = document.createElement('span'); d.className='page-info'; d.textContent='…'; container.appendChild(d); }
    container.appendChild(pageBtn(totalPages));
  }

  const next = document.createElement('button');
  next.className = 'page-btn';
  next.textContent = 'Suiv. ›';
  next.disabled = currentPage === totalPages;
  next.onclick = () => { currentPage++; applySearch(); };
  container.appendChild(next);

  const info = document.createElement('span');
  info.className = 'page-info';
  info.textContent = 'Page ' + currentPage + '/' + totalPages;
  container.appendChild(info);
}

function pageBtn(p) {
  const b = document.createElement('button');
  b.className = 'page-btn' + (p === currentPage ? ' active' : '');
  b.textContent = p;
  b.onclick = () => { currentPage = p; applySearch(); };
  return b;
}

/* ═══════════════════════════════════════════════════════════
   RENDER
═══════════════════════════════════════════════════════════ */
function updateStatPill() {
  const n = pharmacies.length;
  document.getElementById('statPill').textContent = n + ' pharmacie' + (n > 1 ? 's' : '');
}

function render(data) {
  const tbody = document.getElementById('tableBody');
  const empty = document.getElementById('emptyState');
  const table = document.getElementById('pharmacyTable');

  if (data.length === 0) {
    table.style.display = 'none';
    empty.style.display = 'block';
    renderPagination(0);
    return;
  }

  table.style.display = '';
  empty.style.display = 'none';

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;

  const start    = (currentPage - 1) * PAGE_SIZE;
  const pageData = data.slice(start, start + PAGE_SIZE);

  tbody.innerHTML = '';
  pageData.forEach(function(p, i) {
    const globalNum = start + i + 1;
    const realIdx   = pharmacies.indexOf(p);

    const emailCell = p.email
      ? '<a href="mailto:' + esc(p.email) + '" class="td-email">' + esc(p.email) + '</a>'
      : '<span style="color:var(--text-light);font-style:italic;font-size:12px;">—</span>';

    const dash = '<span style="color:var(--text-light);font-style:italic;font-size:12px;">—</span>';
    const hasCoords = p.lat && p.lng;

    const latCell = p.lat
      ? (hasCoords
          ? '<a href="https://www.google.com/maps?q=' + esc(p.lat) + ',' + esc(p.lng) + '" target="_blank" class="td-coord-link" title="Voir sur Google Maps"><span class="td-coord">' + esc(p.lat) + '</span></a>'
          : '<span class="td-coord">' + esc(p.lat) + '</span>')
      : dash;
    const lngCell = p.lng ? '<span class="td-coord">' + esc(p.lng) + '</span>' : dash;

    const tr = document.createElement('tr');
    tr.style.animationDelay = (i * 40) + 'ms';
    tr.innerHTML =
      '<td class="td-num" style="font-weight:700;color:var(--green-accent);text-align:center;font-size:13px;">' +
        '<span class="num-badge desktop-num">' + globalNum + '</span>' +
        '<span class="num-badge mobile-num"># ' + globalNum + '</span>' +
        '<div class="td-actions mobile-actions">' +
        '<button class="btn-edit" onclick="openEditModal(' + realIdx + ')">✏️ Modifier</button>' +
        //'<button class="btn-del" onclick="deleteRow(' + realIdx + ')">🗑 Supprimer</button>' +
        '</div>' +
      '</td>' +
      '<td data-label="Nom"><span class="td-name">' + esc(p.nom) + '</span></td>' +
      '<td data-label="Département"><span class="td-dept">' + esc(p.dept) + '</span></td>' +
      '<td data-label="Ville">' + esc(p.ville) + '</td>' +
      '<td data-label="Quartier">' + esc(p.quartier) + '</td>' +
      '<td data-label="Adresse">' + esc(p.adresse) + '</td>' +
      '<td data-label="Téléphone"><span class="td-phone">' + esc(p.tel) + '</span></td>' +
      '<td data-label="Email">' + emailCell + '</td>' +
      '<td data-label="Latitude" style="text-align:center;">' + latCell + '</td>' +
      '<td data-label="Longitude" style="text-align:center;">' + lngCell + '</td>' +
      '<td class="td-action-cell"><div class="td-actions">' +
      '<button class="btn-edit" onclick="openEditModal(' + realIdx + ')">✏️ Modifier</button>' +
      //'<button class="btn-del" onclick="deleteRow(' + realIdx + ')">🗑 Supprimer</button>' +
      '</div></td>';
    tbody.appendChild(tr);
  });

  renderPagination(data.length);
}

function esc(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ═══════════════════════════════════════════════════════════
   CRUD
═══════════════════════════════════════════════════════════ */
async function deleteRow(idx) {
  const p = pharmacies[idx];
  if (!confirm('Supprimer « ' + p.nom + ' » ?')) return;

  // Écriture Sheets si configuré
  if (SHEETS_CONFIG.appsScriptUrl && p._sheetRow) {
    showToast('⟳ Suppression en cours…');
    const r = await callAppsScript('delete', { sheetRow: p._sheetRow });
    if (!r.ok) {
      showToast('⚠️ Erreur : ' + (r.reason || 'inconnu'));
      return;
    }
  }

  pharmacies.splice(idx, 1);
  await saveData();
  updateStatPill();
  applySearch();
  showToast('Pharmacie supprimée.');
}

function applySearch() {
  const q = document.getElementById('searchInput').value.toLowerCase().trim();
  const qNoSpace = q.replace(/\s+/g, '');
  lastFiltered = q
    ? pharmacies.filter(function(p) {
        const fieldsMatch = [p.nom, p.ville, p.quartier, p.dept, p.adresse, p.email || '']
          .some(function(v){ return v.toLowerCase().includes(q); });
        const telMatch = p.tel.replace(/\s+/g, '').toLowerCase().includes(qNoSpace);
        return fieldsMatch || telMatch;
      })
    : pharmacies;
  render(lastFiltered);
}

/* ═══════════════════════════════════════════════════════════
   MODAL AJOUTER / MODIFIER
═══════════════════════════════════════════════════════════ */
function openModal() {
  editIndex = -1;
  document.getElementById('modalTitle').textContent = 'Nouvelle Pharmacie';
  document.getElementById('modalSubtitle').textContent = 'Remplissez toutes les informations requises';
  document.getElementById('btnSubmitLabel').textContent = 'Enregistrer';
  ['f-nom','f-dept','f-ville','f-quartier','f-tel','f-adresse','f-email','f-lat','f-lng'].forEach(function(id) {
    const el = document.getElementById(id);
    if (el.tagName === 'SELECT') el.selectedIndex = 0;
    else el.value = '';
    el.classList.remove('error');
  });
  document.getElementById('overlay').classList.add('active');
  setTimeout(function(){ document.getElementById('f-nom').focus(); }, 100);
}

function openEditModal(idx) {
  editIndex = idx;
  const p = pharmacies[idx];
  document.getElementById('modalTitle').textContent = 'Modifier la Pharmacie';
  document.getElementById('modalSubtitle').textContent = 'Modifiez les informations ci-dessous';
  document.getElementById('btnSubmitLabel').textContent = 'Mettre à jour';
  document.getElementById('f-nom').value      = p.nom;
  document.getElementById('f-dept').value     = p.dept;
  document.getElementById('f-ville').value    = p.ville;
  document.getElementById('f-quartier').value = p.quartier;
  document.getElementById('f-tel').value      = p.tel;
  document.getElementById('f-adresse').value  = p.adresse;
  document.getElementById('f-email').value    = p.email || '';
  document.getElementById('f-lat').value      = p.lat || '';
  document.getElementById('f-lng').value      = p.lng || '';
  ['f-nom','f-dept','f-ville','f-quartier','f-tel','f-adresse','f-email','f-lat','f-lng'].forEach(function(id){
    document.getElementById(id).classList.remove('error');
  });
  document.getElementById('overlay').classList.add('active');
  setTimeout(function(){ document.getElementById('f-nom').focus(); }, 100);
}

function closeModal() {
  document.getElementById('overlay').classList.remove('active');
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById('overlay')) closeModal();
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') { closeModal(); closeImportModal(); }
  if (e.key === 'Enter' && document.getElementById('overlay').classList.contains('active')) submitForm();
});

function isValidCoord(val, min, max) {
  if (val === '') return true;
  const n = parseFloat(val);
  return !isNaN(n) && n >= min && n <= max;
}

async function submitForm() {
  const requiredMap = { nom:'f-nom', dept:'f-dept', ville:'f-ville', quartier:'f-quartier', tel:'f-tel', adresse:'f-adresse' };
  const vals = {};
  let valid = true;
  let errorMsg = '';

  Object.keys(requiredMap).forEach(function(k) {
    const el = document.getElementById(requiredMap[k]);
    const v  = el.value.trim();
    vals[k]  = v;
    if (!v) { el.classList.add('error'); valid = false; errorMsg = 'Veuillez remplir tous les champs obligatoires.'; }
    else      el.classList.remove('error');
  });

  const emailEl  = document.getElementById('f-email');
  const emailVal = emailEl.value.trim();
  if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
    emailEl.classList.add('error'); valid = false; errorMsg = 'Adresse email invalide.';
  } else { emailEl.classList.remove('error'); vals.email = emailVal; }

  const latEl  = document.getElementById('f-lat');
  const latVal = latEl.value.trim();
  if (!isValidCoord(latVal, -90, 90)) {
    latEl.classList.add('error'); valid = false; errorMsg = 'Latitude invalide (entre -90 et 90).';
  } else { latEl.classList.remove('error'); vals.lat = latVal; }

  const lngEl  = document.getElementById('f-lng');
  const lngVal = lngEl.value.trim();
  if (!isValidCoord(lngVal, -180, 180)) {
    lngEl.classList.add('error'); valid = false; errorMsg = 'Longitude invalide (entre -180 et 180).';
  } else { lngEl.classList.remove('error'); vals.lng = lngVal; }

  if (!valid) { showToast(errorMsg); return; }

  // Écriture Sheets si Apps Script configuré
  if (SHEETS_CONFIG.appsScriptUrl) {
    const isEdit = editIndex >= 0;
    showToast('⟳ Enregistrement en cours…');

    const payload = isEdit
      ? { pharmacy: vals, sheetRow: pharmacies[editIndex]._sheetRow }
      : { pharmacy: vals };

    const r = await callAppsScript(isEdit ? 'update' : 'add', payload);
    if (!r.ok) {
      showToast('⚠️ Erreur Sheets : ' + (r.reason || 'inconnu'));
      return;
    }
    // Rechargement depuis Sheets pour avoir les données fraîches
    closeModal();
    await loadFromSheets(false);
    showToast('Pharmacie « ' + vals.nom + ' » ' + (isEdit ? 'mise à jour' : 'ajoutée') + ' !');
    return;
  }

  // Mode mémoire seulement (pas d'Apps Script)
  if (editIndex >= 0) {
    vals._sheetRow = pharmacies[editIndex]._sheetRow;
    pharmacies[editIndex] = vals;
    updateStatPill(); applySearch(); closeModal();
    showToast('Pharmacie « ' + vals.nom + ' » mise à jour !');
  } else {
    vals._sheetRow = null;
    pharmacies.push(vals);
    currentPage = Math.ceil(pharmacies.length / PAGE_SIZE);
    updateStatPill(); applySearch(); closeModal();
    showToast('Pharmacie « ' + vals.nom + ' » ajoutée (non synchronisée avec Sheets).');
  }
}

/* ═══════════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════════ */
let toastTimer;
function showToast(msg) {
  clearTimeout(toastTimer);
  const t = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  t.classList.add('show');
  toastTimer = setTimeout(function(){ t.classList.remove('show'); }, 3500);
}

/* ═══════════════════════════════════════════════════════════
   IMPORT CSV / EXCEL (conservé intact)
═══════════════════════════════════════════════════════════ */
const FIELD_MAP = {
  nom:      ['nom', 'name', 'pharmacie', 'pharmacy', 'denomination', 'libelle', 'établissement', 'etablissement'],
  dept:     ['département', 'departement', 'dept', 'department', 'dep', 'région', 'region'],
  ville:    ['ville', 'city', 'commune', 'localite', 'localité', 'municipalite', 'municipalité'],
  quartier: ['quartier', 'district', 'zone', 'secteur', 'arrondissement'],
  adresse:  ['adresse', 'address', 'localisation', 'situation', 'rue', 'street'],
  tel:      ['téléphone', 'telephone', 'tel', 'phone', 'contact', 'numéro', 'numero', 'mobile', 'gsm', 'tél'],
  email:    ['email', 'mail', 'courriel', 'e-mail', 'mél'],
  lat:      ['latitude', 'lat'],
  lng:      ['longitude', 'lng', 'lon', 'long']
};

const DEPT_OPTIONS = [
  'Alibori','Atacora','Atlantique','Borgou','Collines',
  'Couffo','Donga','Littoral','Mono','Ouémé','Plateau','Zou'
];

function triggerImport() {
  document.getElementById('importFileInput').value = '';
  document.getElementById('importFileInput').click();
}

function handleFileImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  const name = file.name.toLowerCase();

  if (name.endsWith('.csv')) {
    const reader = new FileReader();
    reader.onload = function(e) { processImportRows(parseCSV(e.target.result), file.name); };
    reader.onerror = function() { showToast('Erreur de lecture du fichier CSV.'); };
    reader.readAsText(file, 'UTF-8');
  } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    if (typeof XLSX === 'undefined') { showToast('Bibliothèque Excel non chargée.'); return; }
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        processImportRows(XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }), file.name);
      } catch(err) { showToast('Impossible de lire le fichier Excel : ' + err.message); }
    };
    reader.onerror = function() { showToast('Erreur de lecture du fichier Excel.'); };
    reader.readAsArrayBuffer(file);
  } else {
    showToast('Format non supporté. Utilisez .csv, .xlsx ou .xls');
  }
}

function parseCSV(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
  if (!lines.length) return [];
  const firstLine = lines[0];
  const delimiter = (firstLine.split(';').length >= firstLine.split(',').length) ? ';' : ',';
  return lines.map(function(line) {
    const result = []; let current = ''; let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === delimiter && !inQuotes) { result.push(current.trim()); current = ''; }
      else current += ch;
    }
    result.push(current.trim());
    return result;
  });
}

function normalizeStr(s) {
  return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
}

function mapHeaders(headers) {
  const mapping = {};
  headers.forEach(function(h, i) {
    const norm = normalizeStr(h);
    if (!norm) return;
    Object.keys(FIELD_MAP).forEach(function(field) {
      if (mapping[field] !== undefined) return;
      if (FIELD_MAP[field].map(normalizeStr).indexOf(norm) !== -1) mapping[field] = i;
    });
  });
  return mapping;
}

function processImportRows(rows, fileName) {
  const nonEmpty = rows.filter(function(r) { return r && r.some(function(c) { return String(c).trim() !== ''; }); });
  if (nonEmpty.length < 2) { showToast('Fichier vide ou sans lignes de données exploitables.'); return; }
  const headers = nonEmpty[0];
  const mapping = mapHeaders(headers);
  if (mapping.nom === undefined) { showToast('Colonne "Nom" introuvable. Vérifiez les en-têtes du fichier.'); return; }

  const parsed = []; const skipped = [];
  for (let r = 1; r < nonEmpty.length; r++) {
    const row = nonEmpty[r];
    function get(field) {
      if (mapping[field] === undefined) return '';
      return String(row[mapping[field]] !== undefined ? row[mapping[field]] : '').trim();
    }
    const nom = get('nom');
    if (!nom) { skipped.push(r + 1); continue; }
    const deptRaw = get('dept');
    let dept = deptRaw;
    if (deptRaw) {
      const matched = DEPT_OPTIONS.find(function(d) { return normalizeStr(d) === normalizeStr(deptRaw); });
      if (matched) dept = matched;
    }
    const cleanCoord = function(v) { return v.replace(',', '.'); };
    parsed.push({ nom, dept, ville: get('ville'), quartier: get('quartier'), adresse: get('adresse'),
      tel: get('tel'), email: get('email'), lat: cleanCoord(get('lat')), lng: cleanCoord(get('lng')), _sheetRow: null });
  }

  if (parsed.length === 0) { showToast('Aucune ligne valide trouvée (la colonne "Nom" est obligatoire).'); return; }
  pendingImportData = parsed;
  showImportPreview(parsed, skipped.length, mapping, headers);
}

function showImportPreview(data, skippedCount, mapping, headers) {
  const n = data.length;
  document.getElementById('importSubtitle').textContent = n + ' pharmacie' + (n > 1 ? 's' : '') + ' prête' + (n > 1 ? 's' : '') + ' à importer';
  document.getElementById('importConfirmLabel').textContent = 'Importer ' + n + ' pharmacie' + (n > 1 ? 's' : '');

  const fieldLabels = { nom:'Nom', dept:'Département', ville:'Ville', quartier:'Quartier', adresse:'Adresse', tel:'Téléphone', email:'Email', lat:'Latitude', lng:'Longitude' };
  let tagsHtml = '';
  Object.keys(fieldLabels).forEach(function(field) {
    const found = mapping[field] !== undefined;
    const colName = found ? esc(String(headers[mapping[field]])) : '';
    tagsHtml += '<span class="mapping-tag ' + (found ? 'found' : 'missing') + '" title="' +
      (found ? 'Colonne trouvée : ' + colName : 'Non trouvé dans le fichier') + '">' +
      (found ? '✓ ' : '○ ') + fieldLabels[field] + '</span>';
  });
  document.getElementById('importMappingInfo').innerHTML = '<strong>Colonnes détectées :</strong><div class="mapping-tags">' + tagsHtml + '</div>';

  let statsHtml = '<div class="import-stat-row"><span class="import-stat good">✅ ' + n + ' ligne' + (n > 1 ? 's' : '') + ' valide' + (n > 1 ? 's' : '') + '</span>';
  if (skippedCount > 0) statsHtml += '<span class="import-stat warn">⚠️ ' + skippedCount + ' ligne' + (skippedCount > 1 ? 's' : '') + ' ignorée' + (skippedCount > 1 ? 's' : '') + ' (nom vide)</span>';
  statsHtml += '</div>';
  document.getElementById('importStats').innerHTML = statsHtml;

  const PREVIEW_MAX = 10;
  const preview = data.slice(0, PREVIEW_MAX);
  const fields  = ['nom','dept','ville','quartier','adresse','tel','email','lat','lng'];
  const labels  = ['Nom','Département','Ville','Quartier','Adresse','Téléphone','Email','Latitude','Longitude'];
  let tableHtml = '<thead><tr>';
  labels.forEach(function(l) { tableHtml += '<th>' + l + '</th>'; });
  tableHtml += '</tr></thead><tbody>';
  preview.forEach(function(p) {
    tableHtml += '<tr>';
    fields.forEach(function(f) {
      tableHtml += p[f] ? '<td>' + esc(p[f]) + '</td>' : '<td><span class="cell-empty">—</span></td>';
    });
    tableHtml += '</tr>';
  });
  if (data.length > PREVIEW_MAX) {
    tableHtml += '<tr><td class="td-more" colspan="' + fields.length + '">… et ' + (data.length - PREVIEW_MAX) + ' autre' + (data.length - PREVIEW_MAX > 1 ? 's' : '') + '</td></tr>';
  }
  tableHtml += '</tbody>';
  document.getElementById('importPreviewTable').innerHTML = tableHtml;
  document.getElementById('importOverlay').classList.add('active');
}

function closeImportModal() {
  document.getElementById('importOverlay').classList.remove('active');
  pendingImportData = [];
}

function handleImportOverlayClick(e) {
  if (e.target === document.getElementById('importOverlay')) closeImportModal();
}

async function confirmImport() {
  if (!pendingImportData.length) return;
  let added = 0; let duplicates = 0;

  pendingImportData.forEach(function(entry) {
    const isDuplicate = pharmacies.some(function(existing) {
      return normalizeStr(existing.nom) === normalizeStr(entry.nom) &&
             normalizeStr(existing.ville || '') === normalizeStr(entry.ville || '');
    });
    if (isDuplicate) duplicates++;
    else { pharmacies.push(entry); added++; }
  });

  pendingImportData = [];

  // Si Apps Script configuré, on peut tenter une écriture en lot
  if (SHEETS_CONFIG.appsScriptUrl && added > 0) {
    showToast('⟳ Import vers Sheets en cours…');
    // Rechargement après import pour synchroniser les _sheetRow
    await loadFromSheets(false);
  }

  updateStatPill(); currentPage = 1; applySearch(); closeImportModal();
  let msg = added + ' pharmacie' + (added > 1 ? 's' : '') + ' importée' + (added > 1 ? 's' : '') + ' !';
  if (duplicates > 0) msg += ' (' + duplicates + ' doublon' + (duplicates > 1 ? 's' : '') + ' ignoré' + (duplicates > 1 ? 's' : '') + ')';
  showToast(msg);
}

/* ═══════════════════════════════════════════════════════════
   DÉMARRAGE
═══════════════════════════════════════════════════════════ */
loadFromSheets(false);