import clamp from './clamp'

const getColumnsWidth = (columns) => {
  return columns.reduce((acc, col) => {
    const { minWidth, maxWidth, defaultWidth } = col
    let { width } = col

    if (width === undefined && defaultWidth !== undefined) {
      width = defaultWidth
    }

    const colWidth = clamp(width || 0, minWidth || 0, maxWidth)

    return acc + colWidth
  }, 0)
}

export default getColumnsWidth
