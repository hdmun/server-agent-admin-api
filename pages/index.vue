/* eslint-disable no-console */
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
          :disabled="!isAliveHost(item.hostName)"
          @click="onShowConfirmMonitoring(item)"
        >
          {{ textForMonitoring(item) }}
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

    <v-dialog
      v-model="dialog.show"
      persistent
      max-width="290"
      >
      <v-card>
        <v-card-title class="text-h5">
          Monitoring
        </v-card-title>
        <v-card-text>
          {{ dialog.selected?.hostName }}의 Monitoring 상태를 `{{ textForMonitoring(dialog.selected) }}`으로 변경합니다.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            text
            @click="closeConfirmMonitoring()"
          >
            Cancel
          </v-btn>
          <v-btn
            color="green darken-1"
            text
            @click="onSetMonitoring(dialog.selected)"
          >
            OK
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <ErrorSnackBar :text="errorMessage" :show="errorMessage !== ''"/>
  </v-card>
</template>

<script lang="ts">
import { Context } from '@nuxt/types'
import Vue from 'vue'

import ErrorSnackBar from '@/components/ErrorSnackBar.vue'
import { IHostServerInfo } from '~/interface/hostServer'
import socket from '~/plugins/socket.io'
import { hostServerStore } from '~/store'

export default Vue.extend({
  components: {
    ErrorSnackBar
  },
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
      selected: [],
      dialog: {
        show: false,
        selected: undefined as IHostServerInfo | undefined
      },
      errorMessage: '',
      timerHandle: undefined as number | undefined
    }
  },
  computed: {
    hostServers() {
      return hostServerStore.serverList
    },
    isAliveHost() {
      return (hostName: string) => {
        return hostServerStore.isAliveHost(hostName)
      }
    },
  },
  beforeDestroy() {
    socket.off('HostInfo', this.onHostInfo)
    window.clearInterval(this.timerHandle)
  },
  mounted() {
    socket.on('HostInfo', this.onHostInfo)
    hostServerStore.loadServers()
    this.timerHandle = window.setInterval(() => {
      hostServerStore.updateHostStatus()
    }, 1000)
  },
  methods: {
    onHostInfo(message: string) {
      const hostServer = JSON.parse(message) as IHostServerInfo
      hostServerStore.onAliveAck(hostServer)
    },
    colorForMonitoring(hostName: string) {
      return hostServerStore.colorMonitoring(hostName)
    },
    textForMonitoring(hostInfo?: IHostServerInfo): string {
      return hostInfo?.monitoring ? 'ON' : 'OFF'
    },
    colorForAliveAck(hostName: string) {
      return hostServerStore.colorAliveAck(hostName)
    },
    onShowConfirmMonitoring(selected: IHostServerInfo) {
      this.dialog = {
        show: true,
        selected: {
          hostName: selected.hostName,
          monitoring: !selected.monitoring
        }
      }
    },
    closeConfirmMonitoring() {
      this.dialog = {
        show: false,
        selected: undefined
      }
    },
    async onSetMonitoring() {
      if (this.dialog.selected === undefined) {
        this.closeConfirmMonitoring()
        return
      }

      try {
        await hostServerStore.setMonitoring(this.dialog.selected)
      }
      catch (error) {
        let message = ''
        if (error instanceof Error) message = error.message
        else message = String(error)

        this.errorMessage = message
        console.log(message)
      }
      finally {
        this.closeConfirmMonitoring()
      }
    },
  }
})
</script>
 