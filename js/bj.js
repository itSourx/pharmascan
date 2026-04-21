/* ══════════════════════════════════════
   CONFIG GOOGLE SHEETS (identique à pharm.js)
══════════════════════════════════════ */
const SHEETS_CONFIG = {
  spreadsheetId: '1rwnYeP8F_Nopmj-x7VNzAyDFVN806ZrSpan54Pjvk4k',
  apiKey:        'AIzaSyDgnmI6_rie3WANTkQ5O1mM2XyhabOVYEk',
  range:         'Pharmacies!A:K',
};

const COL = {
  nom: 1, adresse: 2, email: 3, dept: 4,
  ville: 5, quartier: 6, tel: 7, lat: 8, lng: 9,
};

const DEPT_MAP = {
  'Alibori':'Alibori', 'Atakora':'Atacora', 'Atlantique':'Atlantique',
  'Borgou':'Borgou', 'Collines':'Collines', 'Donga':'Donga',
  "Département de l'Ouémé":'Ouémé', 'Kouffo':'Couffo',
  'Littoral':'Littoral', 'Mono':'Mono', 'Plateau':'Plateau', 'Zou':'Zou',
};

function rowToPharmacy(row, sheetRow) {
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
    _sheetRow: sheetRow,
  };
}
/* ══════════════════════════════════════
   1. VARIABLES GLOBALES
══════════════════════════════════════ */
let userLat = null;
let userLng = null;
let userMarker = null;
let boundaryCache = {};
let currentDepPharmacies = [];
let selectedPharmacy = null; // pharmacie mise en évidence depuis la recherche

/* ── Base de données pharmacies (chargée depuis pharmacies_data.json) ── */
window.PHARMA_DB = [];

function getAllPharmacies() {
  return window.PHARMA_DB || [];
}

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) ** 2
    + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180)
    * Math.sin(dLng/2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function getNearestPharmacy(pharmacies) {
  if (userLat === null || !pharmacies.length) return null;
  return pharmacies.reduce((nearest, p) => {
    const d = haversine(userLat, userLng, parseFloat(p.lat), parseFloat(p.lng));
    return d < nearest.d ? { p, d } : nearest;
  }, { p: null, d: Infinity }).p;
}

/* ══════════════════════════════════════
   2. CONSTANTES CARTE SVG
══════════════════════════════════════ */
const ORDER = ["Alibori", "Atacora", "Borgou", "Donga", "Collines", "Zou", "Plateau", "Couffo", "Atlantique", "Ouémé", "Mono", "Littoral"];
const CEN   = { "Alibori": [248, 108], "Atacora": [126, 168], "Borgou": [237, 253], "Donga": [146, 295], "Collines": [186, 410], "Plateau": [224, 462], "Zou": [176, 491], "Couffo": [147, 512], "Atlantique": [188, 555], "Ouémé": [224, 562], "Mono": [151, 545], "Littoral": [208, 580] };
const DOTC  = ["#CDC4AE", "#9BA6A8", "#92B18F", "#D16664", "#E67CA2", "#F9E083", "#AA785D", "#B7907B", "#9FC68E", "#A180AA", "#DDC467", "#F6B8C5"];
const DEPS  = ORDER.map(id => ({ id, v: 0 }));
const NS    = 'http://www.w3.org/2000/svg';
const bubG  = document.getElementById('bubs');
const listEl = document.getElementById('slist');
let sel = null;

const BUBBLE_COL = '#1c6b34';
const BUBBLE_R   = 7;

const getTotal = () => DEPS.reduce((s, d) => s + d.v, 0);
const getMax   = () => Math.max(...DEPS.map(d => d.v));

/* ══════════════════════════════════════
   3. BULLES SVG
══════════════════════════════════════ */
function drawBubbles() {
  bubG.innerHTML = '';
  DEPS.forEach(dep => {
    const [cx, cy] = CEN[dep.id];
    const r = BUBBLE_R;

    if (dep.id === sel) {
      const rg = document.createElementNS(NS, 'circle');
      rg.setAttribute('cx', cx); rg.setAttribute('cy', cy);
      rg.setAttribute('r', r + 5); rg.setAttribute('fill', 'none');
      rg.setAttribute('stroke', BUBBLE_COL); rg.setAttribute('stroke-width', '2');
      rg.setAttribute('opacity', '0.45');
      bubG.appendChild(rg);
    }
    const sh = document.createElementNS(NS, 'circle');
    sh.setAttribute('cx', cx + 1); sh.setAttribute('cy', cy + 2);
    sh.setAttribute('r', r); sh.setAttribute('fill', 'rgba(0,0,0,.2)');
    bubG.appendChild(sh);
    const ci = document.createElementNS(NS, 'circle');
    ci.setAttribute('cx', cx); ci.setAttribute('cy', cy);
    ci.setAttribute('r', r); ci.setAttribute('fill', BUBBLE_COL);
    ci.style.cursor = 'pointer';
    ci.addEventListener('click', () => doSelect(dep.id));
    bubG.appendChild(ci);
    const hi = document.createElementNS(NS, 'circle');
    hi.setAttribute('cx', cx - r * .2); hi.setAttribute('cy', cy - r * .25);
    hi.setAttribute('r', r * .3); hi.setAttribute('fill', 'rgba(255,255,255,.18)');
    hi.setAttribute('pointer-events', 'none');
    bubG.appendChild(hi);
    const tv = document.createElementNS(NS, 'text');
    tv.setAttribute('x', cx); tv.setAttribute('y', cy + .4);
    tv.setAttribute('text-anchor', 'middle'); tv.setAttribute('dominant-baseline', 'middle');
    tv.setAttribute('font-size', '8'); tv.setAttribute('font-weight', '700');
    tv.setAttribute('font-family', "'DM Sans',sans-serif"); tv.setAttribute('fill', '#fff');
    tv.setAttribute('pointer-events', 'none');
    tv.textContent = dep.v;
    bubG.appendChild(tv);
    const tn = document.createElementNS(NS, 'text');
    const lx = dep.id === 'Ouémé' ? cx + 10 : cx;
    tn.setAttribute('x', lx); tn.setAttribute('y', cy + r + 5);
    tn.setAttribute('text-anchor', 'middle'); tn.setAttribute('dominant-baseline', 'middle');
    tn.setAttribute('font-size', '9'); tn.setAttribute('font-weight', '600');
    tn.setAttribute('font-family', "'DM Sans',sans-serif"); tn.setAttribute('fill', '#162a1e');
    tn.setAttribute('opacity', '0.78'); tn.setAttribute('pointer-events', 'none');
    tn.textContent = dep.id;
    bubG.appendChild(tn);
  });
}

/* ══════════════════════════════════════
   4. SÉLECTION
══════════════════════════════════════ */
function doSelect(id) {
  sel = id;
  const dep = DEPS.find(d => d.id === id);
  const tot = getTotal();
  document.getElementById('ibd').textContent = dep.id;
  document.getElementById('ibv').textContent = dep.v.toLocaleString('fr-FR');
  document.getElementById('ibp').textContent = tot > 0 ? (dep.v / tot * 100).toFixed(1) + '%' : '–';
  DEPS.forEach(d => {
    const el = document.getElementById('z-' + d.id);
    if (el) el.classList.toggle('sel', d.id === id);
  });
  document.querySelectorAll('.dr').forEach(r => r.classList.toggle('act', r.dataset.id === id));
  drawBubbles();
  openModal(id);
}

/* ══════════════════════════════════════
   5. PANEL SIDEBAR
══════════════════════════════════════ */
function makeRow(dep, origIdx, mx) {
  const pct = mx > 0 ? (dep.v / mx * 100) : 0;
  const row = document.createElement('div');
  row.className = 'dr' + (dep.id === sel ? ' act' : '');
  row.dataset.id = dep.id;
  row.innerHTML = `
    <div class="dd" style="background:${DOTC[origIdx]}"></div>
    <span class="dn">${dep.id}</span>
    <div class="db"><div class="dbf" style="width:${pct}%"></div></div>
    <span class="dv">${dep.v.toLocaleString('fr-FR')}</span>
  `;
  row.addEventListener('click', () => doSelect(dep.id));
  return row;
}

function buildPanel() {
  listEl.innerHTML = '';
  const mx = getMax();
  document.getElementById('tot').textContent = getTotal().toLocaleString('fr-FR');
  ORDER.forEach(id => {
    const dep = DEPS.find(d => d.id === id);
    listEl.appendChild(makeRow(dep, ORDER.indexOf(id), mx));
  });
  DEPS.forEach(dep => {
    const el = document.getElementById('z-' + dep.id);
    if (el) el.addEventListener('click', () => doSelect(dep.id));
  });
}

/* ══════════════════════════════════════
   6. SIDEBAR MOBILE
══════════════════════════════════════ */
function toggleSidebar() {
  const sb  = document.getElementById('sidebar');
  const btn = document.getElementById('mobToggle');
  const open = sb.classList.toggle('open');
  btn.textContent = open ? '✕  Fermer' : '☰  Données';
}

/* ══════════════════════════════════════
   7. TÉLÉCHARGEMENT
══════════════════════════════════════ */
function downloadMap() {
  const btn = document.getElementById('dlBtn');
  btn.textContent = '⏳';
  btn.disabled = true;
  const svgEl = document.getElementById('map');
  const svgClone = svgEl.cloneNode(true);
  svgEl.querySelectorAll('.dz').forEach(path => {
    const clone = svgClone.querySelector('#' + path.id);
    if (clone) {
      clone.setAttribute('fill', path.getAttribute('fill'));
      clone.removeAttribute('class');
      const filter = path.style.filter;
      if (filter) clone.style.filter = filter;
    }
  });
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('width', '400'); bg.setAttribute('height', '601'); bg.setAttribute('fill', '#faf7f2');
  svgClone.insertBefore(bg, svgClone.firstChild);
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.textContent = `text{font-family:Arial,sans-serif;}`;
  svgClone.insertBefore(style, svgClone.firstChild);
  svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svgClone.setAttribute('width', '800'); svgClone.setAttribute('height', '1202');
  const svgStr  = new XMLSerializer().serializeToString(svgClone);
  const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();
  img.onload = function () {
    const canvas = document.createElement('canvas');
    canvas.width = 800; canvas.height = 1202;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#faf7f2'; ctx.fillRect(0, 0, 800, 1202);
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
    canvas.toBlob(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'benin-carte-clients.png';
      a.click();
      URL.revokeObjectURL(a.href);
      btn.innerHTML = `<svg viewBox="0 0 16 16"><path d="M8 1v8.5M5 7l3 3 3-3M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;
      btn.disabled = false;
    }, 'image/png');
  };
  img.onerror = function () {
    btn.innerHTML = `<svg viewBox="0 0 16 16"><path d="M8 1v8.5M5 7l3 3 3-3M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;
    btn.disabled = false;
  };
  img.src = url;
}

/* ══════════════════════════════════════
   8. MODAL DÉPARTEMENT (LEAFLET)
══════════════════════════════════════ */
const modalOverlay = document.getElementById('modalOverlay');
const modalClose   = document.getElementById('modalClose');
const modalTitle   = document.getElementById('modalTitle');
const modalMap     = document.getElementById('modalMap');

const DEP_GEO = {
  "Alibori":    [11.37,  2.95, 9],
  "Atacora":    [10.35,  1.55, 9],
  "Borgou":     [ 9.80,  2.75, 9],
  "Donga":      [ 9.70,  1.75, 9],
  "Collines":   [ 8.25,  2.30, 10],
  "Zou":        [ 7.20,  2.15, 10],
  "Plateau":    [ 7.10,  2.65, 10],
  "Couffo":     [ 7.00,  1.80, 11],
  "Atlantique": [ 6.60,  2.30, 11],
  "Ouémé":      [ 6.55,  2.60, 11],
  "Mono":       [ 6.90,  1.62, 11],
  "Littoral":   [ 6.37,  2.42, 13],
};

const DEP_BOUNDS = {
  "Alibori":    [[10.45, 2.00], [12.40, 3.80]],
  "Atacora":    [[ 9.50, 0.80], [11.10, 2.10]],
  "Borgou":     [[ 8.50, 2.00], [11.00, 3.80]],
  "Donga":      [[ 8.80, 1.20], [10.20, 2.20]],
  "Collines":   [[ 7.50, 1.80], [ 9.00, 2.80]],
  "Zou":        [[ 6.90, 1.80], [ 8.00, 2.70]],
  "Plateau":    [[ 6.80, 2.30], [ 7.70, 3.00]],
  "Couffo":     [[ 6.70, 1.50], [ 7.50, 2.00]],
  "Atlantique": [[ 6.30, 2.00], [ 6.75, 2.60]],
  "Ouémé":      [[ 6.30, 2.40], [ 6.80, 2.80]],
  "Mono":       [[ 6.60, 1.45], [ 7.10, 1.90]],
  "Littoral":   [[ 6.33, 2.34], [ 6.39, 2.49]],
};

let leafletMap = null;

function openModal(id) {
  const geo    = DEP_GEO[id];
  const bounds = DEP_BOUNDS[id];
  if (!geo || !bounds) return;

  modalTitle.textContent = id;
  modalOverlay.classList.add('open');
  document.addEventListener('keydown', onModalKey);

  setTimeout(() => {
    const container = document.getElementById('modalLeaflet');
    if (!container) return;

    if (leafletMap) { leafletMap.remove(); leafletMap = null; }

    const leafletBounds = L.latLngBounds(bounds[0], bounds[1]);

    const allPharmacies = getAllPharmacies();

    const depPharmacies = allPharmacies.filter(p =>
      p.dept === id &&
      p.lat && p.lng &&
      !isNaN(parseFloat(p.lat)) && !isNaN(parseFloat(p.lng))
    );

    leafletMap = L.map('modalLeaflet', {
      maxBounds: leafletBounds,
      maxBoundsViscosity: 1.0,
      zoomControl: true,
      attributionControl: true,
    }).fitBounds(leafletBounds);

    const minZoom = leafletMap.getZoom();
    leafletMap.setMinZoom(minZoom);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(leafletMap);

    currentDepPharmacies = depPharmacies;
drawPharmMarkers();

    /* Marqueur utilisateur si déjà localisé */
    if (userLat !== null) {
      const userIcon = L.divIcon({
        className: '',
        html: `<div style="
          width:16px; height:16px;
          background:#1a73e8;
          border:3px solid #fff;
          border-radius:50%;
          box-shadow:0 0 0 4px rgba(26,115,232,.30), 0 2px 8px rgba(0,0,0,.4);
        "></div>`,
        iconSize: [16, 16], iconAnchor: [8, 8], popupAnchor: [0, -10],
      });
      userMarker = L.marker([userLat, userLng], { icon: userIcon })
        .addTo(leafletMap)
        .bindPopup('<strong>Vous êtes ici</strong>');
    }

    leafletMap.invalidateSize();
  }, 120);
}

function drawPharmMarkers() {
  if (!leafletMap) return;

  /* Supprime tous les marqueurs pharmacie existants */
  leafletMap.eachLayer(layer => {
    if (layer._isPharmMarker) leafletMap.removeLayer(layer);
  });

  if (currentDepPharmacies.length === 0) return;

  const nearest = getNearestPharmacy(currentDepPharmacies);

  currentDepPharmacies.forEach(p => {
    const isNearest  = nearest && p === nearest;
    const isSelected = selectedPharmacy && p.nom === selectedPharmacy.nom;

    let pharmIcon;

    if (isSelected) {
      pharmIcon = L.divIcon({
        className: '',
        html: `
          <div class="pharm-marker-selected">
            <div class="pharm-marker-ring"></div>
            <div class="pharm-marker-dot"></div>
          </div>`,
        iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -16],
      });
    } else if (isNearest) {
      pharmIcon = L.divIcon({
        className: '',
        html: `<div style="
            width:20px; height:20px;
            background:#f59e0b;
            border:3px solid #fff;
            border-radius:50%;
            box-shadow:0 0 0 4px rgba(245,158,11,.35), 0 2px 8px rgba(0,0,0,.5);
          "></div>`,
        iconSize: [20, 20], iconAnchor: [10, 10], popupAnchor: [0, -12],
      });
    } else {
      pharmIcon = L.divIcon({
        className: '',
        html: `<div style="
            width:13px; height:13px;
            background:#d4364a;
            border:2px solid #fff;
            border-radius:50%;
            box-shadow:0 2px 6px rgba(0,0,0,.4);
          "></div>`,
        iconSize: [13, 13], iconAnchor: [6, 6], popupAnchor: [0, -8],
      });
    }

    const marker = L.marker([parseFloat(p.lat), parseFloat(p.lng)], {
      icon: pharmIcon,
      zIndexOffset: isSelected ? 1000 : (isNearest ? 500 : 0),
    }).addTo(leafletMap);

    marker._isPharmMarker = true;

    marker.bindTooltip(
      isSelected
        ? `<span style="color:#00C896;font-weight:700;">✚ ${p.nom}</span>`
        : isNearest
          ? `⭐ ${p.nom} <em style="font-size:.75em;opacity:.7;">(la plus proche)</em>`
          : p.nom,
      { permanent: false, direction: 'top', offset: [0, -8] }
    );

    if (isSelected && leafletMap) {
      setTimeout(() => marker.openTooltip(), 300);
    }

    marker.on('click', () => openPharmModal(p, isNearest));
  });
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.removeEventListener('keydown', onModalKey);
  selectedPharmacy = null;
}

function onModalKey(e) {
  if (e.key === 'Escape') closeModal();
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});

/* ══════════════════════════════════════
   9. LOCALISATION UTILISATEUR
══════════════════════════════════════ */
function findNearestPharmacy() {
  const btn = document.getElementById('btnNearestPharm');

  if (!navigator.geolocation) {
    btn.textContent = '❌ Non supporté';
    setTimeout(() => { btn.textContent = '⭐ Pharmacie la plus proche'; }, 3000);
    return;
  }

  btn.textContent = '⏳ Localisation…';
  btn.disabled = true;

  navigator.geolocation.getCurrentPosition(
    pos => {
      userLat = pos.coords.latitude;
      userLng = pos.coords.longitude;

      /* Charge toutes les pharmacies avec coordonnées valides */
      const allPharmacies = getAllPharmacies();

      const withCoords = allPharmacies.filter(p =>
        p.lat && p.lng &&
        !isNaN(parseFloat(p.lat)) && !isNaN(parseFloat(p.lng))
      );

      btn.textContent = '⭐ Pharmacie la plus proche';
      btn.disabled = false;

      if (withCoords.length === 0) {
        alert('Aucune pharmacie avec coordonnées enregistrée.');
        return;
      }

      /* Trouve la plus proche */
      const nearest = withCoords.reduce((best, p) => {
        const d = haversine(userLat, userLng, parseFloat(p.lat), parseFloat(p.lng));
        return d < best.d ? { p, d } : best;
      }, { p: null, d: Infinity });

      const km = nearest.d < 1
        ? Math.round(nearest.d * 1000) + ' m'
        : nearest.d.toFixed(1) + ' km';

      /* Ouvre le département correspondant */
      doSelect(nearest.p.dept);

      /* Attend que la carte soit prête puis ouvre le modal pharmacie */
      setTimeout(() => {
        drawPharmMarkers();

        /* Petit délai supplémentaire pour que les marqueurs soient créés */
        setTimeout(() => {
          openPharmModal(nearest.p, true, km);
        }, 150);
      }, 450);
    },
    err => {
      const msgs = { 1: '❌ Permission refusée', 2: '❌ Position indisponible', 3: '❌ Délai dépassé' };
      btn.textContent = msgs[err.code] || '❌ Erreur';
      setTimeout(() => { btn.textContent = '⭐ Pharmacie la plus proche'; btn.disabled = false; }, 3000);
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}
function locateUser() {
  const btn = document.getElementById('btnLocate');
  if (!leafletMap) return;

  if (!navigator.geolocation) {
    btn.textContent = '❌ Non supporté';
    return;
  }

  btn.textContent = '⏳ Localisation…';
  btn.disabled = true;

  navigator.geolocation.getCurrentPosition(
    pos => {
      userLat = pos.coords.latitude;
      userLng = pos.coords.longitude;
      drawPharmMarkers(); // Rafraîchit immédiatement les marqueurs

      if (userMarker) { leafletMap.removeLayer(userMarker); userMarker = null; }

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:16px; height:16px;
          background:#1a73e8;
          border:3px solid #fff;
          border-radius:50%;
          box-shadow:0 0 0 4px rgba(26,115,232,.30), 0 2px 8px rgba(0,0,0,.4);
        "></div>`,
        iconSize: [16, 16], iconAnchor: [8, 8], popupAnchor: [0, -10],
      });

      userMarker = L.marker([userLat, userLng], { icon })
        .addTo(leafletMap)
        .bindPopup('<strong>Vous êtes ici</strong>')
        .openPopup();

      leafletMap.setView([userLat, userLng], leafletMap.getZoom());

      btn.textContent = '📍 Voir ma position';
      btn.disabled = false;
    },
    err => {
      const msgs = { 1: '❌ Permission refusée', 2: '❌ Position indisponible', 3: '❌ Délai dépassé' };
      btn.textContent = msgs[err.code] || '❌ Erreur';
      setTimeout(() => { btn.textContent = '📍 Voir ma position'; btn.disabled = false; }, 3000);
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

function getDepFromCoords(lat, lng) {
  return ORDER.find(id => {
    const b = DEP_BOUNDS[id];
    return lat >= b[0][0] && lat <= b[1][0]
        && lng >= b[0][1] && lng <= b[1][1];
  }) || null;
}

function locateAndOpen() {
  const btn = document.getElementById('btnLocateMain');
  if (!navigator.geolocation) {
    btn.textContent = '❌ Non supporté';
    return;
  }

  btn.textContent = '⏳ Localisation…';
  btn.disabled = true;

  navigator.geolocation.getCurrentPosition(
    pos => {
      userLat = pos.coords.latitude;
      userLng = pos.coords.longitude;
      drawPharmMarkers(); // Rafraîchit immédiatement les marqueurs

      const depId = getDepFromCoords(userLat, userLng);

      btn.textContent = '📍 Voir ma position';
      btn.disabled = false;

      if (!depId) {
        alert('Votre position est en dehors du Bénin.');
        return;
      }

      doSelect(depId);

      setTimeout(() => {
        if (!leafletMap) return;
        if (userMarker) { leafletMap.removeLayer(userMarker); userMarker = null; }

        const icon = L.divIcon({
          className: '',
          html: `<div style="
            width:16px; height:16px;
            background:#1a73e8;
            border:3px solid #fff;
            border-radius:50%;
            box-shadow:0 0 0 4px rgba(26,115,232,.30), 0 2px 8px rgba(0,0,0,.4);
          "></div>`,
          iconSize: [16, 16], iconAnchor: [8, 8], popupAnchor: [0, -10],
        });

        userMarker = L.marker([userLat, userLng], { icon })
          .addTo(leafletMap)
          .bindPopup('<strong>Vous êtes ici</strong>')
          .openPopup();

        leafletMap.setView([userLat, userLng], leafletMap.getZoom());
      }, 400);
    },
    err => {
      const msgs = { 1: '❌ Permission refusée', 2: '❌ Position indisponible', 3: '❌ Délai dépassé' };
      btn.textContent = msgs[err.code] || '❌ Erreur';
      setTimeout(() => { btn.textContent = '📍 Voir ma position'; btn.disabled = false; }, 3000);
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

/* ══════════════════════════════════════
   10. MODAL PHARMACIE
══════════════════════════════════════ */
function openPharmModal(p, isNearest = false, distance = null) {
  document.getElementById('pharmModalTitle').innerHTML = p.nom
    + (isNearest
      ? ` <span style="
          font-family:'DM Sans',sans-serif;
          font-size:.65rem;
          font-weight:700;
          letter-spacing:.08em;
          text-transform:uppercase;
          background:#f59e0b;
          color:#1a1a1a;
          border-radius:6px;
          padding:2px 8px;
          vertical-align:middle;
          margin-left:8px;
        ">⭐ La plus proche</span>`
      : '');

  // Calcul automatique de la distance si l'utilisateur est localisé
const autoDistance = (userLat !== null && p.lat && p.lng)
  ? (() => {
      const d = haversine(userLat, userLng, parseFloat(p.lat), parseFloat(p.lng));
      return d < 1 ? Math.round(d * 1000) + ' m' : d.toFixed(1) + ' km';
    })()
  : (distance || null);

const fields = [
  { label: 'Département', value: p.dept },
  { label: 'Ville',       value: p.ville },
  { label: 'Quartier',    value: p.quartier },
  { label: 'Adresse',     value: p.adresse },
  { label: 'Téléphone',   value: `<a href="tel:${p.tel}">${p.tel}</a>` },
  { label: 'Email',       value: p.email
      ? `<a href="mailto:${p.email}">${p.email}</a>`
      : '<span style="opacity:.4;font-style:italic;">—</span>' },
  ...(autoDistance ? [{ label: 'Distance', value: `<span style="color:#f59e0b;font-weight:700;">${autoDistance}</span>` }] : []),
];

  document.getElementById('pharmModalBody').innerHTML = fields.map((f, i) => `
    ${i > 0 ? '<div class="pharm-divider"></div>' : ''}
    <div class="pharm-row">
      <span class="pharm-label">${f.label}</span>
      <span class="pharm-value">${f.value}</span>
    </div>
  `).join('') + `
    <div class="pharm-divider"></div>
    <button id="btnItinerary" onclick="startItinerary(${p.lat}, ${p.lng})" style="
      margin-top:4px;
      width:100%;
      padding:11px;
      background:var(--gold);
      color:var(--forest);
      border:none;
      border-radius:10px;
      font-family:'DM Sans',sans-serif;
      font-size:.85rem;
      font-weight:700;
      letter-spacing:.04em;
      cursor:pointer;
      display:flex;
      align-items:center;
      justify-content:center;
      gap:8px;
      transition:background .15s, transform .1s;
    ">🧭 Itinéraire</button>
  `;

  const overlay = document.getElementById('pharmOverlay');
  overlay.classList.add('open');
  overlay.onclick = e => { if (e.target === overlay) closePharmModal(); };
  document.addEventListener('keydown', onPharmKey);
}

function closePharmModal() {
  document.getElementById('pharmOverlay').classList.remove('open');
  document.removeEventListener('keydown', onPharmKey);
}

function onPharmKey(e) {
  if (e.key === 'Escape') closePharmModal();
}

function startItinerary(destLat, destLng) {
  const btn = document.getElementById('btnItinerary');
  btn.textContent = '⏳ Localisation…';
  btn.disabled = true;

  if (!navigator.geolocation) {
    btn.textContent = '❌ Non supporté';
    setTimeout(() => { btn.innerHTML = '🧭 Itinéraire'; btn.disabled = false; }, 2500);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      const url = `https://www.google.com/maps/dir/?api=1`
        + `&origin=${pos.coords.latitude},${pos.coords.longitude}`
        + `&destination=${destLat},${destLng}`
        + `&travelmode=driving`;
      window.open(url, '_blank');
      btn.innerHTML = '🧭 Itinéraire';
      btn.disabled = false;
    },
    err => {
      const msgs = { 1: '❌ Permission refusée', 2: '❌ Position indisponible', 3: '❌ Délai dépassé' };
      btn.textContent = msgs[err.code] || '❌ Erreur';
      setTimeout(() => { btn.innerHTML = '🧭 Itinéraire'; btn.disabled = false; }, 3000);
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

/* ══════════════════════════════════════
   11. RECHERCHE PHARMACIE (SIDEBAR)
══════════════════════════════════════ */
function highlightMatch(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    text.slice(0, idx) +
    '<mark>' + text.slice(idx, idx + query.length) + '</mark>' +
    text.slice(idx + query.length)
  );
}

function clearSearch() {
  const input = document.getElementById('pharmSearch');
  const sugBox = document.getElementById('searchSuggestions');
  const clearBtn = document.getElementById('searchClear');
  input.value = '';
  sugBox.classList.remove('open');
  clearBtn.classList.remove('visible');
  input.focus();
}

function initSearch() {
  const input    = document.getElementById('pharmSearch');
  const sugBox   = document.getElementById('searchSuggestions');
  const clearBtn = document.getElementById('searchClear');
  const box      = document.getElementById('searchBox');

  let activeIdx = -1;

  function getItems() {
    return Array.from(sugBox.querySelectorAll('.ssug-item'));
  }

  function setActive(idx) {
    const items = getItems();
    items.forEach((el, i) => el.classList.toggle('active', i === idx));
    activeIdx = idx;
  }

  function renderSuggestions(q) {
    sugBox.innerHTML = '';
    activeIdx = -1;

    if (!q || q.length < 1) {
      sugBox.classList.remove('open');
      clearBtn.classList.remove('visible');
      return;
    }

    clearBtn.classList.add('visible');

    const results = window.PHARMA_DB.filter(p =>
      p.nom.toLowerCase().includes(q.toLowerCase()) ||
      p.ville.toLowerCase().includes(q.toLowerCase()) ||
      p.quartier.toLowerCase().includes(q.toLowerCase()) ||
      p.dept.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 10);

    if (!results.length) {
      sugBox.innerHTML = `<div class="ssug-empty">Aucune pharmacie trouvée</div>`;
      sugBox.classList.add('open');
      return;
    }

    results.forEach((p, i) => {
      const item = document.createElement('div');
      item.className = 'ssug-item';
      item.setAttribute('role', 'option');
      item.dataset.idx = i;

      // Sous-titre : ville + quartier ou dept
      const sub = [p.ville, p.quartier].filter(Boolean).join(', ') || p.dept;

      item.innerHTML = `
        <div class="ssug-left">
          <span class="ssug-cross">✚</span>
          <span class="ssug-nom">${highlightMatch(p.nom, q)}</span>
        </div>
        <span class="ssug-meta">${highlightMatch(sub, q)}</span>
      `;

      item.addEventListener('mousedown', e => {
        e.preventDefault(); // empêche le blur sur l'input
        input.value = p.nom;
        sugBox.classList.remove('open');
        clearBtn.classList.add('visible');

        // Mémorise la pharmacie pour le marqueur vert
        selectedPharmacy = p;

        // 1. Ouvre la carte du département (en arrière-plan)
        doSelect(p.dept);

        // 2. Attend que la carte et les marqueurs soient prêts, puis ouvre les infos
        setTimeout(() => {
          // Recentre la carte sur la pharmacie si coordonnées disponibles
          if (leafletMap && p.lat && p.lng) {
            const lat = parseFloat(p.lat);
            const lng = parseFloat(p.lng);
            if (!isNaN(lat) && !isNaN(lng)) {
              leafletMap.setView([lat, lng], Math.max(leafletMap.getZoom(), 14), { animate: true });
            }
          }
          openPharmModal(p);
        }, 520);
      });

      item.addEventListener('mousemove', () => setActive(i));
      sugBox.appendChild(item);
    });

    sugBox.classList.add('open');
  }

  input.addEventListener('input', () => {
    renderSuggestions(input.value.trim());
  });

  input.addEventListener('keydown', e => {
    const items = getItems();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(Math.min(activeIdx + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(Math.max(activeIdx - 1, 0));
    } else if (e.key === 'Enter') {
      if (activeIdx >= 0 && items[activeIdx]) {
        items[activeIdx].dispatchEvent(new MouseEvent('mousedown'));
      }
    } else if (e.key === 'Escape') {
      clearSearch();
    }
  });

  input.addEventListener('focus', () => {
    if (input.value.trim().length >= 1) sugBox.classList.add('open');
  });

  input.addEventListener('blur', () => {
    setTimeout(() => sugBox.classList.remove('open'), 150);
  });

  document.addEventListener('click', e => {
    if (!box.contains(e.target)) sugBox.classList.remove('open');
  });
}

/* ══════════════════════════════════════
   12. INIT ASYNC
══════════════════════════════════════ */
function loadPharmaCounts() {
  const pharmacies = getAllPharmacies();
  DEPS.forEach(dep => {
    dep.v = pharmacies.filter(p => p.dept === dep.id).length;
  });
}

async function initApp() {
  try {
    const url = new URL(
      'https://sheets.googleapis.com/v4/spreadsheets/' +
      encodeURIComponent(SHEETS_CONFIG.spreadsheetId) +
      '/values/' + encodeURIComponent(SHEETS_CONFIG.range)
    );
    url.searchParams.set('key', SHEETS_CONFIG.apiKey);
    url.searchParams.set('valueRenderOption', 'UNFORMATTED_VALUE');
    url.searchParams.set('majorDimension', 'ROWS');

    const res  = await fetch(url.toString());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const rows = (data.values || []).slice(1); // ignore header

    window.PHARMA_DB = rows
      .map((row, i) => rowToPharmacy(row, i + 2))
      .filter(Boolean);

  } catch(e) {
    window.PHARMA_DB = [];
    console.warn('Google Sheets non chargé :', e);
  }
  loadPharmaCounts();
  buildPanel();
  drawBubbles();
  initSearch();
}

initApp();