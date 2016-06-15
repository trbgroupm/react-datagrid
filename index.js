import React from 'react'
import { render } from 'react-dom'
import Component from 'react-class'

import { Flex } from 'react-flex'
import DataGrid, { ColumnGroup } from './src'
import './index.scss'

import gen, { gen2 } from './generate'
import Perf from 'react-addons-perf'


const data = gen2(10000)
const columns = [
  {
    name: 'firstName',
    titleClassName: 'helloHEader',
    className: 'test'
  }, {
    name: 'grade',
    type: 'number'
  }, {
    name: 'index',
    type: 'number'
  }, {
    name: 'country',
    minWidth: 350,
  }, {
    title: 'Actions',
    minWidth: 350,
    render({value, data, cellProps}) {
      if (cellProps.headerCell){
        value = 'test'
        return
      }

      cellProps.children = <div>
        <button>add</button>
        <button>remove</button>
      </div>
    }
  }
].map(c => {
  c.minWidth = c.minWidth || 100
  return c
})

const remoteData = ({ sortInfo, skip, limit }) => {

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
    }

    fetch(`http://localhost:8080/fake-api/person10${query}`)
      .then(r => {
        return r.json()
      })
      .then(json => {
        setTimeout(() => {
          resolve(json)
        }, 300)
      })
  })
}

class App extends Component {
  constructor(props){
    super(props)

    this.state = {
      sortable: true,
      height: 500,
      sortInfo: {dir: 1, name: "firstName", index: 2},
      data: data
    }

    // setTimeout(() => {
    //   this.setState({
    //     data: gen2(100)
    //   })
    // }, 5000)
  }

  render(){
    return <Flex
      column
      alignItems="stretch"
      className="app"
      wrap={false}
      flex
      style={{padding: 20}}
    >
      <h1>
        React DataGrid by ZippyUi
      </h1>

      <div>
        <button
          style={{
            marginBottom: 10
          }}
          onClick={() => this.setState({
            height: this.state.height + 10
          })}
        >
          Add Height
        </button>
        <button onClick={() => this.refs.grid.gotoFirstPage()}>{'|<'}</button>
        <button onClick={() => this.refs.grid.gotoPrevPage()}>{'<'}</button>
        <button onClick={() => this.refs.grid.gotoNextPage()}>{'>'}</button>
        <button onClick={() => this.refs.grid.gotoLastPage()}>{'>|'}</button>

        <button
          style={{
            marginBottom: 10
          }}
          onClick={() => this.setState({
            height: this.state.height - 10
          })}
        >
          Remove Height
        </button>

        <button onClick={() => this.setState({sortable: !this.state.sortable})}>toggle sortable</button>
        <button onClick={() => this.setState({showCellBorders: !this.state.showCellBorders})}>toggle showCellBorders</button>

        Sortable: {this.state.sortable+''}
      </div>

      <DataGrid
        ref="grid"
        sortable={this.state.sortable}
        autoFocus
        limit={4}
        keyPageStep={1000}
        emptyText="no data"
        pagination
        idProperty={'id'}
        dataSource={remoteData}
        showCellBorders={this.state.showCellBorders}
        columns={columns}
        defaultSortInfo={[]}
        xonSortInfoChange={(info) => console.log('sort change',info)}
        defaultActiveIndex={0}
        renderRow={(rowProps) => {
          // if (rowProps.data.error) {
            rowProps.className = rowProps.className + ' classErroare'
          // }
        }}
      >{/*
        <ColumnGroup fixed columns={columns.slice(0, 3)} />
        <ColumnGroup columns={columns.slice(3)} />
      */}</DataGrid>
    </Flex>
  }
}


render(<App />, document.getElementById('content'))
