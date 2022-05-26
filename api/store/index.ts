import { Store } from 'vuex'
import { createProxy, extractVuexModule } from "vuex-class-component"

import HostServerStore from './HostServer'
import ServerProcessStore from './ServerProcess'

export const store = new Store({
  modules: {
    ...extractVuexModule( HostServerStore ),
    ...extractVuexModule( ServerProcessStore )
  }
})

// Creating proxies.
export const vxm = {
  host: createProxy( store, HostServerStore ),
  process: createProxy( store, ServerProcessStore ),
}


export function diffPerSec(before: Date, after: Date) {
  const diffInMs = Math.abs(after.getTime() - before.getTime());
  return Math.floor(diffInMs / 1000);
}
