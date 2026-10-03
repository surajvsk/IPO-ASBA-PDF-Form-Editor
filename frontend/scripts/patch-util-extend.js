const util = require("util");

function extend(target, source) {
  if (source === null || typeof source !== "object") {
    return target;
  }
  return Object.assign(target, source);
}

util._extend = extend;
