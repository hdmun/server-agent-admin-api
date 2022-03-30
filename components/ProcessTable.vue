<template>
  <td :colspan="6">
    <v-simple-table>
      <template #default>
        <thead>
          <tr>
            <th>Process</th>
            <th>Server</th>
            <th>ProcessingTime(sec)</th>
            <th>ThreadId</th>
            <th>마지막 응답 시간</th>
            <th>Alive</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="process in processes"
            :key="process.serverName"
          >
            <td>{{ process.processName }}</td>
            <td>{{ process.serverName}}</td>
            <td>{{ process.processingTime}}</td>
            <td>{{ process.threadId}}</td>
            <td>{{ process.receiveTime}}</td>
            <td>
              <v-chip
                :color="aliveColor(process.alive)"
              >
                {{ aliveText(process.alive) }}
              </v-chip>
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </td>
</template>

<script lang="ts">
import Vue from 'vue'
import { ServerProcessInfo } from '@/store/serverProcess'
import { serverProcessStore } from '~/store'
import { IServerProcessInfo } from '~/interface/serverProcess'
import socket from '~/plugins/socket.io'

export default Vue.extend({
  props: {
    hostname: {
      type: String,
      required: true
    },
  },
  data() {
    return {}
  },
  computed: {
    processes(): ServerProcessInfo[] {
      return serverProcessStore.processByHost(this.hostname)
    }
  },
  beforeDestroy() {
    socket.off('ServerInfo', this.onServerInfo)
  },
  mounted() {
    socket.on('ServerInfo', this.onServerInfo)
    serverProcessStore.loadProcess()
  },
  methods: {
    onServerInfo(message: string) {
      const serverInfo = JSON.parse(message) as IServerProcessInfo
      serverProcessStore.onUpdate(serverInfo)
    },
    aliveColor(isAlive: boolean) {
      return isAlive ? 'green' : 'red'
    },
    aliveText(isAlive: boolean) {
      return isAlive ? 'Running' : 'Dead'
    }
  }
})
</script>
