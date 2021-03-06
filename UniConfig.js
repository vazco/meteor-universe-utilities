'use strict';
/* global UniConfig: true */
var _configCollection = new Mongo.Collection('universe_configs');
UniConfig = {
    public:{
        set: function(name, value, isServerWriteOnly){
            var row = {name: name, value:value, access: 'public', lastModified: new Date()};
            if(isServerWriteOnly){
                row.isServerWriteOnly = isServerWriteOnly;
            }

            if(Meteor.isClient){
                return _set(row);
            }

            return !!_configCollection.upsert(
                {name: name, access: 'public'},
                row
            );
        },
        get: function(name, defaultValue){
            var obj = _configCollection.findOne({name: name, access: 'public'});
            if(_.isUndefined(obj)) {
                return defaultValue;
            }
            return obj.value;
        },
        getRow: function(name){
           return _configCollection.findOne({name: name, access: 'public'});
        },
        find: function(selector, options) {
            options = options || {};
            selector = _.extend({access: 'public'}, selector||{});
            return _configCollection.find(selector, options);
        }
    },
    users: {
        set: function(name, value, userId){
            if(!userId){
                userId = Meteor.userId();
            }
            userId = UniUtils.getIdIfDocument(userId);
            if(!userId){
                throw Meteor.Error(404, 'Missing userId');
            }
            var row =  {name: name, value:value, access: userId, lastModified: new Date()};
            if(Meteor.isClient) {
                return _set(row);
            }

            if(_.isUndefined(value)){
                return !!_configCollection.remove({name: name, access: userId});
            }

            return !!_configCollection.upsert(
                {name: name, access: userId},
                row
            );
        },
        get: function(name, defaultValue, userId){
            if(!userId){
                userId = Meteor.userId();
            }
            userId = UniUtils.getIdIfDocument(userId);
            if(!userId){
                throw Meteor.Error(404, 'Missing userId');
            }
            var obj = _configCollection.findOne({name: name, access: userId});
            if(_.isUndefined(obj)) {
                return defaultValue;
            }
            return obj.value;
        },
        getRow: function(name, userId){
            return _configCollection.findOne({name: name, access: userId});
        },
        find: function(selector, options) {
            options = options || {};
            selector = _.extend({access: 'public'}, selector||{});
            return _configCollection.find(selector, options);
        }
    },
    onReady: function(cb){
        if(!_.isFunction(cb)){
            throw new Meteor.Error(500, 'Function was expected but gets: '+ typeof cb);
        }
        if(Meteor.isServer){
            cb.call(this);
        } else{
            var self = this;
            Tracker.autorun(function(c){
                if(UniConfig.ready()){
                    cb.call(self);
                    c.stop();
                }
            });
        }
    }
};

var _set = function(row){
    UniConfig.onReady(function(){
        var doc = _configCollection.findOne({name: row.name, access: row.access});
        if(doc){
            if(_.isUndefined(row.value)){
                return !!_configCollection.remove({name: row.name, access: row.access});
            }
            _configCollection.update(
                {_id: doc._id},
                {$set: row}
            );
        } else {
            _configCollection.insert(row);
        }
    });
    return true;
};

if(Meteor.isServer){
    UniConfig.ready = () => true;
    UniConfig.private = {
        set (name, value) {
            if (_.isUndefined(value)) {
                return !!_configCollection.remove({name: name, access: 'private'});
            }
            return !!_configCollection.upsert(
                {name: name, access: 'private'},
                {name: name, value: value, access: 'private', lastModified: new Date()}
            );
        },
        get (name, defaultValue) {
            var obj = _configCollection.findOne({name: name, access: 'private'});
            if (_.isUndefined(obj)) {
                return defaultValue;
            }
            return obj.value;
        },
        getRow (name) {
            return _configCollection.findOne({name: name, access: 'private'});
        },
        find (selector, options) {
            options = options || {};
            selector = _.extend({access: 'public'}, selector||{});
            return _configCollection.find(selector, options);
        },
        runOnce (name, callback, isAsync) {
            if (!UniConfig.private.get('runOne_' + name)) {
                var result, asyncWay = err => {
                    if (err) {
                        UniConfig.private.set('runOne_' + name);
                    } else {
                        UniConfig.private.set('runOne_' + name, new Date());
                    }
                    isAsync = true;
                    console.log('Running once:', name, 'status: '+(err?'FAILED':'OK'), '(from async callback)');
                };
                try {
                    result = callback(asyncWay);
                    if (result && typeof result.then === 'function') {
                        isAsync = true;
                        result.then(
                            () => {
                                UniConfig.private.set('runOne_' + name, new Date());
                                console.log('Running once:', name, 'status: OK', '(from promise)');
                            },
                            () => {
                                isAsync = true;
                                UniConfig.private.set('runOne_' + name);
                                console.log('Running once:', name, 'status: FAILED', '(from promise)');
                            }
                        );
                    }
                } catch (e) {
                    console.error(e);
                    result = false;
                }
                if (isAsync) {
                    return;
                }
                if (result !== false) {
                    UniConfig.private.set('runOne_' + name, new Date());
                }
                console.log('Running once:', name, 'status: '+((result !== false)?'OK':'FAILED'));
            }
        }
    };
    // short access
    UniConfig.runOnce = UniConfig.private.runOnce;

    Meteor.publish('UniConfig', function () {
        var query = {access: 'public'};
        if(_.isString(this.userId) && this.userId !== 'private'){
            query = {$or:[query, {access: this.userId}]};
        }
        return _configCollection.find(query);
    });

    _configCollection._ensureIndex({name:1, access:1}, {unique: 1});
    UniConfig.public._accessValidators = [];
    UniConfig.public.onAccessValidation = function onAccessValidation (accessValidator) {
        if (accessValidator !== 'function') {
            throw new Error('Access Validator must be a function');
        }
        UniConfig.public._accessValidators.push(accessValidator);
    };

    var _checkRights = function(userId, doc){
        if(doc.isServerWriteOnly){
            return false;
        }
        switch(doc.access){
            case 'public':
                //For non universe environment we grant access for all
                var result = true;
                if (typeof UniUsers !== 'undefined'){
                    result = UniUsers.isAdminLoggedIn();
                }

                if (UniConfig.public._accessValidators.length){
                    result = UniConfig.public._accessValidators.every(function(fn){
                        var res = fn(userId, doc, result);
                        return res || res === undefined;
                    });
                }

            return result;
            case 'private':
                return false;
        }
        return doc.access === userId;
    };

    _configCollection.allow({
        insert: _checkRights,
        update: _checkRights,
        remove: _checkRights
    });

} else{
    var _handleSub = Meteor.subscribe('UniConfig');
    UniConfig.ready = _handleSub.ready;
}
