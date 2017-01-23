import { Component, h } from 'preact'

export class Provider extends Component {
  getChildContext () {
    return {
      store: this.props.store
    }
  }

  render (props) {
    return props.children[0]
  }
}

export function connect (mapStateToProps) {
  function mapState (props, context) {
    if (typeof mapStateToProps !== 'function') return
    return mapStateToProps(context.store.state, props)
  }

  return function wrapComponent (WrappedComponent) {
    return class Connect extends Component {
      constructor (props, context) {
        super(props, context)
        this.state = mapState(props, context)

        this.handleStoreUpdate = () => {
          this.updateTimeout = setTimeout(() => { // setState after all events have been handled
            this.setState(mapState(this.props, this.context))
          })
        }

        context.store.on('*', this.handleStoreUpdate)
      }

      componentWillUnmount () {
        window.clearTimeout(this.updateTimeout)
        this.context.store.off('*', this.handleStoreUpdate)
      }

      render (props, state) {
        return h(
          WrappedComponent,
          Object.assign(
            {},
            Object.assign({}, props),
            state,
            { emit: this.context.store.emit }
          )
        )
      }
    }
  }
}
