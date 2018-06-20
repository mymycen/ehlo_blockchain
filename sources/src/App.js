import React, { Component } from 'react'
import Colloquium from './Colloquium'

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
      <Colloquium></Colloquium>
      </div>
      );
  }
}

export default App
