import React from 'react';
import * as THREE from 'three';
import './Background.css';

import { EffectComposer } from './jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './jsm/postprocessing/UnrealBloomPass.js';

interface BackgroundParam {
  scrollY : number,
  boxes : HTMLElement[]
}

interface BloomParam {
  exposure: number,
  bloomStrength: number,
  bloomThreshold: number,
  bloomRadius: number
}

let clock : THREE.Clock;
let container : HTMLElement | null;
let scene : THREE.Scene;
let pointLight : THREE.PointLight;
let renderer : THREE.WebGLRenderer;
let camera : THREE.PerspectiveCamera;
let composer : EffectComposer;

//color
let rime : number = 0x00FF00;

//wonderLine
let wNum : number = 5;
let wonderStart : boolean = false;

//text
let message = 'Nocks_on';

let params : BloomParam = {
  exposure: 1,
  bloomStrength: 1.5,
  bloomThreshold: 0,
  bloomRadius: 0
};

class Background extends React.Component<BackgroundParam, {}> {
  render() {
    return (
      <div>
        <div id="background"></div>
      </div>
    )
  }
  componentDidMount() {
    clock = new THREE.Clock();
    container = document.getElementById('background');
    if (container == null) {
      return;
    }

    renderer = new THREE.WebGLRenderer( {antialias: true} );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    container.appendChild( renderer.domElement );

    //Boxes
    console.log('box data')
    for (let box of this.props.boxes) {
      let rect : ClientRect | DOMRect = box.getBoundingClientRect();
      console.log(rect);
    }

    //Figure
    let inR : number = 100;
    let outR : number = 150;
    let point2D : THREE.Vector2[] = [];
    let arcGen : THREE.EllipseCurve = new THREE.EllipseCurve(
      0, 0,
      inR, inR,
      Math.PI*2/3, Math.PI*4/3,
      false,
      0
    );
    point2D = arcGen.getPoints(50);
    point2D.push(new THREE.Vector2(outR * Math.cos(Math.PI*4/3), outR * Math.sin(Math.PI*4/3)));
    let point3D : THREE.Vector3[] = [];
    for (let p2 of point2D) {
      point3D.push(new THREE.Vector3(p2.x, p2.y, 0));
    }
    let geo : THREE.BufferGeometry = new THREE.BufferGeometry().setFromPoints(point3D);
    let mat : THREE.Material = new THREE.LineBasicMaterial( {color: rime} );
    let figure : THREE.Line = new THREE.Line( geo, mat );
    let figure2 : THREE.Line = figure.clone(true);
    figure2.rotateZ(Math.PI);

    //wonder
    let w : wonderLine[] = [];
    for (let i = 0; i < wNum; i++) {
      w.push(new wonderLine(new THREE.Vector2(0, 0), rime));
    }

    //font
    let loader : THREE.FontLoader = new THREE.FontLoader();
    let text : THREE.Mesh;
    loader.load('./fonts/gentilis_regular.typeface.json', function(font) {
      console.log('finish loading');
      let shapes : THREE.Shape[] = font.generateShapes(message, 1, 100);
      let geometry : THREE.ShapeBufferGeometry = new THREE.ShapeBufferGeometry(shapes);
      
      let material : THREE.LineBasicMaterial = new THREE.LineBasicMaterial({
        color: rime,
        side: THREE.DoubleSide
      });
      geometry.computeBoundingBox();
      let center_x : number = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
      geometry.translate(center_x, 0, 0);

      text = new THREE.Mesh(geometry, material);

    },
    () => {console.log('loading font...')},
    () => {console.log('failure')})

    const animate = () => {
      scene = new THREE.Scene();

      let fov : number = 60;
      let aspect : number = window.innerWidth / window.innerHeight;
      let dist : number = (window.innerHeight/2) / Math.tan((fov/2)*Math.PI/180);
      camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 1000);
      camera.position.z = dist;
      scene.add(camera);
      
      scene.add( new THREE.AmbientLight(0x404040) );

      pointLight = new THREE.PointLight(0xffffff, 1);
      camera.add(pointLight);

      scene.add(figure);
      scene.add(figure2);
      if (wonderStart) {
        for (let i = 0; i < wNum; i++) {
          w[i].update();
          scene.add(w[i].getLine());
        }
      }
      if (text != null) {
        scene.add(text);
      }

      var renderScene = new RenderPass( scene, camera );

      var bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
      bloomPass.threshold = params.bloomThreshold;
      bloomPass.strength = params.bloomStrength;
      bloomPass.radius = params.bloomRadius;

      composer = new EffectComposer( renderer );
      composer.addPass( renderScene );
      composer.addPass( bloomPass );

      requestAnimationFrame(animate);

      const delta : number = clock.getDelta();
      composer.render();
    }

    animate();

    const onWindowResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', onWindowResize, false);
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

export default Background;
