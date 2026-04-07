/**
 * Electron loader script
 * Uses tsx to transpile main.ts on the fly
 */
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Launch electron with tsx as the ESM loader
const electronBin = path.join(__dirname, 'node_modules/.bin/electron')
const mainFile = path.join(__dirname, 'electron/main.ts')

const child = spawn(electronBin, ['--import=tsx', mainFile], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' },
})

child.on('exit', (code) => process.exit(code ?? 0))
