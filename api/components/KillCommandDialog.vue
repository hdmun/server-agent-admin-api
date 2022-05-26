<template>
  <v-container>
    <v-dialog v-model="open" persistent max-width="290">
      <v-card>
        <v-card-title class="text-h5"> 서버 프로세스 종료 </v-card-title>
        <v-card-text>
          {{ hostname }} {{ servername }} 서버로 종료 커맨드를 전송합니다.
        </v-card-text>
        <v-card-text>
          <v-radio-group v-model="selectCommand">
            <v-radio
              v-for="command in killCommands"
              :key="command.value"
              :label="command.text"
              :value="command.value"
            />
          </v-radio-group>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="green darken-1" text @click="open = false">
            Cancel
          </v-btn>
          <v-btn color="green darken-1" text @click="onClickOK()"> OK </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>


<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    opendialog: {
      type: Boolean,
      required: true,
    },
    errormessage: {
      type: String,
      default: '',
    },
    hostname: {
      type: String,
      required: true,
    },
    servername: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      killCommands: [
        { text: '전체 강제종료', value: 'killAll' },
        { text: '전체 종료', value: 'closeAll' },
        { text: '강제 종료', value: 'kill' },
        { text: '종료', value: 'close' },
      ],
      selectCommand: '',
    }
  },
  computed:{
    open: {
      get (): boolean {
        return this.opendialog
      },
      set (value: boolean) {
         this.$emit('update:opendialog', value)
      }
    },
    errorMessage: {
      get (): string {
        return this.errormessage
      },
      set (value: string) {
         this.$emit('update:errormessage', value)
      }
    },
  },
  methods: {
    onClickOK() {
      if (this.selectCommand === '') {
        this.errorMessage = '선택된 커맨드가 없습니다.'
        this.open = false
        return
      }

      if (this.servername === '') {
        this.errorMessage = '선택된 서버가 없습니다.'
        this.open = false
        return
      }

      this.$emit('onkillcommand', this.selectCommand)
      this.open = false
    },
  },
})
</script>
