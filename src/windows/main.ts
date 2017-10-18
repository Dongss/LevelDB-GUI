import * as electron from 'electron';
const path = require('path');
const url = require('url');
import {Window} from '../core/window';
import * as hander from '../events/handler';
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
    eventHandler() {
        hander.aboutBtnClick(this.window);
        hander.newConBtnClick(this.window);
        hander.getAllConnections(this.window);
        hander.initConnection(this.window);
        hander.getByKey(this.window);
    }
}