import type { NitroApp } from 'nitropack'

export default (nitroApp: NitroApp) => {
  nitroApp.hooks.hook('feedme:handle', async ({ context: { event }, feed }) => {
    // Note: The RSS feed can be defined by hook in other plugin,
    //       or by more specialized one
    if (!feed.invoke())
      feed.create({ id: '', title: `Default feed for '${event.path}' route`, copyright: '' })
  })
}
