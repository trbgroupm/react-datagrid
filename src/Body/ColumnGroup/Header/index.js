import React, { PropTypes } from 'react'
import Component from 'react-class'

import assign from 'object-assign'
import { Flex } from 'react-flex'
import { NotifyResize } from 'react-notify-resize'

import Cell from '../Cell'

import getIndexBy from '../../../utils/getIndexBy'
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
    const { width, minWidth } = props
    let { style } = props

    if (width || minWidth) {
      style = assign({}, props.style)

      if (width) {
        style.width = Math.max(width, minWidth || 0)
      }

      if (minWidth) {
        style.minWidth = minWidth
      }
    }

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
      sortable,
      sortInfo,
      isMultiSort
    } = props

    return columns.map((column) => {
      const {
        name,
        title,
        index,
        sortable: sortableColumn
      } = column

      const isSortable = sortable && sortableColumn !== false
      let cellSortInfo = null

      if (isSortable && sortInfo) {
        if (isMultiSort) {
          const sortInfoIndex = getIndexBy(sortInfo, 'name', name)
          cellSortInfo = sortInfoIndex !== -1 ? sortInfo[sortInfoIndex] : null
        } else {
          cellSortInfo = sortInfo.index === index ? sortInfo : null
        }
      }

      let value
      if (title) {
        value = typeof title === 'function' ?
            title(assign({}, props, {
              column,
              columnSortInfo: cellSortInfo
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
        onClick={this.props.onCellClick}
        onSortClick={this.props.onSortClick}
        sortable={isSortable}
        sortInfo={cellSortInfo}
      />
    })
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
