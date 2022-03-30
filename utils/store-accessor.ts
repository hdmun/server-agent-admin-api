import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import HostServerStore from '~/store/hostServer'
import ServerProcessStore from '~/store/serverProcess'

let hostServerStore: HostServerStore
let serverProcessStore: ServerProcessStore

function initialiseStores(store: Store<any>): void {
    hostServerStore = getModule(HostServerStore, store)
    serverProcessStore = getModule(ServerProcessStore, store)
}

export {
    initialiseStores,
    hostServerStore,
    serverProcessStore
}
