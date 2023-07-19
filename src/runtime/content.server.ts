import type { NitroApp } from 'nitropack'

/**
 * Why are we declaring types for  `defineNitroPlugin`?
 *
 * It appears that there is no way to import `defineNitroPlugin` from #imports
 * without TypeScript screaming. It might be that the `#imports` types are not
 * exported at project generation phase with `nuxi` CLI
 *
 * If this issue can be resolved, then this code can of course be deleted
 * and changed to the following:
 *
 * ```ts
 * import { defineNitroPlugin } from '#imports'
 * ```
 *
 * ----------------------------------------------------------------------------
 *
 * MANY THANKS AND SALUTATIONS TO THE CHAKRA-UI DEV TEAM
 *
 * [EXPLANATION BY CHAKRA-UI](
 *   https://github.com/chakra-ui/chakra-ui-vue-next/blob/main/modules/nuxt/src/runtime/chakra.server.ts
 * )
 */

export type NitroAppPlugin = (nitro: NitroApp) => void

export const defineNitroPlugin = (setup: NitroAppPlugin) => setup

export default defineNitroPlugin((nitroApp) => {
})
