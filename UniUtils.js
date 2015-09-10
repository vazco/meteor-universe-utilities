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
    set: function (object, key, value) {
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
    function get (object, key, defaultValue) {
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
    has: function (obj, prop, hasOwnProperty) {
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
            if(hasOwnProperty){
                return _.has(obj, last);
            }
            return !!(obj && obj[last]);
        } else {
            if(hasOwnProperty){
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
    findKey: function (obj, search, context) {
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
    getIdIfDocument: function (docId) {
        if (_.isObject(docId)) {
            return docId._id;
        }
        return docId;
    },
    /**
     * @deprecated getUniUserObject is deprecated, please use ensureUniUser instead
     */
    getUniUserObject: function(user, withoutLoggedIn){
        if(!withoutLoggedIn){
            return UniUsers.ensureUniUser(user, Match.Any);
        }
        return UniUsers.ensureUniUser(user||null, Match.Any);
    },
    /**
     * Compares documents and returns diff
     * @param doc1 document will be compared against to document in doc2 parameter.
     * @param doc2 against to.
     * @returns {{}}
     */
    docDiff: function (doc1, doc2) {
        var diff = {};
        for (var k1 in doc1) {
            if (!EJSON.equals(doc1[k1],doc2[k1])) {
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
     * Gets instance parent of current template it works everywhere where Template.instance() works
     * @param {string} templateName Name of template
     * @param {object=TemplateInstance} templateName Name of template
     */
    getParentTemplateInstance: function (templateName, currentTemplateInstance) {
        if (!/Template\..*/i.test(templateName)) {
            templateName = 'Template.' + templateName;
        }
        if (!currentTemplateInstance) {
            currentTemplateInstance = Template.instance();
        }
        if(!currentTemplateInstance){
            console.error('Missing current instance of template!');
            return;
        }
        var view = currentTemplateInstance.view;
        while (view && view.name !== templateName) {
            view = view.parentView;
        }
        return view && view.templateInstance();
    },

    /**
     * Gets instance of template by DOM element
     * useful when you need a template instance which is not your parent template
     * @param domElem DOM element
     */
    getTemplateInstanceByDOM: function (domElem) {
        if(_.isObject(domElem) && domElem instanceof jQuery){
            if(!domElem.length){
                return;
            }
            domElem = domElem[0];
        }
        if (domElem) {
            var view = Blaze.getView(domElem);
            var template = view && view.templateInstance && view.templateInstance();
            if(!template && view){
                while (view && !view.templateInstance) {
                    view = view.parentView;
                }
                template = view && view.templateInstance && view.templateInstance();
            }
            return template;
        }
    },
    /**
     * Clearing additional last object added by spacebars in template
     * @param param{*}
     * @returns {*}
     */
    clearSpacebarsKwObject: function(param){
        if(Match.test(param, Spacebars.kw)){
            return;
        }
        return param;
    },
    /**
     * Formatting currency
     * @param number{number}
     * @param sections{string}
     * @param decimals{string}
     * @returns {string}
     */
    formatCurrency: function (number, sections, decimals) {
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
    }
};

/*
 * Creates a new Interface object. Interface object defines the required methods.
 * @param methods {Array} Array of methods that should be implemented.
 */
UniUtils.Interface = function (methods) {
    if(!(this instanceof UniUtils.Interface)){
        throw new Error('You must create new instance by "new UniUtils.Interface(def)"');
    }
    if(!methods || !_.isArray(methods)){
        throw new Error('Parameter "methods" must be an array of the methods that are expected');
    }
    this.methods = [];
    var self = this;

    _.each(methods, function(method){
        if (!_.isString(method)) {
            throw new Error('Interface constructor expects that method names will be passed in as a string.');
        }
        self.methods.push(method);
    });
};

/**
 * Checks an object literal containing methods that should be implemented
 * @param object {object} tested object
 */
UniUtils.Interface.prototype.ensureImplements = function(object){
    // loop through provided object and check they implement the required methods
    _.each(this.methods, function(method){
        // if false is returned from either check then throw an error
        if (!object[method] || !_.isFunction(object[method])) {
            throw new Error ('Method "'+method+'" must be implemented in your object!');
        }
    });
};
