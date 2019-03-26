import * as Boom from 'boom'
import * as cryptiles from 'cryptiles'
import * as express from 'express'
import { wrapError } from '../common/utils'
import etc from '../etc'

export default (token: string = etc.access_token): express.Handler => (req, res, next) => {
  let queryToken = req.headers.token
  if (Array.isArray(queryToken)) queryToken = queryToken[0]
  if (queryToken && cryptiles.fixedTimeComparison(queryToken, token)) return next()
  const err = Boom.unauthorized('TOKEN NOT MATCH')
  return res.status(401).json(wrapError(err))
}
