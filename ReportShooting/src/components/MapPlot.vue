<script setup>
import { ref, onMounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'

const mapContainer = ref(null)
let mapInstance = null
let markerLayer = null

// Dropdowns
const years = ref([])
const selectedYear = ref(null)

const months = ref(["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"])
const selectedMonth = ref("Jan")

const crimeTypes = ref(["All"])
const selectedCrimeType = ref("All")

const shootings = ref([])

// --- Load shootings ---
async function loadShootingData() {
  if (!selectedYear.value || !mapInstance) return

  try {
    const url = new URL('http://localhost:3000/shootingsmap')
    url.searchParams.append('year', selectedYear.value)
    if (selectedCrimeType.value !== 'All')
      url.searchParams.append('crime_type', selectedCrimeType.value)

    const res = await fetch(url)
    const data = await res.json()

    console.log("API returned", data.length, "rows")

    // Month filter (parse YYYY-MM-DD)
    shootings.value =
      selectedMonth.value === 'All'
        ? data
        : data.filter(d => {
            const month = parseInt(d.date.slice(5, 7), 10)
            return month === months.value.indexOf(selectedMonth.value) + 1
          })

    console.log("Month-filtered shootings:", shootings.value.length)
    plotMarkers()
  } catch (err) {
    console.error("Failed to load shooting data", err)
  }
}

// --- Initialize map ---
function initMap() {
  mapInstance = L.map(mapContainer.value).setView([38.2527, -85.7585], 11)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(mapInstance)

  // Initialize marker cluster group
  markerLayer = L.markerClusterGroup({maxClusterRadius: 30})
  mapInstance.addLayer(markerLayer)

  loadShootingData() 
}

// --- Plot markers ---
function plotMarkers() {
  if (!mapInstance || !markerLayer) return

  markerLayer.clearLayers()

  shootings.value.forEach(s => {
    const lat = parseFloat(s.lat)
    const lon = parseFloat(s.lon)
    if (isNaN(lat) || isNaN(lon)) return

    const jitter = 0.0001
    const latJitter = lat + (Math.random() - 0.5) * jitter
    const lonJitter = lon + (Math.random() - 0.5) * jitter

    const marker = L.marker([latJitter, lonJitter])
      .bindPopup(`
        <strong>${s.crime_type}</strong><br/>
        ${s.neighborhood || 'Unknown'}<br/>
        ${s.date}
      `)

    markerLayer.addLayer(marker)
  })

  if (markerLayer.getLayers().length > 0) {
    mapInstance.fitBounds(markerLayer.getBounds())
  }
}

// --- Load crime types ---
async function loadCrimeTypes() {
  try {
    const res = await fetch("http://localhost:3000/shootingtype")
    const data = await res.json()
    crimeTypes.value = ["All", ...Array.from(new Set(data.map(d => d.Crime_Type)))]
  } catch (e) {
    console.error("Failed to load crime types", e)
  }
}

// Watchers
watch([selectedYear, selectedMonth, selectedCrimeType], loadShootingData)

// onMounted
onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3000/totalincidents')
    const data = await res.json()
    years.value = data.map(d => d.year).sort().reverse()
    selectedYear.value = years.value[0]

    await loadCrimeTypes()
    initMap()
  } catch (err) {
    console.error("Failed to initialize map", err)
  }
})
</script>

<template>
  <div class="filters">
    <select v-model="selectedYear">
      <option v-for="y in years" :key="y">{{ y }}</option>
    </select>

    <select v-model="selectedMonth">
      <option v-for="m in months" :key="m">{{ m }}</option>
    </select>

    <select v-model="selectedCrimeType">
      <option v-for="ct in crimeTypes" :key="ct">{{ ct }}</option>
    </select>
  </div>

  <div ref="mapContainer" style="width: 100%; height: 600px;"></div>
</template>

<style scoped>
.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
</style>
