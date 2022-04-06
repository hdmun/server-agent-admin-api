<template>
  <v-card>
    <v-card-title>
      서버 프로세스
      <v-spacer></v-spacer>
    </v-card-title>
    <v-data-table :headers="headers" :items="processes" class="elevation-1">
      <template #[`item.alive`]="{ item }">
        <v-chip :color="aliveColor(item.alive)">
          {{ aliveText(item.alive) }}
        </v-chip>
      </template>

      <template #[`item.command`]="{ item }">
        <v-chip
          :disabled="!item.alive"
          @click="onClickClose"
        >
          Close
        </v-chip>
      </template>
    </v-data-table>

    <KillCommandDialog
      :opendialog="openKillCommandDlg"
      :hostname="select.hostName"
      :servername="select.serverName"
      @onkillcommand="onKillCommand"
    />
    <ErrorSnackBar :text="errorMessage" :show="errorMessage !== ''" />
  </v-card>
</template>


<script lang="ts">
import { Context } from '@nuxt/types'
import Vue from 'vue'

import ErrorSnackBar from '@/components/ErrorSnackBar.vue'
import KillCommandDialog from '@/components/KillCommandDialog.vue'

import { IServerProcessInfo } from '~/interface/ServerProcess'
import socket from '~/plugins/socket.io'
import { vxm } from '~/store'
import { ServerProcessInfo } from '~/store/ServerProcess'

export default Vue.extend({
  components: {
    ErrorSnackBar,
    KillCommandDialog,
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
        { text: 'Close Command', value: 'command' },
      ],
      errorMessage: '',
      timerHandle: undefined as number | undefined,
      openKillCommandDlg: false,
      select: {
        hostName: '',
        serverName: '',
      },
    }
  },
  computed: {
    processes(): ServerProcessInfo[] {
      return vxm.process.processAll
    },
  },
  beforeDestroy() {
    socket.off('ServerInfo', this.onServerInfo)
  },
  mounted() {
    socket.on('ServerInfo', this.onServerInfo)
    vxm.process.loadProcess()
  },
  methods: {
    onServerInfo(message: string) {
      const serverInfo = JSON.parse(message) as IServerProcessInfo
      vxm.process.onUpdate(serverInfo)
    },
    aliveColor(isAlive: boolean) {
      return isAlive ? 'green' : 'red'
    },
    aliveText(isAlive: boolean) {
      return isAlive ? 'Running' : 'Dead'
    },
    onClickClose(item: ServerProcessInfo) {
      this.select.hostName = item.hostName
      this.select.serverName = item.serverName
      this.openKillCommandDlg = true
    },
    onKillCommand(command: string) {
      try {
        vxm.process.killCommand({
          hostName: this.select.hostName,
          killCommand: command,
          serverName: this.select.serverName,
        })
      } catch (error) {
        let message = ''
        if (error instanceof Error) message = error.message
        else message = String(error)

        this.errorMessage = message
      }
      this.openKillCommandDlg = false
    },
  },
})
</script>
