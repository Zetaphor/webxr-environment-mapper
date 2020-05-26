import * as THREE from './three.module.js';
import { GLTFExporter } from './GLTFExporter.js';
let camera, scene, renderer, container;
let conLeft, conRight, xrConLeft, xrConRight;
let light, cubeInterval, cubeColor;
let markers = new THREE.Group();
let outputEl, totalPointsEl, statusEl;

init();
requestSession();

window.addEventListener("unload", closeSession);

function init() {
  outputEl = document.getElementById('output');
  totalPointsEl = document.getElementById('totalPoints');
  statusEl = document.getElementById('status');

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
    if (e.target.id === 'outputPoints') outputPoints();
    if (e.target.id === 'downloadPoints') downloadPoints();
    else if (e.target.id === 'importPoints') importPoints();
    else if (e.target.id === 'downloadScene') downloadScene();
  }, false);
}

function requestSession() {
  totalPointsEl.parentElement.style.display = 'none';
  statusEl.parentElement.style.display = 'block';
  statusEl.innerHTML = 'Requesting WebXR session';
  navigator.xr.isSessionSupported('immersive-vr').then(function (supported) {
    let options = { optionalFeatures: ['local-floor', 'bounded-floor'] };
    navigator.xr.requestSession('immersive-vr', options).then(onSessionStarted).catch(function (err) {
      totalPointsEl.parentElement.style.display = 'none';
      statusEl.parentElement.style.display = 'block';
      statusEl.innerHTML = err;
    });
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
  totalPointsEl.parentElement.style.display = 'block';
  statusEl.parentElement.style.display = 'none';
}

async function closeSession() {
  totalPointsEl.parentElement.style.display = 'none';
  statusEl.parentElement.style.display = 'block';
  statusEl.innerHTML = 'WebXR session ended';
  await renderer.xr.getSession().end();
}

function onSelectStart() {
  cubeColor = Math.random() * 0xffffff;
  addMarker(xrConRight.position);
  cubeInterval = setInterval(addMarker(xrConRight.position), 250)
}

function onSelectEnd() {
  clearInterval(cubeInterval);
}

function onSelect() {
  clearInterval(cubeInterval);
}

function animate() {
  renderer.setAnimationLoop(render);
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

function addMarker(position) {
  let marker = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.05), new THREE.MeshLambertMaterial({ color: cubeColor }));
  marker.position.x = position.x;
  marker.position.y = position.y;
  marker.position.z = position.z;
  markers.add(marker);
  totalPointsEl.innerHTML = markers.children.length;
}

function outputPoints() {
  let points = [];
  for (let i = 0; i < markers.children.length; i++) {
    points.push({
      x: markers.children[i].position.x,
      y: markers.children[i].position.y,
      z: markers.children[i].position.z,
    });
  }
  outputEl.value = JSON.stringify(points);
}

function importPoints() {
  let points = JSON.parse(outputEl.value);
  cubeColor = Math.random() * 0xffffff;
  for (let i = 0; i < points.length; i++) {
    addMarker(points[i]);
  }
  outputEl.value = '';
}

function downloadScene() {
  var exporter = new GLTFExporter();
  exporter.parse(scene, function (gltf) {
    download('gltf', JSON.stringify(gltf));
  }, { truncateDrawRange: false });
}

function downloadPoints() {
  outputPoints();
  download('txt', JSON.stringify(outputEl.value));
}

function download(extension, data) {
  var downloadLink = document.createElement('a');
  downloadLink.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(data)}`);
  downloadLink.setAttribute('download', `environment_${dateTimeString()}.${extension}`);
  downloadLink.style.display = 'none';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

function dateTimeString() {
  let today = new Date();
  let ampm = (today.getHours() >= 12) ? "PM" : "AM";
  let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  let time = today.getHours() + "." + today.getMinutes() + "." + today.getSeconds();
  return `${date}_${time}${ampm}`;
}