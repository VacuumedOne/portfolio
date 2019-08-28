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
        <div>仮設です。制作物をまとめる場所にする予定です。Three.jsと奮闘中(2019/8/29現在)。</div>
        <div className="detail" style={worksStyle}>
          
        </div>
      </div>
    )
  }
}

export default Works;