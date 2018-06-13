import React, { Component } from 'react'
import Colloquium from './Colloquium'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" onClick={this.updateValue} className="pure-menu-heading pure-menu-link">Truffle Box</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <Colloquium></Colloquium>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
