"use strict"

const assert = require('assert');
const debug = require('debug')('promisify:test');
const promisify = require('..');

describe('promisify function tests', function () {

  it('should promisify simple function', function (done) {
    let asyncFunc = callback => {
      setImmediate(() => callback(null, true));
    };

    let p = promisify(asyncFunc);

    debug(p);

    p().then(result => {
      assert.equal(result, true);
      done();
    }).catch(err => {
      done(err);
    });

  });

  it('should catch promisified function error', function (done) {
    let asyncFunc = callback => {
      setImmediate(() => callback(new Error()));
    };

    let p = promisify(asyncFunc);

    p().then(result => {
      done(new Error('should not have succeeded'));
    }).catch(err => {
      done();
    });

  });

});

describe('module tests', function () {

  it('should promisify simple module', function (done) {

    let simple = promisify(require('./samples/simple'));

    simple(true).then(result => {
      assert(result);
      done();
    }).catch(err => {
      done(err);
    });

  });

  it('simple should fail', function (done) {

    let simple = promisify(require('./samples/simple'));

    simple(false).then(result => {
      done(new Error('should not have succeeded'));
    }).catch(err => {
      done();
    });

  });

  it('should promisify simple-exports module and chain results', function (done) {

    let simple = promisify(require('./samples/simple-exports'));

    simple.foo(true).then(() => {
      return simple.foo(false);
    }).then(() => {
      done(new Error('should not have succeeded'));
    }).catch(err => {
      // expected
      done();
    });
  });

});

describe('prototypes', function () {

  it('should say woof with normal callback', function (done) {

    const Dog = require('./samples/prototypes');
    let dog = new Dog();

    dog.speak((err, result) => {
      if (err) return done(err);
      assert.equal(result, 'woof');
      done();
    });

  });

  it('should say woof', function (done) {

    const Dog = promisify(require('./samples/prototypes'));
    let dog = new Dog();

    dog.speak().then(function (result) {
      assert.equal(result, 'woof');
      done();
    }).catch(function (err) {
      done(err);
    });

  });

});
