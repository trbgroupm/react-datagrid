import React from 'react'
import { Flex, Item } from 'react-flex'
import join from '../../../join'

const RESIZE_HANDLE = <div className="react-datagrid__column-resizer-handle" />

const RESIZE_WRAPPER_CLASS_NAME = 'react-datagrid__column-header__resize-wrapper'

export default (props) => {
  if (props.resizable) {
    return <Flex
      flex
      row
      style={props.style}
      className={join(
        RESIZE_WRAPPER_CLASS_NAME,
        props.lastInGroup && `${RESIZE_WRAPPER_CLASS_NAME}--last-in-group`
      )}
    >
      <Item
        {...props}
        style={null}
        id={null}
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
    id={null}
    className={`${props.className} react-datagrid__box--ellipsis`}
    name={null}
    title={null}
    type={null}
    value={null}
  />
}
