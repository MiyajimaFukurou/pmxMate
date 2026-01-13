/*
// マスコットの「基本機能」をまとめたモジュール
// - three.js / MMD 初期化
// - PMX 読み込み
// - 待機モーション(VMD)のループ再生
// - 背景透過
// - クリック透過（モデル上だけクリックを受ける）
*/

import * as THREE from 'three';
import { MMDLoader } from 'three/addons/loaders/MMDLoader.js';
import { MMDAnimationHelper } from 'three/addons/animation/MMDAnimationHelper.js';

/**
 * マスコットのコア機能セットアップ
 *
 * @param {Object} options
 * @param {string} options.modelPath  - PMX モデルパス
 * @param {string} options.vmdPath    - 待機モーション VMD パス
 * @param {number} options.width      - 初期ウィンドウ幅
 * @param {number} options.height     - 初期ウィンドウ高さ
 *
 * @returns {{
 *   scene: THREE.Scene,
 *   camera: THREE.PerspectiveCamera,
 *   renderer: THREE.WebGLRenderer,
 *   load: () => Promise<void>,
 *   start: () => void,
 * }}
 */


export function createMascotCore({ modelPath, vmdPath, width, height }) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true, // キャンバス背景透過
  });
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0); // 完全透明

  // 白飛び対策
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.6;

  document.body.appendChild(renderer.domElement);

  // 影
  const canvas = renderer.domElement;
  canvas.style.filter = 'drop-shadow(-25px 15px 4px rgba(0, 0, 0, 0.6))';  // (x方向, y方向, ぼかし, 色味(r, g, b, 透明度))

  // ⚠️テスト用ボックス・・・のはずが、pmxの接触判定がコレに依存してるため必要⚠️
  // 原因不明
  //*
  const testGeo = new THREE.BoxGeometry(5, 10, 5);
  const testMat = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true,
  });
  const testBox = new THREE.Mesh(testGeo, testMat);
  testBox.position.set(0, 0, 0);
  scene.add(testBox);
  //*/
  
  // --- MMD セットアップ ---
  const loader = new MMDLoader();
  const helper = new MMDAnimationHelper({
    afterglow: 2.0,  // モーション間の補正
    physics: false,  // 物理演算
  });

  let model = null;

  // カーソルの接触判定
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let lastHover = false;   // 直前フレームでモデルの上にいたかどうか

  // モデル読み込み前でもイベントは取れるが、model が null の間は何もしない
  window.addEventListener('mousemove', (event) => {
    if (!model) return;

    const rect = renderer.domElement.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    // three.js の NDC に変換 (-1〜1)
    mouse.x = x * 2 - 1;
    mouse.y = -(y * 2 - 1);

    raycaster.setFromCamera(mouse, camera);

    // レイキャスト対象
    //const intersects = raycaster.intersectObject(testBox, true);
    //const intersects = raycaster.intersectObject(model, true);  // model 側の当たり判定がよくわからん（全部透過してる）ので・・・↓
    const intersects = raycaster.intersectObjects(scene.children, true);  // シーン下にあるメッシュ全体
    
    const isHover = intersects.length > 0;
    console.log('isHover:', isHover);

    if (isHover !== lastHover) {
      lastHover = isHover;
      // モデル外   → ignore = true （透過ON：下のウィンドウにクリックを通す）
      const ignore = !isHover;
      window.mouseThrough?.setIgnore(ignore);
    }
  });

  // F1 で強制的に透過OFF（デバッグ用）
  window.addEventListener('keydown', (event) => {
    if (event.key === 'F1') {
      window.mouseThrough?.setIgnore(false);
    }
  });

  // --- モデル & モーション読み込み ---
  async function load() {
    // MMDLoader を Promise 化して扱いやすくしておく
    const loadModel = (path) =>
      new Promise((resolve, reject) => {
        loader.load(
          path,
          (mesh) => resolve(mesh),
          undefined,
          (error) => reject(error),
        );
      });

    const loadVmd = (path, mesh) =>
      new Promise((resolve, reject) => {
        loader.loadAnimation(
          path,
          mesh,
          (animation) => resolve(animation),
          undefined,
          (error) => reject(error),
        );
      });

    try {
      model = await loadModel(modelPath);
      scene.add(model);
      console.log('PMX 読み込み完了');

      if (vmdPath) {
        const animation = await loadVmd(vmdPath, model);
        helper.add(model, {
          animation,
          physics: false,  // ここでも宣言しないと動かないっぽい？
        });
        console.log('待機モーション(VMD) 読み込み完了');
      }
    } catch (err) {
      console.error('モデル / モーション読み込みエラー:', err);
    }
  }

  // --- アニメーションループ ---
  const clock = new THREE.Clock();

  function start() {
    function animate() {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      helper.update(delta);  // モーション再生
      renderer.render(scene, camera);
    }

    animate();
  }

  let dragging = false;
  let rafPending = false;

  function onMouseMoveForHover(e) {
      if (dragging) return; // ドラッグ中はhover判定しない
    }

  canvas.addEventListener('pointerdown', (e) => {
    if (!e.altKey) return;
    if (!lastHover) return;
    dragging = true;

    canvas.setPointerCapture(e.pointerId);
    window.windowControl?.dragStart();
    e.preventDefault();
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    
    if (!rafPending) {
      rafPending = true;  // 移動処理はスタックしない（ペンディングする）
      requestAnimationFrame(() => {
        rafPending = false;
        window.windowControl?.dragMove();
      });
    }
    e.preventDefault();
  });

  canvas.addEventListener('pointerup', (e) => {
    if (!dragging) return;
    dragging = false;
    window.windowControl?.dragEnd();

    try { canvas.releasePointerCapture(e.pointerId); } catch {}
    e.preventDefault();
  });

  // 外から触りたい最低限のものだけ返す
  return {
    scene,
    camera,
    renderer,
    load,
    start,
  };
}
