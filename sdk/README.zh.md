# OpenFour 前端 SDK

OpenFour 发币前端用 JavaScript SDK：组装后端请求、提交链上 `createToken`、按 preset 解析各玩法模块 schema（税费、标准币、Uni V4 等）。合约 ABI 从 Hardhat artifacts 同步，不在源码中硬编码。

## 目录

```
abi/                          # 从 artifacts 同步的完整 ABI（JSON）
examples/                     # 独立示例（.mjs）
scripts/
  sync-abi-from-artifacts.mjs
  verify-create-args.mjs
createTaxTokenRequest.js        # 组装后端 POST body
createTokenOnChain.js           # 链上 createToken（通用）
createTokenWithBackend.js       # 后端 API + 上链（通用）
createTaxTokenWithBackend.js    # 便捷方法：buildCreateTaxTokenRequest + 后端 + 上链
createArgCodec.js               # 解码/规范化 backend createArg
encodeFromSchema.js             # schema 编解码
loadPresetSchemas.js            # 链上读 Tools/Registry
resolvePresetCreateSchemas.js   # 按 preset 解析各模式创建 schema
index.js                        # 对外导出
```

## 同步 ABI

编译 OpenFour 合约后（在包含 `artifacts/` 的仓库根目录执行 `npx hardhat compile`）：

```bash
node scripts/sync-abi-from-artifacts.mjs
```

来源（相对仓库 `artifacts/contracts/`）：

- `core/OpenFourCore.sol/OpenFourCore.json`
- `core/OpenFourTools.sol/OpenFourTools.json`
- `core/OpenFourRegistry.sol/OpenFourRegistry.json`
- `interfaces/ITagDescriptor.sol/ITagDescriptor.json`

## 校验编码（可选）

```bash
REGISTRY_ADDRESS=0xYourRegistry RPC_URL=https://bsc-testnet.publicnode.com \
  node scripts/verify-create-args.mjs
```

## 快速开始

示例均在**本目录**下执行（包含 `index.js` 的目录）。

### 0) 解析 preset 列表与各模式创建 schema

见 `examples/04-list-preset-create-schemas.example.mjs`

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
// one.preset.tokenModuleTag  — 链上 module descriptor().tag（本质依据）
// one.mode                   — SDK 推导的标签（见下文「CREATE_MODE 与链上」）
// one.flags.needsVaultSelection / needsHookSalt — 由 tag + schema 字段推导
```

#### CREATE_MODE 与链上（非合约枚举）

`CREATE_MODE` 仅在本 SDK 内定义，合约侧没有该枚举。链上实际是 **模块 tag** + **各模块 encode schema 字段**。

| SDK `one.mode` | 推导规则 | 应对的链上依据 |
|----------------|----------|----------------|
| `uni_v4` | 优先：Uni 代币模块 | `one.preset.tokenModuleTag === 'module.token.uni'` |
| `tax` | 否则：税费代币模块 | `one.preset.tokenModuleTag === 'module.token.tax'` |
| `generic` | 其余 | 如 `tokenModuleTag === 'module.token.standard'` |

优先级：`uni_v4` → `tax` → `generic`。业务分支建议以 `preset.tokenModuleTag` 和 `flags` 为准，不要只依赖 `mode`。

```bash
REGISTRY_ADDRESS=0xYourRegistry RPC_URL=https://bsc-testnet.publicnode.com \
  node examples/04-list-preset-create-schemas.example.mjs
```

### 1) 仅组装后端请求

见 `examples/01-build-backend-payload.example.mjs`

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

### 2) 仅上链（已有 backend 返回）

见 `examples/02-submit-onchain.example.mjs`

```js
import { prepareCreateTokenOnChain, submitCreateTokenOnChain } from './index.js'

const { createArg, signature, txValue } = prepareCreateTokenOnChain({
  rawCreateArg: data.createArg,
  signature: data.signature,
  wrappedNative: '0x...', // 该链 WBNB / WETH
})

await submitCreateTokenOnChain({ signer, coreAddress, createArg, signature, txValue })
```

### 3) 后端 + 上链（示例）

见 `examples/03-create-tax-token-with-backend.example.mjs`

```js
import { createTaxTokenWithBackendAndChain } from './createTaxTokenWithBackend.js'

await createTaxTokenWithBackendAndChain({
  buildRequest: { /* buildCreateTaxTokenRequest 入参 */ },
  postCreate,
  signer,
  coreAddress,
  wrappedNative: '0x...',
})

// 通用（任意 POST body）:
import { createTokenWithBackendAndChain } from './createTokenWithBackend.js'
await createTokenWithBackendAndChain({ buildPayload: payload, postCreate, signer, coreAddress })
```

## 导出 API

| 函数 | 说明 |
|------|------|
| `buildCreateTaxTokenRequest` | 组装后端 body + initParams（模块参数由 `taxInfo` 提供） |
| `resolvePresaleQuote` | 将 `presaleQuote` / `preSale` 映射为后端字段 |
| `loadPresetSchemas` | Registry → Tools → schemas |
| `resolvePresetCreateSchema` | 单个 preset：metadata + schemas + activeParams |
| `resolveAllPresetCreateSchemas` | 列表解析所有可创建 preset |
| `buildCombinedParams` / `detectCreateMode` | 合并参数；由 tag/schema 映射为 SDK `CREATE_MODE` |
| `CREATE_MODE` / `UNI_TOKEN_MODULE_TAG` / `TAX_TOKEN_MODULE_TAG` | SDK 常量；链上 tag 为 `module.token.uni` / `module.token.tax` |
| `prepareCreateTokenOnChain` | 规范化 createArg，计算 txValue（与合约一致） |
| `isPresaleNative` / `computeCreateTokenTxValue` | 预购原生 / ERC20 付款判断 |
| `submitCreateTokenOnChain` | 调用 OpenFourCore.createToken |
| `createTokenWithBackendAndChain` | 通用：POST body + 上链 |
| `createTaxTokenWithBackendAndChain` | 税费：buildCreateTaxTokenRequest + POST + 上链 |
| `encodeModuleParams` / `decodeModuleParams` | schema 编解码 |

## 依赖

- `ethers` ^6.x

## 说明

- 税费类 preset **不包含** `hookSalt`（Uni V4 需单独挖盐流程）。
- 各 preset 的模块字段（`buyFeeRate`、`router`、`founder` 等）须由集成方写入 `taxInfo`。
- 后端预购字段：`createParams.presaleQuote` 或 `createParams.preSale`（见 `resolvePresaleQuote`）。
- `createArg` 的 tuple 解码布局在 `abi/createTokenArgsCodec.json`（backend 返回的 bytes 结构，非合约 artifact 条目）。
- **msg.value**：`createFee` 永远用原生币支付；仅当 `quoteAsset == wrappedNative` 且 `presaleQuote > 0` 时，`msg.value` 还需加上 `presaleQuote`；ERC20 预购时 `msg.value` 仍至少为 `createFee`。
