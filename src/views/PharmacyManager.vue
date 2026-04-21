<template>
  <div class="pm-root">

    <!-- ░░ HEADER ░░ -->
    <header class="pm-header">
      <div class="pm-header-inner">
        <div class="pm-logo">
          <img src="/assets/Component 1.png" alt="PharmaScan" />
        </div>
        <div class="pm-nav-btns">
          <router-link to="/" class="pm-nav-btn">
            <svg viewBox="0 0 20 20" fill="none" class="w-4 h-4"><path d="M3 8l7-5 7 5v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 22V12h2v10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Carte
          </router-link>
          <button class="pm-nav-btn" @click="$router.push('/utilisateurs')">
            <svg viewBox="0 0 20 20" fill="none" class="w-4 h-4"><path d="M10 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 18a6 6 0 0112 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Utilisateurs
          </button>
        </div>
        <div class="pm-clock">
          <span class="pm-clock-date">{{ clockDate }}</span>
          <span class="pm-clock-time">{{ clockTime }}</span>
        </div>
      </div>
    </header>

    <!-- ░░ HERO STRIP ░░ -->
    <div class="pm-hero">
      <div class="pm-hero-grid">
        <div>
          <h1 class="pm-hero-title">Répertoire National   <em>des Pharmacies</em></h1>
          <p class="pm-hero-sub">Gérez et consultez la liste complète des pharmacies enregistrées</p>
        </div>
        <div class="pm-hero-stat">
          <div class="pm-stat-ring">
            <span class="pm-stat-num">{{ totalPharmacies }}</span>
            <span class="pm-stat-lbl">pharmacies</span>
          </div>
        </div>
      </div>
      <div class="pm-hero-noise"></div>
    </div>

    <!-- ░░ TOOLBAR ░░ -->
    <div class="pm-toolbar">
      <div class="pm-search-wrap">
        <svg class="pm-search-ico" viewBox="0 0 20 20" fill="none">
          <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" stroke-width="1.6"/>
          <path d="M13 13L17 17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
        <input
          type="text"
          class="pm-search"
          v-model="searchQuery"
          placeholder="Rechercher par nom, ville, quartier…"
          @input="handleSearch"
        />
        <button v-if="searchQuery" class="pm-search-clear" @click="searchQuery='';handleSearch()">✕</button>
      </div>

      <div class="pm-actions">
        <button class="pm-btn-ghost" @click="triggerImport">
          <svg viewBox="0 0 16 16" fill="none" class="w-4 h-4">
            <path d="M8 1v9M5 7l3 3 3-3M2 12v1a1 1 0 001 1h10a1 1 0 001-1v-1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Importer CSV / Excel
        </button>
        <button class="pm-btn-primary" @click="openModal()">
          <span class="pm-btn-plus">＋</span>
          Ajouter une pharmacie
        </button>
      </div>

      <input type="file" ref="importFileInput" accept=".csv,.xlsx,.xls" style="display:none" @change="handleFileImport" />
    </div>

    <!-- ░░ COUNT BAR ░░ -->
    <div class="pm-countbar">
      <div class="pm-count-badge">
        <span class="pm-count-dot"></span>
        {{ filteredPharmacies.length }} pharmacie{{ filteredPharmacies.length > 1 ? 's' : '' }}
        <template v-if="searchQuery"> trouvée{{ filteredPharmacies.length > 1 ? 's' : '' }}</template>
      </div>
      <div class="pm-count-pages" v-if="totalPages > 1">Page {{ currentPage }} / {{ totalPages }}</div>
    </div>

    <!-- ░░ TABLE ░░ -->
    <div class="pm-table-wrap">
      <div class="pm-table-scroll">
        <table class="pm-table">
          <thead>
            <tr>
              <th class="pm-th-num">N°</th>
              <th>Nom</th>
              <th>Département</th>
              <th>Ville</th>
              <th>Quartier</th>
              <th>Adresse</th>
              <th>Téléphone</th>
              <th>Email</th>
              <th class="text-center">Lat.</th>
              <th class="text-center">Lng.</th>
              <th class="pm-th-actions"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, i) in paginatedPharmacies" :key="i" class="pm-row">
              <td class="pm-td-num">{{ (currentPage - 1) * pageSize + i + 1 }}</td>
              <td class="pm-td-nom">
                <div class="pm-nom-wrap">
                  <span class="pm-cross">✚</span>
                  {{ p.nom }}
                </div>
              </td>
              <td><span class="pm-dept-badge">{{ p.dept }}</span></td>
              <td>{{ p.ville }}</td>
              <td class="pm-td-muted">{{ p.quartier }}</td>
              <td class="pm-td-muted pm-td-addr">{{ p.adresse }}</td>
              <td>
                <a v-if="p.tel" :href="'tel:'+p.tel" class="pm-link-tel">{{ p.tel }}</a>
                <span v-else class="pm-td-empty">—</span>
              </td>
              <td class="pm-td-muted pm-td-email">
                <span v-if="p.email">{{ p.email }}</span>
                <span v-else class="pm-td-empty">—</span>
              </td>
              <td class="pm-td-coord">{{ p.lat || '—' }}</td>
              <td class="pm-td-coord">{{ p.lng || '—' }}</td>
              <td class="pm-td-btns">
                <button class="pm-btn-edit" @click="openModal(p, (currentPage-1)*pageSize + i)" title="Modifier">
                  <svg viewBox="0 0 16 16" fill="none"><path d="M11 2l3 3-8 8H3v-3l8-8z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>
                </button>
                <!--<button class="pm-btn-del" @click="deletePharmacy((currentPage-1)*pageSize + i)" title="Supprimer">
                  <svg viewBox="0 0 16 16" fill="none"><path d="M3 5h10M6 5V3h4v2M7 8v4M9 8v4M4 5l1 8h6l1-8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- EMPTY STATE -->
      <div v-if="filteredPharmacies.length === 0" class="pm-empty">
        <div class="pm-empty-icon">
          <svg viewBox="0 0 64 64" fill="none"><rect x="8" y="12" width="48" height="40" rx="6" stroke="currentColor" stroke-width="2"/><path d="M32 24v16M24 32h16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
        </div>
        <div class="pm-empty-title">Aucune pharmacie enregistrée</div>
        <div class="pm-empty-sub">Cliquez sur « Ajouter une pharmacie » pour commencer, ou modifiez votre recherche.</div>
        <button class="pm-btn-primary pm-empty-cta" @click="openModal()">
          <span class="pm-btn-plus">＋</span> Ajouter une pharmacie
        </button>
      </div>

      <!-- PAGINATION -->
<div v-if="totalPages > 1" class="pm-pagination">
  <button class="pm-page-btn" :disabled="currentPage===1" @click="currentPage--">
    <svg viewBox="0 0 16 16" fill="none" class="w-4 h-4"><path d="M10 4l-4 4 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </button>

  <template v-for="page in paginationRange" :key="page">
    <span v-if="page === '...'" class="pm-page-dots">…</span>
    <button
      v-else
      class="pm-page-btn"
      :class="{ active: currentPage === page }"
      @click="currentPage = page"
    >{{ page }}</button>
  </template>

  <button class="pm-page-btn" :disabled="currentPage===totalPages" @click="currentPage++">
    <svg viewBox="0 0 16 16" fill="none" class="w-4 h-4"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </button>
</div>
    </div>

    <!-- ░░ MODAL ADD / EDIT ░░ -->
    <Transition name="pm-overlay">
      <div class="pm-overlay" v-if="showModal" @click.self="closeModal">
        <div class="pm-modal">
          <div class="pm-modal-head">
            <div>
              <div class="pm-modal-eyebrow">{{ editIndex >= 0 ? 'Modification' : 'Nouvelle entrée' }}</div>
              <div class="pm-modal-title">{{ editIndex >= 0 ? 'Modifier la Pharmacie' : 'Ajouter une Pharmacie' }}</div>
            </div>
            <button class="pm-modal-close" @click="closeModal">✕</button>
          </div>

          <div class="pm-modal-body">
            <div class="pm-field full">
              <label for="f-nom">Nom de la pharmacie <span class="req">*</span></label>
              <input type="text" id="f-nom" v-model="form.nom" placeholder="Ex : Pharmacie du Bénin" />
            </div>
            <div class="pm-field">
              <label for="f-dept">Département <span class="req">*</span></label>
              <select id="f-dept" v-model="form.dept">
                <option value="">— Sélectionner —</option>
                <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
              </select>
            </div>
            <div class="pm-field">
              <label for="f-ville">Ville <span class="req">*</span></label>
              <input type="text" id="f-ville" v-model="form.ville" placeholder="Ex : Cotonou" />
            </div>
            <div class="pm-field">
              <label for="f-quartier">Quartier <span class="req">*</span></label>
              <input type="text" id="f-quartier" v-model="form.quartier" placeholder="Ex : Cadjehoun" />
            </div>
            <div class="pm-field">
              <label for="f-tel">Téléphone <span class="req">*</span></label>
              <input type="tel" id="f-tel" v-model="form.tel" placeholder="Ex : +229 21 30 00 00" />
            </div>
            <div class="pm-field">
              <label for="f-email">Email <span class="opt">(optionnel)</span></label>
              <input type="email" id="f-email" v-model="form.email" placeholder="Ex : contact@pharmacie.bj" />
            </div>
            <div class="pm-field">
              <label for="f-lat">Latitude <span class="opt">(optionnel)</span></label>
              <input type="text" id="f-lat" v-model="form.lat" placeholder="Ex : 6.3654" inputmode="decimal" />
            </div>
            <div class="pm-field">
              <label for="f-lng">Longitude <span class="opt">(optionnel)</span></label>
              <input type="text" id="f-lng" v-model="form.lng" placeholder="Ex : 2.4183" inputmode="decimal" />
            </div>
            <div class="pm-field full">
              <label for="f-adresse">Adresse complète <span class="req">*</span></label>
              <input type="text" id="f-adresse" v-model="form.adresse" placeholder="Ex : Rue des Palmiers, lot 12" />
            </div>
          </div>

          <div class="pm-modal-foot">
            <button class="pm-btn-ghost" @click="closeModal">Annuler</button>
            <button class="pm-btn-primary" @click="submitForm">
              <svg viewBox="0 0 16 16" fill="none" class="w-4 h-4"><path d="M3 8l4 4 6-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
              {{ editIndex >= 0 ? 'Mettre à jour' : 'Enregistrer' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ░░ MODAL IMPORT PREVIEW ░░ -->
    <Transition name="pm-overlay">
      <div class="pm-overlay" v-if="showImportModal" @click.self="closeImportModal">
        <div class="pm-modal pm-modal-import">
          <div class="pm-modal-head">
            <div>
              <div class="pm-modal-eyebrow">Importation</div>
              <div class="pm-modal-title">Aperçu des données</div>
            </div>
            <button class="pm-modal-close" @click="closeImportModal">✕</button>
          </div>

          <div class="pm-modal-body">
            <div class="pm-import-stats">
              <span class="pm-count-dot"></span>
              {{ pendingImportData.length }} ligne{{ pendingImportData.length > 1 ? 's' : '' }} détectée{{ pendingImportData.length > 1 ? 's' : '' }}
            </div>
            <div class="pm-import-scroll">
              <table class="pm-table pm-table-sm">
                <thead>
                  <tr>
                    <th>Nom</th><th>Département</th><th>Ville</th><th>Quartier</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, i) in pendingImportData.slice(0, 10)" :key="i" class="pm-row">
                    <td class="pm-td-nom"><div class="pm-nom-wrap"><span class="pm-cross">✚</span>{{ row.nom }}</div></td>
                    <td><span class="pm-dept-badge">{{ row.dept }}</span></td>
                    <td>{{ row.ville }}</td>
                    <td class="pm-td-muted">{{ row.quartier }}</td>
                  </tr>
                </tbody>
              </table>
              <div v-if="pendingImportData.length > 10" class="pm-import-more">
                … et {{ pendingImportData.length - 10 }} ligne{{ pendingImportData.length - 10 > 1 ? 's' : '' }} supplémentaire{{ pendingImportData.length - 10 > 1 ? 's' : '' }}
              </div>
            </div>
          </div>

          <div class="pm-modal-foot">
            <button class="pm-btn-ghost" @click="closeImportModal">Annuler</button>
            <button class="pm-btn-primary" @click="confirmImport">
              <svg viewBox="0 0 16 16" fill="none" class="w-4 h-4"><path d="M8 1v9M5 7l3 3 3-3M2 12v1a1 1 0 001 1h10a1 1 0 001-1v-1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              Confirmer l'import
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ░░ TOAST ░░ -->
    <Transition name="pm-toast">
      <div class="pm-toast" v-if="showToast">
        <span class="pm-toast-ico">✓</span>
        {{ toastMsg }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as XLSX from 'xlsx'

const SHEETS_CONFIG = {
  spreadsheetId: '1rwnYeP8F_Nopmj-x7VNzAyDFVN806ZrSpan54Pjvk4k',
  apiKey: 'AIzaSyDgnmI6_rie3WANTkQ5O1mM2XyhabOVYEk',
  range: 'Pharmacies!A:K',
  appsScriptUrl: 'https://script.google.com/macros/s/AKfycby_GxYL6togQwEven1CUu5PW_KPmeJ9N4P3bHdZyWueLOpdO9aTULnxwu_B0jqTPyhRMw/exec',
}

const COL = { nom:1, adresse:2, email:3, dept:4, ville:5, quartier:6, tel:7, lat:8, lng:9 }

const departments = [
  'Alibori','Atacora','Atlantique','Borgou','Collines',
  'Couffo','Donga','Littoral','Mono','Ouémé','Plateau','Zou'
]

const pharmacies         = ref([])
const searchQuery        = ref('')
const currentPage        = ref(1)
const pageSize           = 20
const showModal          = ref(false)
const showImportModal    = ref(false)
const editIndex          = ref(-1)
const pendingImportData  = ref([])
const showToast          = ref(false)
const toastMsg           = ref('')
const importFileInput    = ref(null)
const clockDate          = ref('')
const clockTime          = ref('')
let clockInterval

const form = ref({ nom:'', dept:'', ville:'', quartier:'', tel:'', email:'', lat:'', lng:'', adresse:'' })

const totalPharmacies = computed(() => pharmacies.value.length)

const filteredPharmacies = computed(() => {
  if (!searchQuery.value) return pharmacies.value
  const q = searchQuery.value.toLowerCase()
  return pharmacies.value.filter(p =>
    p.nom?.toLowerCase().includes(q) ||
    p.ville?.toLowerCase().includes(q) ||
    p.quartier?.toLowerCase().includes(q) ||
    p.dept?.toLowerCase().includes(q)
  )
})

const totalPages       = computed(() => Math.ceil(filteredPharmacies.value.length / pageSize))
const paginatedPharmacies = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredPharmacies.value.slice(start, start + pageSize)
})

const paginationRange = computed(() => {
  const total   = totalPages.value
  const current = currentPage.value
  const delta   = 1          // pages de chaque côté de la page active
  const range   = []

  // Toujours afficher : 1ère, dernière, courante ± delta
  const show = new Set([
    1, total,
    ...Array.from({ length: delta * 2 + 1 }, (_, i) => current - delta + i)
      .filter(p => p >= 1 && p <= total)
  ])

  let prev = 0
  for (const page of [...show].sort((a, b) => a - b)) {
    if (page - prev > 1) range.push('...')
    range.push(page)
    prev = page
  }
  return range
})

function updateClock() {
  const now = new Date()
  const days   = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi']
  const months = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']
  clockDate.value = `${days[now.getDay()]} ${String(now.getDate()).padStart(2,'0')} ${months[now.getMonth()]} ${now.getFullYear()}`
  clockTime.value = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`
}

function handleSearch() { currentPage.value = 1 }

function openModal(pharmacy = null, index = -1) {
  editIndex.value = index
  form.value = pharmacy ? { ...pharmacy } : { nom:'', dept:'', ville:'', quartier:'', tel:'', email:'', lat:'', lng:'', adresse:'' }
  showModal.value = true
}

function closeModal() { showModal.value = false; editIndex.value = -1 }

function submitForm() {
  if (!form.value.nom || !form.value.dept || !form.value.ville || !form.value.quartier || !form.value.tel || !form.value.adresse) {
    alert('Veuillez remplir tous les champs obligatoires')
    return
  }
  if (editIndex.value >= 0) {
    pharmacies.value[editIndex.value] = { ...form.value }
    showToastMsg('Pharmacie mise à jour avec succès !')
  } else {
    pharmacies.value.push({ ...form.value })
    showToastMsg('Pharmacie ajoutée avec succès !')
  }
  closeModal()
}

function deletePharmacy(index) {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette pharmacie ?')) {
    pharmacies.value.splice(index, 1)
    showToastMsg('Pharmacie supprimée avec succès !')
    if (paginatedPharmacies.value.length === 0 && currentPage.value > 1) currentPage.value--
  }
}

function triggerImport() { importFileInput.value?.click() }

function handleFileImport(event) {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = e => {
    const data = new Uint8Array(e.target.result)
    const wb   = XLSX.read(data, { type:'array' })
    const ws   = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(ws, { header:1 })
    pendingImportData.value = rows.slice(1).map(row => ({
      nom:row[0]||'', dept:row[1]||'', ville:row[2]||'', quartier:row[3]||'',
      adresse:row[4]||'', tel:row[5]||'', email:row[6]||'', lat:row[7]||'', lng:row[8]||''
    })).filter(p => p.nom)
    if (pendingImportData.value.length > 0) showImportModal.value = true
  }
  reader.readAsArrayBuffer(file)
  event.target.value = ''
}

function closeImportModal() { showImportModal.value = false; pendingImportData.value = [] }

function confirmImport() {
  pharmacies.value.push(...pendingImportData.value)
  showToastMsg(`${pendingImportData.value.length} pharmacies importées avec succès !`)
  closeImportModal()
}

function showToastMsg(msg) {
  toastMsg.value = msg
  showToast.value = true
  setTimeout(() => showToast.value = false, 3200)
}

async function loadPharmacies() {
  try {
    const url = new URL(
      'https://sheets.googleapis.com/v4/spreadsheets/' +
      encodeURIComponent(SHEETS_CONFIG.spreadsheetId) +
      '/values/' + encodeURIComponent(SHEETS_CONFIG.range)
    )
    url.searchParams.set('key', SHEETS_CONFIG.apiKey)
    const res  = await fetch(url.toString())
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const data = await res.json()
    pharmacies.value = (data.values||[]).slice(1).map(row => ({
      nom:row[COL.nom]||'', dept:row[COL.dept]||'', ville:row[COL.ville]||'',
      quartier:row[COL.quartier]||'', adresse:row[COL.adresse]||'',
      tel:row[COL.tel]||'', email:row[COL.email]||'', lat:row[COL.lat]||'', lng:row[COL.lng]||''
    })).filter(p => p.nom)
  } catch(e) { console.warn('Google Sheets non chargé :', e) }
}

onMounted(() => { updateClock(); clockInterval = setInterval(updateClock, 1000); loadPharmacies() })
onUnmounted(() => clearInterval(clockInterval))
</script>

<style scoped>
/* ── Variables ── */
.pm-root {
  --green: #00C896;
  --green-dim: rgba(0,200,150,.12);
  --green-border: rgba(0,200,150,.25);
  --dark: #061c10;
  --dark2: #0b2e1a;
  --dark3: #0d3820;
  --text: #1a3326;
  --muted: #6b8a78;
  --border: #d0e4d8;
  --bg: #f0f6f2;
  --white: #fff;
  --radius: 12px;
  --shadow: 0 2px 12px rgba(0,0,0,.07);
  --font-head: 'Fraunces', Georgia, serif;
  --font-body: 'DM Sans', system-ui, sans-serif;
  min-height: 100vh;
  background: var(--bg);
  font-family: var(--font-body);
}

/* ── HEADER ── */
.pm-header {
  background: linear-gradient(175deg, #06141f 0%, #08201a 18%, #063724 100%);
  border-bottom: 1px solid rgba(0,200,150,.15);
  position: sticky;
  top: 0;
  z-index: 100;
}
.pm-header-inner {
  max-width: 1600px;
  margin: 0 auto;
  padding: 14px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.pm-logo img {
  height: 38px;
  object-fit: contain;
}
.pm-nav-btns {
  display: flex;
  gap: 10px;
  align-items: center;
}
.pm-nav-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid rgba(0,200,150,.25);
  background: rgba(0,200,150,.08);
  color: rgba(255,255,255,.85);
  font-size: .82rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all .15s;
}
.pm-nav-btn:hover {
  background: rgba(0,200,150,.15);
  border-color: rgba(0,200,150,.4);
  color: #fff;
}
.pm-nav-btn svg {
  width: 16px;
  height: 16px;
}
.pm-clock {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}
.pm-clock-date {
  font-size: .72rem;
  color: rgba(255,255,255,.38);
  font-family: var(--font-body);
  letter-spacing: .04em;
}
.pm-clock-time {
  font-size: .95rem;
  color: var(--green);
  font-family: 'DM Mono', monospace;
  font-weight: 600;
  letter-spacing: .08em;
}

/* ── HERO ── */
.pm-hero {
  position: relative;
  overflow: hidden;
  background: linear-gradient(160deg, #061e12 0%, #082f1a 40%, #0a3d22 100%);
  padding: 36px 28px 34px;
}
.pm-hero-grid {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  position: relative;
  z-index: 1;
}
.pm-hero-eyebrow {
  font-size: .68rem;
  font-weight: 700;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--green);
  margin-bottom: 10px;
}
.pm-hero-title {
  font-family: var(--font-head);
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.15;
  margin: 0 0 10px;
}
.pm-hero-title em {
  font-style: italic;
  color: var(--green);
}
.pm-hero-sub {
  font-size: .88rem;
  color: rgba(255,255,255,.45);
  max-width: 440px;
}
.pm-hero-noise {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.04'/%3E%3C/svg%3E");
  pointer-events: none;
  opacity: .5;
}
.pm-stat-ring {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  border: 2px solid var(--green-border);
  background: rgba(0,200,150,.06);
  box-shadow: 0 0 40px rgba(0,200,150,.1), inset 0 0 20px rgba(0,200,150,.04);
  flex-shrink: 0;
}
.pm-stat-num {
  font-family: var(--font-head);
  font-size: 1.7rem;
  font-weight: 700;
  color: var(--green);
  line-height: 1;
}
.pm-stat-lbl {
  font-size: .63rem;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: rgba(255,255,255,.35);
  margin-top: 4px;
}

/* ── TOOLBAR ── */
.pm-toolbar {
  max-width: 1600px;
  margin: 0 auto;
  padding: 16px 28px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.pm-search-wrap {
  position: relative;
  flex: 1;
  min-width: 220px;
}
.pm-search-ico {
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  width: 15px;
  height: 15px;
  color: var(--muted);
  pointer-events: none;
  transition: color .15s;
}
.pm-search-wrap:focus-within .pm-search-ico { color: var(--green) }
.pm-search {
  width: 100%;
  padding: 11px 38px 11px 40px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  font-size: .88rem;
  font-family: var(--font-body);
  color: var(--text);
  background: var(--white);
  outline: none;
  transition: border-color .15s, box-shadow .15s;
}
.pm-search:focus {
  border-color: var(--green);
  box-shadow: 0 0 0 3px rgba(0,200,150,.12);
}
.pm-search-clear {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,.06);
  border: none;
  width: 20px; height: 20px;
  border-radius: 50%;
  font-size: .6rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  transition: background .12s;
}
.pm-search-clear:hover { background: rgba(0,0,0,.12) }
.pm-actions { display: flex; gap: 10px; align-items: center }

/* Buttons */
.pm-btn-ghost {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 16px;
  border-radius: var(--radius);
  border: 1.5px solid var(--border);
  background: var(--white);
  color: var(--text);
  font-family: var(--font-body);
  font-size: .85rem;
  font-weight: 500;
  cursor: pointer;
  transition: border-color .15s, box-shadow .15s;
}
.pm-btn-ghost:hover {
  border-color: var(--green);
  box-shadow: 0 0 0 3px rgba(0,200,150,.08);
}
.pm-btn-primary {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 20px;
  border-radius: var(--radius);
  border: none;
  background: var(--green);
  color: #fff;
  font-family: var(--font-body);
  font-size: .85rem;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: .02em;
  transition: filter .15s, box-shadow .15s;
  box-shadow: 0 2px 12px rgba(0,200,150,.3);
}
.pm-btn-primary:hover { filter: brightness(1.08) }
.pm-btn-plus { font-size: 1.1rem; line-height: 1; }

/* ── COUNT BAR ── */
.pm-countbar {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 28px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.pm-count-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 12px;
  background: var(--green-dim);
  color: #00a87c;
  border-radius: 20px;
  font-size: .78rem;
  font-weight: 600;
  letter-spacing: .02em;
}
.pm-count-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--green);
  display: inline-block;
  animation: blink 2s ease-in-out infinite;
}
@keyframes blink {
  0%,100% { opacity:1 } 50% { opacity:.3 }
}
.pm-count-pages {
  font-size: .78rem;
  color: var(--muted);
}

/* ── TABLE ── */
.pm-table-wrap {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 28px 40px;
}
.pm-table-scroll {
  overflow-x: auto;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
}
.pm-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--white);
  font-size: .82rem;
}
.pm-table thead tr {
  background: linear-gradient(90deg, #08261a 0%, #0a3020 100%);
}
.pm-table th {
  padding: 12px 14px;
  text-align: left;
  font-family: var(--font-body);
  font-size: .68rem;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: rgba(255,255,255,.5);
  white-space: nowrap;
  border-bottom: 1px solid rgba(0,200,150,.15);
}
.pm-table th:first-child { border-radius: 12px 0 0 0 }
.pm-table th:last-child  { border-radius: 0 12px 0 0 }
.pm-th-num    { width: 52px }
.pm-th-actions{ width: 72px }
.pm-row { transition: background .1s }
.pm-row:hover { background: #f4fbf7 }
.pm-row:not(:last-child) td { border-bottom: 1px solid var(--border) }
.pm-table td {
  padding: 11px 14px;
  color: var(--text);
  vertical-align: middle;
}
.pm-td-num {
  font-size: .72rem;
  color: var(--muted);
  font-weight: 600;
  text-align: center;
}
.pm-nom-wrap {
  display: flex;
  align-items: center;
  gap: 7px;
  font-weight: 600;
}
.pm-cross {
  color: var(--green);
  font-size: .62rem;
  flex-shrink: 0;
}
.pm-dept-badge {
  display: inline-block;
  padding: 2px 8px;
  background: var(--green-dim);
  color: #008c67;
  border-radius: 6px;
  font-size: .72rem;
  font-weight: 600;
  white-space: nowrap;
}
.pm-td-muted { color: var(--muted) }
.pm-td-addr  { max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap }
.pm-td-email { max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap }
.pm-td-coord {
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: .74rem;
  color: var(--muted);
}
.pm-td-empty { color: #c5d8cd }
.pm-link-tel {
  color: #007a5c;
  text-decoration: none;
  font-weight: 500;
}
.pm-link-tel:hover { text-decoration: underline }
.pm-td-btns { display: flex; gap: 6px; align-items: center }
.pm-btn-edit, .pm-btn-del {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px; height: 30px;
  border-radius: 8px;
  border: 1.5px solid transparent;
  cursor: pointer;
  background: transparent;
  transition: all .13s;
}
.pm-btn-edit svg, .pm-btn-del svg { width: 14px; height: 14px }
.pm-btn-edit { color: #0a7a55; border-color: #c8e8d8 }
.pm-btn-edit:hover { background: var(--green-dim); border-color: var(--green) }
.pm-btn-del  { color: #b54040; border-color: #f0cece }
.pm-btn-del:hover { background: rgba(181,64,64,.08); border-color: #e88 }
.pm-table-sm td, .pm-table-sm th { padding: 9px 12px }

/* ── EMPTY ── */
.pm-empty {
  text-align: center;
  padding: 64px 24px;
  background: var(--white);
}
.pm-empty-icon {
  width: 64px; height: 64px;
  margin: 0 auto 20px;
  color: #b0ccbc;
}
.pm-empty-icon svg { width: 64px; height: 64px }
.pm-empty-title {
  font-family: var(--font-head);
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
}
.pm-empty-sub {
  font-size: .85rem;
  color: var(--muted);
  max-width: 360px;
  margin: 0 auto 24px;
}
.pm-empty-cta { margin: 0 auto }

/* ── PAGINATION ── */
.pm-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin-top: 20px;
  flex-wrap: nowrap;
  overflow: hidden;
  padding: 0 4px;
}
.pm-page-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  border-radius: 9px;
  border: 1.5px solid var(--border);
  background: var(--white);
  color: var(--text);
  font-family: var(--font-body);
  font-size: .82rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .13s;
  flex-shrink: 0;
}
.pm-page-btn:hover:not(:disabled) {
  border-color: var(--green);
  color: #007a5c;
}
.pm-page-btn.active {
  background: var(--green);
  border-color: var(--green);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0,200,150,.3);
}
.pm-page-btn:disabled { opacity: .35; cursor: default }

/* ── OVERLAY ── */
.pm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(6,18,10,.65);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}

/* ── MODAL ── */
.pm-modal {
  background: var(--white);
  border-radius: 18px;
  width: 100%;
  max-width: 680px;
  max-height: 92vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 80px rgba(0,0,0,.25);
}
.pm-modal-import { max-width: 820px }
.pm-modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px 26px 20px;
  background: linear-gradient(135deg, #071e10 0%, #0a3020 100%);
  flex-shrink: 0;
}
.pm-modal-eyebrow {
  font-size: .65rem;
  font-weight: 700;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--green);
  margin-bottom: 5px;
}
.pm-modal-title {
  font-family: var(--font-head);
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
}
.pm-modal-close {
  width: 32px; height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.06);
  color: rgba(255,255,255,.55);
  font-size: .85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .13s;
  flex-shrink: 0;
}
.pm-modal-close:hover { background: rgba(255,255,255,.12); color: #fff }
.pm-modal-body {
  padding: 24px 26px;
  overflow-y: auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.pm-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.pm-field.full { grid-column: 1 / -1 }
.pm-field label {
  font-size: .68rem;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: #4a7060;
}
.req { color: var(--green); font-weight: 800 }
.opt { font-size: .62rem; font-weight: 400; letter-spacing: 0; text-transform: none; color: var(--muted) }
.pm-field input,
.pm-field select {
  padding: 10px 13px;
  border: 1.5px solid var(--border);
  border-radius: 9px;
  font-size: .85rem;
  font-family: var(--font-body);
  color: var(--text);
  background: #fafcfb;
  outline: none;
  transition: border-color .15s, box-shadow .15s;
}
.pm-field input:focus,
.pm-field select:focus {
  border-color: var(--green);
  box-shadow: 0 0 0 3px rgba(0,200,150,.1);
  background: #fff;
}
.pm-modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 26px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

/* Import */
.pm-import-stats {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  font-weight: 600;
  font-size: .85rem;
  color: #007a5c;
}
.pm-import-scroll {
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: 10px;
}
.pm-import-more {
  text-align: center;
  padding: 10px;
  font-size: .78rem;
  color: var(--muted);
  background: #fafcfb;
  border-top: 1px solid var(--border);
}

/* ── TOAST ── */
.pm-toast {
  position: fixed;
  bottom: 28px;
  right: 28px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #071e10 0%, #0a3020 100%);
  border: 1px solid var(--green-border);
  color: rgba(255,255,255,.88);
  padding: 13px 20px;
  border-radius: 12px;
  font-size: .85rem;
  font-weight: 500;
  z-index: 2000;
  box-shadow: 0 8px 30px rgba(0,0,0,.3);
}
.pm-toast-ico {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px; height: 20px;
  border-radius: 50%;
  background: var(--green);
  color: #fff;
  font-size: .65rem;
  font-weight: 800;
  flex-shrink: 0;
}
.pm-page-dots {
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: .85rem;
  color: var(--muted);
  user-select: none;
  pointer-events: none;
  flex-shrink: 0;
}

/* ── Pagination compacte sur mobile ── */
@media (max-width: 480px) {
  .pm-pagination {
    gap: 3px;
    padding: 0 2px;
  }

  .pm-page-btn {
    min-width: 30px;
    height: 30px;
    padding: 0 4px;
    font-size: .75rem;
    border-radius: 7px;
  }

  .pm-page-dots {
    min-width: 20px;
    font-size: .75rem;
  }
}

/* ── TRANSITIONS ── */
.pm-overlay-enter-active,
.pm-overlay-leave-active { transition: opacity .2s ease }
.pm-overlay-enter-from,
.pm-overlay-leave-to   { opacity: 0 }

.pm-toast-enter-active  { transition: all .3s cubic-bezier(.34,1.56,.64,1) }
.pm-toast-leave-active  { transition: all .2s ease }
.pm-toast-enter-from    { transform: translateY(20px); opacity: 0 }
.pm-toast-leave-to      { transform: translateY(10px); opacity: 0 }
</style>