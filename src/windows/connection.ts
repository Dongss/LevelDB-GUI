import * as electron from 'electron';
const path = require('path');
const url = require('url');
import {Window} from '../core/window';
import * as myglobal from '../libs/myglobal';

export class ConnectionWindow extends Window {
    filename: string = '../connection_window.html';
    constructor() {
        super('connection');
    }
    init(parent: any) {
        let options = {
            width: 800,
            height: 300,
            // alwaysOnTop: true,
            backgroundColor: '#fafafa',
            title: 'New connection',
            parent: parent
        };
        this.create(this.filename, options);
        myglobal.set(myglobal.KEYS.CON_WIN, this.window);
        this.eventHandler();
        // devtool
        this.window.webContents.openDevTools();
    }
    onClosed() {
        this.window = null;
        myglobal.set(myglobal.KEYS.CON_WIN, null);
    }
    eventHandler() {
       require('../events/handler/connection');
    }
 }