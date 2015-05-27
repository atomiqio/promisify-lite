"use strict"

module.exports = promisify;

const denodeify = require('denodeify');
const debug = require('debug')('promisify');
const functionHelper = require('./lib/function-helper');
const promisifiableTypes = new Set(['function', 'object']);

/**
 * Analyze and possibly promisify the thing argument.
 * If it's a function that takes a callback, it will be converted to a promise.
 * If it's an object, it will be recursively processed until all functions
 * have been analyzed and converted.
 *
 * @param {*} thing the function or object to analyze and potentially (recursively) promisify
 * @param {Set} cache for caching promisified objects
 * @return {*} promisified function or object.
 */
function promisify(thing, cache, path) {
  debug('promisifying => ', thing);

  cache = cache || new Set();
  path = path || '';

  debug(path);

  // thing has already been promisified and cached
  if (cache.has(thing)) {
    debug('returning cached promise');
    return thing;
  }

  // only promisify functions or the member functions of objects, just return anything else
  let type = typeof thing;
  if (!thing || !promisifiableTypes.has(type)) {
    debug('%s is not promisifiable', type);
    return thing;
  }

  // cache thing to avoid lookup cycles
  cache.add(thing);

  if (type == 'function') {
    thing = promisifyFunction(thing, cache, path);
  } else {
    Object.keys(thing).map(function(key) {
      return [ key, thing[key] ];
    }).filter(function (prop) {
      let key = prop[0];
      let val = prop[1];
      let type = typeof val;

      debug('analyzing member property %s', key);

      if (type == 'object') {
        debug('recursing for member object property');
        promisify(val, cache, path + '$' + key);
        return false;
      }

      return type == 'function';

    }).forEach(function (prop) {
      debug('entry: ' + prop.toString());
      let key = prop[0],
          val = prop[1];

      thing[key] = promisifyFunction(val, cache, path);
    });
  }

  return thing;
}

/**
 * Examine not just the function, but all of its members (for exammple,
 * the function might be a module).
 * 1. For each property, recursively call promisify
 * 2. If the property value is a function, call promisify on the prototype
 * 3. Finally, promisify the function itself
 *
 * @param fn
 * @param cache
 * @returns {*}
 */
function promisifyFunction(fn, cache, path) {
  debug('analyzing function ', fn);

  // recursively process and promisify the function's properties, including inherited ones
  Object.keys(fn).forEach(function(key) {
    debug('processing %s', key);
    //if (fn[key].prototype != fn && fn[key].prototype != fn.prototype) {
    //if (Object.getPrototypeOf(fn[key]) != fn) {
    if (fn[key]) {
      fn[key] = promisify(fn[key], cache, path + '%' + key);
    }
  });

  // process the function's prototype and attach to the promisified version
  if (fn.prototype) {
    debug('processing prototype');
    promisify(fn.prototype, cache, path + '#');
  }

  // promisify the function
  if (functionHelper.isAsync(fn)) {
    debug('denodeifying async function');
    let p = denodeify(fn);

    // make sure the promisified function has access to the original function's properties
    // by adding it to the prototype chain
    //Object.setPrototypeOf(p, thing);
    p.prototype = fn.prototype;

    debug(p);
    return p;
  }

  return fn;
}

