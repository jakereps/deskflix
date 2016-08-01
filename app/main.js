const { app, BrowserWindow } = require('electron');

let win;

const createWindow = () => {
  win = new BrowserWindow({ width: 640, height: 480, frame: false });
  win.loadURL(`file://${__dirname}/index.html`);
  win.on('closed', () => {
    win = null;
  });
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});
