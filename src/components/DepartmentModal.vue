<template>
  <div class="modal-overlay open" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title">{{ dept }}</div>
        <button class="modal-close" @click="$emit('close')" title="Fermer">✕</button>
      </div>
      <div class="modal-header">
        <div class="modal-title"></div>
        <div style="display:flex; align-items:center; gap:8px;">
          <button id="btnLocate" @click="handleLocateUser" :disabled="locating">
            {{ locating ? '⏳ Localisation…' : '📍 Voir ma position' }}
          </button>
        </div>
      </div>
      <div class="modal-map" id="modalMap">
        <div id="modalLeaflet" style="width:100%;height:100%;"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import L from 'leaflet'
import { DEP_GEO, DEP_BOUNDS, ORDER } from '../composables/usePharmacy.js'

const props = defineProps({
  dept: { type: String, required: true },
  pharmacies: { type: Array, default: () => [] },
  userLat: { type: Number, default: null },
  userLng: { type: Number, default: null },
  selectedPharmacy: { type: Object, default: null }
})

const emit = defineEmits(['close', 'locate-user', 'select-pharmacy'])

const leafletMap = ref(null)
const userMarker = ref(null)
const locating = ref(false)

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
    * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function getNearestPharmacy() {
  if (props.userLat === null || !props.pharmacies.length) return null
  return props.pharmacies.reduce((nearest, p) => {
    const d = haversine(props.userLat, props.userLng, parseFloat(p.lat), parseFloat(p.lng))
    return d < nearest.d ? { p, d } : nearest
  }, { p: null, d: Infinity }).p
}

function drawPharmMarkers() {
  if (!leafletMap.value) return

  leafletMap.value.eachLayer(layer => {
    if (layer._isPharmMarker) leafletMap.value.removeLayer(layer)
  })

  if (props.pharmacies.length === 0) return

  const nearest = getNearestPharmacy()

  props.pharmacies.forEach(p => {
    const isNearest = nearest && p === nearest
    const isSelected = props.selectedPharmacy && p.nom === props.selectedPharmacy.nom

    let pharmIcon

    if (isSelected) {
      pharmIcon = L.divIcon({
        className: '',
        html: `
          <div class="pharm-marker-selected">
            <div class="pharm-marker-ring"></div>
            <div class="pharm-marker-dot"></div>
          </div>`,
        iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -16],
      })
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
      })
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
      })
    }

    const marker = L.marker([parseFloat(p.lat), parseFloat(p.lng)], {
      icon: pharmIcon,
      zIndexOffset: isSelected ? 1000 : (isNearest ? 500 : 0),
    }).addTo(leafletMap.value)

    marker._isPharmMarker = true

    marker.bindTooltip(
      isSelected
        ? `<span style="color:#00C896;font-weight:700;">✚ ${p.nom}</span>`
        : isNearest
          ? `⭐ ${p.nom} <em style="font-size:.75em;opacity:.7;">(la plus proche)</em>`
          : p.nom,
      { permanent: false, direction: 'top', offset: [0, -8] }
    )

    if (isSelected) {
      setTimeout(() => marker.openTooltip(), 300)
    }

    marker.on('click', () => {
      const d = props.userLat !== null
        ? haversine(props.userLat, props.userLng, parseFloat(p.lat), parseFloat(p.lng))
        : null
      const dist = d !== null
        ? (d < 1 ? Math.round(d * 1000) + ' m' : d.toFixed(1) + ' km')
        : null
      emit('select-pharmacy', p, isNearest, dist)
    })
  })
}

async function handleLocateUser() {
  locating.value = true
  try {
    const marker = await emit('locate-user', leafletMap.value, userMarker)
    if (marker) {
      userMarker.value = marker
    }
    drawPharmMarkers()
  } finally {
    locating.value = false
  }
}

async function initMap() {
  const geo = DEP_GEO[props.dept]
  const bounds = DEP_BOUNDS[props.dept]
  if (!geo || !bounds) return

  await nextTick()

  const container = document.getElementById('modalLeaflet')
  if (!container) return

  if (leafletMap.value) {
    leafletMap.value.remove()
    leafletMap.value = null
  }

  const leafletBounds = L.latLngBounds(bounds[0], bounds[1])

  leafletMap.value = L.map('modalLeaflet', {
    maxBounds: leafletBounds,
    maxBoundsViscosity: 1.0,
    zoomControl: true,
    attributionControl: true,
  }).fitBounds(leafletBounds)

  const minZoom = leafletMap.value.getZoom()
  leafletMap.value.setMinZoom(minZoom)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19,
  }).addTo(leafletMap.value)

  drawPharmMarkers()

  if (props.userLat !== null) {
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
    })
    userMarker.value = L.marker([props.userLat, props.userLng], { icon: userIcon })
      .addTo(leafletMap.value)
      .bindPopup('<strong>Vous êtes ici</strong>')
  }

  leafletMap.value.invalidateSize()
}

function onKeyDown(e) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => {
  setTimeout(initMap, 120)
  document.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown)
  if (leafletMap.value) {
    leafletMap.value.remove()
    leafletMap.value = null
  }
})

watch(() => props.pharmacies, drawPharmMarkers, { deep: true })
watch(() => props.selectedPharmacy, drawPharmMarkers)
</script>
