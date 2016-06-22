import DragHelper from 'drag-helper'

const emptyFn = () => {}

export default function ({
    region,
    headerRegion,
    constrainTo,

    columnHeaderNodes,
    columns,
    index,

    initialSize,
    extraOffset
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
      region,
      initialLeft
    }),
    onDragStart(e, config) {
      const constrained = isContrained(config)

      onResizeDragStart({
        initialLeft,
        offset: initialLeft,
        constrained,
        resizing: true,
        region,
        column
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
        offset,
        region,
        column
      })
    },

    onDrop(e, config) {
      const diff = config.diff.left
      const offset = initialLeft + diff
      const constrained = isContrained(config)
      const size = initialSize + diff

      onResizeDrop({
        index,
        constrained,
        initialLeft,
        region,
        diff,
        offset,
        size,
        column
      })
    }
  })
}
