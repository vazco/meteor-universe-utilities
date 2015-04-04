'use strict';

/* global UniUtils: true */

UniUtils = {
    /**
     * Creates an empty object inside namespace if not existent.
     * @param object
     * @param {String} path
     * @param {*} value in path. default is object if no matches in path
     * @example var obj = {};
     * set(obj, 'foo.bar'); // {}
     * console.log(obj);  // {foo:{bar:{}}}
     * @returns {*} it'll return created object or existing object.
     */
    set: function (object, path, value) {
        if (!_.isString(path)) {
            console.log('Path must be type of String', 'error');
            return object;
        }
        var obj = object;
        _.each(path.split('.'), function (key, index, list) {
            if (!obj[key]) {
                obj[key] = {};
            }
            if (!_.isUndefined(value) && list.length === (index + 1)) {
                obj[key] = value;
            }
            obj = obj[key];
        });
        return object;
    },

    /**
     * Returns nested property value.
     * @param obj
     * @param prop
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
    get: function (obj, prop, defaultValue) {
        try {
            if (!_.isString(prop)) {
                throw new Error('Parameter prop must be type of String');
            }
            var parts = prop.split('.');
            var last;

            if (_.isArray(parts)) {
                last = parts.pop();
            } else {
                if (obj[prop]) {
                    return obj[prop];
                } else {
                    return defaultValue;
                }
            }

            while (prop = parts.shift()) {
                obj = obj[prop];
                if (typeof obj !== 'object' || obj === null) {
                    return defaultValue;
                }
            }

            return (obj && obj[last] ? obj[last] : defaultValue);
        } catch(e){
            return defaultValue;
        }
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
            return UniUsers.ensureUniUser(user || null, Match.Any);
        }
        return UniUsers.ensureUniUser(user, Match.Any);
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
     * @param domElem DOM element (not jQuery obj)
     */
    getTemplateInstanceByDOM: function (domElem) {
        if (domElem) {
            var view = Blaze.getView(domElem);
            return view && view.templateInstance();
        }
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