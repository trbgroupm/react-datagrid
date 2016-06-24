import Region from 'region'
import DragHelper from 'drag-helper'

const emptyFn = () => {}

export default ({ constrainTo, region }, cfg = {}, event) => {

  const onDrag = cfg.onDrag || emptyFn
  const onDrop = cfg.onDrop || emptyFn

  DragHelper(event, {
    constrainTo,
    region,
    onDragStart(event, config) {
    },

    onDrag(event, config) {
      var diff = config.diff.left
      onDrag(diff, event)
    },

    onDrop(event, config) {
      var diff = config.diff.left
      onDrop(diff)
    }
  })
}
