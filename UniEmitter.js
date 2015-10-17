UniUtils.Emitter = function UniEmitter() {
    this._listeners = {};
};

UniUtils.Emitter.prototype.emit = function emit(eventType) {
    if (!Array.isArray(this._listeners[eventType])) {
        return this;
    }
    var args = Array.prototype.slice.call(arguments, 1);
    this._listeners[eventType].forEach(function _emit(listener) {
        listener.apply(this, args);
    }, this);

    return this;
};

UniUtils.Emitter.prototype.on = function on(eventType, listener) {
    if (!_.isArray(this._listeners[eventType])) {
        this._listeners[eventType] = [];
    }

    if (this._listeners[eventType].indexOf(listener) === -1) {
        this._listeners[eventType].push(listener);
    }

    return this;
};

UniUtils.Emitter.prototype.once = function once(eventType, listener) {
    var self = this;

    function _once() {
        var args = Array.prototype.slice.call(arguments, 0);
        self.off(eventType, _once);
        listener.apply(self, args);
    }

    _once.listener = listener;
    return this.on(eventType, _once);
};

UniUtils.Emitter.prototype.off = function off(eventType, listener) {
    if (!_.isArray(this._listeners[eventType])) {
        return this;
    }

    if (typeof listener === 'undefined') {
        this._listeners[eventType] = [];
        return this;
    }

    var index = this._listeners[eventType].indexOf(listener);

    if (index === -1) {
        for (var i = 0; i < this._listeners[eventType].length; i += 1) {
            if (this._listeners[eventType][i].listener === listener) {
                index = i;
                break;
            }
        }
    }
    this._listeners[eventType].splice(index, 1);
    return this;
};

