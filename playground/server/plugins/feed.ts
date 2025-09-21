import type {} from '../../.nuxt/types/types.routes'
import type {} from '../../../src/types'

import type { NitroApp } from 'nitropack'

export default (nitroApp: NitroApp) => {
  nitroApp.hooks.hook('feedme:handle', async ({ context: { event, routeSettings }, feed: { obtain } }) => {
    // Note: Since there's no specialized hooks for atom feed, general will create feed object
    const feed = obtain({ id: '', title: `Default feed for '${event.path}'`, copyright: '', ...routeSettings.feed })
    feed.addItem({ date: new Date('2025-09-20'), link: '/', title: 'General hook article' })
  })

  nitroApp.hooks.hook('feedme:handle[/feed.xml]', async ({ context: { event }, feed: { obtain } }) => {
    // Note: Specialized hook is always called before general
    const feed = obtain({ id: '', title: `Special feed for '${event.path}' route`, copyright: '' })
    feed.addItem({ date: new Date('2025-09-21'), title: 'Exclusive for xml (from specialized hook)' })
  })
}
