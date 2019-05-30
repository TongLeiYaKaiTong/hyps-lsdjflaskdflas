import * as THREE from 'three';
// import Stage from "./components/stage/stage.js";
import Stage from './components/stage/stage'
import './less/index.less';
import SnoutGeometry from './components/snoutGeometry/snoutGeometry';
// import SlopedCylinderGeometry from './components/slopedCylinderGeometry/slopedCylinderGeometry'

const opts = {
    element: '#container',
}

const stage_1 = new Stage(opts);
stage_1.animate();


const material = new THREE.MeshNormalMaterial();

const snoutGeometry = new SnoutGeometry(20, 10, 30, 18, 18);
const snout = new THREE.Mesh(snoutGeometry, material);
stage_1.add(snout);


// const slopedCylinderGeometry = new SlopedCylinderGeometry(20, 10, 30, 18, 18);
// const slopedCylinder = new THREE.Mesh(slopedCylinderGeometry, material);
// stage_1.add(slopedCylinder);