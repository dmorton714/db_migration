<script setup>
import { computed } from 'vue'


// Mock shootings dataset (replace later with real data)
const shootings = [
  { id: 1, date: '2025-01-02', neighborhood: 'Russell', injured: 1, fatal: 0 },
  { id: 2, date: '2025-01-04', neighborhood: 'Portland', injured: 2, fatal: 1 },
  { id: 3, date: '2025-01-05', neighborhood: 'Smoketown', injured: 0, fatal: 1 },
  { id: 4, date: '2025-01-06', neighborhood: 'Shawnee', injured: 1, fatal: 0 },
]

// KPIs
const totalIncidents = shootings.length

const totalFatalities = computed(() =>
  shootings.reduce((sum, s) => sum + s.fatal, 0)
)

const totalInjured = computed(() =>
  shootings.reduce((sum, s) => sum + s.injured, 0)
)

const neighborhoodsImpacted = computed(() =>
  new Set(shootings.map(s => s.neighborhood)).size
)
</script>

<template>
  <div class="dashboard">

    <!-- Header -->
    <header class="header">
      <h1>Louisville Shooting Dashboard</h1>
      <p>Mock data preview — replace with city records later</p>
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


    <section class="content-grid">


      <div class="panel">
        <h2>Recent Incidents</h2>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Neighborhood</th>
              <th>Injured</th>
              <th>Fatal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in shootings" :key="row.id">
              <td>{{ row.date }}</td>
              <td>{{ row.neighborhood }}</td>
              <td>{{ row.injured }}</td>
              <td>{{ row.fatal }}</td>
            </tr>
          </tbody>
        </table>
      </div>


      <div class="panel map">
        <h2>Map — Hotspot View</h2>
        <p>Map or geospatial visualization will go here.</p>
      </div>


      <div class="panel">
        <h2>Trend Over Time</h2>
        <p>Chart placeholder (we can wire Chart.js or ECharts later).</p>
      </div>


      <div class="panel">
        <h2>Neighborhood Breakdown</h2>

        <ul class="neighborhood-list">
          <li v-for="row in shootings" :key="row.id">
            <strong>{{ row.neighborhood }}</strong> —
            Injured: {{ row.injured }},
            Fatal: {{ row.fatal }}
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
  padding-left: 1rem;
  line-height: 1.6;
}
</style>
