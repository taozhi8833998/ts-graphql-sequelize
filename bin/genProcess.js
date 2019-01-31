#!/usr/bin/env node

try {
  require('babel-register')
  require('babel-polyfill')
}catch(err) {
  console.error(`require babel-register or babel-polyfill failed : ${err}`)
}

const path = require('path')
const etc = require('../lib/etc').default

const cwd = path.join(__dirname, '../')
const config = {
  apps : [
    {
      name       : 'worker',
      script     : './bin/starter.js',
      args       : ['worker'],
      exec_mode  : 'cluster_mode',
      instances  : etc.env === 1 ? 1 : require('os').cpus().length,
      node_args  : ['--harmony', '--max_old_space_size=4096'],
      error_file : path.join(etc.log_folder, 'worker_error.log'),
      out_file   : path.join(etc.log_folder, 'worker_out.log'),
      cwd        : cwd,
      merge_logs : true,
    },
  ],
}
console.log(JSON.stringify(config))
module.exports = config
