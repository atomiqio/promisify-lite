promisify-iojs
==============

[![npm version](https://badge.fury.io/js/promisify-iojs.svg)](http://badge.fury.io/js/promisify-iojs)

Convert idiomatic async functions that expect callbacks to EcmaScript 2015 promises.

`promisify-iojs` is a very lightweight implementation that wraps callback-style async
functions with native io.js promises.

Call `promisify` with an object or function and it will over all member properites
and up prototype chains to ensure all callback-style async functions are converted
to promises. The easiest thing is to just promisify modules when loading them. 

## Example: promisify a loaded module

```js

    const fs = promisify(require('fs'));
    
    let f = require('path').join(__dirname, './file.txt');
    
    fs.readFile(f, 'utf8')
        .then(data => {
          // do something with data
        })
        .catch(err => {
          // handle error
        });

  });

```

By promisifying `fs`, you can use the above style instead of the typical
callback style shown below:

```js
    var fs = require('fs');
    
    var f = require('path').join(__dirname, './file.txt');
    
    fs.readFile(f, 'utf8', function(err, data) {
      if (err) {
        // handle error
      } else {
        do something with data
      }
    }
```

## Example: promisify a specific function

```js

    var asyncFunc = function(callback) {
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





