import * as THREE from './three.module.js';
import { GLTFExporter } from './GLTFExporter.js';
let camera, scene, renderer, container;
let conLeft, conRight, xrConLeft, xrConRight;
let light, cubeInterval, cubeColor;
let markers = new THREE.Group();

init();
requestSession();

window.addEventListener("unload", closeSession);

function init() {
  container = document.createElement('div');
  document.body.appendChild(container);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
  scene.add(light);

  conLeft = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshLambertMaterial({ color: 0xff0000 }));
  conRight = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshLambertMaterial({ color: 0x0000ff }));
  conLeft.visible = false;
  conRight.visible = false;
  scene.add(conLeft, conRight);

  scene.add(markers);

  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  renderer.xr.enabled = true;

  document.addEventListener('click', function(e) {
    if (e.target.id === 'exportPoints') exportPoints();
    else if (e.target.id === 'importPoints') importPoints();
    else if (e.target.id === 'exportScene') exportScene();
  }, false);
}

function requestSession() {
  navigator.xr.isSessionSupported('immersive-vr').then(function (supported) {
    let options = { optionalFeatures: ['local-floor', 'bounded-floor'] };
    navigator.xr.requestSession('immersive-vr', options).then(onSessionStarted);
  });
}

function onSessionStarted(session) {
  renderer.xr.setSession(session);
  xrConLeft = renderer.xr.getController(0);
  xrConRight = renderer.xr.getController(1);

  renderer.xr.getSession().addEventListener('selectstart', onSelectStart);
  renderer.xr.getSession().addEventListener('selectend', onSelectEnd);
  renderer.xr.getSession().addEventListener('select', onSelect);
  animate();
}

async function closeSession(session) {
  await renderer.xr.getSession().end();
}

function onSelectStart() {
  cubeColor = Math.random() * 0xffffff;
  cubeInterval = setInterval(addMarker, 250)
}

function onSelectEnd() {
  clearInterval(cubeInterval);
}

function onSelect() {
  clearInterval(cubeInterval);
}

function addMarker() {
  let marker = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.05), new THREE.MeshLambertMaterial({ color: cubeColor }));
  marker.position.x = xrConRight.position.x;
  marker.position.y = xrConRight.position.y;
  marker.position.z = xrConRight.position.z;
  markers.add(marker);
}

function animate() {
  renderer.setAnimationLoop(render);
}

function exportPoints() {
  let points = [];
  for (let i = 0; i < markers.children.length; i++) {
    points.push({
      x: markers.children[i].position.x,
      y: markers.children[i].position.y,
      z: markers.children[i].position.z,
    });
  }
  document.getElementById('output').value = JSON.stringify(points);
}

function exportScene() {
  var exporter = new GLTFExporter();
  exporter.parse(scene, function (gltf) {
    download('drawing.gltf', JSON.stringify(gltf));
  }, { truncateDrawRange: false });
}

function importPoints() {
  let points = JSON.parse(document.getElementById('output').value);
  cubeColor = Math.random() * 0xffffff;
  for (let i = 0; i < points.length; i++) {
    let marker = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.05), new THREE.MeshLambertMaterial({ color: cubeColor }));
    marker.position.x = points[i].x;
    marker.position.y = points[i].y;
    marker.position.z = points[i].z;
    markers.add(marker);
  }
  document.getElementById('output').value = '';
}

function render() {
  conLeft.position.x = xrConLeft.position.x;
  conLeft.position.y = xrConLeft.position.y;
  conLeft.position.z = xrConLeft.position.z;
  conLeft.rotation.x = xrConLeft.rotation.x;
  conLeft.rotation.y = xrConLeft.rotation.y;
  conLeft.rotation.z = xrConLeft.rotation.z;

  conRight.position.x = xrConRight.position.x;
  conRight.position.y = xrConRight.position.y;
  conRight.position.z = xrConRight.position.z;
  conRight.rotation.x = xrConRight.rotation.x;
  conRight.rotation.y = xrConRight.rotation.y;
  conRight.rotation.z = xrConRight.rotation.z;

  renderer.render(scene, camera);
}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}