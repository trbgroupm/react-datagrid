import React, { PropTypes } from 'react'
import Component from 'react-class'

export default class EmptyText extends Component {

  render() {
    const { props } = this
    const { emptyText, children } = props

    return <div className="react-datagrid__empty-text">{emptyText || children}</div>
  }
}

EmptyText.defaultProps = {
  emptyText: 'No records'
}

EmptyText.propTypes = {
  emptyText: PropTypes.node
}
