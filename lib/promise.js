const notPromisifyKeys = [
  "downloadFile",
  "request",
  "uploadFile",
  "connectSocket",
  "createCamera",
];
const syncReg = /Sync$/;

function hasCallback(args) {
  if (!args || typeof args !== "object") {
    return false;
  }

  const callback = ["success", "fail", "complete"];

  return callback.some((fnName) => {
    if (typeof args[fnName] === "function") {
      return true;
    }
    return false;
  });
}

function promisifyAll(globalObj, mini) {
  try {
    Object.keys(globalObj)
      .filter((key) => {
        if (notPromisifyKeys.indexOf(key) >= 0 || syncReg.test(key)) {
          return false;
        }
        return true;
      })
      .forEach((key) => {
        forEach(globalObj, mini, key);
      });
  } catch (e) {
    console.error(e);
  }
}

function forEach(globalObj, mini, key) {
  const property = globalObj[key];
  if (typeof property === "function") {
    const fn = property.bind(globalObj);
    mini[key] = (...args) => {
      if (hasCallback(args[0])) {
        return fn(...args);
      }
      return promisify(fn)(...args);
    };
    return;
  }

  if (typeof property === Object) {
    mini[key] = Object.create(Object.getPrototypeOf(property));
    promisifyAll(property, mini[key]);
    return;
  }
  mini[key] = property;
}

function promisify(func) {
  if (typeof func !== "function") return fn;
  return function _promisify(...args) {
    return new Promise((resolve, reject) => {
      func(
        Object.assign(...args, {
          success: resolve,
          fail: reject,
        }),
      );
    });
  };
}

export { promisifyAll };
