/**
 * event handers for main window
 */

import {ipcMain} from 'electron';
import {dialog} from 'electron';
import {ConnectionWindow} from '../../windows/connection';
import {LocalLevel} from '../../core/local_level';
import * as myglobal from '../../libs/myglobal';
import * as ejs from 'ejs';
import * as config from '../../libs/configure';

ipcMain.on('common.message-box', (event: any, arg: any) => {
    dialog.showMessageBox(arg);
});

ipcMain.on('click.about-btn', (event: any, arg: any) => {
    dialog.showMessageBox({
        type: 'info',
        title: 'About - LevelDB GUI',
        buttons: ['OK'],
        message: 'Version: v0.0.1',
        detail: 'Link: https://github.com/Dongss/dogs\nCopyrights: ...'
    });
});

ipcMain.on('click.newcon-btn', (event: any, arg: any) => {
    let conWindow = myglobal.get(myglobal.KEYS.CON_WIN);
    if (!!conWindow) {
        conWindow.show();
        return;
    }
    let w = new ConnectionWindow();
    w.init(myglobal.get(myglobal.KEYS.MAIN_WIN));
    if (!!arg) {
        let id = arg.id;
        let cons = config.get('connections');
        let conConfig = cons.find((v: any) => v._id === id);
        if (!conConfig) {
            dialog.showErrorBox('Get connection failed !', `can not find this connection ${id}`);
            return;
        }
        w.window.webContents.on('did-finish-load', () => {
            w.send('data.connection-fill', {
                id: id,
                conf: {
                    name: conConfig.name,
                    dirPath: conConfig.info
                }
            });
        });
    }
});

ipcMain.on('data.all-connections', (event: any, arg: any) => {
    _allConnections(event);
});

let currentCons: {[key: string]: any} = {};

const KEYS_TAB = `
<li role="presentation" class="active">
    <a href="#<%= id %>" role="tab" data-toggle="tab"> <%= name %> &nbsp;&nbsp;
    <button type="button" class="close" aria-label="Close">
        <span aria-hidden="true">&times;</span>
    </button>
    </a>
    12
</li>
`;

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
                id: conConfig._id,
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

ipcMain.on('data.close-con', (event: any, params: any) => {
    _releaseConnection(event, params.id);
});

ipcMain.on('click.delete-connection', (event: any, params: any) => {
    dialog.showMessageBox({
        type: 'question',
        title: 'Delete connection',
        buttons: ['Cancel', 'Yes'],
        message: 'Are you sure you want to delete this connection?',
        detail: 'Are you sure you want to delete this connection?'
    }, (r) => {
        if (r === 1) {
            LocalLevel.deleteConnection(params.id);
            _allConnections(event);
        }
        return;
    });
});

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

function _releaseConnection(event: any, id: string) {
    let con = currentCons[id];
    if (!con) return;
    con.disconnect();
    currentCons[id] = null;
    event.sender.send('data.close-connection.reply', {id: id});
}