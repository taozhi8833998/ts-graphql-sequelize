const { expect } = require('chai')
const etc = require('../lib/etc').default

describe('init test', () => {
  it('should checked etc config', () => {
    expect(etc.log_stdio).to.be.eql(true)
  })
})