import React, { PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import Component from 'react-class'
import assign from 'object-assign'
import join from '../../join'

import shallowequal from 'shallowequal'
import getColumnsInfo from '../../utils/getColumnsInfo'

import InnerWrapper from './InnerWrapper'
import Header from './Header'

export default class ColumnGroup extends Component {

  constructor(props) {
    super(props)

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
    </div>
  }

  onResizeMouseDown(headerProps, colHeaderNode, event) {
    if (this.props.onResizeMouseDown) {
      this.props.onResizeMouseDown({
        absoluteIndex: headerProps.absoluteIndex,
        colHeaderNode,
        headerNode: findDOMNode(this.header),
        event
      })
    }
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
}

ColumnGroup.defaultProps = {
  isColumnGroup: true
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
