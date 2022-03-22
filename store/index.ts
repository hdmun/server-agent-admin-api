import Vue from 'vue'
import Vuex, { Store }from 'vuex'

import HostServerStore from '~/store/hostServer'

Vue.use(Vuex)

export interface RootState {}

export const store = new Store<RootState>({
  modules: {
    hostServer: HostServerStore,
  },
  strict: process.env.NODE_ENV !== 'production',
})
