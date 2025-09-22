<template>
  <div class="step-interface-container text-center">
    <div class="button-container d-flex align-center justify-center">
      <v-btn
        class="button"
        icon
        color="primary"
        :disabled="disabled.backButtonIsDisabled || disabled.isAnimating"
        @click="stepBack"
      >
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      <v-btn
        class="button"
        icon
        color="primary"
        :disabled="disabled.forwardButtonIsDisabled || disabled.isAnimating"
        @click="stepForward"
      >
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </div>
    <span class="caption text-uppercase grey--text text--darken-1">{{ label }}</span>
  </div>
</template>

<script>
export default {
  name: 'HistoryButtons',
  props: {
    length: { type: Number, default: 1 },
    currentFrame: { type: Number, default: 0 },
    disabled: { type: Object, default: () => ({}) },
    label: { type: String, default: '' },
  },
  methods: {
    stepBack() {
      this.$emit('HistoryEvents', -1);
    },
    stepForward() {
      this.$emit('HistoryEvents', 1);
    },
  },
};
</script>

<style scoped>
.button-container {
  gap: 12px;
}

.button {
  background: #f3f6ff !important;
}
</style>
