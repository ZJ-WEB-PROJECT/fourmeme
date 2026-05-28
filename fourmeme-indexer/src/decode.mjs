import { UNI_TOKEN_TAG_ID } from './config.mjs'

/**
 * 从 TokenCreated.encodedTags 解析 token slot 的 tagId，
 * 判断是否为 UniToken（token tag = keccak256("token.uni") 前 8 字节）。
 *
 * encodedTags 布局（57 字节，参考 sdk/encodedTags.js）：
 *   byte 0       : schema version（应为 1）
 *   bytes 1–8    : token tagId
 *   bytes 9–16   : tokenModule tagId
 *   bytes 17–24  : vault tagId
 *   bytes 25–32  : curve tagId
 *   bytes 33–40  : trade tagId
 *   bytes 41–48  : migrate tagId
 *   bytes 49–56  : customData tagId
 *
 * @param {string} encodedTags  "0x" + 114 hex chars（57 bytes）
 * @returns {boolean}
 */
export function isUniToken(encodedTags) {
  if (!encodedTags || encodedTags.length < 18) return false
  // 0x(2) + schema(2) + tokenTagId(16) → slice [4, 20]
  const tokenTagId = ('0x' + encodedTags.slice(4, 20)).toLowerCase()
  return tokenTagId === UNI_TOKEN_TAG_ID
}

/**
 * 从 tokenMetaUri 获取元数据 JSON。
 * 格式（客户确认）：{ name, symbol, image, description, updated_at, links }
 *
 * @param {string} uri
 * @returns {Promise<{image:string, description:string, links:object}|null>}
 */
export async function fetchTokenMeta(uri) {
  if (!uri) return null
  try {
    const res = await fetch(uri, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    const json = await res.json()
    return {
      image:       json.image       || '',
      description: json.description || '',
      links: {
        website:  json.links?.website  || '',
        twitter:  json.links?.twitter  || '',
        telegram: json.links?.telegram || '',
      },
    }
  } catch {
    return null
  }
}
