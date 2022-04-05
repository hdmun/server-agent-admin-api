import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import HostServerStore from '~/store/HostServer'
import ServerProcessStore from '~/store/ServerProcess'

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
