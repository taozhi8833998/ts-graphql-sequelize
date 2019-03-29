import { IApp, IContext } from '../common/interfaces'
import { createLog } from '../common/log'
import k8sClient from '../ctrl/kubernetes'

const log = createLog('app_resolver')

export default {
  Mutation: {
    createApp: (_: any, app: IApp, { res, db }: IContext): Promise<IApp> => k8sClient.createProject(app),
    deleteApp: (_: any, app: IApp, { res, db }: IContext): Promise<{}> => k8sClient.deleteProject(app),
  },
}
