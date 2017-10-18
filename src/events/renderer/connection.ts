/**
 * scripts for connection window 
 */

import {ipcRenderer} from 'electron';
import * as $ from 'jquery';
(global as any).jQuery = $;

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
    ipcRenderer.send('click.close-con-btn');
});

ipcRenderer.on('click.open-folder-btn.reply', (event: any, arg: string) => {
    if (arg) {
        $('#con-local-dir-input').val(arg);
    }
});