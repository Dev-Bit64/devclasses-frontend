/**
 * Class applied to portalled content (dialogs, menus, tooltips, popovers).
 * Portals render outside the page tree, so they must re-apply the scoped reset and tokens.
 * `.dc-public` and `.dc-app` resolve to an identical reset, so one class covers content
 * opened from either surface.
 */
export const PORTAL_SCOPE = "dc-public";
