// カメラとは言うが、光源もここで処理

import * as THREE from 'three';

/**
 * カメラの位置調整・ライト追加・リサイズ対応をまとめて行う
 *
 * @param {THREE.Scene} scene
 * @param {THREE.Camera} camera
 * @param {THREE.WebGLRenderer} renderer
 */


export function setupCameraAndLights(scene, camera, renderer) {
  // カメラ位置
  camera.position.set(0, 17, 10);

  // スポットライト
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
  dirLight.position.set(0, 20, 20);
  scene.add(dirLight);

  // 環境光
  const ambient = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambient);

  // ウィンドウリサイズ対応
  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}
