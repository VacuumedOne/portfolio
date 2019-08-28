import React from 'react';

interface AccProps {

}

interface AccState {
  acc : number
}

class Text extends React.Component<AccProps, AccState> {
  private btn : string = '増やす';

  constructor(props : AccProps) {
    super(props);
    this.state = {
      acc: 4
    };
  }

  render() {
    return (
      <div>
        この要素のaccは{ this.state.acc }
        <button onClick={ () => { this.setState({acc: this.state.acc + 1}) } }>
          { this.btn }
        </button>
      </div>
    )
  }
}

export default Text;