"use strict"

const util = require('util');
const debug = require('debug')('prototypes');

function Animal(noise) {
  this.noise = noise;
}

Animal.prototype.speak = function(callback) {
  debug('Animal.prototype.speak');
  setImmediate(function() {
    debug('Animal.prototype.speak invoking callback');
    callback(null, this.noise);
  }.bind(this));
};

function Dog() {
  Animal.call(this, 'woof');
}

util.inherits(Dog, Animal);

module.exports = Dog;


