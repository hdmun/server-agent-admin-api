import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import HostServerStore from '~/store/hostServer'

let hostServerStore: HostServerStore

function initialiseStores(store: Store<any>): void {
    hostServerStore = getModule(HostServerStore, store)
}

export {
    initialiseStores,
    hostServerStore
}
