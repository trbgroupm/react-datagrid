import React, { PropTypes } from 'react'
import Component from 'react-class'
import { Flex } from 'react-flex'
import DragHelper from 'drag-helper'

const IS_MAC = global && global.navigator && global.navigator.appVersion &&
  global.navigator.appVersion.indexOf('Mac') != -1

const IS_FIREFOX = global && global.navigator && global.navigator.userAgent &&
  !!~global.navigator.userAgent.toLowerCase().indexOf('firefox')

class Scroller extends Component {

  componentDidMount() {
    this.scrollAt(this.props.scrollTop)
  }

  render() {
    const props = this.props

    const {
      itemHeight,
      dataLength,
      contentHeight,
      scrollTop,
      height,
      scrollbarWidth,
      hasScroll
    } = props

    const scrollContentStyle = {
      height: contentHeight
    }

    const contentStyle = {
      // maxHeight: height,
      // minHeight: height, // needed for ie
    }


    if (hasScroll) {
      contentStyle.maxWidth = `calc(100% - ${scrollbarWidth}px)`
    }

    const scrollerStyle = {
      height,
      maxHeight: height,
      maxWidth: scrollbarWidth,
      minWidth: scrollbarWidth,
      position: 'relative',
      top: this.props.headerHeight
    }

    return <Flex
      row
      wrap={false}
      alignItems="stretch"
      className="react-datagrid__scroller"
    >
      <Flex
        flex={1}
        className="react-datagrid__scroller__content"
        alignItems="stretch"
        wrap={false}
        ref="viewport"
        onWheel={this.onWheel}
        onTouchStart={this.onTouchStart}
        style={contentStyle}
      >
        {props.children}
      </Flex>
      {
        hasScroll
        &&
        <div
          ref="scrollbar"
          className="react-datagrid__scroller__scrollbar"
          onScroll={this.onScrollBarScroll}
          style={scrollerStyle}
        >
          <div
            className="react-datagrid__scroller__scrollbar__content"
            ref="scrollBarContent"
            style={scrollContentStyle}
          />
        </div>
      }
    </Flex>
  }

  // onScroll is triggered indirectly by:
  // - onWheel
  // - onTouch
  // - onScroll by scrollbar
  onScroll(scrollTop, event){
    if (!this.props.hasScroll) {
      return
    }

    const newScrollTop = this.normalizeScrollTop(scrollTop)

    if (newScrollTop != this.props.scrollTop) {
      this.props.onScroll(newScrollTop, event)
      // this.onScrollDebounced(scrollTop, event)
    }
  }

  onScrollBarScroll(event) {
    if (event.target.scrollTop !== this.props.scrollTop) {
      this.onScroll(event.target.scrollTop, event)
    }
  }

  onWheel(event) {
    const props = this.props
    const {
      scrollStep,
      scrollTop,
      maxScrollTop
    } = props

    const { deltaY, deltaX } = event


    let newScrollTop = scrollTop

    if (deltaY < 0) {
      newScrollTop += deltaY * scrollStep
    } else {
      newScrollTop += deltaY * scrollStep
    }

    if (
        Math.abs(deltaX) < Math.abs(deltaY)
        // don't prevent default when thre is no scroll, or scrollTop === 0 or maxScrollTop
        &&
        this.props.hasScroll
        &&
        newScrollTop < maxScrollTop
        &&
        newScrollTop > 0
      ) {
      event.preventDefault()
    }


    this.onScroll(newScrollTop)
  }

  onTouchStart(event){
    DragHelper(event.nativeEvent, {
      scope: this,
      onDragStart: (event, config) => {
        this.initialScrollStart = this.props.scrollTop
      },
      onDrag: (event, config) => {

        if (Math.abs(config.diff.left) <= Math.abs(config.diff.top * 4)) {
          event.stopPropagation()
          event.preventDefault()
        }

        const newScrollPos = this.initialScrollStart - config.diff.top

        this.onScroll(newScrollPos, event)
      },

      onDrop: (event, config) => {
        this.initialScrollStart = null
      }
    })
  }

  scrollAt(scrollTop){
    if (this.props.hasScroll) {
      this.refs.scrollbar.scrollTop = this.normalizeScrollTop(scrollTop)
    }
  }

  normalizeScrollTop(scrollTop){
    const { maxScrollTop } = this.props
    let newScrollTop = ~~scrollTop

    if (newScrollTop < 0) {
      newScrollTop = 0
    }

    if (newScrollTop > maxScrollTop) {
      newScrollTop = maxScrollTop
    }

    return newScrollTop
  }
}

Scroller.defaultProps = {
  scrollStep: IS_FIREFOX? 40 : 1
}

Scroller.propTypes = {
  className: PropTypes.string,
  scrollTop: PropTypes.number,
  scrollStep: PropTypes.number
}

export default Scroller
