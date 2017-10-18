import {ConnectionMode, Level} from './level';
// multilevel no types support yet
const multilevel = require('multilevel');
import * as net from 'net';

export class HttpLevel extends Level {
    constructor(host: string, port: number) {
        super(ConnectionMode.LOCAL);
    }
}
