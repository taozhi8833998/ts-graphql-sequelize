import { readFileSync } from 'fs'
import { safeLoad } from 'js-yaml'
import * as _ from 'lodash'
import { join } from 'path'

const defaultPath: string = join(__dirname, '../etc/config.default.yaml')
const defaultEtc: string = safeLoad(readFileSync(defaultPath, 'utf8'))
const envPath: string = join(__dirname, '/../etc/config.yaml')

const getEnvCfg: () => object = () => {
  try {
    const fileContent: string = readFileSync(envPath, 'utf8')
    return safeLoad(fileContent)
  } catch (err) {
    // log.error('got env config failed = ', err)
    return {}
  }
}

const getRuntimeEnv: () => object = () => {
  try {
    const runtimeCfg: string = process.env.RUNTIME_CFG || '{}'
    return runtimeCfg && JSON.parse(runtimeCfg)
  } catch (err) {
    // log.error('got process runtime config failed = ', err)
    return {}
  }
}

const etc: object = _.merge({}, defaultEtc, getEnvCfg(), getRuntimeEnv())

export default etc
