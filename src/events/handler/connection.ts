/**
 * event handers for connection window
 */

import {ipcMain} from 'electron';
import {dialog} from 'electron';
import {ConnectionWindow} from '../../windows/connection';
import {LocalLevel} from '../../core/local_level';
import * as myglobal from '../../libs/myglobal';
import * as ejs from 'ejs';
import * as config from '../../libs/configure';

ipcMain.on('click.open-folder-btn', (event: any, arg: any) => {
    dialog.showOpenDialog({
        message: 'choose folder',
        properties: ['openDirectory', 'createDirectory']
    }, (dirPaths: string[]) => {
        let mypath: string = dirPaths ? dirPaths[0] : null;
        event.sender.send('click.open-folder-btn.reply', mypath);
    });
});

ipcMain.on('click.test-con-btn', (event: any, arg: any) => {
    let db = new LocalLevel(arg);
    db.connect()
    .then(async () => {
        dialog.showMessageBox({
            type: 'info',
            title: 'Test connection',
            message: 'Connect success !',
            detail: arg,
            buttons: ['OK']
        });
        await db.disconnect();
    })
    .catch((e: any) => {
        let message = e.message;
        dialog.showErrorBox('Connect failed !', message);
    });
});

ipcMain.on('click.save-con-btn', (event: any, arg: any) => {
    if (!arg.name || !arg.path) {
        dialog.showErrorBox('Invalid input !', 'please check your input');
        return;
    }

    let db = new LocalLevel(arg.path);
    let cons = db.saveConnection(arg.name);
    let mainWin = myglobal.get(myglobal.KEYS.MAIN_WIN);
    mainWin.webContents.send('data.init-connection-reload');
    closeWin();
});

ipcMain.on('click.close-con-btn', (event: any, arg: any) => {
    closeWin();
});

function closeWin() {
    let conWin = myglobal.get(myglobal.KEYS.CON_WIN);
    conWin.close();
}