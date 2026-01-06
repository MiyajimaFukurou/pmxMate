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
