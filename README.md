# Universe Utilities

## Installation

```sh
$ meteor add universe:utilities
```

UniUtils.set - Creates an empty object inside namespace if not existent.

UniUtils.get - Returns nested key value.
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
UniUtils.has - Checks if object contains a child key.
Useful for cases where you need to check if an object contain a nested key.

UniUtils.findKey - Search key in object or array
```
@param obj or array
@param search predicate function or value
@param context
```

UniUtils.getParentTemplateInstance - Gets instance parent of current template it works everywhere where Template.instance() works
```
@param {string} templateName Name of template
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

## Recommended variables
To better project organisation, this package provides following variables:

### App
- space for application helpers and other stuff,

### Colls
- space for public collections in project

##And many more - check the source##
