import * as BluePromise from 'bluebird'
import { createLog } from '../common/log'

const log = createLog('handles')

const sequelizeHandle = {
  get(target: any, propKey: string, receiver: any) {
    const origMethod = Reflect.get(target, propKey, receiver)
    if (propKey !== 'query') return origMethod
    const func = async (...args: any[]) => {
      const start = Date.now()
      const result = await Reflect.apply(origMethod, target, args)
      const useTime = Date.now() - start
      log.info(`It takes ${useTime} ms to executing the sql: ${args[0]}`)
      return BluePromise.resolve(result)
    }
    return func
  },
}

export {
  sequelizeHandle,
}
