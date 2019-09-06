import * as THREE from 'three';

let MeshLine = require('three.meshline').MeshLine;
let MeshLineMaterial = require('three.meshline').MeshLineMaterial;

class AnimatedMeshLine {
  division: number = 100;
  points : THREE.Vector3[];
  color : THREE.Color | number;
  mesh : THREE.Mesh;
  mat : any;
  speed : number = 0.01;
  lineWidth : number = 3;
  amplitude : number = 0;
  dashRatio : number = 0;
  ran : number = Math.random();
  constructor(points : THREE.Vector3[], color : THREE.Color | number, speed? : number, lineWidth? : number, amplitude? : number, dashRatio?: number) {
    this.points = points;
    this.color = color;
    if (lineWidth) this.lineWidth = lineWidth;
    if (amplitude) this.amplitude = amplitude;
    if (dashRatio) this.dashRatio = dashRatio;
    {
      let geo : THREE.Geometry = new THREE.Geometry();
      geo.setFromPoints(new THREE.CatmullRomCurve3(points).getPoints(this.division));
      let line = new MeshLine();
      line.setGeometry(geo, (p : number) => {
        // return this.lineWidth + this.amplitude*Math.sin(this.division*p + this.ran*10);
        return this.lineWidth + this.amplitude*Math.sin(p);
        // return 5;
      });
      let mat = new MeshLineMaterial({
        transparent : true,
        color: this.color,
        dashArray: 1,
        dashOffset: 0,
        dashRatio: this.dashRatio
      });
      this.mat = mat;
      this.mesh = new THREE.Mesh(line.geometry, mat);
    }
  }
  getMesh () {
    return this.mesh;
  }
  update() {
    this.mat.dashOffset += this.speed;
  }
  isAlive() {

  }
  respawn() {

  }
}

export default AnimatedMeshLine;