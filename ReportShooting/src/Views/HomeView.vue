<script setup>
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


// --------------------
// For Table
// --------------------
const searchQuery = ref('')        // filter by neighborhood
const currentPage = ref(1)         // current page
const pageSize = ref(10)            // rows per page


const filteredShootings = computed(() => {
  if (!searchQuery.value) return shootings.value
  return shootings.value.filter(row =>
    row.neighborhood.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const totalPages = computed(() =>
  Math.ceil(filteredShootings.value.length / pageSize.value)
)

const paginatedShootings = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredShootings.value.slice(start, end)
})

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}


// On year change or mounted
onMounted(() => loadShootings(selectedYear.value))
watch(selectedYear, (newYear) => loadShootings(newYear))


// --------------------
// Fetch list of years
// --------------------
async function loadAvailableYears() {
  try {
    const res = await fetch(`${API_BASE}/totalincidents`)
    const data = await res.json()
    years.value = data.map(r => r.year)
    selectedYear.value = years.value.at(-1) // default to latest year
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
    const res = await fetch('http://localhost:3000/shootingtype')
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

// --------------------
// Lifecycle & Watch
// --------------------
onMounted(async () => {
  await loadAvailableYears()
  await loadShootings()
})

onMounted(() => loadShootingTypes())
onMounted(() => loadNeighborhoods())

watch(selectedYear, () => loadShootings())

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

// neighborhood breakdown
const neighborhoodData = ref([])

async function loadNeighborhoodBreakdown(year) {
  try {
    const res = await fetch(`http://localhost:3000/neighborhood-breakdown?year=${year}`)
    neighborhoodData.value = await res.json()
  } catch (e) {
    console.error("Failed to load neighborhood breakdown", e)
  }
}

// On mounted or year change
onMounted(() => loadNeighborhoodBreakdown(selectedYear.value))
watch(selectedYear, (newYear) => loadNeighborhoodBreakdown(newYear))



</script>

<template>
  <div class="dashboard">

    <!-- Header -->
    <header class="header">
      <h1>Louisville Shooting Dashboard</h1>

      <div class="year-select">
        <label for="year">Select Year:</label>
        <select id="year" v-model="selectedYear">
          <option v-for="year in years" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
      </div>

      <p v-if="isLoading">Loading data…</p>
      <p v-if="error" style="color:red">{{ error }}</p>
    </header>

    <!-- KPI CARDS -->
    <section class="kpi-grid">
      <div class="card">
        <h3>Total Incidents</h3>
        <p class="value">{{ totalIncidents }}</p>
      </div>

      <div class="card">
        <h3>Total Injured</h3>
        <p class="value">{{ totalInjured }}</p>
      </div>

      <div class="card">
        <h3>Total Fatalities</h3>
        <p class="value">{{ totalFatalities }}</p>
      </div>

      <div class="card">
        <h3>Neighborhoods Impacted</h3>
        <p class="value">{{ neighborhoodsImpacted }}</p>
      </div>
    </section>

    <!-- Content Grid -->
    <section class="content-grid">

      <!-- Recent Incidents Table -->
      <div class="panel">
          <h2>Recent Incidents</h2>

          <!-- Search -->
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search by neighborhood"
            class="search-box"
          />

          <!-- Table -->
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Address</th>
                <th>Crime Type</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in paginatedShootings" :key="row.id">
                <td>{{ row.date }}</td>
                <td>{{ row.neighborhood }}</td>
                <td>{{ row.crime_type }}</td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div class="pagination">
            <button @click="prevPage" :disabled="currentPage === 1">Prev</button>
            <span>Page {{ currentPage }} of {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
          </div>
        </div>

      <!-- Map placeholder -->
      <div class="panel map">
        <h2>Map — Hotspot View</h2>
        <p>Map or geospatial visualization will go here.</p>
      </div>

      <!-- Trend placeholder -->
      <div class="panel">
        <h2>Trend Over Time</h2>
        <p>Chart placeholder (Chart.js / ECharts can be wired later).</p>
      </div>

      <!-- Neighborhood breakdown -->
      <div class="panel">
        <h2>Neighborhood Breakdown</h2>
        <ul class="neighborhood-list">
          <li v-for="row in neighborhoodData" :key="row.neighborhood">
            <strong>{{ row.neighborhood }}</strong> —
            Injured: {{ row.Injured }},
            Fatal: {{ row.Fatal }},
            AI: {{ row.AI }}
          </li>
        </ul>
      </div>

    </section>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 1.5rem;
  background: var(--lou-light);
  display: grid;
  gap: 1.25rem;
}

.header h1 {
  color: var(--lou-navy);
  margin-bottom: .25rem;
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

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.card {
  background: white;
  border-right: 6px solid var(--lou-gold);
  border-bottom: 6px solid var(--lou-gold);
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 6px 14px rgba(0,0,0,.06);
}

.card h3 {
  margin-bottom: .35rem;
  color: var(--lou-navy);
}

.value {
  font-size: 1.75rem;
  font-weight: 800;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1.2fr;
  grid-template-rows: auto auto;
  gap: 1rem;
}

.panel {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 6px 14px rgba(0,0,0,.06);
  border-right: 6px solid var(--lou-gold);
  border-bottom: 6px solid var(--lou-gold);
}

.panel h2 {
  color: var(--lou-navy);
  margin-bottom: .5rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: var(--lou-navy);
  color: white;
  text-align: left;
  padding: .5rem;
}

td {
  padding: .5rem;
  border-bottom: 1px solid #ddd;
}

.map {
  background:white;
  color: black;
}

.neighborhood-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding-left: 0;
  list-style: none;
  line-height: 1.6;
}

.neighborhood-list li {
  background: var(--lou-light);
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}


.search-box {
  margin-bottom: 10px;
  padding: 10px;
  width: 70%;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.pagination {
  margin-top: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination button {
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--lou-navy);
  background: var(--lou-light);
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}


</style>
