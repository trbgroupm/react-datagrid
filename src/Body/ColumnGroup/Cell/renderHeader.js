import React from 'react'
import { Flex, Item } from 'react-flex'

const RESIZE_HANDLE = <div className="react-datagrid__column-resizer-handle" />

export default (props) => {
  if (props.resizable) {
    return <Flex
      flex
      row
      style={props.style}
      className="react-datagrid__column-header__resize-wrapper"
    >
      <Item
        {...props}
        style={null}
        className={`${props.className} react-datagrid__box--ellipsis`}
        name={null}
        title={null}
        type={null}
        value={null}
      />
      <div
        className="react-datagrid__column-resizer"
        onMouseDown={props.onResizeMouseDown}
      >
        {RESIZE_HANDLE}
      </div>
    </Flex>
  }

  return <Item
    {...props}
    className={`${props.className} react-datagrid__box--ellipsis`}
    name={null}
    title={null}
    type={null}
    value={null}
  />
}
