import { fileURLToPath } from 'node:url'
import { XMLValidator, XMLParser } from 'fast-xml-parser'
import { describe, it, expect } from 'vitest'
import { setup, fetch } from '@nuxt/test-utils/e2e'

interface ContentTypeTestSuite {
  route: string
  type: 'application/rss+xml' | 'application/atom+xml' | 'application/json'
}

describe('Feed', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('../playground', import.meta.url)),
    setupTimeout: 480000,
  })

  describe('ContentType', async () => {
    const testSuites: ContentTypeTestSuite[] = [
      { route: '/feed.xml', type: 'application/rss+xml' },
      { route: '/feed.atom', type: 'application/atom+xml' },
      { route: '/content.xml', type: 'application/rss+xml' },
      { route: '/pages.json', type: 'application/json' },
      { route: '/hooked.xml', type: 'application/rss+xml' },
    ]

    for (const suite of testSuites) {
      it(`Receives ${suite.route}`, async () => {
        const response = await fetch(suite.route)
        expect(response.headers.get('Content-Type'), 'Response ContentType').toBe(suite.type)
      })
    }
  })

  describe('/feed.xml', async () => {
    it('Tests /feed.xml validness', async () => {
      const response = await fetch('/feed.xml')
      const content = await (await response.blob()).text()
      expect(XMLValidator.validate(content), 'Test xml validness').toBe(true)
    })

    it('Tests /feed.xml content', async () => {
      const response = await fetch('/feed.xml')
      const content = await (await response.blob()).text()

      const parser = new XMLParser()
      const parsed = parser.parse(content)

      expect(parsed?.rss?.channel?.title, 'Channel title')
        .toBe(`Special feed for '/feed.xml' route`)

      expect(parsed?.rss?.channel?.item?.length, 'Channel item amount')
        .toBe(2)

      // FIRST ITEM
      expect(parsed?.rss?.channel?.item[0].title, 'First channel item title')
        .toBe('Exclusive for xml (from specialized hook)')

      // SECOND ITEM
      expect(parsed?.rss?.channel?.item[1].title, 'Second channel item title')
        .toBe('General hook article')

      expect(parsed?.rss?.channel?.item[1].link, 'Second channel item link')
        .toBe('/')

      expect(parsed?.rss?.channel?.item[1].pubDate, 'Second channel item pubDate')
        .toBe('Sat, 20 Sep 2025 00:00:00 GMT')
    })
  })

  describe('/feed.atom', async () => {
    it('Tests /feed.atom validness', async () => {
      const response = await fetch('/feed.atom')
      const content = await (await response.blob()).text()

      expect(XMLValidator.validate(content), 'Test atom (xml) validness').toBe(true)
    })

    it('Tests /feed.atom content', async () => {
      const response = await fetch('/feed.atom')
      const content = await (await response.blob()).text()

      const parser = new XMLParser()
      const parsed = parser.parse(content)

      expect(parsed?.feed?.title, 'Channel title')
        .toBe(`Generated title by nuxt-feedme!`)

      // SINGLE ITEM
      expect(parsed?.feed?.entry.title, 'First channel item title')
        .toBe('General hook article')

      expect(parsed?.feed?.entry.id, 'First channel item id')
        .toBe('/')

      expect(parsed?.feed?.entry.updated, 'First channel item updated')
        .toBe('2025-09-20T00:00:00.000Z')
    })
  })

  describe('/content.xml', async () => {
    it('Tests /content.xml validness', async () => {
      const response = await fetch('/content.xml')
      const content = await (await response.blob()).text()

      expect(XMLValidator.validate(content), 'Test xml validness').toBe(true)
    })

    it('Tests /content.xml content', async () => {
      const response = await fetch('/content.xml')
      const content = await (await response.blob()).text()

      const parser = new XMLParser()
      const parsed = parser.parse(content)

      expect(parsed?.rss?.channel?.title, 'Channel title')
        .toBe('Content driven')

      expect(parsed?.rss?.channel?.link, 'Channel link')
        .toBe('http://localhost:3000')

      expect(parsed?.rss?.channel?.copyright, 'Channel copyright')
        .toBe('CC BY-NC-SA 4.0 2023 by Helltraitor')

      expect(parsed?.rss?.channel?.item?.length, 'Channel item amount')
        .toBe(2)

      // FIRST ITEM
      expect(parsed?.rss?.channel?.item[0]?.title, 'First channel item title')
        .toBe('Feedme item with feedme prefix and date')

      expect(parsed?.rss?.channel?.item[0]?.link, 'First channel item link')
        .toBe('/feedmeitem')

      expect(parsed?.rss?.channel?.item[0]?.guid, 'First channel item guid')
        .toBe('content/feedmeItem.md')

      expect(parsed?.rss?.channel?.item[0]?.pubDate, 'First channel item pubDate')
        .toBe('Fri, 03 Jan 2020 00:00:00 GMT')

      expect(parsed?.rss?.channel?.item[0]?.description, 'First channel item description')
        .toBe('Content example')

      // SECOND ITEM
      expect(parsed?.rss?.channel?.item[1]?.title, 'Second channel item title')
        .toBe('Root with link')

      expect(parsed?.rss?.channel?.item[1]?.link, 'Second channel item link')
        .toBe('/rootwithlink')

      expect(parsed?.rss?.channel?.item[1]?.guid, 'Second channel item guid')
        .toBe('content/rootWithLink.md')

      expect(parsed?.rss?.channel?.item[1]?.pubDate, 'Second channel item pubDate')
        .toBe('Sat, 04 Jan 2020 00:00:00 GMT')

      expect(parsed?.rss?.channel?.item[1]?.description, 'Second channel item description')
        .toBe('Link to feed.atom')
    })
  })

  describe('/pages.json', async () => {
    it('Tests /pages.json validness', async () => {
      const response = await fetch('/pages.json')
      const content = await (await response.blob()).text()

      expect(() => JSON.parse(content), 'Test json validness').not.toThrow()
    })

    it('Tests /pages.json content', async () => {
      const response = await fetch('/pages.json')
      const content = await (await response.blob()).text()

      const parsed = JSON.parse(content)

      expect(parsed?.title, 'Channel title')
        .toBe('Content driven (pages + content from defaults)')

      expect(parsed?.home_page_url, 'Channel home page url')
        .toBe('http://localhost:3000')

      expect(parsed?.author?.name, 'Channel author name')
        .toBe('Helltraitor')

      expect(parsed?.items?.length, 'Channel item amount')
        .toBe(4)

      // FIRST ITEM
      expect(parsed?.items[0]?.id, 'First channel item id')
        .toBe('content/feedmeItem.md')

      expect(parsed?.items[0]?.content_html, 'First channel content html')
        .toBe('Content example')

      expect(parsed?.items[0]?.url, 'First channel content url')
        .toBe('/feedmeitem')

      expect(parsed?.items[0]?.title, 'First channel content title')
        .toBe('Feedme item with feedme prefix and date')

      expect(parsed?.items[0]?.date_modified, 'First channel content date modified')
        .toBe('2020-01-03T00:00:00.000Z')

      // SECOND ITEM
      expect(parsed?.items[1]?.id, 'Second channel item id')
        .toBe('content/rootWithLink.md')

      expect(parsed?.items[1]?.content_html, 'Second channel content html')
        .toBe('Link to feed.atom')

      expect(parsed?.items[1]?.url, 'Second channel content url')
        .toBe('/rootwithlink')

      expect(parsed?.items[1]?.title, 'Second channel content title')
        .toBe('Root with link')

      expect(parsed?.items[1]?.date_modified, 'Second channel content date modified')
        .toBe('2020-01-04T00:00:00.000Z')

      // THIRD ITEM
      expect(parsed?.items[2]?.id, 'Third channel item id')
        .toBe('pages/pages/pagesFeedmeItem.md')

      expect(parsed?.items[2]?.content_html, 'Third channel content html')
        .toBe('Content example')

      expect(parsed?.items[2]?.url, 'Third channel content url')
        .toBe('/pages/pagesfeedmeitem')

      expect(parsed?.items[2]?.title, 'Third channel content title')
        .toBe('Page item with feedme prefix and date')

      expect(parsed?.items[2]?.date_modified, 'Third channel content date modified')
        .toBe('2020-01-01T00:00:00.000Z')

      // FOURTH ITEM
      expect(parsed?.items[3]?.id, 'Fourth channel item id')
        .toBe('pages/pages/pagesRootWithLink.md')

      expect(parsed?.items[3]?.content_html, 'Fourth channel content html')
        .toBe('Link to feed.atom')

      expect(parsed?.items[3]?.url, 'Fourth channel content url')
        .toBe('/pages/pagesrootwithlink')

      expect(parsed?.items[3]?.title, 'Fourth channel content title')
        .toBe('Pages root with link')

      expect(parsed?.items[3]?.date_modified, 'Fourth channel content date modified')
        .toBe('2020-01-02T00:00:00.000Z')
    })
  })

  describe('/hooked.xml', async () => {
    it('Tests /hooked.xml validness', async () => {
      const response = await fetch('/hooked.xml')
      const content = await (await response.blob()).text()

      expect(XMLValidator.validate(content), 'Test xml validness').toBe(true)
    })

    it('Tests /hooked.xml content', async () => {
      const response = await fetch('/hooked.xml')
      const content = await (await response.blob()).text()

      const parser = new XMLParser()
      const parsed = parser.parse(content)

      expect(parsed?.rss?.channel?.title, 'Channel title')
        .toBe('Content driven (filtered pages)')

      expect(parsed?.rss?.channel?.link, 'Channel link')
        .toBe('http://localhost:3000')

      expect(parsed?.rss?.channel?.copyright, 'Channel copyright')
        .toBe('CC BY-NC-SA 4.0 2023 by Helltraitor')

      expect(parsed?.rss?.channel?.item?.length, 'Channel item amount')
        .toBe(2)

      // FIRST ITEM
      expect(parsed?.rss?.channel?.item[0]?.title, 'First channel item title')
        .toBe('Page item with feedme prefix and date')

      expect(parsed?.rss?.channel?.item[0]?.link, 'First channel item link')
        .toBe('/pages/pagesfeedmeitem')

      expect(parsed?.rss?.channel?.item[0]?.guid, 'First channel item guid')
        .toBe('pages/pages/pagesFeedmeItem.md')

      expect(parsed?.rss?.channel?.item[0]?.pubDate, 'First channel item pubDate')
        .toBe('Wed, 01 Jan 2020 00:00:00 GMT')

      expect(parsed?.rss?.channel?.item[0]?.description, 'First channel item description')
        .toBe('Content example')

      // SECOND ITEM
      expect(parsed?.rss?.channel?.item[1]?.title, 'Second channel item title')
        .toBe('Feedme item with feedme prefix and date')

      expect(parsed?.rss?.channel?.item[1]?.link, 'Second channel item link')
        .toBe('/feedmeitem')

      expect(parsed?.rss?.channel?.item[1]?.guid, 'Second channel item guid')
        .toBe('content/feedmeItem.md')

      expect(parsed?.rss?.channel?.item[1]?.pubDate, 'Second channel item pubDate')
        .toBe('Fri, 03 Jan 2020 00:00:00 GMT')

      expect(parsed?.rss?.channel?.item[1]?.description, 'Second channel item description')
        .toBe('Content example')
    })
  })
})
