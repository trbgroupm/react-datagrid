import React from 'react'
import { render } from 'react-dom'

console.log('React.version', React.version);
import Example from './example'

render(<Example />, document.getElementById('content'))
