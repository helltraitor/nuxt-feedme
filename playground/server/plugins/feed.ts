import type { NitroApp } from 'nitropack'

export default (nitroApp: NitroApp) => {
  nitroApp.hooks.hook('feedme:handle:content:item[/contentDefaults.xml]', async ({ feed: { insert, invoke, parsed } }) => {
    if (parsed.title === 'First item') {
      const maybeItemOptions = invoke()
      insert({
        ...maybeItemOptions,
        category: [
          ...maybeItemOptions?.category ?? [],
          { name: 'content hook processed' },
        ],
      })
    }
  })

  nitroApp.hooks.hook('feedme:handle:content:item[/contentDefaults.xml]', async ({ feed: { insert, invoke, parsed } }) => {
    // In case if you use several nitro plugins, item can be created already
    const maybeItemOptions = invoke()
    // Insertions replace item, so you can update current \ create new with existed keys (undefined equals to {})
    insert({
      ...maybeItemOptions,
      image: {
        title: 'Title',
        // parsed.feedme.image.url | parsed.feedme.image.source | parsed.image.url | ...
        // Depends on how you put this item in yaml meta
        // Yaml objects (such as image: { title: Title, source: Link }) will be kept
        //
        // The most probably is that you have just relative link to this page: media/og.png
        // so it should be concatenated with parsed._path
        //
        // Then you can apply tag [/^(?=\/)/, baseUrl], to replace relative links to hosted ones
        url: `${parsed._path}/${parsed?.image?.url}`,
      },
    })
  })

  nitroApp.hooks.hook('feedme:handle[/feed.xml]', async ({ context: { event }, feed }) => {
    // Note: In case when several hooks exist, they may be called in chain.
    //       So it's possible to completely override early feed
    feed.create({ id: '', title: `Special feed for '${event.path}' route`, copyright: '' })
  })

  nitroApp.hooks.hook('feedme:handle', async ({ context: { event }, feed }) => {
    // Note: The RSS feed can be defined by hook in other plugin,
    //       or by more specialized one
    if (!feed.invoke())
      feed.create({ id: '', title: `Default feed for '${event.path}' route`, copyright: '' })
  })
}
