import { createMascotCore } from './mascotCore.js';
import { setupCameraAndLights } from './camera.js';

const url       = new URL(window.location.href);
const modelPath = url.searchParams.get('modelPath');
const vmdPath   = url.searchParams.get('vmdPath');

async function main() {
  const width  = window.innerWidth;
  const height = window.innerHeight;

  // マスコット設定
  const mascot = createMascotCore({
    modelPath,
    vmdPath,
    width,
    height,
  });

  // カメラ & ライト設定
  setupCameraAndLights(mascot.scene, mascot.camera, mascot.renderer);

  // モデル & モーション読み込み
  await mascot.load();

  // アニメーション開始
  mascot.start();
}

main().catch(console.error);
