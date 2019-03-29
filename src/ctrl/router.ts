import * as Boom from 'boom'
import * as express from 'express'
import { IApp } from '../common/interfaces'
import { createLog } from '../common/log'
import { wrapError } from '../common/utils'
import k8sClient from './kubernetes'

const log = createLog('router')

export default (router: express.Router): express.Router => {
  router.post('/dev-tool/:appName/ganjiang/project', async (req, res) => {
    const app: IApp = req.body
    try {
      const preview = await k8sClient.createProject(app)
      res.status(200).json({
        data: {
          preview,
          ...app,
        },
        isError: false,
      })
    } catch (err) {
      log.error('create project failed = %o', err)
      const error = Boom.internal(err.message)
      res.status(error.output.statusCode || 500).json(wrapError(error))
    }
  })

  router.delete('/dev-tool/:appName/ganjiang/project', async (req, res) => {
    const app: IApp = req.body
    try {
      const data = await k8sClient.deleteProject(app)
      res.status(200).json({
        data,
        isError: false,
      })
    } catch (err) {
      log.error('delete project failed = %o', err)
      const error = Boom.internal(err.message)
      res.status(error.output.statusCode || 500).json(wrapError(error))
    }
  })
  return router
}
