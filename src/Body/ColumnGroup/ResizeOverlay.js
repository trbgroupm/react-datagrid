import React from 'react'
import Component from 'react-class'
import assign from 'object-assign'

import join from '../../join'

export default class ResizeOverlay extends Component {
  constructor(props) {
    super(props)

    this.state = {
      offset: 0,
      constrained: false
    }
  }

  setConstrained(constrained) {
    if (this.state.constrained != constrained) {
      this.setState({
        constrained
      })
    }
  }

  setOffset(offset) {
    this.setState({
      offset
    })
  }

  setActive(active) {
    this.setState({
      active
    })
  }

  render() {
    const props = this.props
    const state = this.state
    const constrained = state.constrained
    const active = props.active !== undefined ?
      props.active :
      state.active

    let { style } = props

    if (active && props.activeStyle) {
      style = assign({}, style)
    }

    const className = join(
      props.className,
      'react-datagrid__resize-overlay',
      active && 'react-datagrid__resize-overlay--active'
    )

    const proxyClassName = join(
      'react-datagrid__resize-proxy',
      constrained && 'react-datagrid__resize-proxy--constrained'
    )

    return <div
      {...props}
      style={style}
      className={className}
    >
      <div
        className={proxyClassName}
        style={{ left: this.state.offset }}
      />
    </div>
  }
}
