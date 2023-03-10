import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { release } from 'os';
import * as macaddress from 'macaddress';
import * as os from 'os';
import { join } from 'path';
// import bonjour from 'bonjour';
import dgram from 'dgram';
// import net from 'net';
// import ip from 'ip';
// import { net } from 'electron';
// import fetch from 'node-fetch';
// import { exec } from 'child_process';
// import path from 'path';
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
const apiFound = false;
let macAddress = '';

// Get Mac Address
macaddress.one((err, mac) => {
    mac = mac.split(':').join('');

    macAddress = mac;
});

async function createWindow() {
    // findApiMaster();
    createSocket();
    win = new BrowserWindow({
        title: 'Main window',
        icon: join(ROOT_PATH.public, 'favicon.svg'),
        webPreferences: {
            preload,
            nodeIntegration: false,
            contextIsolation: true,
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

function createSocket() {
    const socket = dgram.createSocket('udp4');
    const PORT = 8080;
    const MESSAGE = 'mcash';

    socket.on('listening', () => {
        socket.setBroadcast(true);
        console.log('socket listening for broadcast');
    });

    socket.on('message', (message, rinfo) => {
        console.log(
            `received response from ${rinfo.address}:${rinfo.port}: ${message}`
        );
        // ipcMain.on('getBack', (event, args) => {
        const body = {
            ip: rinfo.address,
            message: message.toString(),
            port: rinfo.port,
        };

        ipcMain.handle('getBack', () => {
            return body;
        });
        // ipcMain.emit('getBack', body);
        //
        //     event.sender.send('getBack', body);
        // });
    });

    socket.bind(() => {
        socket.send(MESSAGE, PORT, '255.255.255.255', (error) => {
            if (error) {
                console.log('error: ', error);
            } else {
                console.log('message send to all');
            }
        });
    });
    setTimeout(() => {
        socket.close();
        console.log('connection closes');

        ipcMain.on('timerEnd', (event) => {
            const end = true;
            const mainWindow = BrowserWindow.getFocusedWindow();

            if (mainWindow) {
                mainWindow.webContents.sendToFrame(0, 'timerEnd', end);
            }
        });
    }, 5000);
}
ipcMain.on('closeApp', () => {
    app.quit();
});
