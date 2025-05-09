import { ipcRenderer } from 'electron'
import { ipcCalls } from '../api'
import { openDialogFileType, openDialogTextureType } from '../types'

export default {
    openDialog(fileType: openDialogFileType, textureType?: openDialogTextureType) {
        ipcRenderer.send('openDialog', fileType, textureType)
    },
    openSaveDialog(savedScene: JSON) {
        ipcRenderer.send('openSaveDialog', savedScene)
    },
    dialogResponseObject: (
        listener: (event: Electron.IpcRendererEvent, response: Buffer<ArrayBufferLike>) => void
    ) => {
        ipcRenderer.on('dialogResponseObject', listener)
    },
    dialogResponseMaterial: (
        listener: (
            event: Electron.IpcRendererEvent,
            response: Buffer<ArrayBufferLike>,
            textureType: openDialogTextureType
        ) => void
    ) => {
        ipcRenderer.on('dialogResponseMaterial', listener)
    },
    api: { ...ipcCalls },
}
