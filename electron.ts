import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const electronBin = path.join(__dirname, 'node_modules/.bin/electron')
const mainFile = path.join(__dirname, 'electron', 'main.mjs')

const child = spawn(electronBin, [mainFile], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    ELECTRON_ENABLE_LOGGING: '1',
  },
})

child.on('exit', (code) => process.exit(code ?? 0))
