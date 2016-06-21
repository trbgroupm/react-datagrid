import React, { PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import Component from 'react-class'
import assign from 'object-assign'
import Region from 'region'
import join from '../../join'

import shallowequal from 'shallowequal'
import getColumnsInfo from '../../utils/getColumnsInfo'

import InnerWrapper from './InnerWrapper'
import Header from './Header'
import ResizeOverlay from './ResizeOverlay'

import setupColumnResize from './setupColumnResize'

export default class ColumnGroup extends Component {

  constructor(props) {
    super(props)

    this.refResizeOverlay = (r) => { this.resizeOverlay = r }
    this.refHeader = (h) => { this.header = h }
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.shouldComponentUpdate) {
      return nextProps.shouldComponentUpdate(nextProps, this.props)
    }

    return !shallowequal(nextProps, this.props)
  }

  render() {
    const props = this.props
    const {
      viewportHeight,
      width,
      fixed,
      innerWrapperOffset,
      header,
      columns,
      isMultiSort,
      sortable,
      sortInfo,
      resizable,
      columnMinWidth,
      data,
    } = props

    const style = assign({}, props.style, {
     // height: viewportHeight,
    })

    if (width !== undefined) {
      style.width = width
    }

    const { minWidth, maxWidth } = getColumnsInfo(columns)


    // Fixed means that it is not allowed to have horizontal scroll
    if (fixed) {
      style.minWidth = minWidth
    }

    const className = join(
        'react-datagrid__column-group',
        props.className
      )

    const innerWrapperStyle = {
      transform: `translate3d(0,${innerWrapperOffset}px, 0)`
    }

    return <div
      {...props}
      className={className}
      style={style}
      data={null}
      onScroll={this.onScroll}
    >
      {
        header && <Header
          ref={this.refHeader}
          data={data}
          columns={columns}
          minWidth={minWidth}
          maxWidth={maxWidth}
          onCellClick={props.onHeaderCellClick}
          onSortClick={props.onHeaderSortClick}
          isMultiSort={isMultiSort}
          sortable={sortable}
          sortInfo={sortInfo}
          resizable={resizable}
          onResize={this.onResize}
          onResizeMouseDown={this.onResizeMouseDown}
        />
      }
      <div className="react-datagrid__column-group__body">
        <div
          className="react-datagrid__column-group__body__inner-wrapper"
          style={innerWrapperStyle}
        >
          <InnerWrapper
            {...props}
            columns={columns}
            minWidth={minWidth}
            maxWidth={maxWidth}
            innerWrapperOffset={null}
          />
        </div>
      </div>

      <ResizeOverlay
        ref={this.refResizeOverlay}
      />
    </div>
  }

  onResize({ height }) {
    if (this.props.onHeaderHeightChange) {
      this.props.onHeaderHeightChange(height)
    }
  }

  onScroll(ev) {
    ev.stopPropagation()
    this.props.onScroll(ev)
  }

  onResizeMouseDown(headerProps, colHeaderNode, event) {
    event.preventDefault()
    event.stopPropagation()

    const region = Region.from(event.currentTarget.firstChild || event.currentTarget)

    const columnHeaderNodes = this.header.getCellDOMNodes()
    const { columns } = this.props
    const index = headerProps.index

    const headerRegion = Region.from(findDOMNode(this.header))
    const constrainTo = Region.from(headerRegion.get())

    const column = columns[index]
    const columnRegion = Region.from(columnHeaderNodes[index])
    const minWidth = column.minWidth

    const left = minWidth + columnRegion.left
    constrainTo.set({ left })

    if (column.maxWidth) {
      const right = columnRegion.left + column.maxWidth
      constrainTo.set({ right })
    }

    setupColumnResize({
      headerRegion,
      constrainTo,
      region,
      columnHeaderNodes,
      columns,
      index
    }, {
      onResizeDragInit: this.onResizeDragInit,
      onResizeDrag: this.onResizeDrag,
      onResizeDrop: this.onResizeDrop
    }, event)
  }

  onResizeDragInit({ offset, constrained }) {
    this.resizeOverlay.setOffset(offset)
    this.resizeOverlay.setActive(true)
    this.resizeOverlay.setConstrained(constrained)
  }

  onResizeDrop({ index, offset, constrained, size }) {
    this.resizeOverlay.setOffset(offset)
    this.resizeOverlay.setConstrained(constrained)
    this.resizeOverlay.setActive(false)

    this.onColumnResize({
      index,
      size
    })
  }

  onResizeDrag({ offset, constrained }) {
    this.resizeOverlay.setOffset(offset)
    this.resizeOverlay.setConstrained(constrained)
  }

  onColumnResize({ index, size }) {
    const column = this.props.columns[index]
    this.props.onColumnResize({ column, size })
  }
}

ColumnGroup.defaultProps = {
  isColumnGroup: true,
  onColumnResize: () => {}
}

ColumnGroup.propTypes = {
  children: (props, propName) => {
    const children = props[propName]

    React.Children.map(children, (child) => {
      if ( !child || !child.props ||  !child.props.isColumn) {
        return new Error('The only children allowed of Datagrid are ColumnGroup')
      }
    })
  },
  onRowMouseEnter: PropTypes.func,
  onRowMouseLeave: PropTypes.func,
}
