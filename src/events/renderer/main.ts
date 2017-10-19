/**
 * scripts for main window
 */

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

$('#con-list-out').ready(() => {
    ipcRenderer.send('data.all-connections');
});

$('#con-list-ul').on('dblclick', '.con-li', (e) => {
    let conId = e.target.getAttribute('con-id');

    // if tab already exist
    let el = $(`#keys-list-tab-ul a[href="#${conId}"]`);
    if (el.length > 0) {
        $('#keys-list-tab-ul li').removeClass('active');
        el.parent('li').addClass('active');
        $('#keys-list-tab-content .tab-pane').removeClass('active');
        $(`.tab-pane#${conId}`).addClass('active');
        return;
    }
    $('.con-li').removeClass('conli-active');
    $(e.target).parent('.con-li').addClass('conli-active');
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
    ($('.nav-tabs') as any).scrollingTabs({
        tabClickHandler: function (e: any) {
            let conId = $(this).attr('href').substring(1);
            $('.con-li').removeClass('conli-active');
            $(`li.con-li[con-id="${conId}"]`).addClass('conli-active');
        }
    });
});

ipcRenderer.on('data.init-connection-reload', (event: any, arg: any) => {
    ipcRenderer.send('data.all-connections');
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