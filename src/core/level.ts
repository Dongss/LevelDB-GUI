// import * as levelup from 'levelup';

let mydb: any;

export enum ConnectionMode {
    LOCAL,
    HTTP,
}

export class Level {
    mode: ConnectionMode;
    constructor(mode: ConnectionMode) {
        this.mode = mode;
    }
    connect() {}
    disconnect() {}
}