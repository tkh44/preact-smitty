# preact-smitty

[![npm version](https://badge.fury.io/js/preact-smitty.svg)](https://badge.fury.io/js/preact-smitty)
[![Build Status](https://travis-ci.org/tkh44/preact-smitty.svg?branch=master)](https://travis-ci.org/tkh44/preact-smitty)
[![codecov](https://codecov.io/gh/tkh44/preact-smitty/branch/master/graph/badge.svg)](https://codecov.io/gh/tkh44/preact-smitty)



Preact bindings for [smitty](https://github.com/tkh44/smitty)

```bash
npm install -S preact-smitty
```

### Basics
```javascript
let mapStateToProps = (state, { id }) => {
  return {
    room: state.rooms[id]
  }
}
const Room = connect(mapStateToProps)(
  class Room extends Component {
    render ({ room = {} }) {
      console.log(room) // logs { id: '1', ... }
      return <h1>room.title</h1>
    }
  }
)

render(
  <Provider store={store}>
    <Room id={'1'}
  </Provider>,
  document.body
)
```

### Demos
- Basic
  - [Map as state](http://codepen.io/tkh44/pen/xgqBmO)
  - [Immutable.Map as state](http://codepen.io/tkh44/pen/MJpREe)
- Async
  - [Fetch api with Immutable.Map as state](http://codepen.io/tkh44/pen/JEWKJX)
- Fun
  - [UI colors with Immutable.Map as state](http://codepen.io/tkh44/pen/xgqNqy)
  - [UI colors with custom class as state](http://codepen.io/tkh44/pen/OWmqBz)
  - [Scroll sync](http://codepen.io/tkh44/pen/pReRVm)



