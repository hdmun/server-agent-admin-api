import { Store } from 'vuex'
import { initialiseStores } from '~/utils/store-accessor'

const initializer = (store: Store<any>) => initialiseStores(store)


export function diffPerSec(before: Date, after: Date) {
  const diffInMs = Math.abs(after.getTime() - before.getTime());
  return Math.floor(diffInMs / 1000);
}


export const plugins = [initializer]
export * from '~/utils/store-accessor'
