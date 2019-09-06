import React from 'react';
import './Profile.css'

interface WorksProps {
  height : number
}

class Works extends React.Component<WorksProps, {}> {
  constructor(props : WorksProps) {
    super(props);
  }
  componentDidUpdate() {
    console.log('works updated!');
    console.log(this.props.height);
  }
  render() {
    return (
      <div className="text">
        <div className="title">Works / Activities</div>
        <div className="detail" style={{height: this.props.height}}>

        </div>
      </div>
    )
  }
}

export default Works;