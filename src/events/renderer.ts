import {ipcRenderer} from 'electron';
import * as $ from 'jquery';
(global as any).jQuery = $;
import * as url from 'url';
import * as path from 'path';
import 'jquery-bootstrap-scrolling-tabs';
const JSONEditor = require('jsoneditor');

$('#about-btn').on('click', () => {
    ipcRenderer.send('click.about-btn');
});

$('#newcon-btn').on('click', () => {
    ipcRenderer.send('click.newcon-btn');
});

$('#open-folder-btn').on('click', () => {
    ipcRenderer.send('click.open-folder-btn');
});

$('#save-con-btn').on('click', () => {
    let dirPath = $('#con-local-dir-input').val();
    let name = $('#con-name-input').val();
    ipcRenderer.send('click.save-con-btn', {
        name: (name as string).trim(),
        path: (dirPath as string).trim()
    });
});

$('#test-con-btn').on('click', () => {
    let dirPath = $('#con-local-dir-input').val();
    ipcRenderer.send('click.test-con-btn', (dirPath as string).trim());
});

$('#close-conwin-btn').on('click', () => {
    console.log($('#con-local-dir-input').val());
});

$('#con-list-out').ready(() => {
    ipcRenderer.send('data.all-connections');
});

$('#con-list-ul').on('dblclick', '.con-li', (e) => {
    let conId = e.target.getAttribute('con-id');
    $('.con-li').removeClass('active');
    $(e.target).addClass('active');
    ipcRenderer.send('data.init-connection', conId);
});

$(document).on('click', '.level-key', (e) => {
    $('.level-key').removeClass('level-key-active');
    $(e.target).parent('p').addClass('level-key-active');
    let key = e.target.getAttribute('level-key');
    let id = $(e.target).parents('.tab-pane')[0].getAttribute('id');
    ipcRenderer.send('data.get-by-key', {
        id: id,
        key: key
    });
});

ipcRenderer.on('click.open-folder-btn.reply', (event: any, arg: string) => {
    if (arg) {
        $('#con-local-dir-input').val(arg);
    }
});

ipcRenderer.on('data.all-connections.reply', (event: any, arg: string) => {
    $('#con-list-ul').html(arg);
});

ipcRenderer.on('data.init-connection.reply', (event: any, arg: any) => {
    let _id = arg._id;
    let keys = arg.keys;
    $('#keys-list-tab-ul li').removeClass('active');
    $('#keys-list-tab-content .tab-pane').removeClass('active');
    $('#keys-list-tab-ul').append(arg.tabStr);
    $('#keys-list-tab-content').append(arg.contentStr);
    ($('.nav-tabs') as any).scrollingTabs();
});

let editors: {[key: string]: any} = {};

ipcRenderer.on('data.get-by-key.reply', (event: any, arg: any) => {
    let el = $(`#${arg.id} .level-data`);
    let keyEl = $(`#${arg.id} .level-data-key`);
    let options = {
        onChange: (data: any) => {
        }
    };
    keyEl.html(`${arg.conName} -- ${arg.key}`);
    if (editors[arg.id]) {
        let editor = editors[arg.id];
        editor.set(JSON.parse(arg.data));
        return;
    }
    let editor = new JSONEditor(el[0], options, JSON.parse(arg.data));
    editors[arg.id] = editor;
});