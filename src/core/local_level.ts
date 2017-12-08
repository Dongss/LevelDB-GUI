import {ConnectionMode, Level} from './level';
import * as fs from 'fs';
const levelup = require('levelup');
const leveldown = require('leveldown');
import * as config from '../libs/configure';
import * as myutil from '../libs/util';

/**
 * local leveldb
 * 
 * @export
 * @class LocalLevel
 * @extends {Level}
 */
export class LocalLevel extends Level {
    dbPath: string;
    mydb: any;
    name: string;
    id: string;
    constructor(dbPath: string, conf?: any) {
        super(ConnectionMode.LOCAL);
        this.dbPath = dbPath;
        if (conf) {
            this.name = conf.name;
            this.id = conf._id;
        }
    }
    async connect() {
        if (!fs.existsSync(this.dbPath)) {
            throw new Error(`dir not exist: ${this.dbPath}`);
        }
        this.mydb = levelup(leveldown(this.dbPath));
    }
    async disconnect() {
        await this.mydb.close();
    }
    isOpen() {
        return this.mydb.isOpen();
    }
    getKeys (opt?: any) {
        return new Promise((resolve, reject) => {
            let keys: any[] = [];
            opt = Object.assign({}, {
                limit: 100
            }, opt);
            this.mydb.createKeyStream(opt)
            .on('data', function (data: any) {
                keys.push(data);
            })
            .on('error', function (err: any) {
                return reject(err);
            })
            .on('end', function () {
                return resolve(keys);
            });
        });
    }
    async getByKey(key: string) {
        return await this.mydb.get(key);
    }
    saveConnection(name: string) {
        let connections = config.get('connections') || [];
        let now = Math.floor(Date.now() / 1000);
        let id = myutil.randomString(15);
        this.name = name;
        this.id = id;
        connections.push({
            _id: id,
            name: name,
            info: this.dbPath,
            create_at: now,
            update_at: now
        });
        config.set('connections', connections);
    }
    updateConnection(dir: string) {
        let connections = config.get('connections') || [];
        let me = connections.find((v: any) => v._id === this.id);
        me.name = this.name;
        me.info = dir;
        me.update_at = Math.floor(Date.now() / 1000);
        config.set('connections', connections);
    }
    static deleteConnection(id: string) {
        let connections = config.get('connections') || [];
        let toDelete = connections.findIndex((v: any) => v._id === id);
        if (toDelete < 0) {
            return;
        }
        connections.splice(toDelete, 1);
        config.set('connections', connections);
    }
}