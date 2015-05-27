"use strict"

module.exports = (x, callback) => {
  // invoke the callback asynchronously; if x is false, callback with error
  setImmediate(() => x ? callback(null, true) : callback(new Error()));
};

