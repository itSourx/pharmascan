import { ref, computed } from 'vue'

// ══════════════════════════════════════
// CONFIG GOOGLE SHEETS
// ════════════════════════════════════════
const SHEETS_CONFIG = {
  spreadsheetId: '1rwnYeP8F_Nopmj-x7VNzAyDFVN806ZrSpan54Pjvk4k',
  apiKey: 'AIzaSyDgnmI6_rie3WANTkQ5O1mM2XyhabOVYEk',
  range: 'Pharmacies!A:K',
}

const COL = {
  nom: 1, adresse: 2, email: 3, dept: 4,
  ville: 5, quartier: 6, tel: 7, lat: 8, lng: 9,
}

const DEPT_MAP = {
  'Alibori': 'Alibori',
  'Atakora': 'Atacora',
  'Atlantique': 'Atlantique',
  'Borgou': 'Borgou',
  'Collines': 'Collines',
  'Donga': 'Donga',
  "Département de l'Ouémé": 'Ouémé',
  'Kouffo': 'Couffo',
  'Littoral': 'Littoral',
  'Mono': 'Mono',
  'Plateau': 'Plateau',
  'Zou': 'Zou',
}

export const ORDER = ["Alibori", "Atacora", "Borgou", "Donga", "Collines", "Zou", "Plateau", "Couffo", "Atlantique", "Ouémé", "Mono", "Littoral"]

export const CEN = {
  "Alibori": [248, 108],
  "Atacora": [126, 168],
  "Borgou": [237, 253],
  "Donga": [146, 295],
  "Collines": [186, 410],
  "Plateau": [224, 462],
  "Zou": [176, 491],
  "Couffo": [147, 512],
  "Atlantique": [188, 555],
  "Ouémé": [224, 562],
  "Mono": [151, 545],
  "Littoral": [208, 580]
}

export const DOTC = ["#CDC4AE", "#9BA6A8", "#92B18F", "#D16664", "#E67CA2", "#F9E083", "#AA785D", "#B7907B", "#9FC68E", "#A180AA", "#DDC467", "#F6B8C5"]

export const DEP_GEO = {
  "Alibori": [11.37, 2.95, 9],
  "Atacora": [10.35, 1.55, 9],
  "Borgou": [9.80, 2.75, 9],
  "Donga": [9.70, 1.75, 9],
  "Collines": [8.25, 2.30, 10],
  "Zou": [7.20, 2.15, 10],
  "Plateau": [7.10, 2.65, 10],
  "Couffo": [7.00, 1.80, 11],
  "Atlantique": [6.60, 2.30, 11],
  "Ouémé": [6.55, 2.60, 11],
  "Mono": [6.90, 1.62, 11],
  "Littoral": [6.37, 2.42, 13],
}

export const DEP_BOUNDS = {
  "Alibori": [[10.45, 2.00], [12.40, 3.80]],
  "Atacora": [[9.50, 0.80], [11.10, 2.10]],
  "Borgou": [[8.50, 2.00], [11.00, 3.80]],
  "Donga": [[8.80, 1.20], [10.20, 2.20]],
  "Collines": [[7.50, 1.80], [9.00, 2.80]],
  "Zou": [[6.90, 1.80], [8.00, 2.70]],
  "Plateau": [[6.80, 2.30], [7.70, 3.00]],
  "Couffo": [[6.70, 1.50], [7.50, 2.00]],
  "Atlantique": [[6.30, 2.00], [6.75, 2.60]],
  "Ouémé": [[6.30, 2.40], [6.80, 2.80]],
  "Mono": [[6.60, 1.45], [7.10, 1.90]],
  "Littoral": [[6.33, 2.34], [6.39, 2.49]],
}

function rowToPharmacy(row, sheetRow) {
  const get = (i) => String(row[i] != null ? row[i] : '').trim()
  const nom = get(COL.nom)
  if (!nom) return null
  const deptRaw = get(COL.dept)
  return {
    nom,
    dept: DEPT_MAP[deptRaw] || deptRaw,
    ville: get(COL.ville),
    quartier: get(COL.quartier),
    adresse: get(COL.adresse),
    tel: get(COL.tel),
    email: get(COL.email),
    lat: get(COL.lat).replace(',', '.'),
    lng: get(COL.lng).replace(',', '.'),
    _sheetRow: sheetRow,
  }
}

// ══════════════════════════════════════
// COMPOSABLE
// ════════════════════════════════════════
export function usePharmacy() {
  const pharmaDB = ref([])
  const userLat = ref(null)
  const userLng = ref(null)
  const selectedDept = ref(null)
  const selectedPharmacy = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  const deps = computed(() => {
    return ORDER.map(id => ({
      id,
      v: pharmaDB.value.filter(p => p.dept === id).length
    }))
  })

  const totalPharmacies = computed(() => pharmaDB.value.length)

  const maxPharmacies = computed(() => {
    return Math.max(...deps.value.map(d => d.v), 0)
  })

  function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2
      + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
      * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  function getNearestPharmacy(pharmacies) {
    if (userLat.value === null || !pharmacies.length) return null
    return pharmacies.reduce((nearest, p) => {
      const d = haversine(userLat.value, userLng.value, parseFloat(p.lat), parseFloat(p.lng))
      return d < nearest.d ? { p, d } : nearest
    }, { p: null, d: Infinity }).p
  }

  function getDepFromCoords(lat, lng) {
    return ORDER.find(id => {
      const b = DEP_BOUNDS[id]
      return lat >= b[0][0] && lat <= b[1][0]
        && lng >= b[0][1] && lng <= b[1][1]
    }) || null
  }

  function locateUser() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Géolocalisation non supportée'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        pos => {
          userLat.value = pos.coords.latitude
          userLng.value = pos.coords.longitude
          resolve({ lat: userLat.value, lng: userLng.value })
        },
        err => {
          const msgs = { 1: 'Permission refusée', 2: 'Position indisponible', 3: 'Délai dépassé' }
          reject(new Error(msgs[err.code] || 'Erreur de localisation'))
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    })
  }

  async function loadPharmacies() {
    isLoading.value = true
    error.value = null

    try {
      const url = new URL(
        'https://sheets.googleapis.com/v4/spreadsheets/' +
        encodeURIComponent(SHEETS_CONFIG.spreadsheetId) +
        '/values/' + encodeURIComponent(SHEETS_CONFIG.range)
      )
      url.searchParams.set('key', SHEETS_CONFIG.apiKey)
      url.searchParams.set('valueRenderOption', 'UNFORMATTED_VALUE')
      url.searchParams.set('majorDimension', 'ROWS')

      const res = await fetch(url.toString())
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const data = await res.json()
      const rows = (data.values || []).slice(1) // ignore header

      pharmaDB.value = rows
        .map((row, i) => rowToPharmacy(row, i + 2))
        .filter(Boolean)
    } catch (e) {
      console.warn('Google Sheets non chargé :', e)
      pharmaDB.value = []
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  function getPharmaciesByDept(deptId) {
    return pharmaDB.value.filter(p =>
      p.dept === deptId &&
      p.lat && p.lng &&
      !isNaN(parseFloat(p.lat)) && !isNaN(parseFloat(p.lng))
    )
  }

  function searchPharmacies(query) {
    if (!query || query.length < 1) return []
    return pharmaDB.value.filter(p =>
      p.nom.toLowerCase().includes(query.toLowerCase()) ||
      p.ville.toLowerCase().includes(query.toLowerCase()) ||
      p.quartier.toLowerCase().includes(query.toLowerCase()) ||
      p.dept.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10)
  }

  function highlightMatch(text, query) {
    if (!query) return text
    const idx = text.toLowerCase().indexOf(query.toLowerCase())
    if (idx === -1) return text
    return (
      text.slice(0, idx) +
      '<mark>' + text.slice(idx, idx + query.length) + '</mark>' +
      text.slice(idx + query.length)
    )
  }

  return {
    // State
    pharmaDB,
    userLat,
    userLng,
    selectedDept,
    selectedPharmacy,
    isLoading,
    error,

    // Computed
    deps,
    totalPharmacies,
    maxPharmacies,

    // Methods
    haversine,
    getNearestPharmacy,
    getDepFromCoords,
    locateUser,
    loadPharmacies,
    getPharmaciesByDept,
    searchPharmacies,
    highlightMatch
  }
}
