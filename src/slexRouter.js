import Rx from 'rx'
import _ from 'lodash'

class SlexRouter {

  constructor () {
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
    for (let { pattern, paramNamesOrder, routePattern, route } of routes) {
      const match = pattern.exec(path)
      if (match) {
        const extras = this._popRouteExtras({ path })
        const routeState = _.chain(match)
          .slice(1)
          .map((param, index) => {
            if (this._isNumber(param)) param = +param
            return param
          })
          .reduce((routeState, next, index) => {
            routeState[paramNamesOrder[index]] = next
            return routeState
          }, { path, routePattern, extras })
          .value()
        return { route, routeState }
      }
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
