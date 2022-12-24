import '../css/style.css'
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import vertexSource from "./shader/vertexShader.glsl?raw";
import fragmentSource from "./shader/fragmentShader.glsl?raw";

// const img = require("../images/image.jpg");
import img from '../images/image.jpg';

let renderer, scene, camera;

const canvas = document.querySelector("#canvas");

let size = {
  width: window.innerWidth,
  height: window.innerHeight
};

async function init(){

  // レンダラー
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(size.width, size.height);

  //シーン
  scene = new THREE.Scene();

  //カメラ
  //ウインドウとWebGL座標を一致させる
  const fov = 45;
  const fovRadian = (fov / 2) * (Math.PI / 180); //視野角をラジアンに変換
  const distance = (size.height / 2) / Math.tan(fovRadian); //ウインドウぴったりのカメラ距離
  camera = new THREE.PerspectiveCamera(fov, size.width / size.height, 1, distance * 2);
  camera.position.z = distance;
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  scene.add(camera);

  //コントローラー
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;

  //ジオメトリ
  const geometry = new THREE.PlaneGeometry(size.width, size.height, 40, 40);

  //テクスチャ
  const loader = new THREE.TextureLoader();
  const texture = await loader.loadAsync(img);

  //GLSL用データ
  let uniforms = {
    uTime: {
      value: 0.0
    },
    uTex: {
      value: texture
    },
    uGeoResolution: {
      value: new THREE.Vector2(geometry.parameters.width, geometry.parameters.height)
    },
    uTexResolution: {
      value: new THREE.Vector2(1024, 1024)
    },
  };

  //マテリアル
  const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexSource,
    fragmentShader: fragmentSource,
    side: THREE.DoubleSide
  });

  //メッシュ
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);


  function animate(){
    //アニメーション処理

    uniforms.uTime.value += 0.03;
    
    //レンダリング
    renderer.render(scene, camera);
    controls.update();
    requestAnimationFrame(animate);
  }
  animate();
  
}

init();

// ラジアンに変換
// function radian(val) {
//   return (val * Math.PI) / 180;
// }

// ランダムな数
// function random(min, max) {
//   return Math.random() * (max - min) + min;
// }

//リサイズ
function onWindowResize() {
  // レンダラーのサイズを修正
  renderer.setSize(window.innerWidth, window.innerHeight);
  // カメラのアスペクト比を修正
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  size.width = window.innerWidth;
  size.height = window.innerHeight;
}
window.addEventListener("resize", onWindowResize);
