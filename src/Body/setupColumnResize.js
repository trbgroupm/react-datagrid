import Region from 'region'
import DragHelper from 'drag-helper'

const emptyFn = () => {}

export default function ({
    region,
    headerRegion,
    constrainTo,

    columnHeaderNodes,
    columns,
    index,

    initialSize
  }, {
    onResizeDragInit = emptyFn,
    onResizeDragStart = emptyFn,
    onResizeDrag = emptyFn,
    onResizeDrop = emptyFn
  },
  event
) {
  event.preventDefault()

  const column = columns[index]

  const initialLeft = region.left - headerRegion.left

  const isContrained = (config) => {
    const constrained = config.dragRegion.left == constrainTo.left ||
      config.dragRegion.right == constrainTo.right

    return constrained
  }

  DragHelper(event, {
    constrainTo,
    region,
    onDragInit: onResizeDragInit.bind(this, {
      offset: initialLeft,
      initialLeft
    }),
    onDragStart(e, config) {
      const constrained = isContrained(config)

      onResizeDragStart({
        initialLeft,
        offset: initialLeft,
        constrained,
        resizing: true
      })
    },

    onDrag(e, config) {
      const diff = config.diff.left
      const offset = initialLeft + diff

      const constrained = isContrained(config)

      onResizeDrag({
        constrained,
        initialLeft,
        diff,
        offset
      })
    },

    onDrop(e, config) {
      const diff = config.diff.left
      const offset = initialLeft + diff

      const constrained = isContrained(config)

      const size = initialSize +
        diff -
        (region.width / 2) // exclude the width of the drag handle

      onResizeDrop({
        index,
        constrained,
        initialLeft,
        diff,
        offset,
        size
      })
      return
      const nextColumn = diff > 0 ?
        null :
        columns[index + 1]

      const columnSize = Region.from(columnHeaderNodes[index]).width
      let nextColumnSize
      const firstSize = columnSize + diff
      let secondSize = 0

      // if (firstSize < column.minWidth){
      //     firstSize = column.minWidth
      //     diff = firstSize - columnSize
      // }

      if (nextColumn) {
        nextColumnSize = nextColumn ?
          Region.from(columnHeaderNodes[index + 1]).width
          :
          0

        secondSize = nextColumnSize - diff
      }

      // if (nextColumn && secondSize < nextColumn.minWidth){
      //     secondSize = nextColumn.minWidth
      //     diff = nextColumnSize - secondSize
      //     firstSize = columnSize + diff
      // }

      const resizeInfo = [{
        name: column.name,
        size: firstSize,
        diff
      }]

      if (nextColumn) {
        resizeInfo.push({
          name: nextColumn.name,
          size: secondSize,
          diff: -diff
        })
      }

      header.onResizeDrop({
        resizing: false,
        resizeColumn: null,
        resizeProxyLeft: null
      }, resizeInfo, e)
    }
  })
}
