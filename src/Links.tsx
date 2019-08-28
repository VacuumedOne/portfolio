import React from 'react';
import './Profile.css'

class Links extends React.Component {
  render() {
    return (
      <div className="text">
        <div className="title">Links</div>
        <div className="detail">
          <li>Github: <a href="https://github.com/VacuumedOne">VacuumedOne</a></li>
          <li>Twitter: <a href="https://twitter.com/nocks_on">のくそん</a></li>
          <li>Shadertoy: <a href="https://www.shadertoy.com/profile?show=shaders">Nocks_on</a></li>
          <li>OpenProcessing: <a href="https://www.openprocessing.org/user/181939">Nocks_on</a></li>
          <li>はてなブログ: </li>
        </div>
      </div>
    )
  }
}

export default Links;