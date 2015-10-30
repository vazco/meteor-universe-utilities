'use strict';
/* global UniConfig: true */
var _configCollection = new Meteor.Collection('universe_configs');
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
    UniConfig.ready = function(){
        return true;
    };
    UniConfig.private = {
        set: function (name, value) {
            if (_.isUndefined(value)) {
                return !!_configCollection.remove({name: name, access: 'private'});
            }
            return !!_configCollection.upsert(
                {name: name, access: 'private'},
                {name: name, value: value, access: 'private', lastModified: new Date()}
            );
        },
        get: function (name, defaultValue) {
            var obj = _configCollection.findOne({name: name, access: 'private'});
            if (_.isUndefined(obj)) {
                return defaultValue;
            }
            return obj.value;
        },
        getRow: function (name) {
            return _configCollection.findOne({name: name, access: 'private'});
        },
        runOnce: function (name, callback) {
            if (!UniConfig.private.get('runOne_' + name)) {
                var result;
                try {
                    result = callback();
                } catch (e) {
                    console.error(e);
                    result = false;
                }
                if (result !== false) {
                    UniConfig.private.set('runOne_' + name, new Date());
                }
                console.log('Running once:', name, 'status: '+((result !== false)?'ok':'failed'));
            }
        }
    };

    Meteor.publish('UniConfig', function () {
        var query = {access: 'public'};
        if(_.isString(this.userId) && this.userId !== 'private'){
            query = {$or:[query, {access: this.userId}]};
        }
        return _configCollection.find(query);
    });

    _configCollection._ensureIndex({name:1, access:1}, {unique: 1});

    var _checkRights = function(userId, doc){
        if(doc.isServerWriteOnly){
            return false;
        }
        switch(doc.access){
            case 'public':
                return true;
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
