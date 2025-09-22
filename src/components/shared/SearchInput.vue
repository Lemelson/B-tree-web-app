<template>
  <div class="button-container align-center flex">
    <v-text-field
      v-model="searchedValue"
      class="text-field"
      :label="label"
      :hint="hint"
      :persistent-hint="Boolean(hint)"
      :disabled="disabled"
      outlined
      dense
      clearable
      hide-details="auto"
      prepend-inner-icon="mdi-magnify"
      @keyup.enter="searchValue"
    />
    <v-btn
      class="button ml-3"
      color="primary"
      :disabled="disabled"
      @click="searchValue"
    >
      Поиск
    </v-btn>
  </div>
</template>

<script>
export default {
  name: 'SearchInput',
  props: {
    disabled: { type: Boolean, default: false },
    label: { type: String, default: 'Поиск значения' },
    hint: { type: String, default: '' },
  },
  data() {
    return {
      searchedValue: '',
    };
  },
  methods: {
    searchValue() {
      if (this.searchedValue !== '' && !this.disabled) {
        this.$emit('myEvent', this.searchedValue);
        this.searchedValue = '';
      }
    },
  },
};
</script>

<style scoped>
.button-container {
  width: 100%;
  max-width: 100%;
}

.text-field {
  flex: 1 1 auto;
}

.button {
  min-width: 120px;
}
</style>
