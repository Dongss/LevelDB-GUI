export function promisify(fn: any, receiver: any = null) {
  return function (...args: any[]) {
    for (let _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return new Promise(function (resolve, reject) {
      fn.apply(receiver, [].concat(args, [function (err: any, res: any) {
        return err ? reject(err) : resolve(res);
      }]));
    });
  };
}

export function randomString(len: number) {
  let src = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghzklmnopqrstuvwxyz0123456789';
  return genRandomString(len, src);
}

function genRandomString(len: number, src: string) {
  let s = '';
  for (let i = 0; i < len; i++) {
      s += src.charAt(
          Math.ceil(Math.random() * 1000) % src.length
      );
  }
  return s;
}