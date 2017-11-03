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
require('jquery-contextmenu');

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
        $('.con-li').removeClass('conli-active');
        $(`li.con-li[con-id="${conId}"]`).addClass('conli-active');
        $('#keys-list-tab-ul li').removeClass('active');
        el.parent('li').addClass('active');
        $('#keys-list-tab-content .tab-pane').removeClass('active');
        $(`.tab-pane#${conId}`).addClass('active');
        return;
    }
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
    _initConCtx();
});

let currentConIds: string[] = [];

ipcRenderer.on('data.init-connection.reply', (event: any, arg: any) => {
    let _id = arg.id;
    $('#keys-list-tab-ul li').removeClass('active');
    $('#keys-list-tab-content .tab-pane').removeClass('active');
    $('#keys-list-tab-ul').append(arg.tabStr);
    $('#keys-list-tab-content').append(arg.contentStr);
    $('.con-li').removeClass('conli-active');
    $(`li.con-li[con-id="${_id}"]`).addClass('conli-active');
    $(`li.con-li[con-id="${_id}"]`).addClass('conli-opened');
    currentConIds.push(_id);
    ($('.nav-tabs') as any).scrollingTabs({
        tabClickHandler: function (e: any) {
            // if close button clicked
            if ($(e.target).is('span')) {
                // close a tab
                let el = $(e.target).parents('a');
                let id = el.attr('href').substring(1);
                _clearConnection(id);
                return;
            }
            let conId = $(this).attr('href').substring(1);
            $('.con-li').removeClass('conli-active');
            if (conId === 'tab-welcome') return;
            $(`li.con-li[con-id="${conId}"]`).addClass('conli-active');
        }
    });
});

ipcRenderer.on('data.init-connection-reload', (event: any, arg: any) => {
    ipcRenderer.send('data.all-connections');
});

ipcRenderer.on('data.close-connection.reply', (event: any, arg: any) => {
    _clearConnection(arg.id);
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

function _initConCtx() {
    ($ as any).contextMenu({
        // define which elements trigger this menu
        selector: '.con-li',
        build: function (trigger: any, e: any) {
            let conId = $(trigger)[0].getAttribute('con-id');
            let opened = currentConIds.indexOf(conId) > -1;
            return {
                items: {
                    'Open': {
                        name: 'Open',
                        disabled: opened,
                        callback: function(key: any, opt: any) {
                            // let conId = this[0].getAttribute('con-id');
                            ipcRenderer.send('data.init-connection', conId);
                        }
                    },
                    'Close': {
                        name: 'Close',
                        disabled: !opened,
                        callback: function(key: any, opt: any) {
                            // let conId = this[0].getAttribute('con-id');
                            ipcRenderer.send('data.close-con', {id: conId});
                        }
                    },
                    'sep0': '---------',
                    'Edit': {
                        name: 'Edit',
                        icon: 'edit',
                        callback: function(key: any, opt: any) {
                            alert('edit!');
                        }
                    },
                    'Delete': {
                        name: 'Delete',
                        icon: 'delete',
                        callback: function(key: any, opt: any) {
                            let conId = this[0].getAttribute('con-id');
                            alert('delete!' + conId);
                        }
                    },
                    'sep1': '---------',
                    'Properties': {
                        name: 'Properties',
                        callback: function(key: any, opt: any) {
                            alert('Properties TODO!');
                        }
                    }
                }
            };
        }
    });
}

function _clearConnection(conId: string) {
    let el = $(`#keys-list-tab-ul a[href="#${conId}"]`);

    // let conId = el.attr('href').substring(1);
    let prevEl = el.parents('li').prev('li');
    let nextEl = el.parents('li').next('li');
    let setOtherActive = !!el.parents('li').hasClass('active');

    el.parents('li').remove();
    $(`.tab-content #${conId}`).remove();

    if (conId !== 'tab-welcome') {
        // release connection
        ipcRenderer.send('data.close-con', { id: conId });
    }

    // get prev tab, set active
    if (setOtherActive) {
        $('.con-li').removeClass('conli-active');
        if (prevEl.length > 0) {
            let prevId = prevEl.children('a').attr('href').substring(1);
            prevEl.addClass('active');
                $(`li.con-li[con-id="${prevId}"]`).addClass('conli-active');
            $(`.tab-content #${prevId}`).addClass('active');
        } else if (nextEl.length > 0) {
            let nextId = nextEl.children('a').attr('href').substring(1);
            nextEl.addClass('active');
            $(`.tab-content #${nextId}`).addClass('active');
            $(`li.con-li[con-id="${nextId}"]`).addClass('conli-active');
        }
    }

    $(`li.con-li[con-id="${conId}"]`).removeClass('conli-opened');
    let index = currentConIds.indexOf(conId);
    if (index > -1) {
        currentConIds.splice(index, 1);
    }
}

function _editConnection(id: string) {}

function _deleteConnection(id: string) {}