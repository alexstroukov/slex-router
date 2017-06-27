# Slex Router

```
$ npm install slex-router
```

`slex-router` is simple client side router which exposes an `rx` stream.

## Example Usage

```javascript
import slexRouter from 'slex-router'

const routes = {
  '/': {
    name: 'home',
    ...anything
  },
  '/item/:id': {
    name: 'item-details',
    ...anything
  },
  '/item/:id/child/:childId': {
    name: 'item-details-deep',
    ...anything
  }
}

const router = slexRouter
  .createStream(this.routes)

store.subscribe(nextRoute => {
  const { route, routeState } = nextRoute
  const { name, ...anything } = route
  const { id, childId } = routeState
})
```