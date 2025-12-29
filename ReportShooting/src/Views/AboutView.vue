<script setup>
</script>

<template>
  <div class="about-page">
    <main class="content">
      <div class="card">
        <h1>About This Dashboard</h1>
        <p>
          This is a placeholder About page. Here we will describe the Louisville Shooting Dashboard,
          its data sources, methodology, and provide context for the city's public safety statistics.
        </p>

        <p>
          Currently using mock data. Real city records and visualizations will be connected here in future updates.
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
