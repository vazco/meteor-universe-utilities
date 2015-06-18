'use strict';

if(typeof FlowRouter === 'object'){ //Flow router support

    Template.registerHelper('routeIs', function (routeName, params, tmpl) {
        var rName = FlowRouter.getRouteName();
        if (rName !== routeName) {
            return false;
        }

        var params_match = true;
        if (tmpl !== undefined) {
            _.each(params, function (value, name) {
                if (FlowRouter.getParam(name) !== value) {
                    params_match = false;
                }
            });
        }

        return params_match;
    });
} else{ //iron router support 0.9 or 1.x

    Template.registerHelper('routeIs', function (routeName, params, tmpl) {
        var router = Router.current();
        var rName = UniUtils.get(router, 'route') || {};
        rName = rName.getName? rName.getName() : rName.name;
        if (rName !== routeName) {
            return false;
        }

        var params_match = true;
        if (tmpl !== undefined) {
            _.each(params, function (value, name) {
                if (router.params[name] !== value) {
                    params_match = false;
                }
            });
        }

        return params_match;
    });
}



Template.registerHelper('formatDateMoment', function (v, format, tmpl) {
    if(v === undefined){
        console.warn('formatDateMoment: date argument is undefined');
        return false;
    }
    if(v === null){
        v = undefined;
    }
    /* global moment: true */
    if (moment) {
        if (format && tmpl) {
            return moment(v).format(format?format:'DD/MM/YYYY HH:mm');
        }
        return moment(v).format('DD/MM/YYYY HH:mm');
    }
    return new Date(v).toDateString();
});


// --------- Compare helpers -------------

Template.registerHelper('eq', function (param1, param2) {
    return (param1 === param2);
});

Template.registerHelper('eqWeak', function (param1, param2) {
    /* jshint -W116 */
    return (param1 == param2);
});

Template.registerHelper('gt', function (param1, param2) {
    return (param1 > param2);
});

Template.registerHelper('gte', function (param1, param2) {
    return (param1 >= param2);
});

Template.registerHelper('lt', function (param1, param2) {
    return (param1 < param2);
});

Template.registerHelper('lte', function (param1, param2) {
    return (param1 <= param2);
});

Template.registerHelper('ne', function (param1, param2) {
    return (param1 !== param2);
});

// --------- Logic helpers -------------

Template.registerHelper('or', function () {
    var args = Array.prototype.slice.call(arguments);
    args.pop();
    return _(args).some(function (arg) {
        return !!arg;
    });
});

Template.registerHelper('and', function() {
    var args = Array.prototype.slice.call(arguments);
    args.pop();
    return _(args).every(function (arg) {
        return !!arg;
    });
});

/**
 * Adds ability to use console.log() from handlebars templates
 * @name Handlebars.log
 */
Template.registerHelper('log', function () {
    var tName = UniUtils.get(Template.instance(), 'view.name');
    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments);
        args.length = args.length - 1;
        args.unshift('%c' + tName, 'background: #CEE7FC; color: #000');
        console.log.apply(console, args);
    } else {
        console.log('%c' + tName, 'background: #C4CDD5; color: #000', 'Context:', this);
    }
});

Template.registerHelper('logTimeStart', function(text){
    var tName = UniUtils.get(Template.instance(), 'view.name');
    console.log('%c' + tName + ' time: '+text, 'background: #CEFCEA; color: #000');
    console.time(text);
});

Template.registerHelper('logTimeEnd', function(text){
    console.timeEnd(text);
});

/**
 * When you need to pass arguments to template and keep current context at the same tame use:
 * {{#with extendOuterContext ..}}
 *
 * @name extendOuterContext
 */
Template.registerHelper('extendOuterContext', function (outerContext) {
    return _.extend(outerContext, this);
});

/**
 * Generate unique ID with prefix
 * @name getUniqueId
 */
Template.registerHelper('getUniqueId', function(){
    var prefix = this._id || 'id';
    return _.uniqueId(prefix);
});

/**
 * Get Meteor session variable
 * @function sessionGet
 * @memberof UIHelpers
 * @param {String} sessionGet - name of variable
 */
Template.registerHelper('sessionGet', function(name) {
    return Session.get(name);
});

/**
 * Get Meteor session variable
 * @function sessionEquals
 * @memberof UIHelpers
 * @param {String} sessionEquals - name of variable
 */
Template.registerHelper('sessionEquals', function(name, value) {
    return Session.equals(name, value);
});

/**
 * Get current user  _id variable
 * @function currentUserId
 * @deprecated please use helper loggedInId
 * @memberof UIHelpers
 * @param {String} currentUserId - variable
 */
Template.registerHelper('currentUserId', function() {
    return Meteor.userId();
});

/**
 * Get current user
 * @function currentUserId
 * @memberof UIHelpers
 * @param {String} currentUserId - variable
 */
Template.registerHelper('getLoggedIn', function() {
    return UniUsers.getLoggedIn();
});

/**
 * Get current user  _id variable
 * @function currentUserId
 * @memberof UIHelpers
 * @param {String} currentUserId - variable
 */
Template.registerHelper('getLoggedInId', function() {
    return UniUsers.getLoggedInId();
});

/**
 * Access for Colls variable to get helpers from collections
 * Colls variable is the place where you can find all public collections of universe
 * @function currentUserId
 * @memberof UIHelpers
 * @param {String} currentUserId - variable
 */
Template.registerHelper('Colls', function() {
    return Colls;
});

/**
 * Concats strings
 * @function currentUserId
 * @memberof UIHelpers
 * @param {String} currentUserId - variable
 */
Template.registerHelper('concat', function() {
    var args = Array.prototype.slice.call(arguments);
    args.pop();
    return args.join('');
});

/**
 * Access to UniUtils
 * @function currentUserId
 * @memberof UIHelpers
 */
Template.registerHelper('UniUtils', function() {
    return UniUtils;
});

/**
 * Access to UniConfig
 * @function currentUserId
 * @memberof UIHelpers
 */
Template.registerHelper('UniConfig', function() {
    return UniConfig;
});

/**
 * It will extend current context with given arguments 
 * @argument key/value pairs given as key=value or "key" value into helper function
 * @return extendedContext {Object}
 * 
 * @example {{>templateName extendContext "key1" value1 "key2" value2}} or
 * @example {{>templateName extendContext key1=value1 key2=value2}}
 */ 
Template.registerHelper('extendContext', function () {
    var toBeExtended = {};
    var extension = {};
    var sliceFunc = Array.prototype.slice;
    var hashKw = sliceFunc.call(arguments, -1)[0].hash;
    var args = sliceFunc.call(arguments, 0, -1);
    var argsLength = args.length;

    if (argsLength % 2 !== 0) {
        throw new Meteor.Error('uneven-params', 'Please provide pairs of key/value for extendContext helper.');
    } else {
        for (var i = 0; i < argsLength; ++i) {
            extension[args[i]] = args[++i];
        }
    }

    if (!_.isObject(this)) {
        toBeExtended._originalContext = this;
    } else {
        toBeExtended = this;
    }

    var extendedContext = _.extend(toBeExtended, extension, hashKw);

    return extendedContext;
});
