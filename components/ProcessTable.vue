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
            <th>Close Command</th>
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
             <td>
              <v-chip
                :disabled="!process.alive"
                @click="onClickClose(process)"
              >
                Close
              </v-chip>
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>

    <KillCommandDialog
      :opendialog.sync="openKillCommandDlg"
      :errormessage.sync="errorMessage"
      :hostname="hostname"
      :servername="select.serverName"
      @onkillcommand="onKillCommand"
    />
    <ErrorSnackBar :text="errorMessage" :show="errorMessage !== ''"/>
  </td>
</template>

<script lang="ts">
import Vue from 'vue'
import { vxm } from '~/store'
import { ServerProcessInfo } from '~/store/ServerProcess'
import { IServerProcessInfo } from '~/interface/ServerProcess'
import socket from '~/plugins/socket.io'

export default Vue.extend({
  props: {
    hostname: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      openKillCommandDlg: false,
      select: {
        serverName: '',
      },
      errorMessage: ''
    }
  },
  computed: {
    processes(): ServerProcessInfo[] {
      return vxm.process.processByHost(this.hostname)
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
    aliveColor(isAlive: boolean) {
      return isAlive ? 'green' : 'red'
    },
    aliveText(isAlive: boolean) {
      return isAlive ? 'Running' : 'Dead'
    },
    onServerInfo(message: string) {
      const serverInfo = JSON.parse(message) as IServerProcessInfo
      vxm.process.onUpdate(serverInfo)
    },
    onClickClose(item: ServerProcessInfo) {
      this.select.serverName = item.serverName
      this.openKillCommandDlg = true
    },
    onKillCommand(command: string) {
      try {
        vxm.process.killCommand({
          hostName: this.hostname,
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
    }
  },
})
</script>
