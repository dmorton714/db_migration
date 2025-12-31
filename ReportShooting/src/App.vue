<script setup>
</script>

<template>
  <nav class="nav">
    <div class="nav-inner">

      <div class="brand">
        <h1>Louisville Shooting Dashboard</h1>
      </div>

      <div class="links">
        <RouterLink to="/" class="link">Home</RouterLink>
        <RouterLink to="/about" class="link">About</RouterLink>
      </div>

    </div>
  </nav>

  <router-view />
</template>

<style scoped>
.nav {
  background: var(--lou-gold);
  color: var(--lou-navy);
  width: 100%;
  padding: 10px;
  box-shadow: 0 6px 14px rgba(0,0,0,.25);
}

.nav-inner {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0 20px;
  box-sizing: border-box;
}

.brand h1 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: .02em;
}

.subtitle {
  opacity: .75;
  font-size: .9rem;
  margin-top: .15rem;
}

.links {
  display: flex;
  gap: 1rem;
}

.link {
  padding: .5rem .9rem;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 600;
  color: white;
  border: 2px solid transparent;
  transition: .2s;
}

.link:hover {
  background: var(--lou-gold);
  color: black;
}

.link.router-link-active {
  border-color: var(--lou-gold);
  background: rgba(255,255,255,.12);
}

@media (max-width: 700px) {
  .nav-inner {
    flex-direction: column;
    align-items: flex-start;
  }

  .links {
    margin-top: .5rem;
  }
}
</style>

