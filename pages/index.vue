<template>
  <v-card>
    <v-card-title>
      호스트 머신
      <v-spacer></v-spacer>
    </v-card-title>
    <v-data-table
      v-model="selected"
      :headers="headers"
      :items="hostServers"
      show-select
      class="elevation-1"
    >
      <template #[`item.monitoring`]="{ item }">
        <v-chip
          :color="getColor(item.monitoring)"
        >
          {{ getTextMonitoring(item.monitoring) }}
        </v-chip>
      </template>

      <template #[`item.alive`]="{ item }">
        <v-chip
          :color="getColor(item.alive)"
        >
          {{ getTextAlive(item.alive) }}
        </v-chip>
      </template>
    </v-data-table>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { IHostServer } from '~/interface/hostServer'

export default Vue.extend({
  async asyncData({ $axios }) {
    try {
      const response = await $axios.get<IHostServer[]>(`/api/servers`)
      return {
        hostServers: response.data
      }
    } catch (error) {
      return {}
    }
  },
  data() {
    return {
      headers: [
        { text: 'HostName', value: 'hostName' },
        { text: 'Address', value: 'ipAddr' },
        { text: 'Monitoring', value: 'monitoring' },
        { text: 'Alive', value: 'alive' },
      ],
      hostServers: [] as IHostServer[],
      selected: []
    }
  },
  created() {},
  methods: {
    getColor(on?: boolean): string {
      return on ? 'green' : 'red'
    },
    getTextMonitoring(on?: boolean): string {
      return on ? 'ON' : 'OFF'
    },
    getTextAlive(on?: boolean): string {
      return on ? '연결중' : '연결 안됨'
    }
  }
})
</script>
