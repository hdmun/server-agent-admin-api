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
      :single-expand="singleExpand"
      :expanded.sync="expanded"
      item-key="hostName"
      show-expand
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
          :color="colorForAliveAck(item.hostName)"
        >
          {{ item.aliveAckText }}
        </v-chip>
      </template>

      <template #expanded-item="{ item }">
        <ProcessTable v-if="item" :hostname="item.hostName" />
      </template>
    </v-data-table>

    <v-dialog
      v-model="isAsk"
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

    <LoadingDialog :message="'waiting...'" :open="dialog.progress" />

    <ErrorSnackBar :text="errorMessage" :show="errorMessage !== ''"/>
  </v-card>
</template>

<script lang="ts">
import { Context } from '@nuxt/types'
import Vue from 'vue'

import ErrorSnackBar from '@/components/ErrorSnackBar.vue'
import LoadingDialog from '@/components/LoadingDialog.vue'
import ProcessTable from '@/components/ProcessTable.vue'

import socket from '@/plugins/socket.io'
import { vxm } from '@/store'
import { IHostServerInfo } from '~/interface/HostServer'

export default Vue.extend({
  components: {
    ErrorSnackBar,
    LoadingDialog,
    ProcessTable
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
      expanded: [],
      singleExpand: true,
      selected: [],
      dialog: {
        selected: undefined as IHostServerInfo | undefined,
        progress: false
      },
      errorMessage: '',
      timerHandle: undefined as number | undefined
    }
  },
  computed: {
    hostServers() {
      return vxm.host.serverList
    },
    isAsk(): boolean {
      return this.dialog.selected !== undefined
    },
    isAliveHost() {
      return (hostName: string) => {
        return vxm.host.isAliveHost(hostName)
      }
    },
  },
  beforeDestroy() {
    socket.off('HostInfo', this.onHostInfo)

    window.clearInterval(this.timerHandle)
  },
  mounted() {
    socket.on('HostInfo', this.onHostInfo)

    vxm.host.loadServers()
    this.timerHandle = window.setInterval(() => {
      vxm.host.updateHostStatus()
    }, 1000)
  },
  methods: {
    onHostInfo(message: string) {
      const hostServer = JSON.parse(message) as IHostServerInfo
      vxm.host.onAliveAck(hostServer)
    },
    colorForMonitoring(hostName: string) {
      return vxm.host.colorMonitoring(hostName)
    },
    textForMonitoring(hostInfo?: IHostServerInfo): string {
      return hostInfo?.monitoring ? 'ON' : 'OFF'
    },
    colorForAliveAck(hostName: string) {
      return vxm.host.colorAliveAck(hostName)
    },
    onShowConfirmMonitoring(selected: IHostServerInfo) {
      this.dialog.selected = {
        hostName: selected.hostName,
        monitoring: !selected.monitoring
      }
    },
    closeConfirmMonitoring() {
      this.dialog.selected = undefined
    },
    async onSetMonitoring() {
      const host = this.dialog.selected
      if (host === undefined) {
        this.errorMessage = '선택된 호스트 머신이 없습니다.'
        return
      }

      this.closeConfirmMonitoring()

      try {
        this.dialog.progress = true
        await vxm.host.setMonitoring(host)
      }
      catch (error) {
        let message = ''
        if (error instanceof Error) message = error.message
        else message = String(error)

        this.errorMessage = message
      }
      finally {
        this.dialog.progress = false
      }
    },
  }
})
</script>
