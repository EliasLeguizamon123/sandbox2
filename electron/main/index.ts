import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { release } from 'os';
import * as macaddress from 'macaddress';
import { join } from 'path';
import dgram from 'dgram';
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

async function createWindow() {
    // findApiMaster();
    // createSocket();
    win = new BrowserWindow({
        title: 'Main window',
        icon: join(ROOT_PATH.public, 'favicon.svg'),
        show: false,
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
// app.whenReady().then(createSocket);
app.disableHardwareAcceleration();
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
    return new Promise((resolve) => {
        const socket = dgram.createSocket('udp4');
        const PORT = 8080;
        const MESSAGE = 'mcash';

        socket.on('listening', () => {
            socket.setBroadcast(true);
            console.log('socket listening for udp');
        });

        socket.on('error', () => {
            console.log('error from socket');
        });

        socket.on('message', (message, rinfo) => {
            console.log(
                `received response from ${rinfo.address}:${rinfo.port}: ${message}`
            );
            if (message.toString() === 'mcash') {
                const body = {
                    ip: rinfo.address,
                    port: rinfo.port,
                    message: message.toString(),
                };

                socket.close();

                resolve(body);
            }
        });
        socket.bind();
        const reconnectMaster = async (i, socket) => {
            for (let i = 0; i <= 4; i++) {
                if (!socket) {
                    // break;
                }
                await sleep(1000);
                socket.send(MESSAGE, PORT, '255.255.255.255', (error) => {
                    if (error) {
                        console.log('error: ', error);
                    } else {
                        console.log('message send to all ', MESSAGE);
                        win.show();
                    }
                });
            }
            resolve({ message: 'error', ip: '', port: '' });
        };

        reconnectMaster(0, socket);
        // win.show();
    });
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

ipcMain.handle('getBack', async () => {
    try {
        const body = await createSocket();

        // win.show();

        return body;
    } catch (error) {
        const body = { ip: '', port: '', message: 'error' };

        // win.show();

        return body;
    }
});

ipcMain.on('closeApp', () => {
    app.quit();
});

ipcMain.on('print', () => {
    const win = BrowserWindow.getFocusedWindow();
    const options = {
        silent: false,
        printBackground: true,
        color: false,
        copies: 1,
    };

    win.webContents.print(options, (success, error) => {
        if (!success) console.log(error);

        console.log('inicio impresion');
    });
});
