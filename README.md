# Universe Utilities

## Installation

```sh
$ meteor add vazco:universe-utilities
```

UniUtils.set - Creates an empty object inside namespace if not existent.

UniUtils.get - Returns nested property value.
```
@param obj
@param prop
@example var obj = {
        foo : {
            bar : 11
        }
    };

 get(obj, 'foo.bar'); // "11"
 get(obj, 'ipsum.dolorem.sit');  // undefined
@returns {*} found property or undefined if property doesn't exist.
```
UniUtils.has - Checks if object contains a child property.
Useful for cases where you need to check if an object contain a nested property.

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

## Pseudo Interface
Validates if object contains needed methods

```
//Create new instance, pass a list of needed methods
var test = new Interface(['getName', 'getAge']);
var properties = { getName: function(){ return 'Cristo'}, getAge: function(){ return 26; } };
function Person(config) {
	// Pass in the methods we are expecting,
	// followed by Interface instance that we're checking against
	test.ensureImplements(config);
	//If all is ok, you can add them to "this"
	_.extend(this, config);
}
```

- `new UniUtils.Interface(array)` Creates a new Interface object, which defines the required methods.
- `.ensureImplements(objectToCheck)` Checks an object literal containing methods that should be implemented.

## Recommended variables
To better project organisation, this package provides following variables:

### App
- space for application helpers and other stuff,

### Colls
- space for public collections in project

##And many more - check the source##
