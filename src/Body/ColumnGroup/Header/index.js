import React, { PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import Component from 'react-class'
import { Flex } from 'react-flex'
import getIndexBy from '../../../utils/getIndexBy'

import assign from 'object-assign'
import join from '../../../join'
import humanize from '../../../utils/humanize'
import Cell from '../Cell'

export default class Header extends Component {
  componentDidMount(){
    const headerNode = findDOMNode(this.refs.header)
    if (headerNode) {
      this.props.onHeaderHeightChange(headerNode.offsetHeight)
    }
  }

  render(){
    const props = this.props
    const {
      width,
      columns,
      minWidth,
      data
    } = props

    const className = join('react-datagrid__colum-group__header', props.className)
    const style = assign({}, props.style)

    if (width) {
      style.width = Math.max(width, minWidth)
    }

    if (minWidth){
      style.minWidth = minWidth
    }

    return <Flex
        {...props}
        ref="header"
        wrap={false}
        className={className}
        data={null}
        style={style}
      >
      {this.renderColumns(columns)}
    </Flex>
  }

  renderColumns(columns){
    const props = this.props
    const {
      sortable,
      sortInfo,
      isMultiSort,
    } = props

    return columns.map((column) => {
      const {
        name,
        title,
        sort,
        index,
      } = column

      let cellSortInfo = null

      if (sortable && sortInfo) {
        if (isMultiSort) {
          const sortInfoIndex = getIndexBy(sortInfo, 'name', name)
          cellSortInfo = sortInfoIndex !== -1? sortInfo[sortInfoIndex] : null
        } else {
          cellSortInfo = sortInfo.index === index? sortInfo : null
        }
      }

      let value
      if (title) {
        value = typeof title === 'function'?
            title(assign({}, props, {
              column,
              columnSortInfo: cellSortInfo
            }))
            :
            title
      } else if (name){
        value = humanize(name)
      }

      return <Cell
        {...column}
        key={index}
        headerCell
        value={value}
        onClick={this.props.onHeaderCellClick}
        sortInfo={cellSortInfo}
      />
    })
  }
}

Header.defaultProps = {
  onHeaderHeightChange: () => {},
}

Header.propTypes = {
  onHeaderCellClick: PropTypes.func,
  onHeaderHeightChange: PropTypes.func,
}
