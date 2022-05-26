<template>
  <div class="text-center">
    <v-dialog
      v-model="show"
      hide-overlay
      persistent
      width="300"
    >
      <v-card
        color="primary"
        dark
      >
        <v-card-text>
          {{ message }}
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    message: {
      type: String,
      default: ''
    },
    open: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({}),
  computed: {
    show: {
      get (): boolean {
        return this.open
      },
      set (value: boolean) {
         this.$emit('update:open', value)
      }
    }
  }
})
</script>