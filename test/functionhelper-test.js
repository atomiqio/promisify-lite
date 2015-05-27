"use strict";

const _ = require('lodash');
const assert = require('assert');
const functionHelper = require('../lib/function-helper');

describe('standard function tests', function () {

  it('should parse function with 0 args', function () {

    let f = function () {
    };

    let args = functionHelper.parameters(f);

    assert(_.isEqual(args, []));

  });

  it('should parse function with 1 arg', function () {

    let f = function (a) {
    };

    let args = functionHelper.parameters(f);

    assert(_.isEqual(args, ['a']));

  });

  it('should parse function with multiple args', function () {

    let f = function (a, b, c) {
    };

    let args = functionHelper.parameters(f);

    assert(_.isEqual(args, ['a', 'b', 'c']));

  });

  it('should parse function with multiple args and inline comments', function () {

    let f = function (a, /* optional */ b, /* optional */ c) {
    };

    let args = functionHelper.parameters(f);

    assert(_.isEqual(args, ['a', 'b', 'c']));

  });
});

describe('fat arrow function tests', function () {

  it('should parse function with 0 args', function () {

    let f = () => {
    };

    let args = functionHelper.parameters(f);

    assert(_.isEqual(args, []));

  });

  it('should parse function with 1 arg', function () {

    let f = a => a * a;

    let args = functionHelper.parameters(f);

    assert(_.isEqual(args, ['a']));

  });

  it('should parse function with multiple args', function () {

    let f = (a, b, c) => {
    };

    let args = functionHelper.parameters(f);

    assert(_.isEqual(args, ['a', 'b', 'c']));

  });

  it('should parse function with multiple args and inline comments', function () {

    let f = (a, /* optional */ b, /* optional */ c) => {
    };

    let args = functionHelper.parameters(f);

    assert(_.isEqual(args, ['a', 'b', 'c']));

  });
});

describe('async function recognition tests', function () {

  let tests = [
    // [ function, expected, description, callback arg name ]
    [function () {
    }, false, 'should reject functions with no parameters'],
    [() => {
    }, false, 'should reject arrow functions with no parameters'],
    [function (a, b, c) {
    }, false, 'should reject functions that do not look like async functions'],
    [(a, b, c) => {
    }, false, 'should reject arrow functions that do not look like async functions'],
    [function (a, b, c, callback, d) {
    }, false, 'should reject functions with callback parameter not in last position'],
    [(a, b, c, callback, d) => {
    }, false, 'should reject arrow functions with callback parameter not in last position'],
    [function (callback) {
    }, true, 'should accept functions with single callback parameter', 'callback'],
    [callback => {
    }, true, 'should accept arrow functions with single callback parameter', 'callback'],
    [(callback) => {
    }, true, 'should accept arrow functions with single callback parameter in parentheses', 'callback'],
    [function (a, b, c, callback) {
    }, true, 'should accept functions with a callback parameter', 'callback'],
    [(a, b, c, callback) => {
    }, true, 'should accept arrow functions with a callback parameter', 'callback'],
    [function (a, b, c, callback_) {
    }, true, 'should accept functions with a callback_ parameter', 'callback_'],
    [(a, b, c, callback_) => {
    }, true, 'should accept arrow functions with a callback_ parameter', 'callback_'],
    [function (a, b, c, cb) {
    }, true, 'should accept functions with a cb parameter', 'cb'],
    [(a, b, c, cb) => {
    }, true, 'should accept arrow functions with a cb parameter', 'cb'],
    [function (a, b, c, cb_) {
    }, true, 'should accept functions with a cb_ parameter', 'cb_'],
    [(a, b, c, cb_) => {
    }, true, 'should accept arrowfunctions with a cb_ parameter', 'cb_'],
    [function (a, b, c, done) {
    }, true, 'should accept functions with a done parameter', 'done'],
    [(a, b, c, done) => {
    }, true, 'should accept arrow functions with a done parameter', 'done']
  ];

  tests.forEach(function (test) {
    let fn = test[0];
    let expected = test[1];
    let description = test[2];
    let callbackArg = test[3];

    it(description, function () {
      assert.equal(functionHelper.isAsync(fn), expected);
      callbackArg && assert.equal(functionHelper.parameters(fn).slice(-1), callbackArg);
    });

  });

});

