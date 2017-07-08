import Rx from 'rx'
import _ from 'lodash'

class SlexRouter {

  constructor () {
    this._processParam = this._processParam.bind(this)
    this._tryMatchRoute = this._tryMatchRoute.bind(this)
    this._getRelevantPath = this._getRelevantPath.bind(this)
    this._isNumber = this._isNumber.bind(this)
    this._mapRouteToParamsArray = this._mapRouteToParamsArray.bind(this)
    this._mapRoutesToMatchers = this._mapRoutesToMatchers.bind(this)
    this._popRouteExtras = this._popRouteExtras.bind(this)
    this._cacheRouteExtras = this._cacheRouteExtras.bind(this)

    this.push = this.push.bind(this)
    this.replace = this.replace.bind(this)
    this.createStream = this.createStream.bind(this)

    this.extras = {}
  }

  createStream (routes) {
    const mappedRoutes = this._mapRoutesToMatchers(routes)
    return Rx.Observable.fromEvent(window, 'hashchange')
      .startWith(this._getRelevantPath())
      .distinctUntilChanged()
      .map(this._getRelevantPath)
      .map(path => this._tryMatchRoute(mappedRoutes, path))
  }

  _cacheRouteExtras ({ path, extras }) {
    this.extras = Object.assign({}, this.extras, {
      [path]: extras
    })
  }
  _popRouteExtras ({ path }) {
    const extras = this.extras[path]
    this.extras = _.omit(this.extras, path)
    return extras
  }

  push ({ path, extras }) {
    window.location.hash = path
    this._cacheRouteExtras({ path, extras })
  }

  replace ({ path, extras }) {
    window.location.replace(`${window.location.origin}${window.location.pathname}#${path}`)
    this._cacheRouteExtras({ path, extras })
  }

  _mapRoutesToMatchers (routes) {
    return Object
      .keys(routes)
      .map(routePattern => {
        const paramNamesOrder = this._mapRouteToParamsArray(routePattern)
        const route = routes[routePattern]
        const patternPath = routePattern
          // replace ':paramName' with matcher
          .replace(/:[^\/]+/g, '([^/]+)')
          // replace wildcard param '*paramName' with matcher
          .replace(/\*[^\/]+/g, '([\\\S]+)')
          // match any number of trailing slashes
          .replace(/:[^\/]+/g, '/*')
          // accept trailing slashes
          .concat('\/?')

        const pattern = new RegExp(`^${patternPath}$`)

        return { pattern, paramNamesOrder, routePattern, route }
      })
  }

  _mapRouteToParamsArray (path) {
      // match any ':params' and '*params'
    return (path.match(/(:|\*)[^\/]+/g) || [])
      // and remove their ':' and '*'
      .map(part => part.replace(/(:|\*)+/g, ''))
  }

  _tryMatchRoute (routes, path) {
    const result = _.chain(routes)
      .find(route => route.pattern.test(path))
      .thru(matchedRoute => {
        if (matchedRoute) {
          const { pattern, paramNamesOrder, routePattern, route } = matchedRoute
          const match = pattern.exec(path)
          const extras = this._popRouteExtras({ path })
          const routeState = _.chain(match)
            .slice(1)
            .map(this._processParam)
            .reduce((routeState, next, index) => {
              if (_.isString(next) && next.includes('/')) {
                const speadState = _.chain(next)
                  .split('/')
                  .map((item, index) => ({ item, index }))
                  .partition(({ item, index }) => {
                    return index % 2 === 0
                  })
                  .unzip()
                  .zipWith(([{ item: key }, { item: value }]) => {
                    return { [key]: this._processParam(value) }
                  })
                  .reduce((memo, next) => ({ ...memo, ...next }), {})
                  .value()
                return {
                  ...routeState,
                  ...speadState
                }
              } else {
                return {
                  ...routeState,
                  [paramNamesOrder[index]]: next
                }
              }
            }, { path, routePattern, extras })
            .value()
          return { route, routeState }
        } else {
          const defaultRoute = _.chain(routes)
            .find(route => route.routePattern === 'default')
            .value()
          if (defaultRoute) {
            const { route, routePattern } = defaultRoute
            const routeState = {
              extras: {},
              path,
              routePattern
            }
            return {
              route,
              routeState
            }
          } else {
            return undefined
          }
        }
      })
      .value()
    return result
  }

  _processParam (param) {
    if (this._isNumber(param)) {
      return +param
    } else {
      return param
    }
  }

  _getRelevantPath () {
    return window.location.hash
      // replace '#' or '#!' followed by any number of '/' until the first character other than / - with just '/'
      .replace(/^#!?\/*/, '/')
      // replace empty string with at least one slash
      .replace(/^$/, '/')
  }

  _isNumber (value) {
    return value !== '' && value !== null && !isNaN(value)
  }
}

export default new SlexRouter()
