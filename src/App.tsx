import React from 'react';
import './App.css';
// import Text from './Text';
// import Loading from './Loading';
import Content from './Content';
// import Background from './Background';

interface AppState {
  boxes : HTMLElement[]
  scrollY : number
}

class App extends React.Component <{}, AppState> {
  constructor() {
    super({});
    this.state = {
      boxes: [],
      scrollY : 0
    };
  }
  render() {
    return (
      <div className="App">
        <Content />
      </div>
    );
  }
}

export default App;
