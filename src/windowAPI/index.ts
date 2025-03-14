import { ipcRenderer } from "electron";

export default {
    openDialog() {
        ipcRenderer.send('openDialog');
    },
    dialogResponse: (listener: (event: Electron.IpcRendererEvent, response: Buffer<ArrayBufferLike>) => void) => {
        ipcRenderer.on('dialogResponse', listener);
    }
}