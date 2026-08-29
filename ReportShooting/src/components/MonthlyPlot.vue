<script setup>
import { ref, watch, onMounted } from "vue"
import {
  Chart,
  LineController,
  ScatterController,
  PointElement,
  LineElement,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js"

Chart.register(
  ScatterController,
  LineController,
  PointElement,
  LineElement,
  LinearScale,
  Tooltip,
  Legend
)

const props = defineProps({
  selectedYearMaster: { type: String, required: true }
})

const chartCanvas = ref(null)
let chartInstance = null

const compareYears = ref([])
const selectedCrimeType = ref("All")
const datasets = ref({})
const yearOptions = ref([])
const crimeTypes = ref(["All"])
const loading = ref(true)
const error = ref(null)

async function loadMonthlyData() {
  loading.value = true
  try {
    const url = new URL("http://localhost:3000/shootingsbymonth")
    if (selectedCrimeType.value !== "All") url.searchParams.append("crime_type", selectedCrimeType.value)

    const res = await fetch(url)
    const data = await res.json()

    // ----- Aggregate per month per year -----
    const grouped = {}
    data.forEach(r => {
      if (!grouped[r.year]) grouped[r.year] = {}
      if (!grouped[r.year][r.month]) grouped[r.year][r.month] = 0
      grouped[r.year][r.month] += Number(r.total_shootings)
    })

    // Convert to Chart.js points
    const datasetsObj = {}
    Object.keys(grouped).forEach(year => {
      datasetsObj[year] = Object.entries(grouped[year])
        .map(([month, total]) => ({ x: Number(month), y: total }))
        .sort((a,b)=>a.x-b.x)
    })

    datasets.value = datasetsObj

    // Dropdowns
    yearOptions.value = Object.keys(datasetsObj).sort().reverse()

    // Default to the most recent year, excluding the master year (2 years total)
    if (!compareYears.value.length) {
      const other = yearOptions.value.find(y => y !== props.selectedYearMaster)
      if (other) compareYears.value = [other]
    }

    const typesSet = new Set(data.map(r => r.Crime_Type))
    crimeTypes.value = ["All", ...Array.from(typesSet).sort()]

    renderChart()
  } catch(e) {
    console.error(e)
    error.value = "Failed to load chart data"
  } finally {
    loading.value = false
  }
}

// ---- Regression for trend line ----
function regressionLine(points) {
  if (!points.length) return []
  const xs = points.map(p=>p.x)
  const ys = points.map(p=>p.y)
  const n = xs.length
  const sumX = xs.reduce((a,b)=>a+b,0)
  const sumY = ys.reduce((a,b)=>a+b,0)
  const sumXY = xs.reduce((a,b,i)=>a + b*ys[i],0)
  const sumXX = xs.reduce((a,b)=>a + b*b,0)
  const slope = (n*sumXY - sumX*sumY) / (n*sumXX - sumX*sumX)
  const intercept = (sumY - slope*sumX)/n
  const trend = []
  for (let m=0.5; m<=12.5; m+=0.5) trend.push({x:m, y:slope*m + intercept})
  return trend
}

// ---- Render Chart ----
function renderChart() {
  if (!chartCanvas.value) return
  if (chartInstance) chartInstance.destroy()

  const louBlue = "#1D1E9E"
  const louGold = "#DBA64C"
  const masterYear = props.selectedYearMaster

  const compareColors = [louGold, "#2E8B57", "#B23A48", "#7A5195"]

  const ds = []
  Object.entries(datasets.value).forEach(([year, points]) => {
    const isMaster = year === masterYear
    const compareIndex = compareYears.value.indexOf(year)
    if (!isMaster && compareIndex === -1) return // ponytail: only draw years the user opted into

    const color = isMaster ? louBlue : compareColors[compareIndex % compareColors.length]

    ds.push({
      label: year,
      data: points,
      showLine: true,
      tension: 0.25,
      borderWidth: 2,
      pointRadius: 5,
      borderColor: color,
      backgroundColor: color
    })

    if (isMaster) {
      ds.push({
        label: `${year} Trend`,
        data: regressionLine(points),
        type: "line",
        showLine: true,
        fill: false,
        pointRadius: 0,
        borderWidth: 3,
        borderDash: [6,4],
        borderColor: louBlue,
        tension: 0.25
      })
    }
  })

  chartInstance = new Chart(chartCanvas.value, {
    type: "scatter",
    data: { datasets: ds },
    options: {
      responsive: true,
      plugins: { legend: { display: true }, tooltip: { mode: "nearest", callbacks:{label: function(context){return context.raw.y}} } },
      scales: {
        x: {
          type: "linear",
          position: "bottom",
          suggestedMin: 0.5,
          suggestedMax: 12.5,
          ticks: {
            stepSize: 1,
            callback: m => ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m-1]
          },
          title: { display: true, text: "Month", color: "#000", font: { size: 14 } }
        },
        y: {
          beginAtZero: true,
          min: 0,
          title: {
            display: true,
            text: "Shooting Incidents",
            color: "#000",
            font: { size: 14, weight: "bold" }
          },
          ticks: { stepSize: 300, color: "#000" }
        }
      }
      }
  })
}

// ---- Watchers ----
watch(selectedCrimeType, loadMonthlyData)
watch(() => props.selectedYearMaster, loadMonthlyData)
watch(compareYears, renderChart, { deep: true })

// ---- On mounted ----
onMounted(loadMonthlyData)
</script>

<template>
  <div>
    <div class="compare-years">
      <span>Compare:</span>
      <label v-for="y in yearOptions.filter(y => y !== selectedYearMaster)" :key="y">
        <input type="checkbox" :value="y" v-model="compareYears" />
        {{ y }}
      </label>
    </div>

    <select v-model="selectedCrimeType">
      <option v-for="c in crimeTypes" :key="c">{{ c }}</option>
    </select>

    <canvas ref="chartCanvas"></canvas>

    <p v-if="loading">Loading chart...</p>
    <p v-if="error">{{ error }}</p>
  </div>
</template>


<style scoped>
.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
.compare-years {
  display: inline-flex;
  gap: 0.75rem;
  align-items: center;
  margin-right: 1rem;
}
.compare-years label {
  font-weight: 400;
}
label {
  font-weight: 600;
}
select {
  margin-left: 0.5rem;
  padding: 0.25rem 0.5rem;
}
</style>
