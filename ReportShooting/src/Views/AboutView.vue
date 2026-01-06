<script setup>
</script>

<template>
  <div class="about-page">
    <main class="content">
      <div class="card">
        <h1>About This Dashboard</h1>
        <p>
          This is a Louisville Shooting Dashboard, providing insights into the city's public safety statistics.
          It highlights key metrics such as total shooting incidents, injuries, fatalities, and affected neighborhoods.
          The dashboard aims to inform the public and policymakers by visualizing trends and patterns in
          shooting incidents over time.
        </p>

        <p>
          Using data from real city records from the Louisville Open Data Portal.
        </p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.about-page {
  background-color: var(--lou-light);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem 1rem;
  min-height: 100dvh;
}

.content {
  max-width: 800px;
  width: 100%;
}

.card {
  background-color: white;
  border-bottom: 6px solid var(--lou-gold);
  border-left: 6px solid var(--lou-gold);
  border-radius: 12px;
  padding: 2rem 1.5rem;
  box-shadow: 0 6px 14px rgba(0,0,0,.08);
  text-align: center;
}

.card h1 {
  color: var(--lou-navy);
  margin-bottom: 1rem;
}

.card p {
  color: #333;
  line-height: 1.6;
  margin-bottom: .75rem;
}
</style>
