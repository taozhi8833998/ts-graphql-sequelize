import * as mo from 'moment'
import * as winston from 'winston'
import etc from '../etc'

const logs: { [name: string]: winston.Logger } = {}
const {
  log_levels,
  log_stdio,
  log_folder,
} = etc as any

const myFormat = winston.format.printf(
  info => `${mo(info.timestamp).format('YYYY-MM-DD HH:mm:ss')} ${info.level}: ${info.message}`)

const createConsoleLog = (name: string) => {
  const levels = log_levels
  const transport = new winston.transports.Console()
  const format = winston.format.combine(
    winston.format.timestamp(),
    winston.format.splat(),
    winston.format.simple(),
    winston.format.colorize(),
    myFormat,
  )
  return { levels, transport, format }
}

const createFileLog = (name: string) => {
  const levels = log_levels
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
    myFormat,
  )
  return { levels, transport, format }
}

const createLog = (name: string) => {
  if (logs[name]) return logs[name]
  const { format, levels, transport } = log_stdio &&
   createConsoleLog(name) || createFileLog(name)
  const opt = {
    format,
    levels,
    transports: [
      transport,
    ],
  }
  logs[name] = winston.createLogger(opt)
  return logs[name]
}

export { createLog }
