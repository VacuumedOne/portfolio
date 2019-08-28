import React from 'react';
import p5 from 'p5';

interface LoadingProps {

}

interface LoadingStatus {

}

class Loading extends React.Component<LoadingProps, LoadingStatus> {
  constructor(prop : LoadingProps) {
    super(prop);
  }
  render() {
    return (
      <div id="loading"></div>
    )
  }
  componentDidMount() {
    let canvas : HTMLElement | null = document.getElementById('loading');
    if (canvas !== null) {
      new p5(sketch, canvas);
    }
  }
}

const sketch = (p5 : p5) : void => {
  let winW : number = window.innerWidth;
  let winH : number = window.innerHeight;
  let time : number = 0;
  let start : boolean = false;
  let dur : number = 0;
  let end : boolean = false;
  
  let rime : p5.Color;
  let bluegreen : p5.Color;
  let darkgreen : p5.Color;
  let bg : p5.Color;
  
  let graphic : p5.Graphics[] = new Array(5);
  let arcRadius : number = Math.min(300, Math.floor(winW/2.1));

  p5.preload = () => {
    //color preload
    p5.colorMode(p5.HSB, 1.0);
    rime = p5.color(1/3, 0.9, 0.8);
    bluegreen = p5.color(8/15, 0.9, 0.8);
    darkgreen = p5.color(2/5, 0.9, 0.8);
    bg = p5.color(0.0, 0.0, 0.2);
    graphic[0] = createArc(p5, arcRadius, darkgreen, 0, Math.PI/2);
    graphic[1] = createBoldArc(p5, arcRadius, rime, 0, Math.PI/1.5);
    graphic[2] = createBoldArc(p5, arcRadius, bluegreen, 0, Math.PI/1.5);
    graphic[3] = createBoldArc(p5, arcRadius, rime, 0, Math.PI/1.5);
  }

  p5.setup = () => {
    p5.createCanvas(winW, winH);
    p5.smooth();
    p5.frameRate(30);
    p5.imageMode(p5.CENTER);
    p5.textAlign(p5.CENTER, p5.CENTER);
  }

  p5.draw = () => {
    p5.background(bg);
    p5.translate(winW/2, winH/2);
    
    //center line
    // p5.stroke(rime);
    // p5.line(-time*time, 0, time*time, 0);

    //arcs
    p5.push();
    p5.scale(0.8 + dur*dur/10);
    p5.rotate(-Math.PI/4 - time/200);
    p5.image(graphic[2], 0, 0);
    p5.pop();
    p5.push();
    p5.rotate(-Math.PI/4 + time/400);
    p5.image(graphic[0], 0, 0);
    p5.pop();
    p5.push();
    p5.scale(0.6);
    p5.rotate(-Math.PI/4 + time/200);
    p5.image(graphic[1], 0, 0);
    p5.pop();
    p5.push();
    p5.scale(0.6);
    p5.rotate(-Math.PI/4 - time/100);
    p5.image(graphic[3], 0, 0);
    p5.pop();

    //text
    p5.fill(rime);
    p5.noStroke();
    p5.textSize(arcRadius/10);
    p5.text("Now Loading...", 0, 10*Math.sin(time/10));

    time++;
    if (start && !end) dur++;
    if (dur > 1000) end = true;
  }
  
  p5.mouseClicked = () => {
    if (!start) {
      start = true;
    }
  }
}

const createArc = (p5: p5, arcRadius : number, col : p5.Color, start : number, stop : number) : p5.Graphics => {
  let g : p5.Graphics;

  let eps : number = 10;
  let pad : number = 20;
  let buffSize : number = arcRadius*2+pad;
  let center_x : number = buffSize / 2;
  let center_y : number = buffSize / 2;
  g = p5.createGraphics(buffSize, buffSize);
  g.loadPixels();
  let d : number = g.pixelDensity();

  for (let x : number = 0; x < buffSize; x++) {
    for (let y : number = 0; y < buffSize; y++) {
      let r : number = Math.sqrt(Math.pow(x-center_x, 2)+Math.pow(y-center_y, 2)) - arcRadius;
      let theta : number = Math.atan((y-center_y)/(x-center_x));

      for (let i : number = 0; i < d; i++) {
        for (let j : number = 0; j < d; j++) {
          let index = 4*((y*d+j)*buffSize*d + (x*d+i));
          if (Math.abs(r) < eps && start < theta && theta < stop) {
            g.pixels[index  ] = Math.max(p5.red(col)*10 / (r*r), p5.red(col));
            g.pixels[index+1] = Math.max(p5.green(col)*10 / (r*r), p5.green(col));
            g.pixels[index+2] = Math.max(p5.blue(col)*10 / (r*r), p5.blue(col));
            g.pixels[index+3] = 255*15 / (r*r);
          }
        }
      }
    }
  }
  g.updatePixels();
  return g;
};

const createBoldArc = (p5: p5, arcRadius : number, col : p5.Color, start : number, stop : number) : p5.Graphics => {
  let g : p5.Graphics;

  let eps : number = 10;
  let pad : number = 20;
  let buffSize : number = arcRadius*2+pad;
  let center_x : number = buffSize / 2;
  let center_y : number = buffSize / 2;
  g = p5.createGraphics(buffSize, buffSize);
  g.loadPixels();
  let d : number = g.pixelDensity();

  for (let x : number = 0; x < buffSize; x++) {
    for (let y : number = 0; y < buffSize; y++) {
      let r : number = Math.sqrt(Math.pow(x-center_x, 2)+Math.pow(y-center_y, 2)) - arcRadius;
      let theta : number = Math.atan((y-center_y)/(x-center_x));
      if (x-center_x < 0) theta += Math.PI;

      for (let i : number = 0; i < d; i++) {
        for (let j : number = 0; j < d; j++) {
          let index = 4*((y*d+j)*buffSize*d + (x*d+i));
          if (Math.abs(r) < eps && start < theta && theta < stop) {
            g.pixels[index  ] = Math.max(p5.red(col)*10 / (r*r), p5.red(col));
            g.pixels[index+1] = Math.max(p5.green(col)*10 / (r*r), p5.green(col));
            g.pixels[index+2] = Math.max(p5.blue(col)*10 / (r*r), p5.blue(col));
            g.pixels[index+3] = 255*15 / (r*r);
          }
        }
      }
    }
  }
  g.updatePixels();
  return g;
};

const createPie = (p5: p5, outerRadius : number, innerRadius : number, col : p5.Color, start : number, stop : number) : p5.Graphics => {
  let g : p5.Graphics;

  let pad : number = 20;
  let buffSize : number = outerRadius*2+pad;
  let center_x : number = buffSize / 2;
  let center_y : number = buffSize / 2;
  g = p5.createGraphics(buffSize, buffSize);
  g.loadPixels();
  let d : number = g.pixelDensity();

  for (let x : number = 0; x < buffSize; x++) {
    for (let y : number = 0; y < buffSize; y++) {
      let r : number = Math.sqrt(Math.pow(x-center_x, 2)+Math.pow(y-center_y, 2)) - (outerRadius + innerRadius)/2;
      let theta : number = Math.atan((y-center_y)/(x-center_x));
      if (x-center_x < 0) theta += Math.PI;

      for (let i : number = 0; i < d; i++) {
        for (let j : number = 0; j < d; j++) {
          let index = 4*((y*d+j)*buffSize*d + (x*d+i));
          if (Math.abs(r) < (outerRadius - innerRadius)/2 && start < theta && theta < stop) {
            g.pixels[index  ] = p5.red(col);
            g.pixels[index+1] = p5.green(col);
            g.pixels[index+2] = p5.blue(col);
            g.pixels[index+3] = 100;
          }
        }
      }
    }
  }
  g.updatePixels();
  return g;
};

const createGlidArc = (p5: p5, arcRadius : number, glidLength : number, col : p5.Color, start : number, stop : number, step: number) : p5.Graphics => {
  let g : p5.Graphics;

  let eps : number = 10;
  let pad : number = 20;
  let buffSize : number = arcRadius*2+glidLength+pad;
  let center_x : number = buffSize / 2;
  let center_y : number = buffSize / 2;
  g = p5.createGraphics(buffSize, buffSize);
  g.loadPixels();
  let d : number = g.pixelDensity();

  g.smooth();
  g.noFill();
  g.stroke(col);
  g.strokeWeight(eps);
  g.strokeCap(p5.SQUARE);
  g.translate(buffSize/2, buffSize/2);
  g.arc(0, 0, arcRadius*2, arcRadius*2, start, stop);
  let ri : number = arcRadius-glidLength/2;
  let ro : number = arcRadius+glidLength/2;
  for(let theta : number = start; theta <= stop; theta += step) {
    g.line(ri*Math.cos(theta), ri*Math.sin(theta), ro*Math.cos(theta), ro*Math.sin(theta));
  }
  // for (let x : number = 0; x < buffSize; x++) {
  //   for (let y : number = 0; y < buffSize; y++) {
  //     let r : number = Math.sqrt(Math.pow(x-center_x, 2)+Math.pow(y-center_y, 2));
  //     let theta : number = Math.atan((y-center_y)/(x-center_x));
  //     if (x-center_x < 0) theta += Math.PI;
  //     let fold : number = theta % (Math.PI/5);
  //     if (fold < 0) fold += Math.PI/5;
  //     fold -= Math.PI/10;
  //     let a : p5.Vector = p5.createVector(arcRadius - glidLength/2);
  //     let b : p5.Vector = p5.createVector(arcRadius + glidLength/2);
  //     let p : p5.Vector = p5.createVector(r*Math.cos(fold), r*Math.sign(fold));
  //     let pa : p5.Vector = p5.createVector(p.x-a.x, p.y-a.y);
  //     let ba : p5.Vector = p5.createVector(b.x-a.x, b.y-a.y);
  //     let h : number = (pa.x*ba.x + pa.y*ba.y)/(Math.sqrt(ba.x*ba.x + ba.y*ba.y));
  //     h = p5.constrain(h, 0.0, 1.0);
  //     let dir : p5.Vector = p5.createVector(pa.x - h*ba.x, pa.y - h*ba.y);

  //     let d1 : number = Math.abs(r - arcRadius);
  //     let d2 : number = 0.05*Math.sqrt(dir.x*dir.x + dir.y*dir.y);

  //     for (let i : number = 0; i < d; i++) {
  //       for (let j : number = 0; j < d; j++) {
  //         let index = 4*((y*d+j)*buffSize*d + (x*d+i));
  //         if (Math.min(d1, d2) < eps && start < theta && theta < stop) {
  //           g.pixels[index  ] = p5.red(col);
  //           g.pixels[index+1] = p5.green(col);
  //           g.pixels[index+2] = p5.blue(col);
  //           g.pixels[index+3] = 100;
  //         }
  //       }
  //     }
  //   }
  // }
  // g.updatePixels();
  return g;
};

export default Loading;