import * as nconf from 'nconf';
const UserHome = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];

const config = nconf.file({
    file: `${UserHome}/.leveldb_gui.json`
});

export function set(key: string, value: any) {
    config.set(key, value);
    config.save(null);
}

export function get(key: string) {
    nconf.load();
    return nconf.get(key);
}