const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('mouseThrough', {
  /*
   * ignore: true  → ウィンドウをクリック透過
   * ignore: false → マスコットがクリックを受けたとき
   */
  setIgnore(ignore) {
    ipcRenderer.send('mouse-through:set-ignore', ignore);
  },
});

contextBridge.exposeInMainWorld('windowControl', {
  dragStart(screenX, screenY) { ipcRenderer.send('window:drag-start', screenX, screenY); },
  dragMove(screenX, screenY)  { ipcRenderer.send('window:drag-move',  screenX, screenY); },
  dragEnd()                   { ipcRenderer.send('window:drag-end'); },
});
