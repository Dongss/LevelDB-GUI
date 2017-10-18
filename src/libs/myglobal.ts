let vars: {[key: string]: any} = {};

export enum KEYS {
    MAIN_WIN,
    CON_WIN,
}

export function get(key: KEYS) {
    return vars[key];
}

export function set(key: KEYS, value: string) {
    vars[key] = value;
}