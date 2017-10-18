import * as electron from 'electron';
const path = require('path');
const url = require('url');
import {Window} from '../core/window';
import * as myglobal from '../libs/myglobal';
import * as config from '../libs/configure';

export class MainWindow extends Window {
    filename: string = '../main_window.html';
    constructor() {
        super('main');
    }
    init() {
        let options = {
            width: 1200,
            height: 800,
            backgroundColor: '#fafafa',
        };
        this.create(this.filename, options);
        myglobal.set(myglobal.KEYS.MAIN_WIN, this.window);
        this.eventHandler();
    }
    onClosed() {
        this.window = null;
        myglobal.set(myglobal.KEYS.MAIN_WIN, null);
    }
    eventHandler() {
       require('../events/handler/main');
    }
}