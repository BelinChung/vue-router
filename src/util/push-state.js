/* @flow */

import { inBrowser } from './dom'
import { saveScrollPosition } from './scroll'
import { genStateKey, setStateKey, getStateKey } from './state-key'
import { extend } from './misc'

export const supportsPushState =
  inBrowser &&
  (function () {
    const ua = window.navigator.userAgent

    if (
      (ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) &&
      ua.indexOf('Mobile Safari') !== -1 &&
      ua.indexOf('Chrome') === -1 &&
      ua.indexOf('Windows Phone') === -1
    ) {
      return false
    }

    return window.history && typeof window.history.pushState === 'function'
  })()

export function pushState (url?: string, replace?: boolean) {
  if (url.indexOf(window.__QIANKUN_ROUTE_PATH__) < 0) return false

  saveScrollPosition()
  // try...catch the pushState call to get around Safari
  // DOM Exception 18 where it limits to 100 pushState calls
  const history = window.history
  try {
    const stateCopy = extend({}, history.state)
    if (replace) {
      // preserve existing history state as it could be overriden by the user
      stateCopy.key = getStateKey()
      history.replaceState(stateCopy, '', url)
    } else {
      history.pushState(Object.assign({}, stateCopy, { key: setStateKey(genStateKey()) }), '', url)
    }
  } catch (e) {
    window.location[replace ? 'replace' : 'assign'](url)
  }
}

export function replaceState (url?: string) {
  pushState(url, true)
}
