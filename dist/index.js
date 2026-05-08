import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { Sdk } from '@hardpointlabs/sdk';
import { createClient } from 'redis';
const app = new Hono();
const orgId = process.env.HARDPOINT_ORG_ID;
if (!orgId) {
    throw new Error('HARDPOINT_ORG_ID environment variable is required');
}
const sdk = Sdk.init({ org_id: orgId });
const tunnel = await sdk.connectAndListen({ service: 'redis.prod' });
const redis = createClient({ socket: { path: tunnel.path, tls: false } });
await redis.connect();
app.get('/', async (c) => {
    await redis.ping();
    return c.text('Hello world');
});
const server = serve(app, (info) => console.log(`Listening on http://localhost:${info.port}`));
function shutdown() {
    redis.quit();
    tunnel[Symbol.asyncDispose]();
    server.close();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
export default app;
export { redis };
//# sourceMappingURL=index.js.map