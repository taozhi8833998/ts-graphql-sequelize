import chalk from 'chalk'
import * as express from 'express'
import * as mo from 'moment'
import * as winston from 'winston'
import etc from '../etc'

const logs: { [name: string]: winston.Logger } = {}
const {
  log_levels,
  log_stdio,
  log_folder,
} = etc as any

const colorful = (str: string) => {
  if (!log_stdio) return str
  const red = Math.floor(Math.random() * 255)
  const green = Math.floor(Math.random() * 255)
  const blue = Math.floor(Math.random() * 255)
  return chalk.rgb(red, green, blue)(str)
}

const myFormat = (name: string) => winston.format.printf(
  info => `${mo(info.timestamp).format('YYYY-MM-DD HH:mm:ss')} ${colorful(name)} -- ${info.level}: ${info.message}`)

const createConsoleLog = (name: string) => {
  const level = 'debug'
  const transport = new winston.transports.Console()
  const format = winston.format.combine(
    winston.format.timestamp(),
    winston.format.splat(),
    winston.format.simple(),
    winston.format.colorize(),
    myFormat(name),
  )
  return { level, transport, format }
}

const createFileLog = (name: string) => {
  const level = 'info'
  const transport = new (winston.transports as any).DailyRotateFile({
    datePattern: 'YYYY-MM-DD',
    dirname: log_folder,
    filename: `${name}-%DATE%.log`,
    maxFiles: 3,
    maxsize: 256,
    zippedArchive: true,
  })
  const format = winston.format.combine(
    winston.format.timestamp(),
    winston.format.splat(),
    winston.format.simple(),
    myFormat(name),
  )
  return { level, transport, format }
}

const createLog = (name: string) => {
  if (logs[name]) return logs[name]
  const { format, level, transport } = log_stdio &&
   createConsoleLog(name) || createFileLog(name)
  const opt = {
    format,
    level,
    transports: [
      transport,
    ],
  }
  logs[name] = winston.createLogger(opt)
  return logs[name]
}

const logMiddleware = (name: string) => {
  const log = createLog(name)
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const start = Date.now()
    const logAccess = () => {
      const useTime = Date.now() - start
      const realIp = req.headers['x-real-ip']
      let forwardIp = req.headers['x-forwarded-for']
      if (forwardIp) forwardIp = Array.isArray(forwardIp) ? forwardIp[0] : forwardIp.split(',').pop()
      const socketIp = (req.socket && req.socket.remoteAddress) || (req.connection && req.connection.remoteAddress)
      const ip = realIp || forwardIp || req.ip || socketIp
      const method = req.method
      const url = req.originalUrl || req.url
      const referer = req.headers.referer || req.headers.refferer || '-'
      const userAgent = req.headers['User-Agent'] || '-'
      const status = res.statusCode
      const body = JSON.stringify(req.body) || ''
      const part = `\"${method} ${url}\" ${status} ${useTime} \"${referer}\" \"${userAgent}\"`
      const info = `${ip} ${process.pid} ${part} \"${body}\"`
      log.info(info)
    }
    res.on('close', logAccess)
    res.on('finish', logAccess)
    next()
  }
}

export {
  createLog,
  logMiddleware,
}
