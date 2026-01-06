const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');
require('dotenv').config();


function createWindow() {
  // 画面サイズ取得
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  // ウィンドウサイズ
  const winwidth = 350;
  const winheight = 350;

  const modelPath = process.env.PMX_FILE;
  const vmdpPath  = process.env.IDLE_VMD;

  const win = new BrowserWindow({
    width: winwidth,
    height: winheight,
    // 右下に配置
    x: width - winwidth,
    y: height - winheight,
    //frame: false,        // 枠なし
    transparent: true,     // 背景透過（した時点で"枠なし"固定っぽい？）
    resizable: false,
    alwaysOnTop: true,     // 常に前面
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),   // Nodeと出力側をやり取りするdir
      contextIsolation: true,        // セキュリティ的には cntextIsolation: true が望ましい
    },
  });

  win.setMenuBarVisibility(false);   // 右クリックで出るあのウィンドウ

  win.loadFile('index.html', {
    query: {
      modelPath: modelPath,
      vmdPath: vmdpPath,
    }
  });

  // 透過ウィンドウ化（イベント自体は保持）
  win.setIgnoreMouseEvents(true, { forward: true });
  // 透過ウィンドウ切り替え
  ipcMain.on('mouse-through:set-ignore', (event, ignore) => {
    //console.log(`setIgnore: ${ignore}`);
    win.setIgnoreMouseEvents(ignore, { forward: true });
  });

  //win.webContents.openDevTools();  // 開発者ツールを開く エラー対処用

}

// 全てのウィンドウが閉じられたら終了
app.on('window-all-closed', () => {
  // mac じゃないなら普通に終了
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {  // mac の dock からクリックされたときなど
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
