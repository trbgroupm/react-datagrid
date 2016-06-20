import React, { PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import Component from 'react-class'
import InlineBlock from 'react-inline-block'

import styles from './index.scss'

const join = (...args) => {
  return args.filter(x => !!x).join(' ')
}

export default class Checkbox extends Component {

  constructor(props) {
    super(props)

    this.state = {
      checked: props.defaultChecked
    }
  }
  render() {
    const props = this.props
    const checked = this.checked = props.checked === undefined ? this.state.checked : props.checked

    const icon = checked ?
      <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0h24v24H0z" fill="none" />
        <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
      :
      <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
        <path d="M0 0h24v24H0z" fill="none" />
      </svg>

    const iconClassName = join(
      styles.icon,
      props.iconClassName,
      checked ? styles.checked : styles.unchecked
    )

    const className = join(
      props.className,
      styles.materialCheckbox
    )

    return <div
      {...props}
      className={className}
      onClick={this.onClick}
      onKeyDown={this.onKeyDown}
      tabIndex={null}
    >
      <InlineBlock
        className={iconClassName}
        tabIndex={props.tabIndex}
        role="button"
        ref={icon => this.icon = findDOMNode(icon)}
        children={icon}
      />
      <InlineBlock
        onMouseDown={e => {
          e.preventDefault()
          this.icon.focus()
        }}
      >
        {props.label || props.children}
      </InlineBlock>
    </div>
  }

  onClick(event) {
    this.props.onClick(event)
    this.toggleValue()
  }

  onKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      this.toggleValue()
    }

    this.props.onKeyDown(event)
  }

  toggleValue() {
    const newValue = !this.checked
    if (this.props.checked === undefined) {
      this.setState({
        checked: newValue
      })
    }
    this.props.onChange(newValue)
  }

}

Checkbox.defaultProps = {
  onClick: () => {},
  onKeyDown: () => {},
  onChange: () => {},
  tabIndex: 0
}

Checkbox.propTypes = {
  className: PropTypes.string,
  onChange: PropTypes.func,
  onKeyDown: PropTypes.func,
  onClick: PropTypes.func,

  checked: PropTypes.bool
}
