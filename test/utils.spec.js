const { expect } = require('chai')
const utils = require('../lib/common/utils')

describe('common utils', () => {
  it('get values by keys', () => {
    const obj = {
      a: {
        b: {
          c: {
            d: 123
          }
        }
      }
    }
    const data = utils.getValueByKeys(['a', 'b', 'c', 'd'], obj)
    const defaultVal = utils.getValueByKeys(['a', 'c', 'b', 'd'], obj, 234)
    expect(data).to.be.eql(123)
    expect(defaultVal).to.be.eql(234)
  })
  it('should parser json', () => {
    const jsonVal = utils.parseJSON('{"a": 1}')
    expect(jsonVal).to.be.eql({a: 1})
  })
  it('should parser json get default value', () => {
    const defaultVal = utils.parseJSON('a', [])
    expect(defaultVal).to.be.eql([])
  })
  it('should wrap error', () => {
    const error = new Error('test error')
    const wrapError = utils.wrapError(error)
    expect(wrapError).to.be.eql({ isError: true, error })
  })
})