import {ipcMain} from 'electron';
import {dialog} from 'electron';
import {ConnectionWindow} from '../windows/connection';
import * as renderer from './renderer';
import {LocalLevel} from '../core/local_level';
import * as myglobal from '../libs/myglobal';
import * as ejs from 'ejs';
import * as config from '../libs/configure';

ipcMain.on('common.error', (event: any, arg: any) => {
    dialog.showErrorBox(arg.title, arg.message);
});

export function aboutBtnClick(win: any) {
    ipcMain.on('click.about-btn', (event: any, arg: any) => {
        let _win = win;
        dialog.showMessageBox(_win, {
            type: 'info',
            title: 'About - LevelDB GUI',
            buttons: ['OK'],
            message: 'Version: v0.0.1',
            detail: 'Link: https://github.com/Dongss/dogs\nCopyrights: ...'
        });
    });
}

let conWindow: any = null;

export function newConBtnClick(win: any) {
    ipcMain.on('click.newcon-btn', (event: any, arg: any) => {
        let _win = win;
        let conWindow = myglobal.get(myglobal.KEYS.CON_WIN);
        if (!!conWindow) {
            conWindow.show();
            return;
        }
        let w = new ConnectionWindow();
        w.init(myglobal.get(myglobal.KEYS.MAIN_WIN));
        w.window.on('closed', () => {
            myglobal.set(myglobal.KEYS.CON_WIN, null);
        });
    });
}

export function openFolderClick(win: any) {
    ipcMain.on('click.open-folder-btn', (event: any, arg: any) => {
        let _win = win;
        dialog.showOpenDialog(_win, {
            message: 'choose folder',
            properties: ['openDirectory', 'createDirectory']
        }, (dirPaths: string[]) => {
            let mypath: string = dirPaths ? dirPaths[0] : null;
            event.sender.send('click.open-folder-btn.reply', mypath);
        });
    });
}

export function testConClick(win: any) {
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
}

export function saveConClick(win: any) {
    ipcMain.on('click.save-con-btn', (event: any, arg: any) => {
        if (!arg.name || !arg.path) {
            dialog.showErrorBox('Invalid input !', 'please check your input');
            return;
        }

        let db = new LocalLevel(arg.path);
        let cons = db.saveConnection(arg.name);
        _allConnections(event);
    });
}

function _allConnections(event: any) {
    let connections = config.get('connections') || [];
    ejs.renderFile('../src/templates/connection_list.ejs', {
        connections: connections
    }, (err, str) => {
        if (err) {
            console.error('get all connections error:', err);
            return;
        }
        event.sender.send('data.all-connections.reply', str);
    });
}

export function getAllConnections(win: any) {
    ipcMain.on('data.all-connections', (event: any, arg: any) => {
        _allConnections(event);
    });
}

let currentCons: {[key: string]: any} = {};

const KEYS_TAB = `
<li role="presentation" class="active">
    <a href="#<%= id %>" role="tab" data-toggle="tab"> <%= name %> &nbsp;&nbsp;
        <button type="button" class="close" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </a>
</li>
`;

export function initConnection(win: any) {
    ipcMain.on('data.init-connection', (event: any, id: string) => {
        let cons = config.get('connections');
        let conConfig = cons.find((v: any) => v._id === id);
        if (!conConfig) {
            dialog.showErrorBox('Open connection failed !', `can not find this connection ${id}`);
            return;
        }
        let existCon = currentCons[id];
        // if this leveldb is open
        if (existCon) {
            if (existCon.isOpen()) {
                return;
            } else {
                delete currentCons[id];
            }
        }

        let con = new LocalLevel(conConfig.info, conConfig);
        con.connect()
        .then(async () => {
            currentCons[id] = con;
            return con.getKeys()
            .then(v => {
                return v;
            });
        })
        .then(v => {
            let tabStr = ejs.render(KEYS_TAB, {
                id: conConfig._id,
                name: conConfig.name,
                keys: v
            });
            ejs.renderFile('../src/templates/level_content.ejs', {
                id: conConfig._id,
                name: conConfig.name,
                keys: v
            }, (err, contentStr) => {
                if (err) {
                    console.error('get all connections error:', err);
                    return;
                }
                event.sender.send('data.init-connection.reply', {
                    tabStr: tabStr,
                    contentStr: contentStr
                });
            });
        })
        .catch(e => {
            let message = e.message;
            dialog.showErrorBox('Open connection failed !', message);
        });
    });
}

export function getByKey(win: any) {
    ipcMain.on('data.get-by-key', (event: any, params: any) => {
        let con = currentCons[params.id];
        con.getByKey(params.key)
        .then((data: any) => {
            event.sender.send('data.get-by-key.reply', {
                data: data,
                key: params.key,
                id: con.id,
                conName: con.name
            });
        })
        .catch((e: any) => {
            let message = e.message;
            dialog.showErrorBox('Get data failed !', message);
        });
    });
}