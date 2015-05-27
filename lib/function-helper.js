"use strict"

const debug = require('debug')('function-helper');

const idiomaticCallbackParams = new Set([ 'callback', 'cb', 'done', 'callback_', 'cb_' ]);

const funcRegex = /function\s.*?\(([^)]*)\)/;
const arrowFuncRegex = /^\(*\s*([^)]*)\s*\)*\s*=>/;
const commentRegex = /\/\*.*\*\//;

/**
 * Inspect the last parameter of the function and see if it matches any of the idiomatic
 * names generally used for asynchronous Node functions, such as callback or cb
 * @param fn
 */
function isAsync(fn) {
  return idiomaticCallbackParams.has(parameters(fn).slice(-1)[0]);
}

/**
 * Extract parameters from function declaration.
 * @param {*} fn A function or string (result of calling fn.toString())
 */
function parameters(fn) {
  if (typeof fn == 'function') { fn = fn.toString(); }
  if (typeof fn != 'string') throw new Error('argument fn must be a function or string, not ' + typeof fn);

  // ensure fn matches a function declaration in standard or arrow syntax
  let match = fn.match(funcRegex);
  let args;

  if (match) {
    args = match[1];
  } else {
    match = fn.match(arrowFuncRegex);
    if (match) {
      args = match[1];

      // because the function body can also contain fat arrow
      // expressions, need to extract only up to the first fat arrow, and
      // can't figure out how to make the regex non-greedy for the fat arrow
      let index = args.indexOf('=>');
      if (index >= 0) {
        args = args.substring(0, index);
      }

    } else {
      throw new Error('argument fn does not appear to be a valid function');
    }
  }

  if (!args) return [];

  // TODO: splits on commas, but if any inline comments have a comma, this will break
  return args.split(',').map(function(arg) {
    // remove any inline comments and extraneous whitespace
    return arg.replace(commentRegex, '').trim();
  });
}

module.exports = {
  isAsync: isAsync,
  parameters: parameters
};
