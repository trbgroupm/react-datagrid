import React, { PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import Component from 'react-class'

import assign from 'object-assign'
import { Item } from 'react-flex'
import shallowequal from 'shallowequal'

import join from '../../../join'
import bemFactory from '../../../bemFactory'

const cellBem = bemFactory('react-datagrid__cell')
const headerBem = bemFactory('react-datagrid__column-header')

import RENDER_HEADER from './renderHeader'

export default class Cell extends Component {
  componentDidMount() {
    if (this.props.onMount) {
      this.props.onMount(this.props, this)
    }
  }

  shouldComponentUpdate(nextProps) {
    if (typeof nextProps.shouldComponentUpdate === 'function') {
      return nextProps.shouldComponentUpdate(nextProps, this.props)
    }

    return !shallowequal(nextProps, this.props)
  }

  prepareStyle(props) {
    const style = assign({}, props.style)

    const { minWidth, maxWidth, defaultWidth } = props
    let { width } = props

    if (width === undefined && defaultWidth !== undefined) {
      width = defaultWidth
    }

    if (width && minWidth && width < minWidth) {
      width = minWidth
    }

    if (minWidth != null) {
      style.minWidth = minWidth
    }

    if (maxWidth != null) {
      style.maxWidth = maxWidth
    }

    if (width != null) {
      if (maxWidth != null && width > maxWidth) {
        width = maxWidth
      }
      if (minWidth != null && width < minWidth) {
        width = minWidth
      }

      style.minWidth = style.maxWidth = style.width = width
    }

    return style
  }

  prepareClassName(props) {
    const {
      headerCell: isHeaderCell,
      headerCellDefaultClassName,
      cellDefaultClassName
    } = props

    const baseClassName = isHeaderCell ?
      headerCellDefaultClassName :
      cellDefaultClassName

    let className = join(
        props.className,
        baseClassName,
        props.textAlign && `${baseClassName}--align-${props.textAlign}`,
        props.first && `${baseClassName}--first`,
        props.last && `${baseClassName}--last`
      )

    if (isHeaderCell) {
      className = join(
        className,
        props.titleClassName,
        props.sortable && `${baseClassName}--sortable`,
        props.resizable && `${baseClassName}--resizable`,
        props.lastInGroup && `${baseClassName}--last-in-group`
      )
    }

    return className
  }

  render() {
    const props = this.props

    const {
      data,
      value,
      name,

      headerCell,

      render: renderCell
    } = props

    const className = this.prepareClassName(props)
    const style = this.prepareStyle(props)

    let cellProps = assign({}, props, {
      value,
      name,
      className,
      children: value,
      style,
      onClick: this.onClick
    })

    // TODO:
    // title can be
    if (headerCell) {
      // I want to add onClick event handler so I can
      // use it for sort
      cellProps = this.prepareHeaderCellProps(cellProps)
    }

    if (renderCell && !headerCell) {
      cellProps.children = renderCell({ value, data, cellProps })
    }

    return headerCell ?
        RENDER_HEADER(cellProps) :
        <Item
          {...cellProps}
          title={null}
          data={null}
        />
  }

  prepareHeaderCellProps(cellProps) {
    const { props } = this
    const { children } = cellProps

    const sortTools = this.getSortTools(
      cellProps.sortInfo ?
        cellProps.sortInfo.dir :
        null,
      cellProps
    )

    cellProps.children = [
      children,
      sortTools
    ]

    if (cellProps.sortInfo && cellProps.sortInfo.dir) {
      const dirName = cellProps.sortInfo.dir == 1 ? 'asc' : 'desc'

      cellProps.className = join(
        cellProps.className,
        `${props.headerCellDefaultClassName}--sort-${dirName}`
      )
    }

    cellProps.onResizeMouseDown = this.onResizeMouseDown.bind(this, cellProps)

    return cellProps
  }

  onResizeMouseDown(cellProps, event) {
    if (this.props.onResizeMouseDown) {
      this.props.onResizeMouseDown(cellProps, findDOMNode(this), event)
    }
  }

  onClick(event) {
    if (this.props.onClick) {
      this.props.onClick(event, this.props)
    }

    if (this.props.headerCell && this.props.sortable) {
      this.props.onSortClick(this.props)
    }
  }

  // direction can be 1, -1 or null
  getSortTools(direction = null, cellProps) {
    const { props } = this

    if (props.renderSortTool) {
      return props.renderSortTool(direction, cellProps)
    }

    let visibilityClassName = ''

    if (!direction) {
      visibilityClassName = 'react-datagrid__icon-sort--hidden'
    }

    return direction === -1 ?
      <svg className={join(visibilityClassName, 'react-datagrid__icon-sort-desc')} height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z" />
      </svg> :
      <svg className={join(visibilityClassName, 'react-datagrid__icon-sort-asc')} height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
      </svg>
  }
}

const emptyFn = () => {}

Cell.defaultProps = {
  cellDefaultClassName: cellBem(),
  headerCellDefaultClassName: headerBem(),

  minWidth: 40,

  onSortClick: emptyFn
}

Cell.propTypes = {
  render: PropTypes.func,
  renderSortTool: PropTypes.func,

  style: PropTypes.object,
  className: PropTypes.string,

  data: PropTypes.object,
  name: PropTypes.string,
  value: PropTypes.node,

  width: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  maxWidth: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  minWidth: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),

  flex: PropTypes.number,

  onClick: PropTypes.func
}
