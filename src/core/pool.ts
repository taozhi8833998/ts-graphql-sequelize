import { generateHash } from '../common/utils'

const pools = new Map()

const get = (...info: any[]) => {
  const key = generateHash(info)
  return pools.get(key)
}
const add = (con: any , ...info: any[]) => {
  const key = generateHash(info)
  pools.set(key, con)
}
const remove = (...info: any[]) => {
  const key = generateHash(info)
  return pools.delete(key)
}

export {
  add,
  get,
  remove,
}
