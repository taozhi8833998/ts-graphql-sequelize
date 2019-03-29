import * as k8s from 'kubernetes-client'
import { IApp } from '../../common/interfaces'
import { createLog } from '../../common/log'
import { deRegisteAppFromCenter , registeApptoCenter } from '../../core/redis'
import etc from '../../etc'
import KubernetesPod from './pod'
import KubernetesService from './service'

const log = createLog('k8s')
const {
  k8s_cfg,
  preview,
  image_prefix: imagePrefix = '',
} = etc

class KubernetesClient {

  private client: k8s.ApiRoot
  private pod: KubernetesPod
  private service: KubernetesService

  constructor() {
    this.client = new k8s.Client1_10({
      config  : k8s_cfg,
      version : '1.11',
    })
    this.pod = new KubernetesPod(this.client)
    this.service = new KubernetesService(this.client)
  }

  public async createProject(app: IApp) {
    const imageURL = `${imagePrefix}${app.language}_${app.template}`
    try {
      await this.pod.createPod({ imageURL, app })
      const service = await this.service.createService({ app })
      await registeApptoCenter(app.name, service.body.spec.clusterIP)
      return preview
    } catch (e) {
      const info = `create project failed ${e.message}`
      log.error(`${info}, the stack is = ${e.stack}`)
      throw e
    }
  }

  public async deleteProject(app: IApp) {
    try {
      await deRegisteAppFromCenter(app.name)
      await this.service.deleteService(app)
      await this.pod.deletePod(app)
      return 'OK'
    } catch (e) {
      const info = `delete project failed ${e.message}`
      log.error(`${info}, the stack is = ${e.stack}`)
      throw e
    }
  }
}

const kuberneteClient = new KubernetesClient()

export default kuberneteClient
