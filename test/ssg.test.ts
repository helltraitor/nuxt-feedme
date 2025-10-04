import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'

describe('SSGRespective', async () => {
  const filenames = [
    'feed.xml',
    'feed.atom',
    'content.xml',
    'pages.json',
  ]

  for (const filename of filenames) {
    it(`Checks existence of ${filename}`, async () => {
      const file = fileURLToPath(new URL(`../playground/.output/public/${filename}`, import.meta.url))

      expect(fs.existsSync(file), `node.fs.existSync of ${file}`).toBe(true)

      const fileStat = fs.statSync(file)

      expect(fileStat.isFile(), `statSync.isFile of ${file}`).toBe(true)
      expect(fileStat.size, `statSync.size of ${file} (size > 256)`).toBeGreaterThan(256)
    })
  }
})
