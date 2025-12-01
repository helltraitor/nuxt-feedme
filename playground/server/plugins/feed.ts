import type { NitroFeedmeHandleOptions as _NFHO } from '../../../src/types'
import type { NitroFeedmeContentOptionsQuery as _NFCOQ, NitroFeedmeContentOptionsItem as _NFCOI } from '../../../src/types/content'

import type { NitroApp } from 'nitropack'
import { queryCollection } from '@nuxt/content/server'

export default (nitroApp: NitroApp) => {
  nitroApp.hooks.hook('feedme:handle', async ({ context: { event, routeSettings }, feed: { obtain } }) => {
    // Note: You need to manually escape content paths when use both manual and content approaches
    const escapeRoutes = new Set(['/content.xml', '/pages.json', '/hooked.xml'])
    if (escapeRoutes.has(event.path)) return

    // Note: Since there's no specialized hooks for atom feed, general will create feed object
    const feed = obtain({ title: `Default feed for '${event.path}'`, ...routeSettings.feed })
    feed.addItem({ date: new Date('2025-09-20'), link: '/', title: 'General hook article' })
  })

  nitroApp.hooks.hook('feedme:handle[/feed.xml]', async ({ context: { event }, feed: { obtain } }) => {
    // Note: Specialized hook is always called before general
    const feed = obtain({ title: `Special feed for '${event.path}' route` })
    feed.addItem({ date: new Date('2025-09-21'), link: '', title: 'Exclusive for xml (from specialized hook)' })
  })

  nitroApp.hooks.hook('feedme:handle:content:query[/hooked.xml]', async ({ context: { event }, query }) => {
    // Provide collections names
    // query.fromCollections(['pages', 'content'])

    // Or add queries directly (optionally with sql operators, such as `like`, `where`, etc...)
    query.add(queryCollection(event, 'pages'), queryCollection(event, 'content'))
  })

  nitroApp.hooks.hook('feedme:handle:content:item[/hooked.xml]', async ({ item }) => {
    // Delete all items which has `root` in their title
    if (item.get().title?.match(/root/gi)) item.del()
  })

  nitroApp.hooks.hook('feedme:handle:content:after[/hooked.xml]', async ({ context: { event } }) => {
    // Content Type contains detected feed type and at least default charset
    // So it always satisfies next schema: `feed-type; charset=.*`
    const maybeArrayContentType = event.node.res.getHeader('content-type')
    const currentContentType = [maybeArrayContentType]
      .flat()
      ?.at(0)
      ?.toString()
      ?.split(';', 1)
      ?.at(0)
      ?? 'text/plain'

    event.node.res.setHeader('content-type', `${currentContentType}; charset=unicode-1-1-utf-8`)
  })
}
