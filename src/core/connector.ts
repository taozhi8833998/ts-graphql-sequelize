import * as Boom from 'boom'
import * as Sequelize from 'sequelize'
import { IConnInfo } from '../common/interfaces'
import { createLog } from '../common/log'
import etc from '../etc'
import { sequelizeHandle } from './handles'
import * as conn from './pool'

const log = createLog('connector')

const getConnect = ({
  database,
  user,
  password,
  host,
  port = 3306,
  dialect = 'mysql',
  pool = {
    idle: 1000,
    max: 20,
    min: 10,
  }}: IConnInfo) => {
  let sequelize = null
  if (!database || !user || !password || !host) {
    throw new Boom(`database=${database}, user=${user}, password=${password} and host=${host} are required`)
  }
  sequelize = conn.get(database, user, password, host, port, dialect)
  if (!sequelize) {
    const logging = etc.logging && log.info || false
    sequelize = new Sequelize(database, user, password, {
      dialect,
      host,
      logging,
      pool,
      port,
      timezone: '+8:00',
    })
    const proxySequelize = new Proxy(sequelize, sequelizeHandle)
    conn.add(proxySequelize, database, user, password, host, port, dialect)
    return proxySequelize
  }
  return sequelize
}

export {
  getConnect,
}
