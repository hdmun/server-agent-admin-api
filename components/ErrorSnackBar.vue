<template>
  <div class="text-center">
    <v-snackbar
      :value="show"
      :multi-line="multiLine"
      :timeout="timeout"
      tile
      color="red accent-2"
    >
      {{ text }}

      <template #action="{ attrs }">
        <v-btn
          color="black"
          text
          v-bind="attrs"
          @click="$emit('update:show', false)"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    text: {
      type: String,
      default: ''
    },
    show: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    multiLine: true,
    timeout: 2000,
  }),
})
</script>