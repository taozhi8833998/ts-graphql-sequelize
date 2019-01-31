import { ApolloServer } from 'apollo-server-express'
import * as bodyParser from 'body-parser'
import * as Boom from 'boom'
import * as cookieParser from 'cookie-parser'
import * as cors from 'cors'
import * as express from 'express'
import * as helmet from 'helmet'
import * as path from 'path'
import * as serveFavicon from 'serve-favicon'
import { createLog } from '../common/log'
import * as utils from '../common/utils'
import etc from '../etc'
import * as db from '../models'
import * as resolvers from '../resolvers'
import * as typeDefs from '../schemes'

const app = express()
const log = createLog('app')
const corsOptions = {
  credentials: true,
  origin: 'http://localhost:3000',
}

app.disable('x-powered-by')
app.use(helmet())
app.use('/admin', express.static(path.join(etc.public, 'backend')))
app.use('/qinglan', express.static(path.join(etc.public, 'frontend')))
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
// app.use(logMiddleware('access'))
app.options(['/graphql', '/upload'], (req, res) => {
  res.set({
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Headers': 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Access-Control-Allow-Origin': 'http://localhost:3000',
  })
  res.status(200).end()
})

// app.use(async (req, res, next) => {
//   const { token } = req.cookies
//   try {
//     const decode = await decodeToken(token)
//     req.user = decode
//     next()
//   } catch (e) {
//     req.user = undefined
//     res
        // .status(500)
        // .json({ isError: true, error: helper.makeError('LOGIN_EXPIRE_ERROR', 'login expired, please relogin') })
//   }
// })
// app.use(acl())

const server = new ApolloServer({
  context({ req, res }: { req: express.Request, res: express.Response }) {
    return {
      db,
      etc,
      req,
      res,
    }
  },
  formatError(error: Error) {
    log.error('GraphQL Error = ', JSON.stringify(error, null, 2))
    return { message: error.message }
  },
  resolvers,
  typeDefs,

})
server.applyMiddleware({ app, cors: corsOptions })
app.use((error: Error | Boom, req: express.Request, res: express.Response) => {
  res.status(500).json(utils.wrapError(error))
})

app.use((_, res: express.Response) => {
  const error = Boom.notFound('Router NOT FOUND')
  return res.status(error.output.statusCode).json(utils.wrapError(error))
})

app.listen(etc.http_port, etc.bind_host || '0.0.0.0', (err: Error) => {
  if (err) log.error('Server started failed')
  const host = etc.bind_host || '0.0.0.0'
  const port = etc.http_port
  if (etc.bind_host) {
    log.info(`Server running locally. Connect to http://${host}:${port}`)
  } else {
    log.info(`Server running publicly. Connect to http://${host}:${port}`)
  }
})
