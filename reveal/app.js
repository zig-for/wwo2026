// ------------------------------------------------
// BASIC SETUP
// ------------------------------------------------

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// Create an empty scene
var scene = new THREE.Scene();




// Create a basic perspective camera
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.z = 14;

// Create a renderer with Antialiasing
var renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(window.devicePixelRatio);
// Configure renderer clear color
renderer.setClearColor("#000000");
const controls = new OrbitControls(camera, renderer.domElement);

// Configure renderer size
renderer.setSize( window.innerWidth, window.innerHeight );

// Append Renderer to DOM
document.body.appendChild( renderer.domElement );

var tl = new THREE.TextureLoader();

async function main() {

const [wood, scratchTex] = await Promise.all([
  tl.loadAsync("wood.jpg"),
  tl.loadAsync("scratch.png"),
]);
wood.colorSpace = THREE.SRGBColorSpace;
	scratchTex.colorSpace = THREE.SRGBColorSpace;
	var ticketCanvas = document.createElement('canvas');
ticketCanvas.width = 800;
ticketCanvas.height = 2200;
document.body.appendChild(ticketCanvas)
// Create a Cube Mesh with basic material
var deskGeometry = new THREE.BoxGeometry( 30, 20, 1 );
var deskMaterial = new THREE.MeshBasicMaterial({map:wood});
var desk = new THREE.Mesh( deskGeometry, deskMaterial );


var ticketGeometry = new THREE.BoxGeometry( 4, 11, 0.001 );
var scratchCanvasTexture = new THREE.CanvasTexture(ticketCanvas);
scratchCanvasTexture.colorSpace = THREE.SRGBColorSpace;
	var scratchMaterial = new THREE.MeshBasicMaterial({map:scratchCanvasTexture});
//var scratchMaterial = new THREE.MeshBasicMaterial({map:scratchTex});
var ticket = new THREE.Mesh( ticketGeometry, scratchMaterial );
desk.position.z = -0.5;

scene.add( desk );
scene.add( ticket );


// setup particles
const glitterScale = 0.05;
const glitterPoints = new Float32Array([
  -glitterScale, -glitterScale,  0.0,  // Vertex 1 (Bottom Left)
   glitterScale, -glitterScale,  0.0,  // Vertex 2 (Bottom Right)
   0.0,  glitterScale,  0.0   // Vertex 3 (Top Center)
]);

const glitterGeom = new THREE.BufferGeometry();
glitterGeom.setAttribute('position', new THREE.BufferAttribute(glitterPoints, 3));

// 3. Create a material (DoubleSide ensures it is visible from both front and back)
const glitterMaterial = new THREE.MeshBasicMaterial({ 
  color: 0x808080,
  side: THREE.DoubleSide 
});

	const maxGlitter = 10000;
var glitterInstancedMesh = new THREE.InstancedMesh(glitterGeom, glitterMaterial, maxGlitter);
		const dummy = new THREE.Object3D();


var glitterIdx = 0;

var glitterVelocity = new Float32Array(maxGlitter * 3);

scene.add( glitterInstancedMesh);

var ctx = ticketCanvas.getContext('2d');
ctx.drawImage(scratchTex.image, 0, 0);
scratchCanvasTexture.needsUpdate = true;

	const raycaster = new THREE.Raycaster();

renderer.domElement.addEventListener('pointermove', (e) => {
  // e.clientX, e.clientY are the pointer position in the viewport



const rect = renderer.domElement.getBoundingClientRect();
const pointerNDC = new THREE.Vector2(
  ((e.clientX - rect.left) / rect.width) * 2 - 1,
  -((e.clientY - rect.top) / rect.height) * 2 + 1
);

  raycaster.setFromCamera(pointerNDC, camera);
  const hits = raycaster.intersectObject(ticket);
if(hits.length) {
	const obj = hits[0].object;
	if(obj === ticket) {
		dummy.position.x = hits[0].point.x;
		dummy.position.y = hits[0].point.y;
		dummy.position.z = hits[0].point.z + 0.1;
		dummy.quaternion.random();	
		dummy.updateMatrix();
		glitterInstancedMesh.setMatrixAt(glitterIdx, dummy.matrix);
		glitterInstancedMesh.instanceMatrix.needsUpdate = true;

const a = Math.random() * Math.PI * 2;
const x = Math.cos(a), y = Math.sin(a);

const xyVel = 0.5;

		glitterVelocity[glitterIdx * 3 + 0] = x * xyVel;
		glitterVelocity[glitterIdx * 3 + 1] = y * xyVel;
		glitterVelocity[glitterIdx * 3 + 2] = 2.0;

		glitterIdx++;
		glitterIdx %= maxGlitter;
	}
}

});

var lastTime = performance.now();


// Render Loop
var render = function () {
 
const now = performance.now();

const frac = (now - lastTime) / 1000;

const gravAccel = -9.8;
requestAnimationFrame( render );

for (let i = 0; i < glitterInstancedMesh.count; i++) {
  glitterInstancedMesh.getMatrixAt(i, dummy.matrix);
  dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);


glitterVelocity[i * 3 + 2] += gravAccel * frac;
dummy.position.x += frac*glitterVelocity[i * 3 + 0];
dummy.position.y += frac*glitterVelocity[i * 3 + 1];
dummy.position.z += frac*glitterVelocity[i * 3 + 2];
	if(dummy.position.z < 0.0) {

dummy.position.z = 
			glitterVelocity[i * 3 + 0] = 
			glitterVelocity[i * 3 + 1] = 
			glitterVelocity[i * 3 + 2] = 0;
	}
  dummy.updateMatrix();
  glitterInstancedMesh.setMatrixAt(i, dummy.matrix);
}
glitterInstancedMesh.instanceMatrix.needsUpdate = true;


 // cube.rotation.x += 0.01;
 // cube.rotation.y += 0.01;

  // Render the scene
  renderer.render(scene, camera);
lastTime = now;
};

render();

}
main();
