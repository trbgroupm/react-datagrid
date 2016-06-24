import React, { PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import Component from 'react-class'

import assign from 'object-assign'
import { Flex } from 'react-flex'
import { NotifyResize } from 'react-notify-resize'

import Cell from '../Cell'

import join from '../../../join'
import humanize from '../../../utils/humanize'

export default class Header extends Component {

  prepareClassName(props) {
    return join(
      'react-datagrid__column-group__header',
      props.className
    )
  }

  prepareStyle(props) {
    const { width, minWidth, maxWidth, index } = props
    let { style = {} } = props

    if (width || minWidth) {
      style = assign({}, props.style)

      if (width) {
        style.width = Math.max(width, minWidth || 0)
      }

      if (minWidth) {
        style.minWidth = minWidth
      }
    }

    if (maxWidth != null) {
      style.maxWidth = maxWidth
    }

    style.zIndex = style.zIndex || (100 - (index || 0))

    return style
  }

  render() {
    const { props } = this
    const { columns } = props

    const className = this.prepareClassName(props)
    const style = this.prepareStyle(props)

    return <Flex
      wrap={false}
      {...props}
      className={className}
      data={null}
      style={style}
    >
      {this.renderColumns(columns)}
      <NotifyResize notifyOnMount onResize={this.props.onResize} />
    </Flex>
  }

  renderColumns(columns) {
    const props = this.props
    const {
      resizable,
      sortable,
      sortInfo,
      isMultiSort
    } = props

    return columns.map((column) => {
      const {
        name,
        title,
        index,
        absoluteIndex,
        sortable: sortableColumn,
        resizable: resizableColumn
      } = column

      const isSortable = sortable && sortableColumn !== false
      const isResizable = resizable && resizableColumn !== false

      let columnSortInfo

      if (isSortable) {
        if (isMultiSort) {
          columnSortInfo = sortInfo.filter(info => info.absoluteIndex === absoluteIndex)[0]
        } else {
          columnSortInfo = sortInfo && sortInfo.absoluteIndex === absoluteIndex ?
            sortInfo :
            null
        }
      }
      let value
      if (title) {
        value = typeof title === 'function' ?
            title(assign({}, props, {
              column,
              columnSortInfo
            }))
            :
            title
      } else if (name) {
        value = humanize(name)
      }

      return <Cell
        {...column}
        headerCell
        key={index}
        value={value}
        onMount={this.onCellMount}
        onClick={this.props.onCellClick}
        onSortClick={this.props.onSortClick}
        onResizeMouseDown={this.props.onResizeMouseDown}
        onMouseDown={this.props.onMouseDown}
        sortable={isSortable}
        sortInfo={columnSortInfo}
        resizable={isResizable}
      />
    })
  }

  onCellMount(props, cell) {
    this.cells = this.cells || []

    this.cells[props.index] = cell
  }

  getCells() {
    return this.cells
  }

  getCellDOMNodes() {
    return this.cells.map(findDOMNode)
  }
}

const emptyFn = () => {}

Header.defaultProps = {
  onResize: emptyFn
}

Header.propTypes = {
  onCellClick: PropTypes.func,
  onSortClick: PropTypes.func,
  onResize: PropTypes.func
}
