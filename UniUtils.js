'use strict';

/* global UniUtils: true */

UniUtils = {
    /**
     * Creates an empty object inside namespace if not existent.
     * @param object
     * @param {String} key
     * @param {*} value in key. default is object if no matches in key
     * @example var obj = {};
     * set(obj, 'foo.bar'); // {}
     * console.log(obj);  // {foo:{bar:{}}}
     * @returns {*} it'll return created object or existing object.
     */
    set: function set(object, key, value) {
        if (typeof key !== 'string') {
            console.warn('Key must be string.');
            return object;
        }

        var keys = key.split('.');
        var copy = object;

        while (key = keys.shift()) {
            if (copy[key] === undefined) {
                if (+keys[0] === +keys[0]) {
                    copy[key] = [];
                } else {
                    copy[key] = {};
                }
            }

            if (value !== undefined && keys.length === 0) {
                copy[key] = value;
            }

            copy = copy[key];
        }

        return object;
    },

    /**
     * Returns nested property value.
     * @param obj
     * @param key
     * @param defaultValue {*=undefined}
     * @example var obj = {
        foo : {
            bar : 11
        }
    };

     get(obj, 'foo.bar'); // "11"
     get(obj, 'ipsum.dolorem.sit');  // undefined
     * @returns {*} found property or undefined if property doesn't exist.
     */
    get: function get(object, key, defaultValue) {
        if (typeof object !== 'object' || object === null) {
            return defaultValue;
        }

        if (typeof key !== 'string') {
            throw new Error('Key must be string.');
        }

        var keys = key.split('.');
        var last = keys.pop();

        while (key = keys.shift()) {
            object = object[key];

            if (typeof object !== 'object' || object === null) {
                return defaultValue;
            }
        }

        return object && object[last] !== undefined ? object[last] : defaultValue;
    },

    /**
     * Checks if object contains a child property.
     * Useful for cases where you need to check if an object contain a nested property.
     * @param obj
     * @param prop
     * @returns {boolean}
     */
    has: function has(obj, prop, hasOwnProperty) {
        if (!_.isString(prop)) {
            throw new Error('Parameter prop must be type of String');
        }
        var parts = prop.split('.');

        if (_.isArray(parts)) {
            var last = parts.pop();
            while (prop = parts.shift()) {
                obj = obj[prop];
                if (typeof obj !== 'object' || obj === null) {
                    return false;
                }
            }
            if (hasOwnProperty) {
                return _.has(obj, last);
            }
            return !!(obj && obj[last]);
        } else {
            if (hasOwnProperty) {
                return _.has(obj, prop);
            }
            return !!(obj && obj[prop]);
        }
    },


    /**
     * Search key in object or array
     * @param obj or array
     * @param search predicate function or value
     * @param context
     */
    findKey         : function findKey(obj, search, context) {
        var result,
            isFunction = _.isFunction(search);

        _.any(obj, function (value, key) {
            var match = isFunction ? search.call(context, value, key, obj) : (value === search);
            if (match) {
                result = key;
                return true;
            }
        });
        return result;
    },
    getIdIfDocument : function getIdIfDocument(docId) {
        if (_.isObject(docId)) {
            return docId._id;
        }
        return docId;
    },
    /**
     * @deprecated getUniUserObject is deprecated, please use ensureUniUser instead
     */
    getUniUserObject: function getUniUserObject(user, withoutLoggedIn) {
        if (!withoutLoggedIn) {
            return UniUsers.ensureUniUser(user, Match.Any);
        }
        return UniUsers.ensureUniUser(user || null, Match.Any);
    },
    /**
     * Compares documents and returns diff
     * @param doc1 document will be compared against to document in doc2 parameter.
     * @param doc2 against to.
     * @returns {{}}
     */
    docDiff         : function docDiff(doc1, doc2) {
        var diff = {};
        for (var k1 in doc1) {
            if (!EJSON.equals(doc1[k1], doc2[k1])) {
                diff[k1] = doc2[k1];
            }
        }
        for (var k2 in doc2) {
            if (!doc1[k2]) {
                diff[k2] = doc2[k2];
            }
        }
        return diff;
    },

    /**
     * Formatting currency
     * @param number{number}
     * @param sections{string}
     * @param decimals{string}
     * @returns {string}
     */
    formatCurrency             : function formatCurrency(number, sections, decimals) {
        var numberFormatMap = {
            'a': '\'',
            'c': ',',
            'd': '.',
            's': ' '
        };

        decimals = numberFormatMap[decimals] ? numberFormatMap[decimals] : decimals;
        sections = numberFormatMap[sections] ? numberFormatMap[sections] : sections;

        return number.toFixed(2).replace('.', decimals).replace(/./g, function (digit, index, digits) {
            if (index && digit !== decimals && ((digits.length - index) % 3 === 0)) {
                return sections + digit;
            }

            return digit;
        });
    },
    /**
     * Gets array of top-level fields, which will be changed by modifier (this from update method)
     * @param updateModifier modifier from update method
     * @returns {Array} list of top-level from doc
     */
    getFieldsFromUpdateModifier: function getFieldsFromUpdateModifier(updateModifier) {
        var fields = [];
        Object.keys(updateModifier).forEach((op) => {
            if (ALLOWED_UPDATE_OPERATIONS[op] === 1) {
                Object.keys(updateModifier[op]).forEach(function (field) {
                    if (field.indexOf('.') !== -1) {
                        field = field.substring(0, field.indexOf('.'));
                    }
                    if (!_.contains(fields, field)) {
                        fields.push(field);
                    }
                });
            } else {
                fields.push(op);
            }
        });
        return fields;
    }
};
