<template>
  <v-app-bar
    flat
    color="transparent"
    class="app-toolbar px-6"
  >
    <v-toolbar-title class="font-weight-semibold text-h5">
      B-Tree Studio
    </v-toolbar-title>
    <v-spacer />
    <v-chip
      color="primary"
      text-color="white"
      label
      small
      outlined
    >
      учебный проект
    </v-chip>
  </v-app-bar>
</template>

<script>
export default {
  name: 'Header',
};
</script>

<style scoped>
.app-toolbar {
  background: transparent;
  backdrop-filter: blur(12px);
}
</style>
