import React from 'react';

import { Dialog, DialogTitle, DialogContent, Button } from '@material-ui/core';

interface WDProps {
  isDialogOpen : boolean,
  content : number,
  handleClose() : void
}

class WorksDialog extends React.Component<WDProps> {
  constructor(props : WDProps) {
    super(props);
  }
  renderContent(i : number) {
    return (
      <div>
        <DialogTitle>{contents[i].title}</DialogTitle>
        <DialogContent>
          <img src={contents[i].img} style={{maxWidth: 500}}></img>
          <div>{contents[i].text}</div>
        </DialogContent>
      </div>
    )
  }
  render() {
    return (
      <Dialog open={this.props.isDialogOpen} onClose={this.props.handleClose}>
        {(this.props.content !== -1) ? this.renderContent(this.props.content) : null}
        <Button onClick={this.props.handleClose} color="primary">Close</Button>
      </Dialog>
    )
  }
}

interface ContentText {
  title : string,
  img : string,
  text : JSX.Element
}

const contents : ContentText[] = [
  {
    title : 'RGB',
    img : 'images/work0.png',
    text : (<div>JavaScript始めたての頃に3時間jamで制作した単発ゲームです。素のHTMLCanvasで作られています。<a href="https://vacuumedone.github.io/RGB/">こちらより</a></div>)
  },
  {
    title : 'つばくログ',
    img : 'images/work1.png',
    text : (<div>所属していたボート部向けに制作した「記録とフィードバックを促すアプリ」です。制作には大学3年の秋から大学4年の春までかかり、長い期間の個人開発となりました。Vue.js+Node.js製です。TypeScriptを使っていなかったので辛かった...。外部に公開していません。</div>)
  },
  {
    title : 'GroP',
    img : 'images/work2.png',
    text : (<div>Webアプリ開発の授業の中で5人チームで作ったアプリです。自分にとっては初めてのチーム開発でした。タスクを「木を育てる」ことに重ね合わせて視覚的に楽しそうにしたTODOアプリです。</div>)
  },
  {
    title : 'Transmissions',
    img : 'images/work3.png',
    text : (<div>Shaderが魔法みたいだなぁと憧れて作ったものです。GLSLで書いてshadertoyに投稿しました。レイマーチングを使えば無限の奥行きをいい感じに見せることができて楽しいですね。距離関数やフォールディングなどの技巧が必要で、まだまだ勉強の必要を感じます。<a href="https://www.shadertoy.com/view/3l2SRh">こちらから</a></div>)
  },
  {
    title: 'Logo Animation',
    img: 'images/work4.gif',
    text: (<div>anime.jsを使えばCSSアニメーションを簡単にリッチにすることができる。これでボタンとか作ってみたい。ライブラリとしても軽い部類だと思うので、いい感じ。複雑なバスを打つのもいいですが、弧と直線の組み合わせでそれなりに見やすいデザインができて良い。<a href="https://vacuumedone.github.io/logo-animation/">こちらから</a></div>)
  }
] 

export default WorksDialog;