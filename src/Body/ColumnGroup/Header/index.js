import React, { PropTypes } from 'react'
import Component from 'react-class'
import { Flex } from 'react-flex'
import getIndexBy from '../../../utils/getIndexBy'

import assign from 'object-assign'
import join from '../../../utils/join'
import humanize from '../../../utils/humanize'
import Cell from '../Cell'

export default class Header extends Component {
  render(){
    const props = this.props
    const {
      width,
      columns,
      minWidth
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
    } = props

    return columns.map((column, index) => {
      const {
        name,
        title,
        sort,
      } = column
      
      let cellSortInfo = null

      if (sortable && sortInfo) {
        if (Array.isArray(sortInfo)) {
          const sortInfoIndex = getIndexBy(sortInfo, 'name', name)
          cellSortInfo = sortInfoIndex !== -1? sortInfo[sortInfoIndex] : null
        } else {
          cellSortInfo = sortInfo.name === name ? sortInfo : null
        }
      }
  
      console.log(cellSortInfo)

      let value
      if (title) {
        value = title
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

Header.propTypes = {
  onHeaderCellClick: PropTypes.func
}