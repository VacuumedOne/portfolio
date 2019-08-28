import React from 'react';
import './Profile.css'

let worksStyle : React.CSSProperties = {
  height: '500px'
}

class Works extends React.Component {
  render() {
    return (
      <div className="text">
        <div className="title">Works / Activities</div>
        <div className="detail" style={worksStyle}>
          
        </div>
      </div>
    )
  }
}

export default Works;