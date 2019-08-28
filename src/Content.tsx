import React from 'react';
import Profile from './Profile';
import Works from './Works';
import Links from './Links';
import './Content.css';

import * as THREE from 'three';

import { EffectComposer } from './jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './jsm/postprocessing/UnrealBloomPass.js';

import { Dialog, DialogTitle, DialogContent, Button } from '@material-ui/core';

interface ContentState {
  isDialogOpen : boolean
}

interface BloomParam {
  exposure: number,
  bloomStrength: number,
  bloomThreshold: number,
  bloomRadius: number
}

let container : HTMLElement | null;
let scene : THREE.Scene;
let pointLight : THREE.PointLight;
let renderer : THREE.WebGLRenderer;
let camera : THREE.PerspectiveCamera;
let composer : EffectComposer;
let raycaster : THREE.Raycaster;
let mouse : THREE.Vector2 = new THREE.Vector2(0,0);

//color
let rime : number = 0x00FF00;

//wonderLine
let wNum : number = 5;
let wonderStart : boolean = false;

//works
let workN = 3;
let circleR = 100;
let titlePad = (window.innerWidth <= 600) ? 150 : 75; //[Works/Activities]の文字分のパディング
let pad = circleR + 50;

let params : BloomParam = {
  exposure: 1,
  bloomStrength: 2,
  bloomThreshold: 0,
  bloomRadius: 0
};

let LAYER = {
  NO_POSTPROCESS: 0,
  BLOOM: 1
};

class Content extends React.Component<{}, ContentState> {
  constructor() {
    super({});
    this.state = {isDialogOpen : false}
    window.addEventListener('resize', this.onWindowResize, false);
    window.addEventListener('mousemove', this.onMouseMove, false);
    // this.handleDialogClose = this.handleDialogClose.bind(this);
  }
  render() {
    return (
      <div id="content">
        <div className="layer1">
          <div id="background"></div>
        </div>
        <div className="layer2">
          <div className="header">Portfolio / Nocks_on</div>
          <div className="body">
            <div className="item" id="box1">
              <Profile />
            </div>
            <div className="item" id="box2">
              <Works />
            </div>
            <div className="item" id="box3">
              <Links />
            </div>
          </div>
          <Dialog open={this.state.isDialogOpen} onClose={this.handleDialogClose}>
            <DialogTitle>Work</DialogTitle>
            <DialogContent>
              <img src="texture/work0.png"></img>
              <div>JavaScript始めたての頃に作った3時間ゲーム制作の作品です。素のHTMLCanvasです。</div>
            </DialogContent>
            <Button onClick={this.handleDialogClose} color="primary">Close</Button>
          </Dialog>
        </div>
      </div>
    )
  }
  handleDialogClose = () => {
    this.setState({
      isDialogOpen : true
    });
  }
  componentDidMount = () => {
    this.setupCanvas();
  }
  componentDidUpdate = () => {
    this.setupCanvas();
  }
  setupCanvas = () => {
    let defaultScrollY = window.scrollY;
    let boxes : HTMLElement[] = [];
    let box : HTMLElement | null;
    for (let i = 1; i <= 3; i++) {
      box = document.getElementById('box' + i);
      if (box !== null) {
        boxes.push(box);
      }
    }
    if (boxes.length !== 3) {
      return;
    }

    container = document.getElementById('background');
    if (container == null) {
      return;
    }

    renderer = new THREE.WebGLRenderer( {antialias: true} );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.autoClear = false;
    container.appendChild( renderer.domElement );

    //Boxes
    let boxM : THREE.LineBasicMaterial = new THREE.LineBasicMaterial( {color: rime} );
    let boxLines : THREE.Line[] = [];
    for (let box of boxes) {
      let rect : ClientRect | DOMRect = box.getBoundingClientRect();
      let boxG : THREE.BufferGeometry = new THREE.BufferGeometry();
      let vertices : Float32Array = new Float32Array([
        rect.left, -rect.top, 0,
        rect.right, -rect.top, 0,
        rect.right, -rect.bottom, 0,
        rect.left, -rect.bottom, 0,
        rect.left, -rect.top, 0,
      ]);
      boxG.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
      let line : THREE.Line = new THREE.Line(boxG, boxM);
      line.position.x = -window.innerWidth/2;
      line.position.y = window.innerHeight/2 - defaultScrollY;
      line.layers.set(LAYER.BLOOM);
      boxLines.push(line);
    }

    //Works
    let works : (Work | undefined)[] = new Array(workN);
    let worksRect : ClientRect | DOMRect = boxes[1].getBoundingClientRect();
    let origin : THREE.Vector3 = new THREE.Vector3(
      -window.innerWidth/2 + worksRect.left + pad,
      window.innerHeight/2 - worksRect.top - defaultScrollY - pad - titlePad,
      0);
    let range : number = worksRect.width - 2 * pad;
    let step : number = 300;

    for(let i = 0; i <= workN; i++) {
      works[i] = new Work('texture/work' + i + '.png', circleR, rime);
    }

    //wonder
    let w : wonderLine[] = [];
    for (let i = 0; i < wNum; i++) {
      w.push(new wonderLine(new THREE.Vector2(0, 0), rime));
    }

    //Cube
    // let cube : THREE.Mesh;
    // {
    //   let geo : THREE.BoxGeometry = new THREE.BoxGeometry(100, 100, 100);
    //   let mat : THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial( {color: rime} );
    //   cube = new THREE.Mesh(geo, mat);
    // }

    const animate = () => {
      scene = new THREE.Scene();

      let fov : number = 60;
      let aspect : number = window.innerWidth / window.innerHeight;
      let dist : number = (window.innerHeight/2) / Math.tan((fov/2)*Math.PI/180);
      camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 1000);
      camera.position.z = dist;
      camera.position.y = -window.scrollY;
      scene.add(camera);
      
      scene.add( new THREE.AmbientLight(0x404040) );

      pointLight = new THREE.PointLight(0xffffff, 1);
      camera.add(pointLight);

      for (let boxLine of boxLines) {
        scene.add(boxLine);
      }

      for (let i = 0; i < workN; i++) {
        let work : Work | undefined = works[i];
        if (work !== undefined) {
          let d : number = i * step;
          let dx : number = (d % range);
          let dy : number = i * circleR + Math.floor(d / range) * circleR;
          let pos : THREE.Vector3 = new THREE.Vector3(origin.x + dx, origin.y - dy, 0);
          work.setPosition(pos);
          let mesh : THREE.Mesh | null = work.getTextureCircle();
          let frontCircle : THREE.Line = work.getFrontCircle();
          let backCircle : THREE.Line = work.getBackCircle();
          scene.add(backCircle);
          if (mesh !== null) {
            scene.add(mesh);
          }
          // scene.add(frontCircle);
        }
      }

      if (wonderStart) {
        for (let i = 0; i < wNum; i++) {
          w[i].update();
          scene.add(w[i].getLine());
        }
      }

      raycaster = new THREE.Raycaster();
      raycaster.setFromCamera( mouse, camera );
      let intersects : THREE.Intersection[] | null = raycaster.intersectObjects(scene.children);
      console.log(intersects.length);
      // for (let intersect of intersects) {
      //   intersect.object.scale.x = 3;
      //   intersect.object.scale.y = 3;
      // }

      //Post Process
      var renderScene = new RenderPass( scene, camera );
      var bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
      bloomPass.threshold = params.bloomThreshold;
      bloomPass.strength = params.bloomStrength;
      bloomPass.radius = params.bloomRadius;

      composer = new EffectComposer( renderer );
      composer.addPass( renderScene );
      // composer.addPass( bloomPass );

      requestAnimationFrame(animate);

      camera.layers.set(LAYER.BLOOM);
      composer.render();
      renderer.clearDepth();
      camera.layers.set(LAYER.NO_POSTPROCESS);
      renderer.render(scene, camera);
    }

    animate();
  }
  onWindowResize = (e : UIEvent) => {
    this.forceUpdate(() => (console.log('re render')));
  }
  onMouseMove = (e : MouseEvent) => {
    mouse.x = e.clientX - window.innerWidth/2;
    mouse.y = -e.clientY + window.innerHeight/2;
  }
}

class wonderLine {
  eps : number = 0.0001;
  center : THREE.Vector2;
  color : number;
  theta: number;
  r : number;
  points : THREE.Vector3[] = [];
  mvR : boolean;
  dr : number = 0;
  dtheta : number = 0;
  rev : number = (Math.random() > 0.5)?-1:1;
  alive: boolean = true;
  constructor(center : THREE.Vector2, color: number) {
    this.center = center;
    this.color = color;
    this.theta = Math.PI*2*Math.random();
    this.r = 0;
    this.points.push(new THREE.Vector3(this.center.x, this.center.y, 0));
    this.mvR = true;
    this.dr = 0.5 + Math.random();
  }
  update() : void {
    if (!this.alive) {
      return;
    } else {
      if (this.r > 50) {
        this.alive = false;
      }
    }
    if (this.mvR) {
      if (this.dr <= this.eps) {
        this.mvR = !this.mvR;
        this.dtheta = Math.PI/8 + Math.PI*Math.random();
      } else {
        let d = Math.min(this.dr, 0.2);
        this.dr -= d;
        this.r += d;
        this.points.push(new THREE.Vector3(
          this.center.x + this.r*Math.cos(this.theta), 
          this.center.y + this.r*Math.sin(this.theta), 
          0));
      }
    } else {
      if (this.dtheta <= this.eps) {
        this.mvR = !this.mvR;
        this.dr = 0.5 + Math.random();
      } else {
        let d = Math.min(this.dtheta, Math.PI/100 * this.r);
        this.dtheta -= d;
        this.theta += d*this.rev;
        this.points.push(new THREE.Vector3(
          this.center.x + this.r*Math.cos(this.theta), 
          this.center.y + this.r*Math.sin(this.theta), 
          0));
      }
    }
  }
  getLine() : THREE.Line {
    let geometry : THREE.BufferGeometry = new THREE.BufferGeometry().setFromPoints(this.points);
    let material : THREE.Material = new THREE.LineBasicMaterial( {color: this.color} );
    let line : THREE.Line = new THREE.Line(geometry, material);
    return line
  }
}

class Work {
  texture : THREE.Texture | undefined;
  textureCircle : THREE.Mesh | undefined;
  backCircle : THREE.Line;
  frontCircle : THREE.Line;
  backDiff : THREE.Vector3;
  position : THREE.Vector3 = new THREE.Vector3(0,0,0);
  constructor(src : string, radius : number, color: number) {
    //set texture circle
    {
      new THREE.TextureLoader().load(src, (tex) => {
        let geo : THREE.CircleGeometry = new THREE.CircleGeometry(radius, 60);
        let mat : THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial( {map: tex } );
        this.texture = tex;
        this.textureCircle = new THREE.Mesh( geo, mat );
      })
    }

    //set back circle
    {
      let arcGen : THREE.EllipseCurve = new THREE.EllipseCurve(
        0, 0,
        radius+10, radius+10,
        0, Math.PI*2,
        false,
        0
      );
      let point2D : THREE.Vector2[] = arcGen.getPoints(60);
      let point3D : THREE.Vector3[] = [];
      for (let p of point2D) {
        point3D.push(new THREE.Vector3(p.x, p.y, -5));
      }
      let geo : THREE.BufferGeometry = new THREE.BufferGeometry().setFromPoints(point3D);
      let mat : THREE.Material = new THREE.LineBasicMaterial( {color: color} );
      this.backCircle = new THREE.Line( geo, mat );
      this.backCircle.layers.set(LAYER.BLOOM);
      this.backDiff = new THREE.Vector3(10*(Math.random()*2-1), 10*(Math.random()*2-1), -10);
    }

    //set front circle
    {
      let arcGen : THREE.EllipseCurve = new THREE.EllipseCurve(
        0, 0,
        radius-10, radius-10,
        0, Math.PI,
        false,
        0
      );
      let point2D : THREE.Vector2[] = arcGen.getPoints(60);
      let point3D : THREE.Vector3[] = [];
      for (let p of point2D) {
        point3D.push(new THREE.Vector3(p.x, p.y, 0));
      }
      let geo : THREE.BufferGeometry = new THREE.BufferGeometry().setFromPoints(point3D);
      let mat : THREE.Material = new THREE.LineBasicMaterial( {color: color} );
      this.frontCircle = new THREE.Line( geo, mat );
      this.frontCircle.layers.set(LAYER.BLOOM);
    }
  }
  getTextureCircle() : THREE.Mesh | null {
    if (this.textureCircle !== undefined) {
      this.textureCircle.position.x = this.position.x;
      this.textureCircle.position.y = this.position.y;
      this.textureCircle.position.z = this.position.z;
      return this.textureCircle;
    } else {
      return null;
    }
  }
  getBackCircle() : THREE.Line {
    this.backCircle.position.x = this.position.x + this.backDiff.x;
    this.backCircle.position.y = this.position.y + this.backDiff.y;
    this.backCircle.position.z = this.position.z + this.backDiff.z;
    return this.backCircle;
  }
  getFrontCircle() : THREE.Line {
    this.frontCircle.position.x = this.position.x;
    this.frontCircle.position.y = this.position.y;
    this.frontCircle.position.z = this.position.z;
    return this.frontCircle;
  }
  setPosition(position : THREE.Vector3) {
    this.position = position;
  }
  update() {

  }
}

export default Content;