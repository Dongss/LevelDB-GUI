import * as electron from 'electron';
const path = require('path');
const url = require('url');

/**
 * window base class by electron.BrowserWindow
 * 
 * @export
 * @class Window
 */
export class Window {
    name: string;
    filename: string = '';
    window: any = null;
    constructor(name: string) {
        this.name = name;
    }
    // opt: 
    // https://electron.atom.io/docs/api/browser-window/#new-browserwindowoptions
    create(filename: string, opt: any) {
        // Create the browser window.
        this.window = new electron.BrowserWindow(opt);
        // and load the index.html of the app.
        this.window.loadURL(url.format({
            pathname: path.join(__dirname, filename),
            protocol: 'file:',
            slashes: true
        }));

        this.window.on('closed', this.onClosed);
    }
    onClosed() {
        this.window = null;
    }
    close() {
        this.window.close();
    }
    send(channel: string, arg?: any) {
        this.window.webContents.send(channel, arg);
    }
}