'use strict'

/* native modules */
const assert = require('assert')

/* npm modules */
const _ = require('lodash')

/* exports */
module.exports = ImmutableAI

/* globals */

// immutable-core object to use - this is injected instead of required so
// that there are not cyclical dependencies between these npm modules which
// both use each other
var immutableCore

// valid local namespaces
const localNamespaces = {
    controller: 'Controller',
    model: 'Model',
    module: 'Module',
}

/**
 * @function ImmutableAI
 *
 * return new ImmutableAI proxy function/object
 *
 * @param {object} args
 *
 * @returns {ImmutableAI}
 */
function ImmutableAI (args) {
    // object that will store the state of the call which must be constructed
    // through multiple proxied property gets
    var call = {
        session: args.session,
    }
    // the proxy object must be addressed first as a property get in order
    // to set the namespace, module, and method to be called and then
    // called as a function to call that method
    var proxyFunctionWrapper = function proxyFunctionWrapper (args) {
        // shallow clone call so that original can be reset
        var callClone = _.clone(call)
        // reset call state
        call.namespace = undefined
        call.module = undefined
        call.method = undefined
        // make call
        return proxyFunction(callClone, args)
    }
    // create proxy for the proxy function object that will intercept each
    // property access on that object
    call.proxy = new Proxy(proxyFunctionWrapper, {
        // call the proxy handler with the current call state
        // on each property access
        get: function getProxyWrapper (target, property) {
            return getProxy(call, property)
        }
    })
    // return proxied function object
    return call.proxy
}

/* public properties */
ImmutableAI.immutableCore = setImmutableCore
ImmutableAI.localNamespaces = localNamespaces

/**
 * @function setImmutableCore
 *
 * set ImmutableCore object to use
 *
 * @param {object} val
 */
function setImmutableCore (val) {
    // get global immutable core object
    immutableCore = val
}


/* private functions */

/**
 * @function getProxy
 *
 * @param {object} call
 * @param {string} property
 *
 * @returns {ImmutableAI}
 *
 * @throws {Error}
 */
function getProxy (call, property) {
    // use property name to set namespace
    if (call.namespace === undefined) {
        // require valid namespace
        assert.ok(localNamespaces[property] !== undefined, `ImmutableAI invalid namespace ${property}`)
        // set namespace
        call.namespace = property
    }
    // use property name to set module name
    else if (call.module === undefined) {
        call.module = property
    }
    // use property name to set method name
    else if (call.method === undefined) {
        call.method = property
    }
    // if all properties set this is error
    else {
        throw new Error(`ImmutableAI property accessed with namespace, module, and method set: ${property}, ${namespace}, ${module}, ${method}`)
    }
    // return proxy to either set next property or call method
    return call.proxy
}

/**
 * @function proxyFunction
 *
 * @param {object} call
 * @param {string} property
 *
 * @returns {Promise}
 *
 * @throws {Error}
 */
function proxyFunction (call, args) {
    // require immutable core
    assert.ok(immutableCore !== undefined, 'ImmutableAI configuration error: immutableCore required')
    // require call properties
    assert.ok(call.namespace !== undefined, 'ImmutableAI method call without namespace')
    assert.ok(call.module !== undefined, 'ImmutableAI method call without module name')
    assert.ok(call.method !== undefined, 'ImmutableAI method call without method name')
    // create method signature
    var signature = call.module+localNamespaces[call.namespace]+'.'+call.method
    // get method - throws error if not found
    var method = immutableCore.method(signature)
    // create empty object for args if not defined
    if (args === undefined) {
        args = {}
    }
    // set session for args
    args.session = call.session
    // call method with args and session
    return method(args)
}
