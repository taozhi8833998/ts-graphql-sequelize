import * as crypto from 'crypto'
import * as express from 'express'
import * as jwt from 'jsonwebtoken'
import * as Sequelize from 'sequelize'
import etc from '../etc'

const SECRET_KEY = etc.SECRET_KEY
const IV_LENGTH = 16
const PLAIN_ENCODING = etc.plain_encoding
const CIPHER_ENCODING = etc.cipher_encoding
const ENCRYPT_ALGORITHM = etc.encrypt_algorithm
const {
  secret,
  expiresIn,
} = etc.jwt

const decodeToken = (token: string) => jwt.verify(token, secret)

const generateToken = (user: {id: number, email: string, name: string}) => {
  const { id, email, name } = user
  return jwt.sign({ id, email, name }, secret, { expiresIn })
}

const getKey = (info: any) => {
  if (typeof info !== 'object') return crypto.createHash('md5').update(info).digest('hex')
  const arrayKey = (element: any[]) => crypto.createHash('md5').update(element.join('_')).digest('hex')
  if (Array.isArray(info)) return arrayKey(info)
  const infoArray = []
  for (const key of Object.keys(info).sort()) {
    infoArray.push(`${key}_${info[key]}`)
  }
  return arrayKey(infoArray)
}

const getValueByKeys = (keys: string[], originObj: any, defaultValue = null) => {
  return keys.reduce((obj, key) => (obj && obj[key] != null) ? obj[key] : defaultValue, originObj)
}

interface IDb {
  sequelize: Sequelize.Instance<any> | null,
  Sequelize: any,
  [name: string]: any,
}

interface IContext {
  db: IDb,
  req: express.Request,
  res: express.Response,
}

interface IUser {
  name: string,
  password: string,
}

const parseJSON = (data: string, defaultValue = {}) => {
  try {
    return JSON.parse(data)
  } catch (e) {
    return defaultValue
  }
}

const wrapError = (error: Error) => ({ error, isError: true })

export {
  decodeToken,
  generateToken,
  getKey,
  IContext,
  IDb,
  IUser,
  getValueByKeys,
  parseJSON,
  wrapError,
}
