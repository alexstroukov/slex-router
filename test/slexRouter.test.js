import { expect } from 'chai'
import sinon from 'sinon'
import slexRouter from '../src/slexRouter'
import jsdom from 'jsdom'

describe('slexRouter', function () {
  const sandbox = sinon.sandbox.create()
  before(function () {
    global.document = jsdom.jsdom(`<body><div id='root'></div></body>`)
    global.window = document.defaultView
    global.navigator = window.navigator
    jsdom.changeURL(window, 'https://example.com/#/')
  })

  beforeEach(function () {
    sandbox.restore()
  })

  afterEach(function () {
    sandbox.restore()
  })

  describe('createStream', function () {
    it('should trigger upon subscription with the current route', function () {
      return new Promise((resolve) => {
        const router = slexRouter
          .createStream({})

        router.subscribe(nextRoute => {
          resolve()
        })
      })
    })
  })

  describe('routes', function () {
    describe('given that any route is matched', function () {
      const routes = {
        '/item/:id': {
          name: 'itemDetails',
          providedFunction: function () {},
          providedArray: [],
          providedObject: {}
        }
      }
      beforeEach(function () {
        window.location.hash = '/item/1'
      })
      it('should provide the route with the route name and any other properties in the route object', function () {
        const router = slexRouter
          .createStream(routes)
        return router
          .first()
          .toPromise()
          .then(nextRoute => {
            const { route } = nextRoute
            expect(route.name).to.equal(routes['/item/:id'].name)
            expect(route.providedFunction).to.equal(routes['/item/:id'].providedFunction)
            expect(route.providedArray).to.equal(routes['/item/:id'].providedArray)
            expect(route.providedObject).to.equal(routes['/item/:id'].providedObject)
          })
      })
      it('should provide routeState with the matched path and routePattern', function () {
        const router = slexRouter
          .createStream(routes)
        return router
          .first()
          .toPromise()
          .then(nextRoute => {
            const { routeState } = nextRoute
            expect(routeState.path).to.equal('/item/1')
            expect(routeState.routePattern).to.equal('/item/:id')
          })
      })
    })
    describe('given the path matches the base route (`/`)', function () {
      const routes = {
        '/': {
          name: 'home'
        }
      }
      beforeEach(function () {
        window.location.hash = '/'
      })
      it('should return the registered base route', function () {
        const router = slexRouter
          .createStream(routes)
        return router
          .first()
          .toPromise()
          .then(nextRoute => {
            const { route } = nextRoute
            expect(route.name).to.equal('home')
          })
      })
    })
    describe('given the path matches an unparameterised route (`/about`)', function () {
      const routes = {
        '/about': {
          name: 'about'
        }
      }
      beforeEach(function () {
        window.location.hash = '/about'
      })
      it('should return the registered unparameterised route', function () {
        const router = slexRouter
          .createStream(routes)
        return router
          .first()
          .toPromise()
          .then(nextRoute => {
            const { route } = nextRoute
            expect(route.name).to.equal('about')
          })
      })
    })
    describe('given the path matches an unparameterised nested route (`/about/plants`)', function () {
      const routes = {
        '/about/plants': {
          name: 'aboutPlants'
        }
      }
      beforeEach(function () {
        window.location.hash = '/about/plants'
      })
      it('should return the registered unparameterised nested route', function () {
        const router = slexRouter
          .createStream(routes)
        return router
          .first()
          .toPromise()
          .then(nextRoute => {
            const { route } = nextRoute
            expect(route.name).to.equal('aboutPlants')
          })
      })
    })
    describe('given the path matches a parametarised route (`/item/:id`)', function () {
      const routes = {
        '/item/:id': {
          name: 'itemDetails'
        }
      }
      beforeEach(function () {
        window.location.hash = '/item/1'
      })
      it('should return the registered parametarised route', function () {
        const router = slexRouter
          .createStream(routes)
        return router
          .first()
          .toPromise()
          .then(nextRoute => {
            const { route } = nextRoute
            expect(route.name).to.equal('itemDetails')
          })
      })
      it('should return the route parameters in routeState', function () {
        const router = slexRouter
          .createStream(routes)
        return router
          .first()
          .toPromise()
          .then(nextRoute => {
            const { routeState } = nextRoute
            expect(routeState.id).to.equal(1)
          })
      })
    })
    describe('given the path matches a nested parametarised route (`/item/:id/child/:childId`)', function () {
      const routes = {
        '/item/:id/child/:childId': {
          name: 'itemDetailsDeep'
        }
      }
      beforeEach(function () {
        window.location.hash = '/item/1/child/2'
      })
      it('should return the registered parametarised route', function () {
        const router = slexRouter
          .createStream(routes)
        return router
          .first()
          .toPromise()
          .then(nextRoute => {
            const { route } = nextRoute
            expect(route.name).to.equal('itemDetailsDeep')
          })
      })
      it('should return the route parameters in routeState', function () {
        const router = slexRouter
          .createStream(routes)
        return router
          .first()
          .toPromise()
          .then(nextRoute => {
            const { routeState } = nextRoute
            expect(routeState.id).to.equal(1)
            expect(routeState.childId).to.equal(2)
          })
      })
    })
    describe('given the path matches a wildcard route (`/*params`)', function () {
      const routes = {
        '/*params': {
          name: 'wildcardRoute'
        }
      }
      beforeEach(function () {
        window.location.hash = '/item/1/child/2'
      })
      it('should return the registered parametarised route', function () {
        const router = slexRouter
          .createStream(routes)
        return router
          .first()
          .toPromise()
          .then(nextRoute => {
            const { route } = nextRoute
            expect(route.name).to.equal('wildcardRoute')
          })
      })
      it('should return the route parameters in routeState', function () {
        const router = slexRouter
          .createStream(routes)
        return router
          .first()
          .toPromise()
          .then(nextRoute => {
            const { routeState } = nextRoute
            expect(routeState.item).to.equal(1)
            expect(routeState.child).to.equal(2)
          })
      })
    })
    describe('given the path matches a nested wildcard route (`/dashboard/:dashboardCategory/*params`)', function () {
      const routes = {
        '/dashboard/:dashboardCategory/*params': {
          name: 'nestedWildcardRoute'
        }
      }
      beforeEach(function () {
        window.location.hash = '/dashboard/summaries/item/1/child/2'
      })
      it('should return the registered parametarised route', function () {
        const router = slexRouter
          .createStream(routes)
        return router
          .first()
          .toPromise()
          .then(nextRoute => {
            const { route } = nextRoute
            expect(route.name).to.equal('nestedWildcardRoute')
          })
      })
      it('should return the route parameters in routeState', function () {
        const router = slexRouter
          .createStream(routes)
        return router
          .first()
          .toPromise()
          .then(nextRoute => {
            const { routeState } = nextRoute
            expect(routeState.dashboardCategory).to.equal('summaries')
            expect(routeState.item).to.equal(1)
            expect(routeState.child).to.equal(2)
          })
      })
    })
    describe('given the path matches a parameterised nested wildcard route (`/item/*params`)', function () {
      const routes = {
        '/dashboard/*params': {
          name: 'nestedWildcardRoute'
        }
      }
      beforeEach(function () {
        window.location.hash = '/dashboard/item/1/child/2'
      })
      it('should return the registered parametarised route', function () {
        const router = slexRouter
          .createStream(routes)
        return router
          .first()
          .toPromise()
          .then(nextRoute => {
            const { route } = nextRoute
            expect(route.name).to.equal('nestedWildcardRoute')
          })
      })
      it('should return the route parameters in routeState', function () {
        const router = slexRouter
          .createStream(routes)
        return router
          .first()
          .toPromise()
          .then(nextRoute => {
            const { routeState } = nextRoute
            expect(routeState.item).to.equal(1)
            expect(routeState.child).to.equal(2)
          })
      })
    })
    describe('given the path doesnt have a matching route', function () {
      const routes = {
        'default': {
          name: 'defaultRoute'
        }
      }
      beforeEach(function () {
        window.location.hash = '/'
      })
      it('should return the registered default route', function () {
        const router = slexRouter
          .createStream(routes)
        return router
          .first()
          .toPromise()
          .then(nextRoute => {
            const { route } = nextRoute
            expect(route.name).to.equal('defaultRoute')
          })
      })
    })
  })

  describe('push', function () {
    const routes = {
      '/': {
        name: 'home'
      },
      '/about': {
        name: 'about'
      }
    }
    beforeEach(function () {
      window.location.hash = '/'
    })
    it('should trigger a url change', function () {
      const router = slexRouter
        .createStream(routes)
        .skip(1)
        .first()
        .toPromise()
        .then(nextRoute => {
          const { route } = nextRoute
          expect(route.name).to.equal('about')
        })
      slexRouter.push({ path: '/about' })
      return router
    })
    it('should pass through the given extras in routeState', function () {
      const extras = {}
      const router = slexRouter
        .createStream(routes)
        .skip(1)
        .first()
        .toPromise()
        .then(nextRoute => {
          const { routeState } = nextRoute
          expect(routeState.extras).to.equal(extras)
        })
      slexRouter.push({ path: '/about', extras })
      return router
    })
  })

  describe('replace', function () {
    const routes = {
      '/': {
        name: 'home'
      },
      '/about': {
        name: 'about'
      }
    }
    beforeEach(function () {
      window.location.hash = '/'
    })
    it('should trigger a url change', function () {
      const router = slexRouter
        .createStream(routes)
        .skip(1)
        .first()
        .toPromise()
        .then(nextRoute => {
          const { route } = nextRoute
          expect(route.name).to.equal('about')
        })
      slexRouter.replace({ path: '/about' })
      return router
    })
    it('should pass through the given extras in routeState', function () {
      const extras = {}
      const router = slexRouter
        .createStream(routes)
        .skip(1)
        .first()
        .toPromise()
        .then(nextRoute => {
          const { routeState } = nextRoute
          expect(routeState.extras).to.equal(extras)
        })
      slexRouter.replace({ path: '/about', extras })
      return router
    })
    it('should replace the current route', function () {
      const locationSpy = sandbox.spy(global.window.location, 'replace')
      slexRouter.replace({ path: '/about' })
      const path = locationSpy.firstCall.args[0].split('#')[1]
      expect(path).to.equal('/about')
    })
  })
})
