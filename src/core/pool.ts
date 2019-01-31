import { getKey } from '../common/utils'

const pools = new Map()

const get = (...info: any[]) => {
  const key = getKey(info)
  return pools.get(key)
}
const add = (con: any , ...info: any[]) => {
  const key = getKey(info)
  pools.set(key, con)
}
const remove = (...info: any[]) => {
  const key = getKey(info)
  return pools.delete(key)
}

export {
  add,
  get,
  remove,
}
