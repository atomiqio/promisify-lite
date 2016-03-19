# promisify-lite [![NPM version][npm-image]][npm-url]

*Note: this package has been renamed from `promisify-iojs`.*

[npm package](https://www.npmjs.com/package/promisify-lite)

    npm install promisify-lite

Convert idiomatic async functions that expect callbacks to EcmaScript 2015 promises.

## Why promisify-lite?

`promisify-lite` is a very lightweight package that only does one thing: wrap standard
Node callback-style functions with promises. It can wrap individual functions and
entire modules when you `require` them. `promisify-lite` is not a promise implementation;
it requires that you use a version of Node that supports promises. It was originally
written as a helper for `iojs` when it was released with promise support, but is now
supported for Node v4 and later.

## Quick Overview

When you "promisify" a function that expects a callback, you create a wrapper around it.
For example, `fs.readFile` is a normal idiomatic async function in Node. It expects an
argument to tell it what file to read and it expects a callback argument that will be
invoked at some point in the future either when the file data is ready or there has been
an error. Using `fs.readFile` normally looks like this:

    fs.readFile('/etc/passwd', (err, data) => {
      if (err) throw err;
      console.log(data);
    });

If we want to work with promises in our code, we will need to promisify `fs.readFile` by
creating a wrapper around it. Depending on whether readFile invokes our callback with an
error or data, we will need to reject or resolve the promise accordingly.

    // create a promise that wraps fs.readFile
    var readFile = new Promise((resolve, reject) => {
      fs.readFile('/etc/passwd', (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });  
    });

Now we can use our promise version of the `readFile` function like this:

    readFile('/etc/passwd')
      .then(data => {
        console.log(data);
      })
      .catch(err => {
        console.error(err);
      });

`promisify-lite` takes care of wrapping async functions so you don't have to. It can
wrap functions and entire objects (including modules) recursively. This makes it easy
to use promises while working with Node core modules and other packages that expect
standard callbacks.

## Details

`promisify-lite` is a very lightweight implementation that wraps callback-style async
functions with native promises. It does not polyfill promise support, but instead relies
on the native support with the versions of Node.js that have it.

Promisify an object or function and it will walk over all member properites
and up prototype chains to ensure all callback-style async functions are converted
to promises. The easiest thing is to just promisify modules when loading them.

`promisify-lite` looks for idiomatic asynchronous functions -- functions that have one of
the following names as the last parameter: `callback`, `cb`, `done`, `callback_`, `cb_`
-- and promisifies them (creates a promise wrapper around the function).
It recognizes both standard functional declarations as well as ES6 fat arrow functions.

Under the hood, `promisify-lite` uses [denodeify](https://www.npmjs.com/package/denodeify)
to create the promise wrapper over individual async functions.

## Example: promisify a `require`ed module

In this example, we promisify the core module `fs`.

Normally, when using async functions, such as `fs.readFile`, you need to
supply a callback, such as in this example:

```js
    const fs = require('fs');

    let f = require('path').join(__dirname, './file.txt');

    fs.readFile(f, 'utf8', function(err, data) {
      if (err) {
        // handle error
      } else {
        do something with data
      }
    }
```

By promisifying the `fs` module, you can dispense with the callback, as
demonstrated in this example:

```js
    const promisify = require('promisify-lite');
    const fs = promisify(require('fs'));

    let f = require('path').join(__dirname, './file.txt');

    // NOTE: readFile has been promisified!
    fs.readFile(f, 'utf8')
        .then(data => {
          // do something with data
        })
        .catch(err => {
          // handle error
        });
  });

```

## Example: promisify a specific function

```js

    let asyncFunc = function(callback) {
      // call back with result asynchronously
      setImmediate(() => callback(null, true));
    }

    // or, with with io.js fat arrow support (`node --harmony_arrow_functions`)
    let asyncFunc = callback => {
      // call back with result asynchronously
      setImmediate(() => callback(null, true));
    };

    let p = promisify(asyncFunc);

    p().then(result => {
      // do something with result
    }).catch(err => {
      // handle error
    });
```

### More examples

See tests for more examples.

    npm test

## A bit more information

For trivial examples, promises might not seem to offer much of a difference over
standard callback-style async functions. However, one of the nice features of promises
is that promise handlers can be chained, avoiding the "Pyramid of Doom" of nested
callbacks in more complicated control flow situations. This makes control flow logic
easier to write and easier to follow. Compare the following example:

Idiomatic Node async callbacks

```js
    asyncFunc(function(err, data) {
      if (err) { /* handle error */ }
      anotherAsyncFunc(function(err, data) {
        if (err) { /* handle error */ }
        andAnotherAsyncFunc(function(err, data) {
          if (err) { /* handle error */ }
          // finish processing data
        });
      });
    });
```

Promise version

```
    asyncFunc(function(data) {
      // process data
      return anotherAsyncFunc();
    })
    .then(function(data) {
      // process data
      return andAnotherAsyncfunc();
    })
    .then(function(data) {
      // finish processing data
    })
    .catch(function(err) {
      // handle error
    });
```


[npm-image]: https://badge.fury.io/js/promisify-lite.svg
[npm-url]: https://npmjs.org/package/promisify-lite
