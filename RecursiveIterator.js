// PRIVATE PROPERTIES
const BYPASS_MODE = '__bypassMode';
const IGNORE_CIRCULAR = '__ignoreCircular';
const MAX_DEEP = '__maxDeep';
const CACHE = '__cache';
const QUEUE = '__queue';
const STATE = '__state';
const {floor} = Math;
const {keys} = Object;

const EMPTY_STATE = {};


UniUtils.RecursiveIterator = class RecursiveIterator {
    /**
     * @param {Object|Array} root
     * @param {Number} [bypassMode='vertical']
     * @param {Boolean} [ignoreCircular=false]
     * @param {Number} [maxDeep=100]
     */
    constructor(root, bypassMode = 'vertical', ignoreCircular = false, maxDeep = 100) {
        this[BYPASS_MODE] = (bypassMode === 'horizontal' || bypassMode === 1);
        this[IGNORE_CIRCULAR] = ignoreCircular;
        this[MAX_DEEP] = maxDeep;
        this[CACHE] = [];
        this[QUEUE] = [];
        this[STATE] = this.getState(undefined, root);
        this.__makeIterable();
    }
    /**
     * @returns {Object}
     */
    next() {
        var {node, path, deep} = this[STATE] || EMPTY_STATE;

        if (this[MAX_DEEP] > deep) {
            if (this.isNode(node)) {
                if (this.isCircular(node)) {
                    if (this[IGNORE_CIRCULAR]) {
                        // skip
                    } else {
                        throw new Error('Circular reference');
                    }
                } else {
                    if (this.onStepInto(this[STATE])) {
                        let descriptors = this.getStatesOfChildNodes(node, path, deep);
                        let method = this[BYPASS_MODE] ? 'push' : 'unshift';
                        this[QUEUE][method](...descriptors);
                        this[CACHE].push(node);
                    }
                }
            }
        }

        var value = this[QUEUE].shift();
        var done = !value;

        this[STATE] = value;

        if (done) this.destroy();

        return {value, done};
    }
    /**
     *
     */
    destroy() {
        this[QUEUE].length = 0;
        this[CACHE].length = 0;
        this[STATE] = null;
    }
    /**
     * @param {*} any
     * @returns {Boolean}
     */
    isNode(any) {
        return isTrueObject(any);
    }
    /**
     * @param {*} any
     * @returns {Boolean}
     */
    isLeaf(any) {
        return !this.isNode(any);
    }
    /**
     * @param {*} any
     * @returns {Boolean}
     */
    isCircular(any) {
        return this[CACHE].indexOf(any) !== -1
    }
    /**
     * Returns states of child nodes
     * @param {Object} node
     * @param {Array} path
     * @param {Number} deep
     * @returns {Array<Object>}
     */
    getStatesOfChildNodes(node, path, deep) {
        return getKeys(node).map(key =>
            this.getState(node, node[key], key, path.concat(key), deep + 1)
        );
    }
    /**
     * Returns state of node. Calls for each node
     * @param {Object} [parent]
     * @param {*} [node]
     * @param {String} [key]
     * @param {Array} [path]
     * @param {Number} [deep]
     * @returns {Object}
     */
    getState(parent, node, key, path = [], deep = 0) {
        return {parent, node, key, path, deep};
    }
    /**
     * Callback
     * @param {Object} state
     * @returns {Boolean}
     */
    onStepInto(state) {
        return true;
    }
    /**
     * Only for es6
     * @private
     */
    __makeIterable() {
        try {
            this[Symbol.iterator] = () => this;
        } catch(e) {}
    }
};

const GLOBAL_OBJECT = Meteor.isServer ? global : window;

/**
 * @param {*} any
 * @returns {Boolean}
 */
function isGlobal (any) {
    return any === GLOBAL_OBJECT;
}

function isTrueObject (any) {
    return any !== null && typeof any === 'object';
}


/**
 * @param {*} any
 * @returns {Boolean}
 */
function isArrayLike (any) {
    if (!isTrueObject(any)) return false;
    if (isGlobal(any)) return false;
    if(!('length' in any)) return false;
    var length = any.length;
    if(length === 0) return true;
    return (length - 1) in any;
}


/**
 * @param {Object|Array} object
 * @returns {Array<String>}
 */
function getKeys (object) {
    var keys_ = keys(object);
    if (Array.isArray(object)) {
        // skip sort
    } else if(isArrayLike(object)) {
        // only integer values
        keys_ = keys_.filter((key) => floor(Number(key)) == key);
        // skip sort
    } else {
        // sort
        keys_ = keys_.sort();
    }
    return keys_;
}