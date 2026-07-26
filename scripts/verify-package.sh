#!/usr/bin/env bash
#
# Verifies the artifact npm would publish rather than the source tree: packs the
# tarball, lints its packaging metadata and type resolution, then installs it
# into a throwaway project and exercises it the way a consumer would.
#
# attw runs with --profile esm-only because this package intentionally ships ESM
# only; CommonJS callers rely on Node's require(esm) support (>=20.19).

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

step() { printf '\n==> %s\n' "$1"; }

step "Packing tarball (prepack builds lib/)"
npm pack --pack-destination "$WORK" >/dev/null
TARBALL="$(find "$WORK" -maxdepth 1 -name '*.tgz')"
printf 'packed %s\n' "$(basename "$TARBALL")"

step "Linting package metadata (publint)"
./node_modules/.bin/publint "$TARBALL"

step "Checking type resolution (attw)"
./node_modules/.bin/attw --profile esm-only "$TARBALL"

step "Installing into a throwaway consumer"
TYPESCRIPT_VERSION="$(node -p "require('$ROOT/package.json').devDependencies.typescript")"
NODE_TYPES_VERSION="$(node -p "require('$ROOT/package.json').devDependencies['@types/node']")"

CONSUMER="$WORK/consumer"
mkdir -p "$CONSUMER"
cd "$CONSUMER"

cat > package.json <<'JSON'
{
  "name": "rllc-consumer-smoke",
  "version": "1.0.0",
  "private": true,
  "type": "module"
}
JSON

npm install --no-audit --no-fund --loglevel=error \
  "$TARBALL" \
  "typescript@$TYPESCRIPT_VERSION" \
  "@types/node@$NODE_TYPES_VERSION"

step "Checking comments are stripped from JS but kept in declarations"
cat > comments.mjs <<'JS'
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative } from "node:path";

const require = createRequire(import.meta.url);
const root = dirname(require.resolve("rocket-launch-live-client"));

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? walk(join(dir, entry.name))
      : [join(dir, entry.name)]
  );

const files = walk(root);
const jsdoc = /\/\*\*/g;

// Runtime JS carries no JSDoc: it costs bytes and editors never read it.
for (const file of files.filter((f) => f.endsWith(".js"))) {
  const blocks = (readFileSync(file, "utf8").match(jsdoc) ?? []).length;
  assert.equal(blocks, 0, `${relative(root, file)} should have no JSDoc blocks`);
}

// Declarations keep JSDoc: this is what powers IntelliSense for consumers.
const documented = {
  "index.d.ts": "Generate a RocketLaunch.Live client",
  "Client.d.ts": "Fetch launches",
  "watcher/index.d.ts": "Create a Watcher that polls the launches endpoint",
};

for (const [file, text] of Object.entries(documented)) {
  const contents = readFileSync(join(root, file), "utf8");
  assert.ok(
    (contents.match(jsdoc) ?? []).length > 0,
    `${file} should retain JSDoc blocks`
  );
  assert.ok(contents.includes(text), `${file} should document "${text}"`);
}

console.log("comment stripping OK");
JS
node comments.mjs

step "Importing as ESM"
cat > smoke.js <<'JS'
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import * as pkg from "rocket-launch-live-client";
import { rllc, RLLClient } from "rocket-launch-live-client";
import { watch, RLLWatcher } from "rocket-launch-live-client/watcher";

assert.deepEqual(Object.keys(pkg).sort(), [
  "RLLClient",
  "RLLEndPoint",
  "RLLEntity",
  "rllc",
]);
assert.equal("RLLWatcher" in pkg, false);

const require = createRequire(import.meta.url);
const rootEntry = require.resolve("rocket-launch-live-client");
const clientEntry = join(dirname(rootEntry), "Client.js");
assert.equal(readFileSync(rootEntry, "utf8").includes("Watcher"), false);
assert.equal(readFileSync(clientEntry, "utf8").includes("Watcher"), false);

const client = rllc("aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee");
assert.ok(client instanceof RLLClient);
assert.equal(typeof client.watch, "undefined");
assert.equal(typeof client.queryLaunches, "function");

for (const method of [
  "companies",
  "launches",
  "locations",
  "missions",
  "pads",
  "tags",
  "vehicles",
]) {
  assert.equal(typeof client[method], "function", `missing ${method}()`);
}

assert.equal(typeof RLLWatcher, "function");
assert.equal(typeof watch, "function");
const watcher = watch(client, 5);
assert.ok(watcher instanceof RLLWatcher);

console.log("ESM import OK");
JS
node smoke.js

step "Requiring as CommonJS"
cat > smoke.cjs <<'JS'
const assert = require("node:assert/strict");
const { rllc, RLLClient } = require("rocket-launch-live-client");
const { watch, RLLWatcher } = require("rocket-launch-live-client/watcher");

const client = rllc("aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee");
assert.ok(client instanceof RLLClient);
assert.equal(typeof client.launches, "function");
assert.equal(typeof client.watch, "undefined");

assert.equal(typeof RLLWatcher, "function");
assert.ok(watch(client) instanceof RLLWatcher);

console.log("CommonJS require OK");
JS
node smoke.cjs

step "Type checking a consumer against the published declarations"
cat > consumer.ts <<'TS'
import { rllc, RLLEntity, RLLResponse } from "rocket-launch-live-client";
import { watch, RLLWatcher } from "rocket-launch-live-client/watcher";

const client = rllc("aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee");
const watcher: RLLWatcher = watch(client, 5, { country_code: "US" });

async function main(): Promise<void> {
  const launches: RLLResponse<RLLEntity.Launch[]> = await client.launches({
    id: 1,
  });
  const launchesLimit: number = launches.limit;
  const name: string = launches.result[0].name;

  const missions: RLLResponse<RLLEntity.Mission[]> = await client.missions();
  const missionsLimit: number = missions.limit;

  console.log(launchesLimit, missionsLimit, name, watcher.launches.size);
}

void main();
TS

cat > tsconfig.json <<'JSON'
{
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "target": "es2022",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": false,
    "types": ["node"]
  },
  "files": ["consumer.ts"]
}
JSON

./node_modules/.bin/tsc -p tsconfig.json
echo "consumer type check OK"

printf '\nPackage verification passed.\n'
