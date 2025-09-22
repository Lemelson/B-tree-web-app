<template>
  <div class="button-container align-center flex">
    <v-text-field
      v-if="!onlypop"
      v-model="deletedValue"
      class="text-field"
      color="error"
      :label="label"
      :hint="hint"
      :persistent-hint="Boolean(hint)"
      :disabled="disabled"
      outlined
      dense
      clearable
      hide-details="auto"
      prepend-inner-icon="mdi-delete-outline"
      @keyup.enter="deleteValue"
    />
    <v-btn
      color="error"
      class="button ml-3"
      :disabled="disabled"
      @click="deleteValue"
    >
      Удалить
    </v-btn>
  </div>
</template>

<script>
export default {
  name: 'DeleteInput',
  props: {
    onlypop: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    label: { type: String, default: 'Удаление значения' },
    hint: { type: String, default: '' },
  },
  data() {
    return {
      deletedValue: '',
    };
  },
  methods: {
    deleteValue() {
      if (this.deletedValue !== '' || this.onlypop) {
        this.$emit('myEvent', this.deletedValue);
        this.deletedValue = '';
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
