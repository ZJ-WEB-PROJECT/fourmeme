# OpenFour Frontend SDK

JavaScript SDK for OpenFour token-creation flows: assemble backend requests, submit on-chain `createToken`, and resolve per-preset module schemas (tax, standard, Uni V4, and others). Contract ABIs are synced from Hardhat artifacts (not hardcoded in source).

## Layout

```
abi/                          # Full ABIs synced from artifacts (JSON)
examples/                     # Standalone examples (.mjs)
scripts/
  sync-abi-from-artifacts.mjs
  verify-create-args.mjs
createTaxTokenRequest.js        # Build backend POST body
createTokenOnChain.js           # On-chain createToken (generic)
createTokenWithBackend.js       # Backend API + on-chain (generic)
createTaxTokenWithBackend.js    # Helper: buildCreateTaxTokenRequest + backend + on-chain
createArgCodec.js               # Decode/normalize backend createArg
encodeFromSchema.js             # Schema encode/decode
loadPresetSchemas.js            # Read Tools/Registry on-chain
resolvePresetCreateSchemas.js   # Resolve create schema per preset/mode
index.js                        # Public exports
```

## Sync ABIs

After compiling OpenFour contracts (`npx hardhat compile` in the repo that owns `artifacts/`):

```bash
node scripts/sync-abi-from-artifacts.mjs
```

Artifact sources (relative to repo `artifacts/contracts/`):

- `core/OpenFourCore.sol/OpenFourCore.json`
- `core/OpenFourTools.sol/OpenFourTools.json`
- `core/OpenFourRegistry.sol/OpenFourRegistry.json`
- `interfaces/ITagDescriptor.sol/ITagDescriptor.json`

## Verify encoding (optional)

```bash
REGISTRY_ADDRESS=0xYourRegistry RPC_URL=https://bsc-testnet.publicnode.com \
  node scripts/verify-create-args.mjs
```

## Quick start

Run examples from this directory (`cd` into the folder that contains `index.js`).

### 0) Resolve preset list and create schema per mode

See `examples/04-list-preset-create-schemas.example.mjs`

```js
import {
  resolveAllPresetCreateSchemas,
  resolvePresetCreateSchema,
  CREATE_MODE,
} from './index.js'

const { summary, items, byId } = await resolveAllPresetCreateSchemas({
  registryAddress: '0x...',
  provider,
})

const one = await resolvePresetCreateSchema({
  registryAddress: '0x...',
  presetId: '1778027615723',
  provider,
})
// one.preset.tokenModuleTag  — on-chain module descriptor().tag (source of truth)
// one.mode                   — SDK label only (see “CREATE_MODE vs on-chain” below)
// one.flags.needsVaultSelection / needsHookSalt — derived from tag + schema fields
```

#### CREATE_MODE vs on-chain (not a contract enum)

`CREATE_MODE` is defined by this SDK for convenience. OpenFour contracts use **module tags** and **encode schemas**, not `CREATE_MODE`.

| SDK `one.mode` | How it is inferred | On-chain signal to check |
|----------------|-------------------|---------------------------|
| `uni_v4` | First: Uni token module | `one.preset.tokenModuleTag === 'module.token.uni'` |
| `tax` | Else: tax token module | `one.preset.tokenModuleTag === 'module.token.tax'` |
| `generic` | Else: standard / other | e.g. `tokenModuleTag === 'module.token.standard'` |

Priority: `uni_v4` → `tax` → `generic`. Prefer `preset.tokenModuleTag` and `flags` over `mode` when branching in your app.

```bash
REGISTRY_ADDRESS=0xYourRegistry RPC_URL=https://bsc-testnet.publicnode.com \
  node examples/04-list-preset-create-schemas.example.mjs
```

### 1) Build backend request only

See `examples/01-build-backend-payload.example.mjs`

```js
import { buildCreateTaxTokenRequest, resolvePresetCreateSchema } from './index.js'

const { schemas, activeParams, preset } = await resolvePresetCreateSchema({
  registryAddress,
  presetId,
  provider,
})
const { payload } = buildCreateTaxTokenRequest({
  presetId,
  schemas,
  taxInfo,
  activeParam: activeParams,
  tokenModuleTag: preset.tokenModuleTag,
})
await postCreate(payload)
```

### 2) Submit on-chain only (backend already returned createArg)

See `examples/02-submit-onchain.example.mjs`

```js
import { prepareCreateTokenOnChain, submitCreateTokenOnChain } from './index.js'

const { createArg, signature, txValue } = prepareCreateTokenOnChain({
  rawCreateArg: data.createArg,
  signature: data.signature,
  wrappedNative: '0x...', // WBNB / WETH on this chain
})

await submitCreateTokenOnChain({ signer, coreAddress, createArg, signature, txValue })
```

### 3) Backend + on-chain (example)

See `examples/03-create-tax-token-with-backend.example.mjs`

```js
import { createTaxTokenWithBackendAndChain } from './createTaxTokenWithBackend.js'

await createTaxTokenWithBackendAndChain({
  buildRequest: { /* buildCreateTaxTokenRequest input */ },
  postCreate,
  signer,
  coreAddress,
  wrappedNative: '0x...',
})

// Generic (any POST body):
import { createTokenWithBackendAndChain } from './createTokenWithBackend.js'
await createTokenWithBackendAndChain({ buildPayload: payload, postCreate, signer, coreAddress })
```

## Exported API

| Function | Description |
|----------|-------------|
| `buildCreateTaxTokenRequest` | Build backend body + encode `initParams` (module fields via `taxInfo`) |
| `resolvePresaleQuote` | Map `presaleQuote` / `preSale` to backend field |
| `loadPresetSchemas` | Registry → Tools → module schemas |
| `resolvePresetCreateSchema` | Single preset: metadata + schemas + activeParams |
| `resolveAllPresetCreateSchemas` | Resolve all creatable presets |
| `buildCombinedParams` / `detectCreateMode` | Merge params; map tag/schema → SDK `CREATE_MODE` |
| `CREATE_MODE` / `UNI_TOKEN_MODULE_TAG` / `TAX_TOKEN_MODULE_TAG` | SDK constants; on-chain tags `module.token.uni` / `module.token.tax` |
| `prepareCreateTokenOnChain` | Normalize createArg; compute txValue (aligned with contract) |
| `isPresaleNative` / `computeCreateTokenTxValue` | Presale native vs ERC20 payment helpers |
| `submitCreateTokenOnChain` | Call OpenFourCore.createToken |
| `createTokenWithBackendAndChain` | Generic: POST body + on-chain |
| `createTaxTokenWithBackendAndChain` | Helper: buildCreateTaxTokenRequest + POST + on-chain |
| `encodeModuleParams` / `decodeModuleParams` | Schema encode/decode |

## Dependencies

- `ethers` ^6.x

## Notes

- Tax presets do **not** inject `hookSalt` (Uni V4 only; use separate hook-mining flow).
- Preset module fields (`buyFeeRate`, `router`, `founder`, etc.) must be provided on `taxInfo` by the integrator.
- Backend presale: `createParams.presaleQuote` or `createParams.preSale` (see `resolvePresaleQuote`).
- `createArg` tuple layout for decoding is in `abi/createTokenArgsCodec.json` (backend bytes layout, not a contract artifact entry).
- **msg.value**: `createFee` is always native. `presaleQuote` is added to `msg.value` only when `quoteAsset == wrappedNative` and `presaleQuote > 0`; ERC20 presale still requires `msg.value >= createFee`.
