const { expect } = require('chai')
const etc = require('../lib/etc').default

describe('etc test', () => {
  it('should checked etc config', () => {
    expect(etc).to.be.eql({
      'access_token': 'your_access_token',
      'bind_host': '::',
      'cipher_encoding': 'base64',
      'encrypt_algorithm': 'aes-256-ctr',
      'env': 1,
      'http_port': 8000,
      'mysql': {
        'host': 'host',
        'port': 3306,
        'database': 'database',
        'user': 'user',
        'password': 'password'
      },
      'jwt': {
        'expiresIn': '3d',
        'secret': 'your_jwt_secret'
      },
      'log_folder': '../../logs',
      'logging': true,
      'log_levels': [
        'debug',
        'info',
        'warn',
        'error'
      ],
      'log_stdio': true,
      'plain_encoding': 'utf8',
      'public': './public',
      'saltRounds': 10,
      'secret_key': 'your_secret_key'
    })
  })
})