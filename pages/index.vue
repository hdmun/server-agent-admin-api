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
          :color="colorForMonitoring(item.hostName)"
        >
          {{ textForMonitoring(item.monitoring) }}
        </v-chip>
      </template>

      <template #[`item.alive`]="{ item }">
        <v-chip
          :color="colorForAliveAck(item.alive)"
        >
          {{ item.aliveAckText }}
        </v-chip>
      </template>
    </v-data-table>
  </v-card>
</template>

<script lang="ts">
import { Context } from '@nuxt/types'
import Vue from 'vue'

import { IHostServerInfo } from '~/interface/hostServer'
import socket from '~/plugins/socket.io'
import { hostServerStore } from '~/store'

export default Vue.extend({
  asyncData(_context: Context) {
    return {}
  },
  data() {
    return {
      headers: [
        { text: 'HostName', value: 'hostName' },
        { text: 'Address', value: 'ipAddr' },
        { text: 'Monitoring', value: 'monitoring' },
        { text: 'AliveAck', value: 'alive' },
      ],
      selected: []
    }
  },
  computed: {
    hostServers() {
      return hostServerStore.serverList
    }
  },
  beforeDestroy() {
    socket.off('HostInfo', this.onHostInfo)
  },
  mounted() {
    socket.on('HostInfo', this.onHostInfo)
    hostServerStore.loadServers()
  },
  methods: {
    onHostInfo(message: string) {
      const hostServer = JSON.parse(message) as IHostServerInfo
      hostServerStore.onAliveAck(hostServer)
    },
    colorForMonitoring(hostName: string) {
      return hostServerStore.colorMonitoring(hostName)
    },
    textForMonitoring(on?: boolean): string {
      return on ? 'ON' : 'OFF'
    },
    colorForAliveAck(hostName: string) {
      return hostServerStore.colorAliveAck(hostName)
    },
  }
})
</script>
 