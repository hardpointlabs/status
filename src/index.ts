import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { Sdk } from '@hardpointlabs/sdk'
import type { HeaderProvider, RequestContext } from '@hardpointlabs/sdk/dist/auth'
import { createClient } from 'redis'

const app = new Hono()

const orgId = process.env.HARDPOINT_ORG_ID
if (!orgId) {
  throw new Error('HARDPOINT_ORG_ID environment variable is required')
}

const sdk = Sdk.init({ orgId: orgId })

app.get('/', async (c) => {
  const hp: HeaderProvider = {
    get: (name: string) => {
      return c.req.header(name);
    }
  }
  const ctx: RequestContext = {
    headers: hp
  }
  const tunnel = await sdk.connectAndListen({ service: 'redis' }, ctx);

  const redis = createClient({ socket: { path: tunnel.path, tls: false } })
  await redis.connect()
  const val = await redis.incr("foo")
  await redis.incr("something")
  await redis.incr("else")
  return c.text(`Hits: ${val}`)
})

const server = serve(app, (info) => console.log(`Listening on http://localhost:${info.port}`))

function shutdown() {
  server.close()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

export default app
