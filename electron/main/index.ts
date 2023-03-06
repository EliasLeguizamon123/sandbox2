import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { release } from 'os';
import * as macaddress from 'macaddress';
import * as os from 'os';
import { join } from 'path';
import { net } from 'electron';

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
    app.quit();
    process.exit(0);
}

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

export const ROOT_PATH = {
    // /dist
    dist: join(__dirname, '../..'),
    // /dist or /public
    public: join(__dirname, app.isPackaged ? '../..' : '../../../public'),
};

let win: BrowserWindow | null = null;
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js');
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(ROOT_PATH.dist, 'index.html');
const hostName: string = os.hostname(); //* Get Host Name

let macAddress = '';

// Get Mac Address
macaddress.one((err, mac) => {
    mac = mac.split(':').join('');

    macAddress = mac;
});

async function createWindow() {
    win = new BrowserWindow({
        title: 'Main window',
        icon: join(ROOT_PATH.public, 'favicon.svg'),
        webPreferences: {
            preload,
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    if (app.isPackaged) {
        win.loadFile(indexHtml);
    } else {
        win.loadURL(url);
        // win.webContents.openDevTools()
    }

    // Test actively push message to the Electron-Renderer
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send(
            'main-process-message',
            new Date().toLocaleString()
        );
    });

    // Make all links open with the browser, not with the application
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('https:')) shell.openExternal(url);

        return { action: 'deny' };
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    win = null;
    if (process.platform !== 'darwin') app.quit();
});

app.on('second-instance', () => {
    if (win) {
        // Focus on the main window if the user tried to open another
        if (win.isMinimized()) win.restore();
        win.focus();
    }
});

app.on('activate', () => {
    const allWindows = BrowserWindow.getAllWindows();

    if (allWindows.length) {
        allWindows[0].focus();
    } else {
        createWindow();
    }
});

// new window example arg: new windows url
ipcMain.handle('open-win', (event, arg) => {
    const childWindow = new BrowserWindow({
        webPreferences: {
            preload,
        },
    });

    if (app.isPackaged) {
        childWindow.loadFile(indexHtml, { hash: arg });
    } else {
        childWindow.loadURL(`${url}/#${arg}`);
        // childWindow.webContents.openDevTools({ mode: "undocked", activate: true })
    }
});

async function req() {
    const request = net.request({
        url: 'http://192.168.1.161:8000/slave-login',
        method: 'POST',
    });

    request.on('response', (response) => {
        const data = [];

        response.on('data', (chunk) => {
            data.push(chunk);
        });
    });

    const body = JSON.stringify({
        username: 'mcash',
        password: 'mcash',
        device_id: macAddress,
        name: 'REDEMPTION', //can be CASHIER || REDEMPTION for the moment
    });

    request.setHeader('Content-Type', 'application/json');
    request.write(body, 'utf-8');
    request.end();
}

ipcMain.on('closeApp', () => {
    app.quit();
});
