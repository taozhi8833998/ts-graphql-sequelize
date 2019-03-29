import { ApolloServer, gql } from 'apollo-server-express'
import * as bodyParser from 'body-parser'
import * as Boom from 'boom'
import * as cookieParser from 'cookie-parser'
import * as cors from 'cors'
import * as express from 'express'
import { GraphQLError, GraphQLFormattedError } from 'graphql'
import * as helmet from 'helmet'
import * as httpProxyMiddleware from 'http-proxy-middleware'
import * as jwt from 'jsonwebtoken'
import * as path from 'path'
import * as serveFavicon from 'serve-favicon'
import { createLog, logMiddleware } from '../common/log'
import * as utils from '../common/utils'
import { findHostByAppName } from '../core/redis'
import acl from '../ctrl/acl'
import router from '../ctrl/router'
import etc from '../etc'
import models from '../models'
import resolvers from '../resolvers'
import schemas from '../schemas'

const db = models
const app = express()
const routers = router(express.Router())
const log = createLog('app')
const corsOptions = {
  credentials: true,
  origin: 'http://localhost:3000',
}
const ttyOptions = {
  pathRewrite: {
    '^\/(.*)auth_token.js$': '/auth_token.js',
    '^\/(.*)ws$': '/ws',
  },
  router(req: any) {
    return `${req.__target__}:2222`
  },
  target: 'http://127.0.0.1:2222',
  // ws: true, // proxy websockets
}
// create the proxy (without context)
const ttyProxy = httpProxyMiddleware(ttyOptions)

app.disable('x-powered-by')
app.use(helmet())
app.use('/admin', express.static(path.join(etc.public, 'backend')))
app.use('/frontend', express.static(path.join(etc.public, 'frontend')))
app.use(express.static(path.join(etc.public, 'frontend')))
app.use(express.static(path.join(etc.public, 'backend')))
app.use(serveFavicon(path.join(etc.public, 'favicon.ico')))
app.get('/state.health', (req, res) => {
  res.status(200).json({ isError: false, data: 'OK' })
})
app.use(cors())
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.options(['/graphql'], (req, res) => {
  res.set({
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Headers': 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Access-Control-Allow-Origin': 'http://localhost:3000',
  })
  res.status(200).end()
})
// disable jwt currently

// app.use(async (req, res, next) => {
//   if (/^\/v\d+\/ganjiang.*$/.test(req.path)) return next()
//   const { token } = req.cookies
//   try {
//     const decode = await jwt.verify(token, etc.jwt.secret);
//     (req as any).user = decode
//     next()
//   } catch (e) {
//     (req as any).user = undefined
//     const error = Boom.unauthorized('token has expired, please refresh')
//     res.status(500).json(utils.wrapError(error))
//   }
// })
app.use(/^\/(.+)\/(.+)\/(?!(tty|ttyws|auth_token.js)).*$/, acl())
app.use(logMiddleware('access'))
app.use(['/:appType/:appName/tty', '/:appType/:appName/auth_token.js'], async (req, res, next) => {
  const { appType, appName } = req.params
  try {
    (req as any).__target__ = await findHostByAppName(appType, appName)
    next()
  } catch (error) {
    log.error('get app failed = ', error)
    return res.status(error.statusCode || 500).json({ isError: true, error })
  }
})

app.use(['/:appType/:appName/tty', '/:appType/:appName/auth_token.js'], ttyProxy)
app.use(routers)
const server = new ApolloServer({
  context({ req, res }: { req: express.Request, res: express.Response }) {
    return {
      db,
      etc,
      req,
      res,
    }
  },
  formatError(error: GraphQLError): GraphQLFormattedError {
    log.error('GraphQL Error = %s', JSON.stringify(error, null, 2))
    return { message: error.message } as GraphQLFormattedError
  },
  resolvers,
  typeDefs: gql(schemas),
})
server.applyMiddleware({ app, cors: corsOptions })
app.use((error: Error | Boom, req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.status(500).json(utils.wrapError(error))
})

app.use((_, res: express.Response) => {
  const error = Boom.notFound('Router NOT FOUND')
  return res.status(error.output.statusCode).json(utils.wrapError(error))
})

const expressServer = app.listen(etc.http_port, etc.bind_host || '0.0.0.0', (err: Error) => {
  if (err) log.error('Server started failed: %o', err)
  const host = etc.bind_host || '0.0.0.0'
  const port = etc.http_port
  if (etc.bind_host) {
    log.info(`Server running locally. Connect to http://${host}:${port}`)
  } else {
    log.info(`Server running publicly. Connect to http://${host}:${port}`)
  }
})

expressServer.on('upgrade', async (req, socket, head) => {
  const matches = req.url.split('/')
  log.info(`upgrade to ws for ${req.url}, the matches = ${matches}`)
  if (!matches || matches.length < 3) {
    return log.error(`do not find the app name for ${req.url}`)
  }
  const appType = matches[1]
  const appName = matches[2]
  req.__target__ = await findHostByAppName(appType, appName)
  if (matches[3] === 'ttyws' || matches[3] === 'tty') return (ttyProxy as any).upgrade(req, socket, head)
})
