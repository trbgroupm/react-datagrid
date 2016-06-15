import React, { PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import Component from 'react-class'

import { Flex, Item } from 'react-flex'
import assign from 'object-assign'
import join from './join'
import LoadMask from 'react-load-mask'
import getIndexBy from './utils/getIndexBy'
import sorty from 'sorty'

import clamp from './utils/clamp'
import Body from './Body'
import ColumnGroup from './Body/ColumnGroup'

import 'react-load-mask/index.css'

const SCREEN_HEIGHT = global.screen && global.screen.height

const isSortControlled = (props) => props.sortInfo !== undefined
 // &&
 //    typeof props.onSortInfoChange == 'function'

class DataGrid extends Component {
  constructor(props) {
    super(props)

    const isLoading = props.dataSource && !!props.dataSource.then

    this.state = {
      loading: isLoading,
      focused: false,
      data: false,
      selected: props.defaultSelected,
      activeIndex: props.defaultActiveIndex,
      sortInfo: props.defaultSortInfo || props.sortInfo || {}
    }
  }

  componentDidMount() {

    if (this.props.autoFocus) {
      this.focus()
    }

    // load data
    this.loadSourceData(this.props.dataSource, this.props)
  }

  componentWillReceiveProps(nextProps, nextState) {
    // data is cached in state
    // needs to be updated if dataSource changes

    if (this.props.dataSource !== nextProps.dataSource) {
      this.loadSourceData(nextProps.dataSource, nextProps)
    }

    if (this.props.sortInfo != nextProps.sortInfo) {
      setTimeout(() => {
        this.setData(null, { sortInfo: nextProps.sortInfo })
      }, 0)
    }
  }

  render() {
    const preparedProps = this.p = this.prepareProps(this.props, this.state)

    const {
      columns,
      header,
      loading,
      className,
      children,
      activeIndex,
      hasNavigation
    } = preparedProps

    return <Flex
      column
      flex
      alignItems="stretch"
      wrap={false}
      tabIndex={hasNavigation ? 0 : null}
      {...this.props}
      onFocus={this.onFocus}
      onBlur={this.onBlur}
      onKeyDown={this.onKeyDown}
      className={className}
    >
      {loading && this.renderLoadMask()}
      <Body
        {...preparedProps}
        ref="body"
        onRowClick={this.onRowClick}
        onHeaderCellClick={this.onHeaderCellClick}
        onHeaderSortClick={this.onHeaderSortClick}
      />
    </Flex>
  }

  renderLoadMask() {
    const props = {
      visible: this.p.loading,
      className: 'react-datagrid__load-mask'
    }

    if (this.p.renderLoadMask) {
      return this.p.renderLoadMask(props)
    }

    return <LoadMask {...props} />
  }

  focus() {
    findDOMNode(this).focus()
  }

  onFocus(event) {
    this.setState({
      focused: true
    })

    this.props.onFocus(event)
  }

  onBlur(event) {
    this.setState({
      focused: false
    })

    this.props.onBlur(event)
  }

  onKeyDown(event) {
    const { key } = event

    this.props.onKeyDown(event)

    if (key == 'ArrowUp') {
      this.incrementActiveIndex(-1)
    }
    if (key == 'ArrowDown') {
      this.incrementActiveIndex(1)
    }
    if (key == 'Home') {
      this.changeActiveIndex(0)
    }
    if (key == 'End') {
      this.changeActiveIndex(this.p.data.length - 1)
    }

    if (key == 'PageUp') {
      this.incrementActiveIndex(this.props.keyPageStep * -1)
    }
    if (key == 'PageDown') {
      this.incrementActiveIndex(this.props.keyPageStep)
    }
  }

  onRowClick(event, rowProps) {
    this.handleSelection(rowProps, event)
    this.changeActiveIndex(rowProps.realIndex)
  }

  incrementActiveIndex(dir) {
    this.changeActiveIndex(this.state.activeIndex + dir)
  }

  changeActiveIndex(newIndex) {
    if (!this.p.hasNavigation) {
      return
    }

    newIndex = clamp(newIndex, 0, this.p.data.length - 1)

    if (newIndex === this.p.activeIndex) {
      return
    }

    if (newIndex != null) {
      const scrollTop = this.getScrollTop()
      const bodyHeight = this.getBodyHeight()
      const rowScrollTop = newIndex * this.props.rowHeight

      // scroll to item if is not visible
      if (scrollTop > rowScrollTop) {
        this.scrollToIndex(newIndex)
      }

      // bottom
      if ((scrollTop + bodyHeight) < rowScrollTop + this.props.rowHeight) {
        this.scrollToIndex(newIndex, {position: 'bottom'})
      }
    }

    this.setState({
      activeIndex: newIndex
    })

    this.props.onActiveIndexChange(newIndex)
  }

  onHeaderCellClick(event, props) {

  }

  onHeaderSortClick(props) {

    const column = this.getColumn(props.index)

    if (this.p.isMultiSort) {
      this.handleMultipleSort(column)
    } else {
      this.handleSingleSort(column)
    }
  }

  /**
   * Sorting
   *   order of sort change
   * - if none, then 1 (asc)
   * - if 1, then -1 (desc)
   * - if -1, then 0 (none)
   */


  /**
   * On single sort when you click on a sortable column it will begin
   * to change between it's three states
   * if you click on a new column the sortInfo overwritten with the
   * new sortInfo detemined by the new column
   */
  handleSingleSort(column) {
    // if click on different column must start from begining
    const newSortInfo = this.getNewSortInfoDescription(column,
        (
          this.p.sortInfo && this.p.sortInfo.index ===
          column.index && this.p.sortInfo.dir
        )
      )

    this.props.onSortInfoChange(newSortInfo)

    if (!this.p.isSortControlled) {
      this.setData(null, { sortInfo: newSortInfo })
    }
  }

  /**
   * On multiselect, when you click on one toggle between it's state
   * if direction is 0, we remove i
   * TODO: do multisort
   */
  handleMultipleSort(column) {
    const sortInfo = this.p.sortInfo

    if (!sortInfo.length) {
      // is empty
      this.setState({
        sortInfo: this.getNewSortInfoDescription(column)
      })
    } else {
      // determine if it is new
      const sortInfoIndex = getIndexBy(sortInfo, 'index', column.index)
    }
  }

  getNewSortInfoDescription(column, dir) {
    let newSortInfo = {}
    let newDir

    if (!dir || dir === 0) {
      newDir = 1
    } else if (dir === 1) {
      newDir = -1
    } else if (dir === -1) {
      // newSortInfo shoud be null in this case
      // this means there is no sort
      // so there is no need to sort with nothing
      return null
    }

    newSortInfo.dir = newDir

    // column cannot be sorted if it has no name and no sort function
    if (!column.name && !column.sort) {
      return
    }

    if (column.name) {
      newSortInfo.name = column.name
    }

    if (column.sort) {
      newSortInfo.fn = column.sort
    }

    if (column.type) {
      newSortInfo.type = column.type
    }

    newSortInfo.index = column.index

    return newSortInfo
  }

  getColumn(index) {
    const columns = this.refs.body.component.getFlattenColumns()

    return columns[index]
  }

  // handles source data it it is array, it is passed directly to setData
  // if is a promise, sets loading flat to true, when resolves passes data to setData
  loadSourceData(dataSource, props){

    if (dataSource === null) {
      this.setData(null)
      return
    }

    if (Array.isArray(dataSource)) {
      this.setData(dataSource)
    }

    if (dataSource.then) {
      if (props.onDataSourceResponse) {
        dataSource.then(props.onDataSourceResponse, props.onDataSourceResponse)
      }

      this.setState({
        loading: true
      })

      dataSource.then(data => {
        if (!Array.isArray(data)) {
          throw new Error(`dataSource Promise did not return an array, it returned a ${typeof data}`)
        }

        this.setData(data)
      })
    }
  }

  sortData(sortInfo, data){
    if (sortInfo) {
      return sorty(sortInfo, data)
    }
  }

  /**
   * updates state with data removes loading flag
   * and if selection is enabled creates a hasmap from the data
   * { idProperty: {..}, .. }
   */
  setData(data, config) {
    const preparedProps = this.p
    const {
      selected,
      defaultSelected,
      onSelectionChange,
      sortable,
      isSortControlled,
    } = preparedProps

    let newDataState = {
      loading: false
    }

    if (data) {
      newDataState.originalData = data
    }

    data = data || this.state.originalData

    let sortInfo
    if (config && config.sortInfo !== undefined) {
      sortInfo = config.sortInfo
      newDataState.sortInfo = sortInfo
    } else if (preparedProps.sortInfo !== undefined) {
      sortInfo = preparedProps.sortInfo
    }

    if (sortInfo) {
      newDataState.data = this.sortData(sortInfo, [...data])
    } else {
      newDataState.data = data
    }

    // make dataMap only if selected is used
    if (this.isSelectionEnabled() && data !== null) {
      newDataState.dataMap = data.reduce((acc, item) => {
        acc[this.getItemId(item)] = item
        return acc
      }, {})
    }

    this.setState(newDataState)
  }

  getItemId(item) {
    return item[this.props.idProperty]
  }

  getSelected() {
    return this.isSelectionControlled()?
           this.props.selected :
           this.state.selected
  }

  getActiveIndex() {
    return this.p.activeIndex
  }

  isSelectionControlled() {
    return this.props.selected !== undefined
  }

  isSelectionEnabled() {
    const selected = this.props.selected
    const defaultSelected = this.props.defaultSelected

    return selected !== undefined || defaultSelected !== undefined
  }

  /**
   * selected can be an object is case of multiselect
   * or a string or number in case of single select
   */
  isSelectionEmpty() {
    const selected = this.getSelected()
    let selectionEmpty = false

    if (selected === undefined) {
      selectionEmpty = true
    }

    if (typeof selected === 'object' && selected !== null) {
      selectionEmpty = Object.keys(selected).length === 0
    }

    return selectionEmpty
  }

  /**
   * creates an object with props, that can come from
   * this.props, this.state, or computed
   * it is helpful to have a single point of access
   */
  prepareProps(props, state) {
    const loading = props.loading == undefined ?
                    this.state.loading :
                    props.loading

    const selected = this.getSelected()
    const hasSelection = !this.isSelectionEmpty()

    /**
     * content height, is the hight of the container that hods all the rows, if the all the rows
     * are rendered, it is used for virtual scroll, based on it we know what to render
     */
    const contentHeight = props.rowHeight * (state.data ? state.data.length : 0) + props.scrollbarWidth
    const isMultiselect = typeof selected === 'object' && selected !== null

    // active index is used for rows navigation
    const activeIndex = props.activeIndex !== undefined ? props.activeIndex : this.state.activeIndex
    const hasNavigation = activeIndex !== undefined
    const isActiveIndexControlled = this.props.activeIndex !== undefined

    // sortInfo
    // if is controleld use props, if not sortinfo
    const sortControlled = isSortControlled(this.props)

    const sortInfo = sortControlled ? props.sortInfo : this.state.sortInfo
    const isMultiSort = Array.isArray(sortInfo)

    const data = state.data

    props = assign({}, props, {
      loading,
      selected,
      hasSelection,
      contentHeight,
      isMultiselect,
      data,
      activeIndex,
      isActiveIndexControlled,
      hasNavigation,
      sortInfo,
      isMultiSort,
      sortControlled: isSortControlled
    })

    props.className = this.prepareClassName(props)

    return props
  }

  prepareClassName(props) {
    const borders = props.showCellBorders

    return join(
      props.className,
      'react-datagrid',
      this.state.focused && 'react-datagrid--focused',
      borders &&
        `react-datagrid--cell-borders-${borders === true ? 'both' : borders}`
    )
  }

  // exposed methods on body component
  scrollAt(scrollTop) {
    return this.refs.body.component.scrollAt(scrollTop)
  }

  scrollToIndex(...args) {
    return this.refs.body.component.scrollToIndex(...args)
  }

  scrollToId(...args) {
    return this.refs.body.component.scrollToId(...args)
  }

  getScrollTop() {
    return this.refs.body.component.getScrollTop()
  }

  getBodyHeight() {
    return this.refs.body.component.getBodyHeight()
  }
}

DataGrid.defaultProps = {
  showCellBorders: true,
  keyPageStep: 10,
  defaultLoading: false,
  header: true,
  onFocus: () => {},
  onBlur: () => {},
  onKeyDown: () => {},
  onRowMouseEnter: () => {},
  onRowMouseLeave: () => {},
  onScrollBottom: () => {},
  onActiveIndexChange: () => {},
  onSortInfoChange: () => {},
  rowProps: {},
  defaultSelected: undefined,
  scrollbarWidth: 20,
  rowPlaceholder: false,
  defaultSortInfo: null,
  sortable: false,
  rowHeight: 40,
}

DataGrid.propTypes = {
  idProperty : PropTypes.string.isRequired,
  loading: PropTypes.bool,
  header: PropTypes.bool,
  defaultLoading : PropTypes.bool,


  // row config
  onRowMouseEnter: PropTypes.func,
  onRowMouseLeave: PropTypes.func,

  /**
   * TODO: refactor find a more elengant way of declaring placeholder
   * you should be able to configure placeholder global on dataGrid
   * and also on ColumnGroup
   */
  rowPlaceholder: PropTypes.bool,
  renderRowPlaceholder: PropTypes.func,
  rowPlaceholderDelay: PropTypes.number,

  // scrolling and scroll
  onScroll: PropTypes.func,
  onScrollBottom: PropTypes.func,
  scrollToIndex: PropTypes.func,
  scrollToId: PropTypes.func,
  scrollbarWidth: PropTypes.number,

  // selection
  selected: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
      PropTypes.object
    ]),
  defaultSelected: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
      PropTypes.object
    ]),
  onSelectionChange: PropTypes.func,


  // sort
  sortable: PropTypes.bool,
  defaultSortInfo: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.object),
    PropTypes.object
  ]),
  sortInfo: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.object),
    PropTypes.object
  ]),
  onSortInfoChange: PropTypes.func,

  // navigation
  activeIndex: PropTypes.number,
  defaultActiveIndex: PropTypes.number,
  onActiveIndexChange: PropTypes.func,


  // columns config
  columns: PropTypes.arrayOf((props, propName) => {
    const column = props[propName]
    if (!column.name && typeof column.render != 'function'){
      return new Error(`column ${propName} should have a "name" prop or a "render" function!`)
    }
  }),
  children: (props, propName) => {
    const children = props[propName]

    React.Children.map(children, (child) => {
      if (
          !child || !child.props ||
          (!child.props.isColumnGroup || !child.props.isColumn)
        ) {
        return new Error('The only children allowed of Datagrid are ColumnGroup and Column')
      }
    })
  },

  // data
  dataSource: (props, propName) => {
    const dataSource = props[propName]

    if (dataSource === undefined) {
      return new Error('dataSource prop is required.')
    }

    if (
        dataSource !== null &&
        !Array.isArray(dataSource) &&
        !(dataSource && dataSource.then)
      ) {
      return new Error('dataSource must be an array, null or a promise.')
    }
  },
  onDataSourceResponse: PropTypes.func,
}


import rowSelect from './rowSelect'

DataGrid.prototype = assign(DataGrid.prototype, rowSelect)

export default DataGrid

import Column from './Column'

// you can configurate the grid using an array of configuration objects
// or declaratively (jsx) using ColumnGroup and Column.
export {
  ColumnGroup,

  // Column is a dummy component only used for configuration
  Column
}
