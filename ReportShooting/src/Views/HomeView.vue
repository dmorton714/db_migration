<script setup>
import MapPlot from '@/components/MapPlot.vue'
import MonthlyPlot from '@/components/MonthlyPlot.vue'
import DataTable from '@/components/DataTable.vue'
import KpiCards from '@/components/KpiCards.vue'
import { ref, computed, onMounted, watch } from 'vue'

// --------------------
// API & State
// --------------------
const API_BASE = 'http://localhost:3000'

const shootings = ref([])
const years = ref([])
const selectedYear = ref(null)
const shootingTypes = ref([])
const neighborhoodsData = ref([])

const isLoading = ref(false)
const error = ref(null)

// for plot
const selectedPlotYear = ref("2025")

// --------------------
// Fetch list of years
// --------------------
async function loadAvailableYears() {
  try {
    const res = await fetch(`${API_BASE}/totalincidents`)
    const data = await res.json()
    years.value = data.map(r => r.year)
    selectedYear.value = years.value.at(-1)
  } catch (e) {
    error.value = "Failed to load years list"
  }
}

// --------------------
// Fetch shootings for selected year
// --------------------
async function loadShootings() {
  if (!selectedYear.value) return
  isLoading.value = true
  error.value = null

  try {
    const res = await fetch(`${API_BASE}/shootings?year=${selectedYear.value}`)
    shootings.value = await res.json()
  } catch (e) {
    error.value = "Failed to load shootings data"
  } finally {
    isLoading.value = false
  }
}

async function loadShootingTypes() {
  try {
    const res = await fetch(`${API_BASE}/shootingtype`)
    shootingTypes.value = await res.json()
  } catch (e) {
    console.error('Failed to load shooting type data', e)
  }
}

async function loadNeighborhoods() {
  try {
    const res = await fetch(`${API_BASE}/neighborhoods`)
    neighborhoodsData.value = await res.json()
  } catch (e) {
    console.error('Failed to load neighborhoods data', e)
  }
}

const neighborhoodData = ref([])

async function loadNeighborhoodBreakdown(year) {
  try {
    const res = await fetch(`${API_BASE}/neighborhood-breakdown?year=${year}`)
    neighborhoodData.value = await res.json()
  } catch (e) {
    console.error("Failed to load neighborhood breakdown", e)
  }
}

// --------------------
// Lifecycle & Watch
// --------------------
onMounted(async () => {
  await loadAvailableYears()
  await loadShootings()
  await loadShootingTypes()
  await loadNeighborhoods()
  await loadNeighborhoodBreakdown(selectedYear.value)
})

watch(selectedYear, (newYear) => {
  loadShootings(newYear)
  loadNeighborhoodBreakdown(newYear)
})

// --------------------
// Computed KPIs
// --------------------
const totalIncidents = computed(() => shootings.value.length)

const totalFatalities = computed(() => {
  if (!selectedYear.value) return 0
  const row = shootingTypes.value.find(
    r => r.year === selectedYear.value && r.Crime_Type === 'Homicide'
  )
  return row ? row.total_shootings : 0
})

const totalInjured = computed(() => {
  if (!selectedYear.value) return 0
  const row = shootingTypes.value.find(
    r => r.year === selectedYear.value && r.Crime_Type === 'Non-Fatal Shooting'
  )
  return row ? row.total_shootings : 0
})

const neighborhoodsImpacted = computed(() => {
  if (!selectedYear.value) return 0
  const row = neighborhoodsData.value.find(r => r.year === selectedYear.value)
  return row ? row.neighborhoods_impacted : 0
})

const neighborhoodColumns = [
  { label: "Neighborhood", field: "neighborhood" },
  { label: "Injured", field: "Injured" },
  { label: "Fatal", field: "Fatal" },
  { label: "AI", field: "AI" }
]

const shootingColumns = [
  { label: 'Date', field: 'date' },
  { label: 'Neighborhood', field: 'neighborhood' },
  { label: 'Crime Type', field: 'crime_type' }
]
</script>

<template>
  <div class="dashboard">

    <!-- Header -->
    <header class="header">
      <div class="year-select">
        <label for="year">Select Year:</label>
        <select id="year" v-model="selectedYear">
          <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
        </select>
      </div>
      <p v-if="isLoading">Loading data…</p>
      <p v-if="error" style="color:red">{{ error }}</p>
    </header>

    <!-- KPI Cards Component -->
    <KpiCards
      :totalIncidents="totalIncidents"
      :totalInjured="totalInjured"
      :totalFatalities="totalFatalities"
      :neighborhoodsImpacted="neighborhoodsImpacted"
    />

    <!-- Content Grid -->
    <section class="content-grid">

      <!-- Recent Incidents Table -->
      <div class="panel">
        <h2>Recent Incidents</h2>
        <DataTable
          :data="shootings"
          :columns="shootingColumns"
          :pageSize="10"
          searchable
        />
      </div>

      <!-- Neighborhood breakdown -->
      <div class="panel">
        <h2>Neighborhood Breakdown</h2>
        <DataTable
          :data="neighborhoodData"
          :columns="neighborhoodColumns"
          :pageSize="10"
          searchable
                />
      </div>

      <!-- Trend -->
      <div class="panel">
        <h2>Shootings Over Time</h2>
        <MonthlyPlot :selectedYearMaster="selectedPlotYear" />
      </div>

      <!-- Map -->
      <div class="panel">
        <h2>Map of Shootings</h2>
        <MapPlot />
      </div>

    </section>
  </div>
</template>


<style scoped>
  body {
  margin: 0;
  padding: 0;
}
.dashboard {
  padding: 0 1.5rem 1.5rem 1.5rem;
  background: var(--lou-light);
  display: grid;
  gap: 1.25rem;
}
.header {
  margin-top: 10px;
}
.header h1 {
  color: var(--lou-navy);
  margin-bottom: .5rem;
}

.header p {
  opacity: .7;
}

.year-select {
  display: flex;
  gap: .5rem;
  align-items: center;
  font-weight: 600;
}

select {
  padding: .35rem .5rem;
  border-radius: 6px;
  border: 2px solid var(--lou-navy);
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 1rem;
}

.panel {
  background: white;
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 6px 14px rgba(0, 0, 0, .06);
  border-left: 6px solid var(--lou-gold);
  border-bottom: 6px solid var(--lou-gold);
}

.panel h2 {
  color: var(--lou-navy);
  margin-top: 0px;
  margin-bottom: 5px;
  text-align: center;
}

.map {
  background: white;
  color: black;
}

</style>
