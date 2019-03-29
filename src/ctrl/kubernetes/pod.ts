import * as k8s from 'kubernetes-client'
import { IApp, IPodParams } from '../../common/interfaces'
import { createLog } from '../../common/log'
import etc from '../../etc'

const log = createLog('k8s-pod')
const { oss, redis, sidecar } = etc
const SSH_PORT = 2222
const REDIS_CFG = {
  db       : redis.db,
  password : redis.password,
  server   : `${redis.host}:${redis.port}`,
}
class KubernetesPod {
  private client: k8s.ApiRoot

  constructor(client: k8s.ApiRoot) {
    this.client = client
  }

  public createPod({ imageURL, app, targetPort = 8000 }: IPodParams) {
    const {
      name: appName,
      language: appLanguage = 'javascript',
      template,
      type: appType,
      token = '',
    } = app
    const bucketName = app.bucket || `${oss.bucket}${appName}`
    const namespace = app.language
    const env = [
      {
        name: 'APP_NAME',
        value: appName,
      },
      {
        name: 'BASE_DIR',
        value: '/home/admin',
      },
      {
        name: 'TOKEN',
        value: token,
      },
      {
        name: 'APP_LANGUAGE',
        value: appLanguage,
      },
      {
        name: 'APP_TYPE',
        value: appType,
      },
      {
        name: 'APP_TEMPLATR',
        value: template,
      },
      {
        name: 'REDIS_CFG',
        value: JSON.stringify(REDIS_CFG),
      },
      {
        name: 'OSS_CFG',
        value: JSON.stringify(etc.oss || {}),
      },
      {
        name: 'SMASH_CFG',
        value: JSON.stringify(etc.smash || {}),
      },
      {
        name: 'SMASH_URL',
        value: JSON.stringify(etc.smash && etc.smash.url || ''),
      },
      {
        name: 'SMASH_HOST_daily',
        value: JSON.stringify(etc.smash && etc.smash.daily_host || ''),
      },
      {
        name: 'SMASH_HOST_pre',
        value: JSON.stringify(etc.smash && etc.smash.pre_host || ''),
      },
      {
        name: 'SMASH_HOST_prod',
        value: JSON.stringify(etc.smash && etc.smash.prod_host || ''),
      },
    ]
    const resources = {
      limits: {
        cpu: '1000m',
        memory: '2Gi',
      },
      requests: {
        cpu: '500m',
        memory: '256Mi',
      },
    }
    const volumeMounts = [
      {
        mountPath: `/home/admin/source/${appName}`,
        name: `${oss.bucket}${appName}`,
      },
    ]
    const imagePullPolicy = 'Always'
    const deploymentManifest = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        labels: {
          app: appName,
        },
        name: appName,
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            app: appName,
          },
        },
        strategy: {
          rollingUpdate: {
            maxSurge: 1,
            maxUnavailable: 2,
          },
          type: 'RollingUpdate',
        },
        template: {
          metadata: {
            labels: {
              app: appName,
            },
          },
          spec: {
            containers: [
              {
                env,
                image: imageURL,
                imagePullPolicy,
                name: appName,
                ports: [
                  {
                    containerPort: targetPort,
                  },
                  {
                    containerPort: SSH_PORT,
                  },
                ],
                resources,
                volumeMounts,
              },
              {
                env,
                image: sidecar.image_url,
                imagePullPolicy,
                name: `sidecar-${appName}`,
                ports: [
                  {
                    containerPort: sidecar.port,
                  },
                ],
                resources,
                volumeMounts,
              },
            ],
            volumes: [
              {
                accessModes: [
                  'ReadWriteMany',
                ],
                capacity: {
                  storage: '20Gi',
                },
                flexVolume: {
                  driver: 'alicloud/oss',
                  options: {
                    akId: oss.accessKeyId,
                    akSecret: oss.accessKeySecret,
                    bucket: bucketName,
                    otherOpts: '',
                    url: oss.endpoint,
                  },
                },
                name: `${oss.bucket}${appName}`,
              },
            ],
          },
        },
      },
    }
    try {
      return this.client.apis.apps.v1.namespaces(namespace).deployments.post({ body: deploymentManifest })
    } catch (err) {
      log.error('deployment pod error = %o', err)
      if (err.code !== 409) throw err
      return this.client.apis.apps.v1.namespaces(namespace).deployments(appName).put({ body: deploymentManifest })
    }
  }

  public deletePod(app: IApp) {
    const { name, language: namespace } = app
    try {
      return this.client.apis.apps.v1.namespaces(namespace).deployments(name).delete()
    } catch (err) {
      log.error(`delete pod = ${name} in namespace = ${namespace} failed = %o`, err)
      throw err
    }
  }
}

export default KubernetesPod
