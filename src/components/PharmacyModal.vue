<template>
  <div class="pharm-overlay open" @click.self="$emit('close')">
    <div class="pharm-modal">
      <div class="pharm-modal-header">
        <div class="pharm-modal-title">
          {{ pharmacy.nom }}
          <span v-if="isNearest" style="
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
          ">⭐ La plus proche</span>
        </div>
        <button class="modal-close" @click="$emit('close')">✕</button>
      </div>
      <div class="pharm-modal-body">
        <template v-for="(field, i) in fields" :key="i">
          <div v-if="i > 0" class="pharm-divider"></div>
          <div class="pharm-row">
            <span class="pharm-label">{{ field.label }}</span>
            <span class="pharm-value" v-html="field.value"></span>
          </div>
        </template>
        
        <div class="pharm-divider"></div>
        <button
          id="btnItinerary"
          @click="startItinerary"
          :disabled="itineraryLoading"
        >
          {{ itineraryLoading ? '⏳ Localisation…' : '🧭 Itinéraire' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  pharmacy: { type: Object, required: true },
  isNearest: { type: Boolean, default: false },
  distance: { type: String, default: null },
  userLat: { type: Number, default: null },
  userLng: { type: Number, default: null }
})

const emit = defineEmits(['close'])

const itineraryLoading = computed(() => false)

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
    * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const autoDistance = computed(() => {
  if (props.userLat !== null && props.pharmacy.lat && props.pharmacy.lng) {
    const d = haversine(props.userLat, props.userLng, parseFloat(props.pharmacy.lat), parseFloat(props.pharmacy.lng))
    return d < 1 ? Math.round(d * 1000) + ' m' : d.toFixed(1) + ' km'
  }
  return props.distance
})

const fields = computed(() => {
  const result = [
    { label: 'Département', value: props.pharmacy.dept },
    { label: 'Ville', value: props.pharmacy.ville },
    { label: 'Quartier', value: props.pharmacy.quartier },
    { label: 'Adresse', value: props.pharmacy.adresse },
    { label: 'Téléphone', value: props.pharmacy.tel ? `<a href="tel:${props.pharmacy.tel}">${props.pharmacy.tel}</a>` : '<span style="opacity:.4;font-style:italic;">—</span>' },
    { label: 'Email', value: props.pharmacy.email ? `<a href="mailto:${props.pharmacy.email}">${props.pharmacy.email}</a>` : '<span style="opacity:.4;font-style:italic;">—</span>' },
  ]
  
  if (autoDistance.value) {
    result.push({ label: 'Distance', value: `<span style="color:#f59e0b;font-weight:700;">${autoDistance.value}</span>` })
  }
  
  return result
})

async function startItinerary() {
  if (!navigator.geolocation) {
    alert('Géolocalisation non supportée')
    return
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      const url = `https://www.google.com/maps/dir/?api=1`
        + `&origin=${pos.coords.latitude},${pos.coords.longitude}`
        + `&destination=${props.pharmacy.lat},${props.pharmacy.lng}`
        + `&travelmode=driving`
      window.open(url, '_blank')
    },
    err => {
      const msgs = { 1: 'Permission refusée', 2: 'Position indisponible', 3: 'Délai dépassé' }
      alert(msgs[err.code] || 'Erreur de localisation')
    },
    { enableHighAccuracy: true, timeout: 10000 }
  )
}

function onKeyDown(e) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => {
  document.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown)
})
</script>
