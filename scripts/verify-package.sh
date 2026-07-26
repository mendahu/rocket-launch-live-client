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

step "Importing as ESM"
cat > smoke.js <<'JS'
import assert from "node:assert/strict";
import * as pkg from "rocket-launch-live-client";
import { rllc, RLLClient, RLLWatcher } from "rocket-launch-live-client";

assert.deepEqual(Object.keys(pkg).sort(), [
  "RLLClient",
  "RLLEndPoint",
  "RLLEntity",
  "RLLWatcher",
  "rllc",
]);

const client = rllc("aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee");
assert.ok(client instanceof RLLClient);
assert.equal(typeof RLLWatcher, "function");

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

console.log("ESM import OK");
JS
node smoke.js

step "Requiring as CommonJS"
cat > smoke.cjs <<'JS'
const assert = require("node:assert/strict");
const { rllc, RLLClient } = require("rocket-launch-live-client");

const client = rllc("aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee");
assert.ok(client instanceof RLLClient);
assert.equal(typeof client.launches, "function");

console.log("CommonJS require OK");
JS
node smoke.cjs

step "Type checking a consumer against the published declarations"
cat > consumer.ts <<'TS'
import { rllc, RLLEntity, RLLResponse } from "rocket-launch-live-client";

const client = rllc("aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee");

async function main(): Promise<void> {
  const launches: RLLResponse<RLLEntity.Launch[]> = await client.launches({
    id: 1,
  });
  const limit: number = launches.limit;
  const name: string = launches.result[0].name;

  const missions: RLLResponse<RLLEntity.Mission[]> = await client.missions();
  // @ts-expect-error `limit` is present only on launch responses
  void missions.limit;

  console.log(limit, name);
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
