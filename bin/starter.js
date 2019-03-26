#!/usr/bin/env node

const path = require('path')
const os = require('os')
const SIGNALS = os.constants.signals
require(path.join(__dirname, '../lib/process', 'worker'))

const listenSignals = [SIGNALS.SIGTERM, SIGNALS.SIGINT, SIGNALS.SIGQUIT]
listenSignals.forEach(signal => {
  process.on(signal, () => {
    console.log(`${process.pid} receive signal: ${signal}`)
    console.log('Server Quit')
    process.exit(98)
  })
})

process.on('uncaughtException', err => {
  console.error(err.stack)
})

process.on('unhandledRejection', reason => {
  console.error('unhandledRejection happened, the reason is:', reason)
})
