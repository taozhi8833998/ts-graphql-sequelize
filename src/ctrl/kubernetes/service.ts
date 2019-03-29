import * as k8s from 'kubernetes-client'
import { IApp, IServiceParams } from '../../common/interfaces'
import { createLog } from '../../common/log'
import etc from '../../etc'

const log = createLog('k8s-service')
class KubernetesService {
  private client: k8s.ApiRoot

  constructor(client: k8s.ApiRoot) {
    this.client = client
  }

  public createService({ app, port = 80, targetPort = 8080, sshPort = 2222, type = 'ClusterIP' }: IServiceParams) {
    const {
      name,
      language: appType = 'javascript',
    } = app
    const namespace = app.language
    const protocol = 'TCP'
    const deploymentManifest = {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: {
        labels: {
          app: name,
        },
        name,
        namespace,
      },
      spec: {
        ports: [
          {
            name,
            port,
            protocol,
            targetPort,
          },
          {
            name: `${name}-tty`,
            port: sshPort,
            protocol: 'TCP',
            targetPort: sshPort,
          },
        ],
        selector: {
          app: name,
        },
        type,
      },
    }
    try {
      return this.client.api.v1.namespaces(namespace).services.post({ body: deploymentManifest })
    } catch (err) {
      log.error('create service error = %o', err)
      if (err.code !== 409) throw err
    }
    return this.client.api.v1.namespaces(namespace).services(name).get()
  }

  public async deleteService(app: IApp) {
    const { name, language: namespace } = app
    try {
      return this.client.api.v1.namespaces(namespace).services(name).delete()
    } catch (err) {
      log.error(`delete service = ${name} in namespace = ${namespace} failed = %o`, err)
      throw err
    }
  }
}

export default KubernetesService
