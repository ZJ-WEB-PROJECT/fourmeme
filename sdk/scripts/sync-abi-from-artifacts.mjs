#!/usr/bin/env node
/**
 * Sync SDK ABI JSON from Hardhat artifacts.
 * Run from SDK root: node scripts/sync-abi-from-artifacts.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const sdkAbiDir = path.resolve(__dirname, '../abi')
const artifactsRoot = path.resolve(__dirname, '../../../artifacts/contracts')

const SOURCES = [
  ['core/OpenFourCore.sol/OpenFourCore.json', 'OpenFourCore.json'],
  ['core/OpenFourTools.sol/OpenFourTools.json', 'OpenFourTools.json'],
  ['core/OpenFourRegistry.sol/OpenFourRegistry.json', 'OpenFourRegistry.json'],
  ['interfaces/ITagDescriptor.sol/ITagDescriptor.json', 'ITagDescriptor.json'],
]

function main() {
  fs.mkdirSync(sdkAbiDir, { recursive: true })
  for (const [relArtifact, outName] of SOURCES) {
    const artifactPath = path.join(artifactsRoot, relArtifact)
    if (!fs.existsSync(artifactPath)) {
      console.error(`Missing artifact: ${artifactPath}`)
      process.exit(1)
    }
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'))
    if (!Array.isArray(artifact.abi)) {
      console.error(`No abi[] in ${artifactPath}`)
      process.exit(1)
    }
    const outPath = path.join(sdkAbiDir, outName)
    fs.writeFileSync(outPath, `${JSON.stringify(artifact.abi, null, 2)}\n`)
    console.log(`Wrote ${outName} (${artifact.abi.length} items)`)
  }
}

main()
