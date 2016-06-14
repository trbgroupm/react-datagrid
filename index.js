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
    name: 'name',
    titleClassName: 'helloHEader',
    className: 'test'
  }, {
    name: 'age',
    type: 'number'
  }, {
    name: 'id',
    type: 'number'
  },{
    name: 'gender'
  }, {
    name: 'location',
    minWidth: 350,
  }, {
    name: 'status',
    minWidth: 350,
  } , {
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
        sortable={this.state.sortable}
        autoFocus
        keyPageStep={1000}
        idProperty={'id'}
        dataSource={this.state.data}
        showCellBorders={this.state.showCellBorders}
        columns={columns}
        defaultSortInfo={[]}
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
