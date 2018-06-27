import React, { Component } from 'react'
import Colloquium from './Colloquium'
import ComponentSelector from './ComponentSelector'

import './App.css'
import Appbar from 'muicss/lib/react/appbar';


class App extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="App">
      <Appbar></Appbar>
      <ComponentSelector></ComponentSelector>
      </div>
      );
  }
}

export default App
