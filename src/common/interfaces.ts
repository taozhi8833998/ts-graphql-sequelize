import * as express from 'express'
import * as Sequelize from 'sequelize'

interface IApp {
  bucket?: string,
  language: string
  name: string,
  template?: string,
  token: string,
  type: string,
}

interface IConnInfo {
  database: string,
  dialect?: string
  host: string,
  password: string
  port?: number
  user: string,
  pool?: {
    idle?: number,
    max?: number,
    min?: number,
  }
}

interface IContext {
  db: IDb,
  req: express.Request,
  res: express.Response,
}

interface IDb {
  sequelize: Sequelize.Instance<any> | null,
  Sequelize: any,
  [name: string]: any,
}

interface IPodParams {
  app: IApp,
  imageURL: string,
  targetPort?: number,
}

interface IRedisPrefix {
  ganjiang: string,
  moye: string,
  devtool: string,
  'dev-tool': string,
}

interface IServiceParams {
  app: IApp,
  port?: number,
  sshPort?: number,
  targetPort?: number,
  type?: string
}

interface IUser {
  name: string,
  password: string,
}

export {
  IApp,
  IConnInfo,
  IContext,
  IDb,
  IPodParams,
  IRedisPrefix,
  IServiceParams,
  IUser,
}
