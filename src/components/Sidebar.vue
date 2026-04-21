<template>
  <aside class="sb" id="sidebar">
    <div class="sh">
      <div class="ttl">République du<em> Bénin</em></div>
      <div class="sub">Répartition des pharmacies par département</div>
    </div>
    
    <div class="stot">
      <span class="lb">Total pharmacies</span>
      <span class="nm">{{ total.toLocaleString('fr-FR') }}</span>
    </div>

    <!-- RECHERCHE PHARMACIE -->
    <div class="ssrch" id="searchBox">
      <div class="ssrch-wrap">
        <svg class="ssrch-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" stroke-width="1.4"/>
          <path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
        </svg>
        <input
          type="text"
          id="pharmSearch"
          v-model="searchQuery"
          placeholder="Rechercher une pharmacie…"
          autocomplete="off"
          spellcheck="false"
          @input="onSearchInput"
          @keydown="onSearchKeydown"
          @focus="onSearchFocus"
          @blur="onSearchBlur"
        />
        <button
          class="ssrch-clear"
          id="searchClear"
          :class="{ visible: searchQuery.length > 0 }"
          @click="clearSearch"
          title="Effacer"
        >✕</button>
      </div>
      <div class="ssug" id="searchSuggestions" :class="{ open: showSuggestions }" role="listbox">
        <template v-if="suggestions.length > 0">
          <div
            v-for="(p, i) in suggestions"
            :key="i"
            class="ssug-item"
            :class="{ active: activeIdx === i }"
            :data-idx="i"
            role="option"
            @mousedown="selectPharmacy(p, $event)"
            @mousemove="setActiveIdx(i)"
          >
            <div class="ssug-left">
              <span class="ssug-cross">✚</span>
              <span class="ssug-nom" v-html="highlightMatch(p.nom, searchQuery)"></span>
            </div>
            <span class="ssug-meta" v-html="highlightMatch(getSubTitle(p), searchQuery)"></span>
          </div>
        </template>
        <div v-else-if="searchQuery.length > 0" class="ssug-empty">Aucune pharmacie trouvée</div>
      </div>
    </div>

    <div class="sl" id="slist">
      <div
        v-for="(dep, i) in deps"
        :key="dep.id"
        class="dr"
        :class="{ act: selectedDept === dep.id }"
        :data-id="dep.id"
        @click="$emit('select-dept', dep.id)"
        :style="{ animationDelay: (0.04 + i * 0.03) + 's' }"
      >
        <div class="dd" :style="{ background: DOTC[i] }"></div>
        <span class="dn">{{ dep.id }}</span>
        <div class="db">
          <div class="dbf" :style="{ width: (max > 0 ? dep.v / max * 100 : 0) + '%' }"></div>
        </div>
        <span class="dv">{{ dep.v.toLocaleString('fr-FR') }}</span>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { DOTC } from '../composables/usePharmacy.js'

const props = defineProps({
  deps: { type: Array, required: true },
  total: { type: Number, default: 0 },
  max: { type: Number, default: 0 },
  selectedDept: { type: String, default: null },
  pharmaDb: { type: Array, default: () => [] }
})

const emit = defineEmits(['select-dept', 'search-pharmacy'])

const searchQuery = ref('')
const showSuggestions = ref(false)
const activeIdx = ref(-1)

const suggestions = computed(() => {
  if (!searchQuery.value || searchQuery.value.length < 1) return []
  return props.pharmaDb.filter(p =>
    p.nom.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    p.ville.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    p.quartier.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    p.dept.toLowerCase().includes(searchQuery.value.toLowerCase())
  ).slice(0, 10)
})

function getSubTitle(p) {
  return [p.ville, p.quartier].filter(Boolean).join(', ') || p.dept
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

function onSearchInput() {
  activeIdx.value = -1
  showSuggestions.value = searchQuery.value.length > 0
}

function onSearchKeydown(e) {
  const items = suggestions.value
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIdx.value = Math.min(activeIdx.value + 1, items.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIdx.value = Math.max(activeIdx.value - 1, 0)
  } else if (e.key === 'Enter') {
    if (activeIdx.value >= 0 && items[activeIdx.value]) {
      selectPharmacy(items[activeIdx.value], e)
    }
  } else if (e.key === 'Escape') {
    clearSearch()
  }
}

function onSearchFocus() {
  if (searchQuery.value.trim().length >= 1) {
    showSuggestions.value = true
  }
}

function onSearchBlur() {
  setTimeout(() => {
    showSuggestions.value = false
  }, 150)
}

function setActiveIdx(idx) {
  activeIdx.value = idx
}

function selectPharmacy(p, e) {
  e.preventDefault()
  searchQuery.value = p.nom
  showSuggestions.value = false
  emit('search-pharmacy', p)
}

function clearSearch() {
  searchQuery.value = ''
  showSuggestions.value = false
  activeIdx.value = -1
  document.getElementById('pharmSearch')?.focus()
}
</script>
