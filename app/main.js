const { app, BrowserWindow, globalShortcut } = require('electron');
const os = require('os');
const glob = require('glob');

let win;

const createWindow = () => {
  win = new BrowserWindow({
    width: 640,
    height: 360,
    frame: false,
    webPreferences: {
      plugins: true,
    },
    alwaysOnTop: true,
  });

  globalShortcut.register('CommandOrControl+Shift+Up', () => {
    const winSize = win.getBounds();
    const calculatedWidth = Math.floor(winSize.width * (16 / 9));
    const calculatedHeight = Math.floor(winSize.height * (16 / 9));
    win.setSize(Math.min(calculatedWidth, 1024), Math.min(calculatedHeight, 576));
    win.center();
  });

  globalShortcut.register('CommandOrControl+Shift+Down', () => {
    const winSize = win.getBounds();
    const calculatedWidth = Math.floor(winSize.width * (9 / 16));
    const calculatedHeight = Math.floor(winSize.height * (9 / 16));
    win.setSize(Math.max(calculatedWidth, 256), Math.max(calculatedHeight, 144));
    win.center();
  });

  globalShortcut.register('CommandOrControl+Shift+Right', () => {
    app.quit();
  });

  win.loadURL(`file://${__dirname}/index.html`);
  win.on('closed', () => {
    win = null;
  });
  win.show();
};

const homeDir = process.env.HOME;
let wideVinePluginPath;
let splitPath;
let wideVineVersion;
let dirGlob;

const errorMessage = 'Something went wrong while trying to find your WideVineCDM ' +
  'plugin location. Please make sure you have Google Chrome installed, and an up-to-date ' +
  'version of the WideVineCDM plugin, found at Chrome://plugins. If both conditions ' +
  'are already met, open an issue on GitHub at https://github.com/jakereps/deskflix';

// switch for os.platform w/ Node 6.x available platforms being:
// 'aix', 'darwin', 'freebsd', 'linux', 'openbsd', 'sunos', 'win32'
switch (os.platform()) {
  case 'darwin': {
    dirGlob = `${homeDir}/Library/Application\ Support/Google/Chrome/**/widevinecdmadapter.plugin`;
    break;
  }
  case 'win32': {
    dirGlob = `${homeDir}/AppData/Local/Google/Chrome/**/widevinecdmadapter.dll`;
    break;
  }
  case 'linux': {
    dirGlob = '/opt/google/chrome/**/libwidevinecdmadapter.so';
    break;
  }
  default:
    throw new Error('Not a valid platform to run on!');
}

const files = glob.sync(dirGlob);
// make sure something was returned
if (files.length) {
  wideVinePluginPath = files[0];
  splitPath = wideVinePluginPath.split('/');
  // grab the version string from the returned filepath
  wideVineVersion = splitPath[splitPath.length - 4];
} else if (!files.length && os.platform() === 'darwin') {
  // unsure when, but in recent OSX Chrome versions WideVine isn't where it used to be
  dirGlob = '/Applications/Google Chrome.app/Contents/Versions/**/widevinecdmadapter.plugin';
  wideVineVersion = '1.4.8.903';
  const alternateFiles = glob.sync(dirGlob);
  wideVinePluginPath = alternateFiles[0];
} else {
  throw new Error(errorMessage);
}

app.commandLine.appendSwitch('widevine-cdm-path', wideVinePluginPath);
app.commandLine.appendSwitch('widevine-cdm-version', wideVineVersion);

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

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
