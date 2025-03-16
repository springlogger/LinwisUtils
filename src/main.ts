import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import fs from "fs";
import { MyAPI } from './api';
import { registerIpcHandlers } from './api/helper';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createSplashWindow = () => {
  const splashScreen = new BrowserWindow({
    width: 300, 
    height: 500, 
    frame: false,
    transparent: false,
    resizable: false,
    show: false,
  });


  splashScreen.loadFile('splash.html');
  splashScreen.once('ready-to-show', () => splashScreen.show());

  return splashScreen;
}

const createWindow = () => {

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false
  });

  mainWindow.removeMenu();
  mainWindow.maximize();


  // load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
  
  MyAPI.init(mainWindow);
  registerIpcHandlers();

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

app.on('ready', () => {
  const splashScreen = createSplashWindow();

  setTimeout(() => {
    splashScreen.close();
    createWindow();
  }, 3000);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
