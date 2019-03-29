import * as Redis from 'ioredis'
import { IRedisPrefix } from '../common/interfaces'
import { createLog } from '../common/log'
import { REDIS_PREFIX_MAP } from '../common/utils'
import etc from '../etc'

const log = createLog('redis_cluster')
const client = new Redis(etc.redis)
let ready = false

client.on('error', (err: Error) => {
  ready = false
  log.error('redis client got the error = ', err)
})
client.on('connect', () => {
  log.info('redis cluster connected')
})
client.on('ready', () => {
  ready = true
  log.info('redis cluster is ready for receiving commands')
})
client.on('+node', (node) => {
  log.info(`new node connected to cluster, and the node is ${node}`)
})
client.on('-node', (node) => {
  log.info(`a node is disconnected from cluster, and the node is ${node}`)
})
client.on('node error', (err, node) => {
  log.error(`cluster connectd to node ${node} failed with error ${err}`)
})

const getReady = () => ready

const findHostByAppName = async (appMode: keyof IRedisPrefix, appName: string) => {
  try {
    const host = await client.get(`${REDIS_PREFIX_MAP[appMode]}${appName}`)
    if (!host) log.error(`could not find host for ${appMode}-${appName}`)
    return `http://${host}`
  } catch (err) {
    log.error(`get ${appMode}-${appName} failed = `, err)
    return
  }
}

const registeApptoCenter = (appName: string, ip: string) => client.set(`${REDIS_PREFIX_MAP.devtool}${appName}`, ip)

const deRegisteAppFromCenter = (appName: string) => client.del(`${REDIS_PREFIX_MAP.devtool}${appName}`)

export {
  client,
  deRegisteAppFromCenter,
  findHostByAppName,
  getReady,
  registeApptoCenter,
}
