import type { NitroApp } from 'nitropack'

export default (nitroApp: NitroApp) => {
  nitroApp.hooks.hook('feedme:handle', async ({ feed }) => {
    return feed.create({ id: '', title: '', copyright: '' })
  })
}
