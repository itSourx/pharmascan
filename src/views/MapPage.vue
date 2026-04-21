<template>
  <!-- ░░ HEADER ░░ -->
  <header class="mp-header">
    <div class="mp-header-inner">
      <div class="mp-logo">
        <img src="/assets/Component 1.png" alt="PharmaScan" />
      </div>
      <div class="mp-nav-btns">
        <button class="mp-nav-btn" @click="$router.push('/gestion')">
          <svg viewBox="0 0 20 20" fill="none" class="w-4 h-4"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M6 2v16M14 2v16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          Gestion
        </button>
        <button class="mp-nav-btn" @click="$router.push('/utilisateurs')">
          <svg viewBox="0 0 20 20" fill="none" class="w-4 h-4"><path d="M10 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 18a6 6 0 0112 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Utilisateurs
        </button>
        <div class="mp-profile-wrap">
          <button class="mp-avatar" @click="showProfileMenu = !showProfileMenu">
            <img v-if="profilePhoto" :src="profilePhoto" alt="Profil" />
            <span v-else>👤</span>
          </button>
          <div v-if="showProfileMenu" class="mp-profile-menu">
            <button class="mp-menu-item" @click="$router.push('/profil')">
              <svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="6" r="3" stroke="currentColor" stroke-width="1.4"/><path d="M3 14a5 5 0 0110 0" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
              Profil
            </button>
            <button class="mp-menu-item" @click="logout">
              <svg viewBox="0 0 16 16" fill="none"><path d="M6 12l4-4-4-4M10 8H2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>

  <div class="container">
    <Sidebar
      :deps="deps"
      :total="totalPharmacies"
      :max="maxPharmacies"
      :selected-dept="selectedDept"
      @select-dept="handleSelectDept"
      @search-pharmacy="handleSearchPharmacy"
      @locate-and-open="handleLocateAndOpen"
      @find-nearest="handleFindNearest"
      :pharma-db="pharmaDB"
    />
    
    <MapView
      :deps="deps"
      :selected-dept="selectedDept"
      @select-dept="handleSelectDept"
      @download-map="handleDownloadMap"
      @locate-and-open="handleLocateAndOpen"
      @find-nearest="handleFindNearest"
    />
  </div>

  <DepartmentModal
    v-if="selectedDept && showDeptModal"
    :dept="selectedDept"
    :pharmacies="currentDepPharmacies"
    :user-lat="userLat"
    :user-lng="userLng"
    :selected-pharmacy="selectedPharmacy"
    @close="closeDeptModal"
    @locate-user="handleLocateUser"
    @select-pharmacy="handleSelectPharmacy"
  />

  <PharmacyModal
    v-if="showPharmModal"
    :pharmacy="currentPharmacy"
    :is-nearest="isNearestPharmacy"
    :distance="pharmacyDistance"
    :user-lat="userLat"
    :user-lng="userLng"
    @close="closePharmModal"
  />

  <button class="mob-toggle" @click="toggleSidebar">
    {{ sidebarOpen ? '✕  Fermer' : '☰  Données' }}
  </button>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Sidebar from '../components/Sidebar.vue'
import MapView from '../components/MapView.vue'
import DepartmentModal from '../components/DepartmentModal.vue'
import PharmacyModal from '../components/PharmacyModal.vue'
import { usePharmacy } from '../composables/usePharmacy.js'
import L from 'leaflet'

const {
  pharmaDB,
  userLat,
  userLng,
  selectedDept,
  selectedPharmacy,
  deps,
  totalPharmacies,
  maxPharmacies,
  loadPharmacies,
  locateUser,
  getPharmaciesByDept,
  getNearestPharmacy,
  getDepFromCoords,
  haversine
} = usePharmacy()

const showDeptModal = ref(false)
const showPharmModal = ref(false)
const currentDepPharmacies = ref([])
const currentPharmacy = ref(null)
const isNearestPharmacy = ref(false)
const pharmacyDistance = ref(null)
const sidebarOpen = ref(false)

// Profile
const showProfileMenu = ref(false)
const profilePhoto = ref('') // URL de la photo de profil

function logout() {
  // Logique de déconnexion ici
  console.log('Déconnexion...')
  showProfileMenu.value = false
}

function closeProfileMenu(e) {
  if (!e.target.closest('.mp-profile-wrap')) {
    showProfileMenu.value = false
  }
}

function handleSelectDept(id) {
  selectedDept.value = id
  currentDepPharmacies.value = getPharmaciesByDept(id)
  showDeptModal.value = true
}

function closeDeptModal() {
  showDeptModal.value = false
}

function handleSelectPharmacy(pharmacy, nearest = false, distance = null) {
  currentPharmacy.value = pharmacy
  isNearestPharmacy.value = nearest
  pharmacyDistance.value = distance
  showPharmModal.value = true
}

function closePharmModal() {
  showPharmModal.value = false
}

function handleSearchPharmacy(pharmacy) {
  selectedPharmacy.value = pharmacy
  selectedDept.value = pharmacy.dept 
  currentDepPharmacies.value = getPharmaciesByDept(pharmacy.dept)
  showDeptModal.value = true
  
  setTimeout(() => {
    handleSelectPharmacy(pharmacy)
  }, 520)
}

async function handleLocateUser(leafletMap, userMarker) {
  try {
    await locateUser()
    
    if (userMarker.value) {
      leafletMap.removeLayer(userMarker.value)
      userMarker.value = null
    }
    
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
    })
    
    const marker = L.marker([userLat.value, userLng.value], { icon })
      .addTo(leafletMap)
      .bindPopup('<strong>Vous êtes ici</strong>')
      .openPopup()
    
    leafletMap.setView([userLat.value, userLng.value], leafletMap.getZoom())
    
    return marker
  } catch (err) {
    alert(err.message)
    return null
  }
}

async function handleLocateAndOpen() {
  try {
    await locateUser()
    const depId = getDepFromCoords(userLat.value, userLng.value)
    
    if (!depId) {
      alert('Votre position est en dehors du Bénin.')
      return
    }
    
    handleSelectDept(depId)
  } catch (err) {
    alert(err.message)
  }
}

async function handleFindNearest() {
  try {
    await locateUser()
    
    const withCoords = pharmaDB.value.filter(p =>
      p.lat && p.lng &&
      !isNaN(parseFloat(p.lat)) && !isNaN(parseFloat(p.lng))
    )
    
    if (withCoords.length === 0) {
      alert('Aucune pharmacie avec coordonnées enregistrée.')
      return
    }
    
    const nearest = withCoords.reduce((best, p) => {
      const d = haversine(userLat.value, userLng.value, parseFloat(p.lat), parseFloat(p.lng))
      return d < best.d ? { p, d } : best
    }, { p: null, d: Infinity })
    
    const km = nearest.d < 1
      ? Math.round(nearest.d * 1000) + ' m'
      : nearest.d.toFixed(1) + ' km'
    
    handleSelectDept(nearest.p.dept)
    
    setTimeout(() => {
      handleSelectPharmacy(nearest.p, true, km)
    }, 450)
  } catch (err) {
    alert(err.message)
  }
}

function handleDownloadMap() {
  const btn = document.getElementById('dlBtn')
  if (btn) {
    btn.textContent = '⏳'
    btn.disabled = true
  }
  
  const svgEl = document.getElementById('map')
  const svgClone = svgEl.cloneNode(true)
  
  svgEl.querySelectorAll('.dz').forEach(path => {
    const clone = svgClone.querySelector('#' + path.id)
    if (clone) {
      clone.setAttribute('fill', path.getAttribute('fill'))
      clone.removeAttribute('class')
      const filter = path.style.filter
      if (filter) clone.style.filter = filter
    }
  })
  
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  bg.setAttribute('width', '400')
  bg.setAttribute('height', '601')
  bg.setAttribute('fill', '#faf7f2')
  svgClone.insertBefore(bg, svgClone.firstChild)
  
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style')
  style.textContent = `text{font-family:Arial,sans-serif;}`
  svgClone.insertBefore(style, svgClone.firstChild)
  
  svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  svgClone.setAttribute('width', '800')
  svgClone.setAttribute('height', '1202')
  
  const svgStr = new XMLSerializer().serializeToString(svgClone)
  const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)
  
  const img = new Image()
  img.onload = function () {
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 1202
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#faf7f2'
    ctx.fillRect(0, 0, 800, 1202)
    ctx.drawImage(img, 0, 0)
    URL.revokeObjectURL(url)
    
    canvas.toBlob(blob => {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'benin-carte-clients.png'
      a.click()
      URL.revokeObjectURL(a.href)
      
      if (btn) {
        btn.innerHTML = `<svg viewBox="0 0 16 16"><path d="M8 1v8.5M5 7l3 3 3-3M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`
        btn.disabled = false
      }
    }, 'image/png')
  }
  
  img.onerror = function () {
    if (btn) {
      btn.innerHTML = `<svg viewBox="0 0 16 16"><path d="M8 1v8.5M5 7l3 3 3-3M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`
      btn.disabled = false
    }
  }
  
  img.src = url
}

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
  const sb = document.getElementById('sidebar')
  if (sb) {
    sb.classList.toggle('open', sidebarOpen.value)
  }
}

onMounted(() => {
  loadPharmacies()
  document.addEventListener('click', closeProfileMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeProfileMenu)
})
</script>

<style scoped>
/* ── HEADER ── */
.mp-header {
  background: linear-gradient(175deg, #06141f 0%, #08201a 18%, #063724 100%);
  border-bottom: 1px solid rgba(0,200,150,.15);
  position: sticky;
  top: 0;
  z-index: 100;
}
.mp-header-inner {
  max-width: 1600px;
  margin: 0 auto;
  padding: 14px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.mp-logo img {
  height: 38px;
  object-fit: contain;
}
.mp-nav-btns {
  display: flex;
  gap: 10px;
  align-items: center;
}
.mp-nav-btn {
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
  cursor: pointer;
  transition: all .15s;
}
.mp-nav-btn:hover {
  background: rgba(0,200,150,.15);
  border-color: rgba(0,200,150,.4);
  color: #fff;
}
.mp-nav-btn svg {
  width: 16px;
  height: 16px;
}

/* ── PROFILE DROPDOWN ── */
.mp-profile-wrap {
  position: relative;
}
.mp-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid rgba(0,200,150,.4);
  background: rgba(0,200,150,.1);
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all .15s;
}
.mp-avatar:hover {
  border-color: rgba(0,200,150,.6);
  box-shadow: 0 0 0 3px rgba(0,200,150,.1);
}
.mp-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.mp-avatar span {
  font-size: 18px;
}
.mp-profile-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid rgba(0,200,150,.2);
  box-shadow: 0 8px 24px rgba(0,0,0,.15);
  min-width: 140px;
  padding: 6px;
  z-index: 1000;
}
.mp-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: .85rem;
  color: #1a3326;
  cursor: pointer;
  transition: background .15s;
}
.mp-menu-item:hover {
  background: rgba(0,200,150,.1);
}
.mp-menu-item svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}
</style>
