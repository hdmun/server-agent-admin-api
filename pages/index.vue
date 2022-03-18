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
          {{ item.aliveAckText }}
        </v-chip>
      </template>
    </v-data-table>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { IHostServer } from '~/interface/hostServer'
import socket from '~/plugins/socket.io'


export default Vue.extend({
  async asyncData({ $axios }) {
    try {
      const response = await $axios.get<IHostServer[]>(`/api/servers`)
      return {
        hostServers: response.data.map((value) => {
          value.aliveAckText = '연결 안됨'
          return value
        })
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
        { text: 'AliveAck', value: 'alive' },
      ],
      hostServers: [] as IHostServer[],
      selected: []
    }
  },
  mounted() {
    socket.on('ServerInfo', (message) => {
      const serverInfo = JSON.parse(message)
      const filter = this.hostServers.filter((value) => {
        return serverInfo.data.hostName === value.hostName
      })

      for (const item of filter) {
        const nowdt = new Date()
        if (item.aliveAckTime === undefined) {
          item.aliveAckTime = nowdt
          continue
        }

        const lastAckTime = item.aliveAckTime
        const diffMin = this.getDifferenceInMinutes(lastAckTime, nowdt)
        const diffSec = this.getDifferenceInSeconds(lastAckTime, nowdt) % 60
        if (diffMin > 0 || diffSec > 0) {
          let aliveAckText = ''

          if (diffMin > 0) {
            aliveAckText = `${diffMin}분`
          }

          if (diffSec > 0) {
            aliveAckText += `${diffSec}초 전`
          }

          item.aliveAckText = aliveAckText
        }

        item.aliveAckTime = nowdt
      }
    })
  },
  methods: {
    getColor(on?: boolean): string {
      return on ? 'green' : 'red'
    },
    getTextMonitoring(on?: boolean): string {
      return on ? 'ON' : 'OFF'
    },
    getTextAlive(on?: boolean): string {
      return on ? '연결중' : '연결 안됨'
    },
    getDifferenceInMinutes(before: Date, after: Date) {
      const diffInMs = Math.abs(after.getTime() - before.getTime());
      return Math.floor(diffInMs / (1000 * 60));
    },
    getDifferenceInSeconds(before: Date, after: Date) {
      const diffInMs = Math.abs(after.getTime() - before.getTime());
      return Math.floor(diffInMs / 1000);
    }
  }
})
</script>
 