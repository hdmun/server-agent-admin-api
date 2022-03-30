<template>
  <v-card>
    <v-card-title>
      서버 프로세스
      <v-spacer></v-spacer>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="processes"
      class="elevation-1"
    >
      <template #[`item.alive`]="{ item }">
        <v-chip
          :color="aliveColor(item.alive)"
        >
          {{ aliveText(item.alive) }}
        </v-chip>
      </template>
    </v-data-table>

    <ErrorSnackBar :text="errorMessage" :show="errorMessage !== ''"/>
  </v-card>
</template>

<script lang="ts">
import { Context } from '@nuxt/types'
import Vue from 'vue'

import ErrorSnackBar from '@/components/ErrorSnackBar.vue'

import { IServerProcessInfo } from '~/interface/serverProcess'
import socket from '~/plugins/socket.io'
import { serverProcessStore } from '~/store'
import { ServerProcessInfo } from '~/store/serverProcess'

export default Vue.extend({
  components: {
    ErrorSnackBar,
  },
  asyncData(_context: Context) {
    return {}
  },
  data() {
    return {
      headers: [
        { text: 'HostName', value: 'hostName' },
        { text: 'Server', value: 'serverName' },
        { text: 'Process', value: 'processName' },
        { text: 'Processing Time (sec)', value: 'processingTime' },
        { text: 'ThreadId', value: 'threadId' },
        { text: '마지막 응답 시간', value: 'receiveTime' },
        { text: 'Alive', value: 'alive' },
      ],
      errorMessage: '',
      timerHandle: undefined as number | undefined
    }
  },
  computed: {
    processes(): ServerProcessInfo[] {
      return serverProcessStore.processAll
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
