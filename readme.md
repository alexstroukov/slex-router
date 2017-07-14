# Slex Router

```
$ npm install slex-router
```

`slex-router` is a simple client side router which exposes an `rxjs` stream.

## Example Usage

```javascript
import slexRouter from 'slex-router'

const routes = {
  '/': {
    name: 'home',
    ...anything
  },
  '/item/:id': {
    name: 'itemDetails',
    ...anything
  },
  '/item/:id/child/:childId': {
    name: 'itemDetailsDeep',
    ...anything
  },
  '/*params': {
    name: 'wildcardRoute',
    ...anything
  }
  'default': {
    name: 'defaultRoute',
    ...anything
  }
}

const router = slexRouter
  .createStream(routes)

const subscription = router.subscribe(nextRoute => {
  const { route, routeState } = nextRoute
  const { name, ...anything } = route
  const { id, childId } = routeState
})

subscription.dispose()
```