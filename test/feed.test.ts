import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, fetch } from '@nuxt/test-utils/e2e'

interface ContentTypeTestSuite {
  route: string
  type: 'application/rss+xml' | 'application/atom+xml' | 'application/json'
}

describe('Feed', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('../playground', import.meta.url)),
  })

  const testSuites: ContentTypeTestSuite[] = [
    { route: '/feed.xml', type: 'application/rss+xml' },
    { route: '/feed.atom', type: 'application/atom+xml' },
    { route: '/content.xml', type: 'application/rss+xml' },
    { route: '/pages.json', type: 'application/json' },
  ]

  for (const suite of testSuites) {
    it(`Receives ${suite.route}`, async () => {
      const response = await fetch(suite.route)
      expect(response.headers.get('Content-Type'), 'Response ContentType').toBe(suite.type)
    })
  }
})
