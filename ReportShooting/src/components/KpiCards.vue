<script setup>
defineProps({
  totalIncidents: { type: Number, required: true },
  totalInjured: { type: Number, required: true },
  totalFatalities: { type: Number, required: true },
  neighborhoodsImpacted: { type: Number, required: true }
})
</script>

<template>
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
</template>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: 0.75rem;
}

.card {
  background: white;
  border-left: 4px solid var(--lou-gold);
  border-bottom: 4px solid var(--lou-gold);
  border-radius: 8px;
  padding: 0.75rem;
  box-shadow: 0 4px 10px rgba(0,0,0,.05);
}

.card h3 {
  margin: 6px 0;
  color: var(--lou-navy);
  text-align: center;
  font-size: 0.95rem;
}

.value {
  margin: 6px 0;
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
}
</style>
