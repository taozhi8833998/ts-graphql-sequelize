const fs = require('fs')
const path = require('path')

try {
  const envJsonPath = path.join(__dirname, '.env.json')
  fs.lstatSync(envJsonPath)
  const cfg = require(envJsonPath)
  const envPath = path.join(__dirname, '.env')
  fs.writeFileSync(envPath, `RUNTIME_CFG=${JSON.stringify(cfg)}`)
  require('dotenv').config({ path: envPath })
} catch (err) {
  console.warn('Loading .env from project root failed = ', err)
}

