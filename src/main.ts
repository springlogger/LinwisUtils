import { app, BrowserWindow, dialog, ipcMain, net } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import fs from "fs";
import { api } from "./constants"

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  mainWindow.removeMenu();
  mainWindow.maximize();

  const request = net.request(api.backend_url)

  request.on("error", (err) => {
    console.log(err);
  })

  request.on("response", (response) => {
    console.log(`STATUS: ${response.statusCode}`)
    console.log(`HEADERS: ${JSON.stringify(response.headers)}`)
    response.on('data', (chunk) => {
      console.log(`BODY: ${chunk}`)
    })
    response.on('end', () => {
      console.log('No more data in response.')
    })
  })
  request.end();

  ipcMain.on('openDialog', async () => {
    const pathToObject = await dialog.showOpenDialog({properties: ['openFile']});

    if (!pathToObject.filePaths[0]) return;

    fs.readFile(pathToObject.filePaths[0], (err, data) => {
      if (err) {
        console.error(err);
        return;
      }

      mainWindow.webContents.send("dialogResponse", data);
    })
  });

  ipcMain.on('openSaveDialog', async (_, savedScene: JSON) => {
    const { filePath } = await dialog.showSaveDialog({
      properties: ['createDirectory'], 
      filters: [{ name: 'json', extensions: ['json'] }]
    });
  
    if (!filePath) return;
  
    try {
      await fs.promises.writeFile(filePath, JSON.stringify(savedScene, null, 2));
    } catch (err) {
      console.error('Ошибка при сохранении файла:', err);
    }
  });

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
