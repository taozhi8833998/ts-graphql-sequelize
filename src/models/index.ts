import * as fs from 'fs'
import * as path from 'path'
import * as Sequelize from 'sequelize'
import { IDb } from '../common/interfaces'
import { createLog } from '../common/log'
import { getConnect } from '../core/connector'
import etc from '../etc'

const log = createLog('model')
const BASE_NAME = path.basename(__filename)
const db: IDb = {
  Sequelize,
  sequelize: null,
}

const sequelize = getConnect(etc.mysql)
fs.readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== BASE_NAME) && (file.endsWith('.model.js')))
  .forEach((file: string) => {
    const model = sequelize.import(path.join(__dirname, file))
    db[model.name] = model
  })

Object.keys(db).forEach((modelName: string) => {
  const associate = db[modelName] && db[modelName].associate
  if (associate && typeof associate === 'function') Reflect.apply(associate, null, [db])
})

sequelize.sync()
  .then(() => log.info('====init model successfully===='))
  .catch((err: Error) => log.error('init model failed = %o', err))

db.sequelize = sequelize

export default db
