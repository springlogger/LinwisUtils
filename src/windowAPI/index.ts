import { ipcRenderer } from 'electron'
import { ipcCalls } from '../api'

export default {
    openDialog() {
        ipcRenderer.send('openDialog')
    },
    openSaveDialog(savedScene: JSON) {
        ipcRenderer.send('openSaveDialog', savedScene)
    },
    dialogResponse: (
        listener: (event: Electron.IpcRendererEvent, response: Buffer<ArrayBufferLike>) => void
    ) => {
        ipcRenderer.on('dialogResponse', listener)
    },
    api: { ...ipcCalls },
}
