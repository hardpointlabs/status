# Project layout

```
AGENTS.md         — this file
src/index.ts      — Hono app entry point (default export)
dist/             — compiled ESM output (gitignored should be in .gitignore)
tsconfig.json     — TypeScript config (ES2022, bundler resolution, strict)
package.json      — ESM package, exports from ./dist/index.js
.gitignore        — node_modules, .DS_Store
```

# Build from scratch

```bash
mkdir status && cd status
npm init -y
npm pkg set type="module"
npm install hono@^4
npm install -D typescript@^5
npx tsc --init --target ES2022 --module ES2022 --moduleResolution bundler --outDir dist --declaration --strict --verbatimModuleSyntax
mkdir src
```

Write `src/index.ts`:

```ts
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.text('Hello world'))

export default app
```

Build:

```bash
npm run build
```
