# Project layout

```
AGENTS.md                 — this file
src/index.ts              — Hono app entry point (default export)
dist/                     — compiled ESM output (gitignored should be in .gitignore)
tsconfig.json             — TypeScript config (ES2022, bundler resolution, strict)
package.json              — ESM package, exports from ./dist/index.js
.gitignore                — node_modules, .DS_Store
```

# Dependencies

- **hono** — web framework
- **@hono/node-server** — Node.js adapter for Hono
- **@hardpointlabs/sdk** — Hardpoint tunnel SDK
- **redis** — Redis client (connects via SDK tunnel UNIX socket)
- **typescript** — dev dependency
- **@types/node** — dev dependency

# Build from scratch

```bash
mkdir status && cd status
npm init -y
npm pkg set type="module"
npm install hono@^4 @hono/node-server @hardpointlabs/sdk redis
npm install -D typescript@^6 @types/node
npx tsc --init --target ES2022 --lib ESNext --module ES2022 --moduleResolution bundler --outDir dist --rootDir src --declaration --strict --verbatimModuleSyntax
mkdir src
```

Write `src/index.ts`:

```ts
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { Sdk } from '@hardpointlabs/sdk'
import { createClient } from 'redis'

const app = new Hono()

const orgId = process.env.HARDPOINT_ORG_ID
if (!orgId) {
  throw new Error('HARDPOINT_ORG_ID environment variable is required')
}

const sdk = Sdk.init({ org_id: orgId })
const tunnel = await sdk.connectAndListen({ service: 'redis.prod' })

const redis = createClient({ socket: { path: tunnel.path, tls: false } })
await redis.connect()

app.get('/', async (c) => {
  await redis.ping()
  return c.text('Hello world')
})

const server = serve(app, (info) => console.log(`Listening on http://localhost:${info.port}`))

function shutdown() {
  redis.quit()
  tunnel[Symbol.asyncDispose]()
  server.close()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

export default app
export { redis }
```

Build:

```bash
npm run build
```
