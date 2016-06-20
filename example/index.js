import React from 'react'
import Component from 'react-class'

import DataGrid, { ColumnGroup } from '../src'
import '../style/index.scss'

import assign from 'object-assign'

import Checkbox from './Checkbox'
import generate from '../generate'

const LABELS = {
  showHorizontalCellBorder: 'Show horizontal cell border',
  showVerticalCellBorder: 'Show vertical cell border',
  navigation: 'Keyboard (row) navigation',
  zebraRows: 'Show zebra rows (odd/even)',
  remoteDataSource: 'Remote data source',
  multiSort: 'Multiple column sorting',
  singleSort: 'Single column sorting',
  livePagination: 'Live pagination',
  localPagination: 'Local pagination (page size 50)',
  remotePagination: 'Remote pagination (page size 50)'
}

const getRemoteDataSource = ({ size, delay }, { sortInfo, skip, limit } = {}) => {

  return new Promise((resolve) => {

    let query = {
      // delay: 5000
    }

    if (skip !== undefined) {
      query.skip = skip
    }

    if (limit !== undefined) {
      query.limit = limit
    }

    if (sortInfo) {
      query.sortInfo = JSON.stringify(sortInfo)
    }

    if (Object.keys(query).length) {
      query = '?' + Object.keys(query).map((key) => {
        return `${key}=${query[key]}`
      }).join('&')
    } else {
      query = ''
    }

    fetch(`http://zippyui.com:8080/fake-api/person${size}${query}`)
      .then(r => {
        return r.json()
      })
      .then(json => {
        if (!delay) {
          return resolve(json)
        }
        setTimeout(() => {
          resolve(json)
        }, delay)
      })
  })
}

export default class DataGridExample extends Component {

  componentDidMount() {
    this.setState({
      data: generate(this.state.size)
    })
  }

  constructor(props) {
    super(props)

    const size = 5000

    this.state = {
      size,
      data: [],
      navigation: true,
      zebraRows: true,
      showHorizontalCellBorder: true,
      showVerticalCellBorder: true,
      remoteDataSource: false,
      remoteDataSourceSize: size,
      livePagination: false,
      localPagination: false,
      remotePagination: false,
      multiSort: false,
      singleSort: false,
      columns: [
        {
          name: 'firstName',
          visible: true,
          defaultWidth: 200
        },
        {
          name: 'lastName',
          visible: true
        },
        {
          name: 'email',
          visible: true
        },
        {
          name: 'grade',
          type: 'number',
          visible: true
        },
        {
          name: 'index',
          type: 'number',
          visible: true
        }
      ]
    }
  }

  render() {
    const state = this.state

    const checkboxes = [
      'navigation',
      'showHorizontalCellBorder',
      'showVerticalCellBorder',
      'zebraRows',
      'remoteDataSource',
      'multiSort',
      'singleSort',
      // 'remotePagination',
      // 'localPagination',
      'livePagination'
      // 'remoteDataSourceSize'
    ].map(name => <Checkbox
      key={name}
      style={{display: 'block'}}
      checked={state[name]}
      onChange={this.onChange(name)}
      children={LABELS[name] || name}
    />)

    const columns = this.state.columns.map(col => col.visible ? col : null).filter(x => !!x)

    const gridProps = {
      idProperty: 'id',
      dataSource: this.state.data,
      defaultSkip: 0,
      limit: 50,
      zebraRows: this.state.zebraRows,
      livePagination: this.state.remoteDataSource ? this.state.livePagination : false,
      showCellBorders: this.state.showHorizontalCellBorder && this.state.showVerticalCellBorder?
        true:
        this.state.showHorizontalCellBorder ?
          'horizontal' :
          this.state.showVerticalCellBorder?
            'vertical' :
            null
      ,
      style: { height: '40vh', width: '100%', marginBottom: 30 },
      columns,
      sortable: false
    }

    if (this.state.remoteDataSource) {
      gridProps.dataSource = this.dataSource = this.dataSource ||  getRemoteDataSource({ size: this.state.size })
    }

    if (state.navigation) {
      gridProps.defaultActiveIndex = this.state.navigation ? 0 : undefined
    } else {
      gridProps.activeIndex = null
    }
    if (state.multiSort) {
      gridProps.sortable = true
      gridProps.defaultSortInfo = []
    }

    if (state.singleSort) {
      gridProps.sortable = true
      gridProps.defaultSortInfo = {}
    }

    if (state.localPagination) {
      gridProps.pagination = 'local'
    }
    if (state.remotePagination) {
      gridProps.pagination = 'remote'
    }

    let lockedColumns = columns.filter(c => c.locked)
    let unlockedColumns = columns.filter(c => !c.locked)

    if (lockedColumns.length) {
      lockedColumns = lockedColumns.map(c => {
        c.minWidth = 350
        return c
      })
      unlockedColumns = unlockedColumns.map(c => {
        c.minWidth = 350
        return c
      })
      delete gridProps.columns
      gridProps.children = [
        <ColumnGroup columns={lockedColumns} fixed />
      ]

      if (unlockedColumns) {
        gridProps.children = gridProps.children.concat(<ColumnGroup columns={unlockedColumns} />)
      }
    }

    const grid = <DataGrid
      {...gridProps}
    />

    return <div style={{width: '100%'}} row alignItems="start">
      <div style={{marginBottom: 20}}>A DataGrid with {this.state.size} rows:</div>
      {grid}
      {checkboxes}

      <div style={{marginBottom: 30}}>
        {this.state.columns.map(this.renderColumnCheckbox)}
      </div>
      <div style={{marginTop: 20}}>
        Locked columns (min col width will be set to 350):
        <div>{this.state.columns.map(this.renderColumnLockCheckbox)}</div>
      </div>

    </div>
  }

  renderColumnLockCheckbox(col, index) {
    return <Checkbox
      key={index}
      style={{display: 'block'}}
      checked={col.locked}
      onChange={() => {
        const cols = this.state.columns.map((col, i) => {
          if (i === index) {
            return assign({}, col, { locked: !col.locked })
          }
          return col
        })

        this.setState({
          columns: cols
        })
      }}
      children={<span>{col.title || col.name}</span>}
    />
  }

  renderColumnCheckbox(col, index) {
    return <Checkbox
      key={index}
      style={{display: 'block'}}
      checked={col.visible}
      onChange={() => {
        const cols = this.state.columns.map((col, i) => {
          if (i === index) {
            return assign({}, col, { visible: !col.visible })
          }
          return col
        })

        const visibleCount = cols.reduce((acc, c) => {
          return acc + (c.visible ? 1 : 0)
        }, 0)

        if (!visibleCount) {
          return
        }

        this.setState({
          columns: cols
        })
      }}
      children={<span>{col.title || col.name}</span>}
    />
  }

  onChange(name) {
    return (value) => {
      const fnName = `intercept_${name}`
      if (this[fnName]) {
        this[fnName](name, value)
        return
      }

      this.setState({
        [name]: value
      })
    }
  }

  intercept_livePagination(name, value) {
    this.setState({
      [name]: value
    })

    if (value) {
      this.dataSource = getRemoteDataSource.bind(this, { size: this.state.size })
      !this.state.remoteDataSource && this.intercept_remoteDataSource('remoteDataSource', true)
    }
  }

  intercept_remoteDataSource(name, value) {
    this.setState({
      [name]: value
    })

    if (!value) {
      this.dataSource = null
      this.setState({
        livePagination: false
      })
    }
  }

  intercept_localPagination(name, value) {
    this.setPagination(value ? 'local' : false)
  }

  intercept_remotePagination(name, value) {
    this.setPagination(value ? 'remote' : false)
  }

  setPagination(value) {

    if (value) {
      this.dataSource = getRemoteDataSource.bind(this, { size: this.state.size })
    } else {
      this.dataSource = getRemoteDataSource({ size: this.state.size })
    }

    const newState = {
      pagination: value
    }

    newState.remotePagination = false
    newState.localPagination = false
    if (value == 'remote') {
      newState.remotePagination = true
    }
    if (value == 'local') {
      newState.localPagination = true
    }

    if (!newState.remotePagination) {
      newState.livePagination = false
    }

    this.setState(newState)
  }

  intercept_multiSort(name, value) {
    const newState = {
      [name]: value
    }

    if (value) {
      newState.singleSort = false
    }

    this.setState(newState)
  }

  intercept_singleSort(name, value) {
    const newState = {
      [name]: value
    }

    if (value) {
      newState.multiSort = false
    }

    this.setState(newState)
  }

}

DataGridExample.defaultProps = {
  tabTitle: 'DataGrid custom configuration'
}
