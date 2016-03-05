# Universe Utilities

## Installation

```sh
$ meteor add universe:utilities
```
## Functions

### UniUtils.set(object, pathInObject, value) 
 Creates an empty object inside namespace if not existent.

```
UniUtils.set({}, 'a.b.c', 'here');
//output: Object {a:{b:{c:"here"}}}
```

### UniUtils.get(object, pathInObject, defaultValue) 
 Returns nested key value.

```
@param obj
@param key
@example var obj = {
        foo : {
            bar : 11
        }
    };

 get(obj, 'foo.bar'); // "11"
 get(obj, 'ipsum.dolorem.sit');  // undefined
@returns {*} found key or undefined if key doesn't exist.
```
### UniUtils.has 
 Checks if object contains a child key.
Useful for cases where you need to check if an object contain a nested key.

### Recursive Iterator
Iterates javascript object recursively.
Works in ES6 environments [iteration protocols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols).
Compatible with [for...of](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Statements/for...of) cycle.
```js
var iterator = new UniUtils.RecursiveIterator(
    root /*{Object|Array}*/,
    // Method bypass of tree: `vertical` or `horizontal`
    [bypassMode="vertical"] /*{String}*/, 
    [ignoreCircular=false] /*{Boolean}*/,
    [maxDeep=100] /*{Number}*/
);

var {value, done} = iterator.next();
var {parent, node, key, path, deep} = value;

// parent is parent node
// node is current node
// key is key of node
// path is path to node
// deep is current deep
```

- `iterator.isNode(node);`
Returns `true` if any is node (as a default node is `{Object}`).

- `iterator.isLeaf(node);`
Returns `true` if node is leaf. Leaf is all primitive types.

- `iterator.isCircular(node);`
Returns `true` if object is circular reference.

- `iterator.onStepInto(state); // state = iterator.next();`
It calls for each node. If returns `false` node will be skipped.
You can override this function, if you need to have custom behavior




### Example (es6)
```js
var root = {
    object: {
        number: 1
    },
    string: 'foo'
};

for(let {node, path} of new UniUtils.RecursiveIterator(root)) {
    console.log(path.join('.'), node);
}

// object    Object {number: 1}
// object.number    1
// string    foo
```

### UniUtils.findKey 
 Search key in object or array
```
@param obj or array
@param search predicate function or value
@param context
```
### UniUtils.deepExtend

Recursive object extending.

```javascript
var obj1 = {
    a: 1,
    b: 2,
    d: {
        a: 1,
        b: [],
        c: { test1: 123, test2: 321 }
    },
    f: 5,
    g: 123,
    i: 321,
    j: [1, 2]
};
var obj2 = {
    b: 3,
    c: 5,
    d: {
        b: { first: 'one', second: 'two' },
        c: { test2: 222 }
    },
    e: { one: 1, two: 2 },
    f: [],
    g: (void 0),
    h: /abc/g,
    i: null,
    j: [3, 4]
};

UniUtils.deepExtend(obj1, obj2);

console.log(obj1);
/*
{ a: 1,
  b: 3,
  d:
   { a: 1,
     b: { first: 'one', second: 'two' },
     c: { test1: 123, test2: 222 } },
  f: null,
  g: undefined,
  c: 5,
  e: { one: 1, two: 2 },
  h: /abc/g,
  i: null,
  j: [3, 4] }
*/
```

### UniUtils.deepEqual

Node's assert.deepEqual() algorithm as a standalone module.
*This module is around 5 times faster than wrapping assert.deepEqual() in a try/catch.*

```js

console.dir([
    UniUtils.deepEqual(
        { a : [ 2, 3 ], b : [ 4 ] },
        { a : [ 2, 3 ], b : [ 4 ] }
    ),
    UniUtils.deepEqual(
        { x : 5, y : [6] },
        { x : 5, y : 6 }
    )
]);
```

**UniUtils.deepEqual(a, b, opts)**
Compare objects a and b, returning whether they are equal according to a recursive equality algorithm.

If opts.strict is true, use strict equality (===) to compare leaf nodes. The default is to use coercive equality (==) because that's how assert.deepEqual() works by default.

### UniUtils.getFieldsFromUpdateModifier(modifier) 
 Gets array of top-level fields, which will be changed by modifier (this from update method)

```
UniUtils.getFieldsFromUpdateModifier({$set: {a:1, b:2, c:4}, $inc: {d:1}});
// output: ["a", "b", "c", "d"]
```

### UniUtils.getPreviewOfDocumentAfterUpdate(updateModifier, oldDoc = {})
 Gets simulation of new version of document passed as a second argument

```
UniUtils.getPreviewOfDocumentAfterUpdate({$set: {a:1, b:2, c:4}, $inc: {d:1}}, {a:2});
// output: Object {a: 1, b: 2, c: 4, d: 1}
```

## UniConfig
- provides a simple configuration mechanism.

UniConfig provides on client side reactive method ready() (it's available on server too but always returns true)
and hook `onReady()`, which calls passed callback only when config is ready.


```
UniConfig.onReady(function(){
    if(this.public.get('myKey')){
        //do something
    }
});
```

All types have methods get, set, getRow.
But arguments for individual types can be different.

**UniConfig.private** - this type of config is available ONLY on server side.

```
 .get (name, defaultValue)
 .set (name, value)
 .getRow (name)
 .runOnce(name, function)
```
UniConfig.private.runOnce - call function only once and save date about this in private config,
but if function threw error or returned false. function will be not check as executed.

**UniConfig.users** - this one is dedicated for users, it's available on both sides but on client it contains only stuff for logged in user.

```
.get (name, defaultValue, userId)
.set (name, value, userId)
.getRow (name, userId)

* userId is needed only on server side
```

**UniConfig.public** - this type is available on both sides, every can change setting, unless it was added with true value passed as the third parameter of set method.

```
 .get (name, defaultValue)
 .set (name, value, isServerWriteOnly)
 .getRow (name)

```

- Writing Access in public scope
Package will grant the writing access in client side for:
    - every single user if this package is used without `universe:collection` package.
    - but if `universe:collection` is added to the project **only admins can set records**
    
You can validate access right for client calls by registering own validator:  
```#js
    UniConfig.public.onAccessValidation(function(userId, settingObject, proposedResult){
    var user = Meteor.users.findOne(userId);
        return user && user.hasAccessForThis;
    })
```

## And many more - check the source#

## Licence
This package is distributed under MIT

Some parts of this package was based under:
- [substack/node-deep-equal](https://github.com/substack/node-deep-equal)
- [unclechu/node-deep-extend](https://github.com/unclechu/node-deep-extend)
- [nervgh/recursive-iterator] (https://github.com/nervgh/recursive-iterator)