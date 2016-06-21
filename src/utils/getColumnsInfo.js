import clamp from './clamp'

const sum = (a, b) => a + b

const getColumnsWidth = (columns, { columnMinWidth } = {}) => {
  return columns.reduce((acc, col) => {
    const { maxWidth, defaultWidth } = col
    let { width, minWidth } = col

    if (minWidth === undefined && columnMinWidth != null) {
      minWidth = columnMinWidth
    }

    if (width === undefined && defaultWidth !== undefined) {
      width = defaultWidth
    }

    const colWidth = clamp(width || 0, minWidth || 0, maxWidth)

    return acc + colWidth
  }, 0)
}

const getColumnSizeInfo = (columns, { columnMinWidth, columnMaxWidth } = {}) => {
  const info = columns.reduce((acc, col) => {
    const { defaultWidth } = col
    let { width, minWidth, maxWidth } = col

    if (minWidth == null && columnMinWidth != null) {
      minWidth = columnMinWidth
    }

    if (maxWidth == null && columnMaxWidth != null) {
      maxWidth = columnMaxWidth
    }

    if (width == null && defaultWidth != null) {
      width = defaultWidth
    }

    const colWidth = clamp(width || 0, minWidth || 0, maxWidth)

    if (width == null) {
      acc.flexCount++
      if (maxWidth != null) {
        acc.flexWithMaxWidth.push(maxWidth)
      }
    } else {
      acc.width += colWidth
      acc.sizeCount++
    }

    acc.minWidth += colWidth

    return acc
  }, {
    count: columns.length,
    flexCount: 0,
    flexWithMaxWidth: [],
    sizeCount: 0,
    width: 0,
    minWidth: 0
  })

  if (info.flexCount == info.flexWithMaxWidth.length) {
    info.maxWidth = info.width + info.flexWithMaxWidth.reduce(sum, 0)
  }

  return info
}

export default getColumnSizeInfo
