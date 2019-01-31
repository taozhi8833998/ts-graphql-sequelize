import * as crypto from 'crypto'

const getKey = (info: any) => {
  if (typeof info !== 'object') return crypto.createHash('md5').update(info).digest('hex')
  const arrayKey = (element: any[]) => crypto.createHash('md5').update(element.join('_')).digest('hex')
  if (Array.isArray(info)) return arrayKey(info)
  const infoArray = []
  for (const key of Object.keys(info).sort()) {
    infoArray.push(`${key}_${info[key]}`)
  }
  return arrayKey(infoArray)
}

const wrapError = (error: Error) => ({ error, isError: true })

export {
  getKey,
  wrapError,
}
