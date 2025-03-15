import { BrowserWindow, ipcMain, ipcRenderer, net } from "electron";
import { api_constants } from "../constants";

let browserWindow: BrowserWindow;

function init(window: BrowserWindow) {
    browserWindow = window;

    ipcMain.on("fetchUser", (_, body) => {
      fetchUser(body);
    })
}

 function fetchUser(body: {email: string, password: string}) {
  if (!browserWindow) return;

  const request = net.request(api_constants.backend_url)

  request.on("error", (err) => {
    console.log(err);
  })

  request.on("response", (response) => {
    response.on('data', (chunk) => {
      browserWindow.webContents.send("sendUserToClient", chunk.toString());
    })
  })
  request.end();
}

// There are the methods our Vue app uses
const ipcCalls = {
  sendUserData(body: {email: string, password: string}) {
      ipcRenderer.send('fetchUser', body);
  },
  fetchUserFromWindow(listener: (event: Electron.IpcRendererEvent, response: string) => void) {
      ipcRenderer.on('sendUserToClient', listener);
  }
}

export const api = {
    init,
    fetchUser,
    ipcCalls
}