<template>
  <v-app class="app-shell">
    <Header class="app-header" />
    <main class="app-content">
      <router-view />
    </main>
  </v-app>
</template>

<script>
import Header from './components/shared/Header.vue';

export default {
  name: 'App',
  components: {
    Header,
  },
};
</script>

<style>
.app-shell {
  font-family: 'Inter', 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #0f172a;
  background: linear-gradient(180deg, #f4f7ff 0%, #ffffff 100%);
  min-height: 100vh;
}

.app-header {
  height: 80px;
  background: transparent;
}

.app-content {
  min-height: calc(100vh - 80px);
  display: flex;
  justify-content: center;
  padding: 0;
}
</style>
