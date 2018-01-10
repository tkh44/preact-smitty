import { Component, h } from 'preact'
import { createStore } from 'smitty'

const tree = createStore({
  connections: [],
  trackers: []
})

tree.createActions({
  register: 'preact-smitty/REGISTER',
  unregister: 'preact-smitty/UNREGISTER',
  setUserStore: 'preact-smitty/SET_USER_STORE',
  userStoreChange: 'preact-smitty/USER_STORE_CHANGE',
  trackAction: 'preact-smitty/TRACK_ACTION',
  releaseAction: 'react-smitty/RELEASE_ACTION'
})

const calculateNextState = userStoreState => ({
  instance,
  mapStateToProps,
  getProps
}) => {
  if (typeof mapStateToProps !== 'function') {
    return
  }

  const nextState = mapStateToProps(userStoreState, getProps())

  if (instance.state !== nextState) {
    instance.setState(nextState)
  }
}

tree.handleActions({
  [tree.actions.setUserStore]: (state, payload) => {
    state.userStore = payload
  },
  [tree.actions.register]: (state, payload) => {
    payload.instance.store = state.userStore
    payload.instance.state = payload.mapStateToProps
      ? payload.mapStateToProps(state.userStore.state, payload.getProps())
      : {}

    if (payload.mapStateToProps && payload.mapStateToProps.length === 2) {
      payload.instance.componentWillReceiveProps = function(nextProps) {
        if (this.props !== nextProps) {
          calculateNextState(state.userStore.state)(payload)
        }
      }
    }

    state.connections = state.connections.concat(payload)
  },
  [tree.actions.unregister]: (state, payload) => {
    const index = state.connections.findIndex(inst => inst === payload)
    state.connections.splice(index, 1)
  },
  [tree.actions.userStoreChange]: (state, userStoreState) => {
    const updater = calculateNextState(userStoreState)
    state.connections.forEach(updater)
  },
  [tree.actions.trackAction]: (state, payload) => {
    payload.instance.store = state.userStore

    let cb = data => {
      let props = payload.getProps()
      if (
        payload.shouldTrackerUpdate(
          state.userStore.state,
          props,
          payload.type,
          data
        )
      ) {
        const nextState = {}
        nextState[payload.key] = payload.tracker(
          state.userStore.state,
          payload.getProps(),
          payload.type,
          data
        )
        payload.instance.setState(() => nextState)
      }
    }

    payload.instance.componentWillReceiveProps = function(nextProps) {
      if (this.props !== nextProps) {
        cb()
      }
    }

    state.userStore.on(payload.type, cb)
    state.trackers.push({
      instance: payload.instance,
      type: payload.type,
      cb
    })

    if (
      payload.shouldTrackerUpdate(
        state.userStore.state,
        payload.getProps(),
        payload.type,
        undefined
      )
    ) {
      const nextState = {}
      nextState[payload.key] = payload.tracker(
        state.userStore.state,
        payload.getProps(),
        payload.type,
        undefined
      )
      payload.instance.setState(() => nextState)
    }
  },
  [tree.actions.releaseAction]: (state, payload) => {
    const index = state.connections.findIndex(inst => inst === payload)
    const tracker = state.connections[index]
    state.userStore.off(tracker.type, tracker.cb)
    state.connections.splice(index, 1)
  }
})

export class Provider extends Component {
  constructor(props) {
    super(props)
    tree.actions.setUserStore(props.store)
    this.props.store.on('$$store:state:change', tree.actions.userStoreChange)
  }

  render(props) {
    return props.children[0]
  }
}

export function connect(mapStateToProps) {
  return function wrapComponent(WrappedComponent) {
    return class Connect extends Component {
      constructor(props) {
        super(props)
        tree.actions.register({
          instance: this,
          mapStateToProps,
          getProps: () => this.props
        })
      }

      componentWillUnmount() {
        tree.actions.unregister(this)
      }

      render(props, state) {
        return h(
          WrappedComponent,
          Object.assign({}, props, state, {
            emit: this.store.emit,
            actions: this.store.actions
          })
        )
      }
    }
  }
}

export function track(
  type,
  statePropertyKey,
  tracker,
  shouldTrackerUpdate = () => true
) {
  return function wrapComponent(WrappedComponent) {
    return class Track extends Component {
      constructor(props) {
        super(props)

        tree.actions.trackAction({
          instance: this,
          type: type.toString(),
          key: statePropertyKey,
          shouldTrackerUpdate,
          tracker,
          getProps: () => this.props
        })
      }

      componentWillUnmount() {
        tree.actions.releaseAction(this)
      }

      render(props, state) {
        return h(
          WrappedComponent,
          Object.assign({}, props, state, {
            emit: this.store.emit,
            actions: this.store.actions
          })
        )
      }
    }
  }
}
