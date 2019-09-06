import React from 'react';
import Profile from './Profile';
import Works from './Works';
import Links from './Links';
import WorksDialog from './WorksDialog'
import './Content.css';
import AnimatedMeshLine from './AnimatedMeshLine';

import * as THREE from 'three';

import { EffectComposer } from './jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './jsm/postprocessing/UnrealBloomPass.js';

import { SpriteMaterial, Mesh } from 'three';

let MeshLine : any = require('three.meshline').MeshLine;
let MeshLineMaterial : any = require('three.meshline').MeshLineMaterial;

interface ContentState {
  isDialogOpen : boolean,
  dialogContent : number,
  workBoxHeight : number
}

interface BloomParam {
  exposure: number,
  bloomStrength: number,
  bloomThreshold: number,
  bloomRadius: number
}


///////////////////////////////
// for updating parameter
let workN : number = 5;
///////////////////////////////

let container : HTMLElement | null;
let scene : THREE.Scene;
// let pointLight : THREE.PointLight;
let renderer : THREE.WebGLRenderer;
let camera : THREE.PerspectiveCamera;
let composer : EffectComposer;
let mouse : THREE.Vector3 = new THREE.Vector3(0,0,0);

//color
let palette : number[][] = [
  [
    0x45bf55,
    0xb5e5bb,
    0x00b496
  ],
  [
    0x731229,
    0x45bf55,
    0x181273,
  ]
];


//wonderLine
let wNum : number = 5;
let wonderStart : boolean = false;

//works
let circleR : number = 100;
let titlePad : number = (window.innerWidth <= 600) ? 150 : 75; //[Works/Activities]の文字分のパディング
let pad : number = circleR + 50;
let step : number = 300;


let params : BloomParam = {
  exposure: 1,
  bloomStrength: 2,
  bloomThreshold: 0,
  bloomRadius: 0
};

let LAYER = {
  PLANE: 0,
  BLOOM: 1
};

class Content extends React.Component<{}, ContentState> {
  constructor() {
    super({});
    this.state = {
      isDialogOpen : false,
      dialogContent : -1,
      workBoxHeight : 500
    }
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
            <div className="item" id="box3">
              <Links />
            </div>
            <div className="item" id="box2">
              <Works height={this.state.workBoxHeight}/>
            </div>
          </div>
          <WorksDialog isDialogOpen={this.state.isDialogOpen} content={this.state.dialogContent} handleClose={this.handleDialogClose}/>
        </div>
      </div>
    )
  }
  handleDialogClose = () => {
    this.setState((prevState) => {
      return {
        isDialogOpen : false,
        dialogContent : -1,
        workBoxHeight : prevState.workBoxHeight
      };
    });
  }
  componentDidMount = () => {
    this.init();
  }
  componentDidUpdate = () => {
    // this.init();
  }
  init = () => {
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

    //Renderer
    renderer = new THREE.WebGLRenderer( {antialias: true} );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.autoClear = false;
    container.appendChild( renderer.domElement );

    //Camera
    let fov : number = 60;
    let aspect : number = window.innerWidth / window.innerHeight;
    let dist : number = (window.innerHeight/2) / Math.tan((fov/2)*Math.PI/180);
    camera = new THREE.PerspectiveCamera(fov, aspect, 1, 1000);
    camera.position.z = dist;

    //Background Plane
    let background : THREE.Sprite | null;
    {
      new THREE.TextureLoader().load('texture/background.png', (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(10, 10);
        let mat = new SpriteMaterial({
          map: tex
        });
        background = new THREE.Sprite(mat);
        background.scale.x = 10000;
        background.scale.y = 10000;
        background.position.z = -100;
      });
    }

    //Boxes
    let boxM : THREE.LineBasicMaterial = new THREE.LineBasicMaterial( {color: palette[0][0], linewidth: 10}, );
    let boxLines : THREE.Line[] = [];
    {
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
        line.layers.set(LAYER.PLANE);
        boxLines.push(line);
      }
    }

    //Works
    let workGroup : THREE.Object3D;
    let works : (Work | undefined)[] = new Array(workN);
    let worksRect : ClientRect | DOMRect = boxes[1].getBoundingClientRect();
    let origin : THREE.Vector3 = new THREE.Vector3(
      -window.innerWidth/2 + worksRect.left + pad,
      window.innerHeight/2 - worksRect.top - defaultScrollY - pad - titlePad,
      0);
    let range : number = worksRect.width - 2 * pad;
    
    for(let i = 0; i < workN; i++) {
      let d : number = i * step;
      let dx : number = (d % range);
      let dy : number = i * 2 * circleR + Math.floor(d / range) * circleR;
      let pos : THREE.Vector3 = new THREE.Vector3(origin.x + dx, origin.y - dy, 0);
      works[i] = new Work('texture/work' + i + '.png', pos, circleR, palette[0][Math.floor(Math.random()*palette.length)]);
    }
    this.setState((prevState) => {
      return {
        isDialogOpen : prevState.isDialogOpen,
        workBoxHeight : (workN-1) * 2 * circleR + Math.floor((workN-1) * step / range) * circleR + circleR + pad
      };
    });

    //MeshLine
    let meshLines : AnimatedMeshLine[] = [];
    let id = 0;
    for (let box of boxes) {
      let rect : DOMRect | ClientRect = box.getBoundingClientRect();
      console.log(rect.top);
      let points : THREE.Vector3[] = [];
      let x = -1000;
      let y = -rect.top - 70 + window.innerHeight/2 - window.scrollY;
      while(x < rect.left - window.innerWidth/2) {
        points.push(new THREE.Vector3(x, y, 0));
        x += 200;
      }
      while(x < 1000) {
        points.push(new THREE.Vector3(x, y, 0));
        x += 200;
      }
      
      meshLines.push(new AnimatedMeshLine(points, palette[1][id++], 0.01, 5, 3, 0.8));
    }
    // let points : THREE.Vector3[] = [];
    // points.push(new THREE.Vector3(-1000, 0, 0));
    // points.push(new THREE.Vector3(0, 0, 0));
    // points.push(new THREE.Vector3(100, 100, 0));
    // points.push(new THREE.Vector3(0, 200, 0));
    // points.push(new THREE.Vector3(-100, 100, 0));
    // points.push(new THREE.Vector3(0, 0, 0));
    // points.push(new THREE.Vector3(1000, 0, 0));
    // let meshLine = new AnimatedMeshLine(points, new THREE.Color(0xff0000));

    const animate = () => {
      scene = new THREE.Scene();
      camera.position.y = -window.scrollY;
      // camera.position.x = mouse.x/20;
      // camera.position.y = mouse.y/20 - window.scrollY;
      // camera.lookAt(0, -window.scrollY, 0);

      // scene.add(camera);
      
      // scene.add( new THREE.AmbientLight(0x404040) );

      // pointLight = new THREE.PointLight(0xffffff, 1);
      // camera.add(pointLight);

      if (background !== null) {
        scene.add(background);
      }

      // for (let boxLine of boxLines) {
      //   scene.add(boxLine);
      // }

      workGroup = new THREE.Object3D();
      for (let i = 0; i < workN; i++) {
        let work : Work | undefined = works[i];
        if (work !== undefined) {
          work.update();
          let group : THREE.Object3D = work.getObject();
          workGroup.add(group);
        }
      }
      scene.add(workGroup);

      // scene.add(spriteGroup);

      for (let meshLine of meshLines) {
        meshLine.update();
        scene.add(meshLine.getMesh());
      }


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

      camera.layers.set(LAYER.PLANE);
      renderer.render(scene, camera);
      // renderer.clearDepth();
      // camera.layers.set(LAYER.BLOOM);
      // composer.render();
    }
    animate();

    const onWindowResize = (e : UIEvent) => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onWindowResize, false);

    const onMouseMove = (e : MouseEvent) => {
      e.preventDefault();
      mouse.x = e.clientX - window.innerWidth/2;
      mouse.y = -e.clientY + window.innerHeight/2;

      for (let i = 0; i < workN; i++) {
        let work : Work | undefined = works[i];
        if (work !== undefined) {
          let dist = Math.sqrt(
            Math.pow(work.position.x - mouse.x, 2.0) +
            Math.pow(work.position.y - mouse.y + window.scrollY, 2.0)
          ) - work.getRadius();
          if (dist < 0) {
            work.expand();
          } else {
            work.shrink();
          }
        }
      }
    }
    window.addEventListener('mousemove', onMouseMove, false);

    const onClick = (e : MouseEvent) => {
      if (!this.state.isDialogOpen) {
        mouse.x = e.clientX - window.innerWidth/2;
        mouse.y = -e.clientY + window.innerHeight/2;
  
        for (let i = 0; i < workN; i++) {
          let work : Work | undefined = works[i];
          if (work !== undefined) {
            let dist = Math.sqrt(
              Math.pow(work.position.x - mouse.x, 2.0) +
              Math.pow(work.position.y - mouse.y + window.scrollY, 2.0)
            ) - work.getRadius();
            if (dist < 0) {
              this.setState((prevState) => {
                return {
                  isDialogOpen : true,
                  dialogContent : i,
                  workBoxHeight : prevState.workBoxHeight
                }
              })
            }
          }
        }
      }
    }
    window.addEventListener('click', onClick, false);
  }
}

class BoldLine {

}

class Work {
  static SCALE_MAX : number = 1.2;
  static SCALE_MIN : number = 1;
  texture : THREE.Texture | undefined;
  textureCircle : THREE.Mesh | undefined;
  backCircle : THREE.Object3D;
  frontCircle : THREE.Object3D;
  position : THREE.Vector3 = new THREE.Vector3(0,0,0);
  defaultRadius: number;
  scale_t : number = 0; //from 0, to 1
  constructor(src : string, position : THREE.Vector3, radius : number, color: number) {
    //position
    this.setPosition(position);
  
    //set texture circle
    this.defaultRadius = radius;
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
        radius+30, radius+30,
        0, Math.PI/4,
        false,
        0
      );
      let point2D : THREE.Vector2[] = arcGen.getPoints(60);
      let point3D : THREE.Vector3[] = [];
      for (let p of point2D) {
        point3D.push(new THREE.Vector3(p.x, p.y, -5));
      }
      let meshLine = new AnimatedMeshLine(point3D, color, 0, 3, 0, 0);
      let mesh : THREE.Mesh = meshLine.getMesh();
      let mesh2 : THREE.Mesh = mesh.clone();
      mesh2.rotateZ(Math.PI);
      this.backCircle = new THREE.Object3D();
      this.backCircle.add(mesh);
      this.backCircle.add(mesh2);
      this.backCircle.rotateZ(Math.random()*Math.PI);
      this.backCircle.layers.set(LAYER.PLANE);
    }

    //set front circle
    {
      let obj : THREE.Object3D = new THREE.Object3D();
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
        point3D.push(new THREE.Vector3(p.x, p.y, 0));
      }
      let geo : THREE.BufferGeometry = new THREE.BufferGeometry().setFromPoints(point3D);
      let mat : THREE.Material = new THREE.LineBasicMaterial( {color: color} );
      let arc : THREE.Line = new THREE.Line( geo, mat );
      obj.add(arc);
      let div = 60;
      for (let i = 0; i < div; i++) {
        let dr = (i%5==0)?radius/16:radius/32;
        let points : THREE.Vector3[] = [
          new THREE.Vector3((radius-dr+10)*Math.cos(i*2*Math.PI/div), (radius-dr+10)*Math.sin(i*2*Math.PI/div), 0),
          new THREE.Vector3((radius+dr+10)*Math.cos(i*2*Math.PI/div), (radius+dr+10)*Math.sin(i*2*Math.PI/div), 0)
        ];
        geo = new THREE.BufferGeometry().setFromPoints(points);
        let line : THREE.Line = new THREE.Line( geo, mat );
        obj.add(line);
      }
      this.frontCircle = obj;
      this.frontCircle.layers.set(LAYER.PLANE);
    }
  }
  getTextureCircle() : THREE.Mesh | null {
    if (this.textureCircle !== undefined) {
      this.textureCircle.position.x = this.position.x;
      this.textureCircle.position.y = this.position.y;
      this.textureCircle.position.z = this.position.z;
      this.textureCircle.scale.x = this.getTextureScale();
      this.textureCircle.scale.y = this.getTextureScale();
      return this.textureCircle;
    } else {
      return null;
    }
  }
  getBackCircle() : THREE.Object3D {
    this.backCircle.position.x = this.position.x;
    this.backCircle.position.y = this.position.y;
    this.backCircle.position.z = this.position.z + 10;
    this.backCircle.scale.x = this.getCircleScale()*this.getCircleScale();
    this.backCircle.scale.y = this.getCircleScale()*this.getCircleScale();
    return this.backCircle;
  }
  getFrontCircle() : THREE.Object3D {
    this.frontCircle.position.x = this.position.x;
    this.frontCircle.position.y = this.position.y;
    this.frontCircle.position.z = this.position.z+20;
    this.frontCircle.scale.x = this.getCircleScale();
    this.frontCircle.scale.y = this.getCircleScale();
    return this.frontCircle;
  }
  getObject() : THREE.Object3D {
    let group : THREE.Object3D = new THREE.Object3D();
    let mesh : THREE.Mesh | null = this.getTextureCircle();
    if (mesh !== null) {
      group.add(mesh);
    }
    group.add(this.getFrontCircle());
    group.add(this.getBackCircle());
    return group;
  }
  setPosition(position : THREE.Vector3) {
    this.position = position;
  }
  getTextureScale() : number {
    return 1 - 0.05 * Math.pow(this.scale_t, 1.5);
  }
  getCircleScale() : number {
    return 1 + 0.1 * Math.pow(this.scale_t, 1.5);
  }
  getRadius() : number {
    return this.defaultRadius * this.getTextureScale();
  }
  expand() {
    if (this.scale_t <= 1) {
      this.scale_t += Math.min(0.05, 1 - this.scale_t);
    } else {
      this.scale_t = 1;
    }
  }
  shrink() {
    if (this.scale_t >= 0) {
      this.scale_t -= Math.min(0.05, this.scale_t);
    } else {
      this.scale_t = 0;
    }
  }
  update() {
    this.frontCircle.rotateZ(Math.PI/2000);
    this.backCircle.rotateZ(-Math.PI/1000);
  }
}

export default Content;