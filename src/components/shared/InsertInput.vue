<template>
  <div class="button-container align-center flex">
    <v-text-field
      v-model="insertedValue"
      class="text-field"
      :label="label"
      :hint="hint"
      :persistent-hint="Boolean(hint)"
      :disabled="disabled"
      outlined
      dense
      clearable
      hide-details="auto"
      prepend-inner-icon="mdi-plus-circle-outline"
      @keyup.enter="insertValue"
    >
      <template #append>
        <v-tooltip
          bottom
          max-width="300"
        >
          <template #activator="{ on, attrs }">
            <v-icon
              v-bind="attrs"
              color="primary"
              small
              v-on="on"
            >
              mdi-help-circle
            </v-icon>
          </template>
          <span>
            Чтобы вставить несколько чисел, введите их через запятую,
            пробел или точку с запятой.
          </span>
        </v-tooltip>
      </template>
    </v-text-field>
    <v-btn
      class="button ml-3"
      color="primary"
      :disabled="disabled"
      @click="insertValue"
    >
      Вставить
    </v-btn>
  </div>
</template>

<script>
export default {
  name: 'InsertInput',
  props: {
    disabled: { type: Boolean, default: false },
    label: { type: String, default: 'Вставка значения' },
    hint: { type: String, default: '' },
  },
  data() {
    return {
      insertedValue: '',
    };
  },
  methods: {
    insertValue() {
      if (this.insertedValue !== '' && !this.disabled) {
        this.$emit('myEvent', this.insertedValue);
        this.insertedValue = '';
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
