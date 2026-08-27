/**
 * dsh-todo-panel, node half.
 *
 * The plugin is browser-only: it registers a "TODO" tab into
 * dsh-better-sidebar and persists tasks to localStorage, so the host half
 * carries no logic. This entry exists so the package ships a valid
 * `main`/`lib/index.js` for the bundle loader; activating it is a no-op.
 */

import type { Context } from '@deepseek-ai/cordis'

/** Required for type merging (does not add runtime work). */
import type {} from 'dsh-better-sidebar'

/** Services this host half depends on. Kept empty: no host capability needed. */
export const inject: string[] = []

/**
 * Host entry. The browser half ships via exports["./client"], discovered
 * through the package.json dsh.client declaration.
 * @param ctx - host cordis context (unused; the plugin is browser-only).
 */
export function apply(_ctx: Context): void {
  // Browser-only plugin: nothing to register on the host side.
}
