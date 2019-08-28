import React from 'react';
import './Profile.css'

class Profile extends React.Component {
  render() {
    return (
      <div className="text">
        <div className="title">Profile</div>
        <div className="detail">
          <div><b>Nocks_on</b>と申します。<b>のくそん</b>と読みます。</div>
          <br />
          <div>好きなこと:
            <div>ゲーム、VRが好きです。今までの人生で一番好きなゲームは『カービィのエアライド』です。最近OculusQuestを買ってVRを楽しんでします。</div>
          </div>
          <br />
          <div>やったこと: 
            <li>Webアプリ開発</li>
            <li>短いゲーム開発</li>
            <li>シェーダなどのビジュアルプログラミング</li>
            <li>動画編集など</li>
          </div>
          <br />
          <div>言語について:
            <li>よく使う: C++、JavaScript</li>
            <li>そこそこ使っている: GLSL</li>
            <li>使える: Java, Python, Swift, Ruby, PHP, HTML/CSS</li>
            <li>興味がある: Haskell</li>
          </div>
        </div>
      </div>
    )
  }
}

export default Profile;