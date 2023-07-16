import type { NitroApp } from 'nitropack'

export default (nitroApp: NitroApp) => {
  nitroApp.hooks.hook('feedme:handle', async ({ context: { event }, feed }) => {
    return feed.create({ id: '', title: `Feed for '${event.path}' route`, copyright: '' })
  })
}
