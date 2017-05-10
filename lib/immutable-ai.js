'use strict'

/* native modules */
const assert = require('assert')

/* npm modules */
const _ = require('lodash')

/* exports */
module.exports = ImmutableAI

/* globals */

// initialize global singleton
if (!global.__immutable_ai__) {
    var GLOBAL = global.__immutable_ai__ = {
        // ImmutableCore instance - must be injected
        immutableCore: undefined,
        // ImmutableCoreModel instance - must be injected
        immutableCoreModel: undefined,
        // valid namespaces - alias: postfix
        localNamespaces: {
            controller: 'Controller',
            model: 'Model',
            module: 'Module',
        }
    }
}
else {
    var GLOBAL = global.__immutable_ai__
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
        // make call
        return proxyFunction(call, args)
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
ImmutableAI.immutableCoreModel = setImmutableCoreModel
ImmutableAI.localNamespace = setLocalNamespace

/**
 * @function setImmutableCore
 *
 * set ImmutableCore object to use
 *
 * @param {object} val
 *
 * @returns {ImmutableAI}
 */
function setImmutableCore (val) {
    // get global immutable core object
    GLOBAL.immutableCore = val
    // return class
    return ImmutableAI
}

/**
 * @function setImmutableCoreModel
 *
 * set ImmutableCoreModel object to use
 *
 * @param {object} val
 *
 * @returns {ImmutableAI}
 */
function setImmutableCoreModel (val) {
    // get global immutable core object
    GLOBAL.immutableCoreModel = val
    // return class
    return ImmutableAI
}

/**
 * @function setLocalNamespace
 *
 * set custom local namespace
 *
 * @param {string} alias
 * @param {string} postfix
 *
 * @returns {ImmutableAI}
 *
 * @throws {Error}
 */
function setLocalNamespace (alias, postfix) {
    // require valid alias
    assert.ok(typeof alias === 'string' && alias.length > 1, 'valid namespace alias required')
    // do not allow the alias session to be used
    assert.ok(alias !== 'session', 'namespace alias session is not allowed')
    // require valid postfix
    assert.ok(typeof postfix === 'string' && postfix.length > 1, 'valid namespace postfix required')
    // set namespace
    GLOBAL.localNamespaces[alias] = postfix
    // return class
    return ImmutableAI
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
        // return session if requested
        if (property === 'session') {
            return call.session
        }
        // require valid namespace
        assert.ok(GLOBAL.localNamespaces[property] !== undefined, `ImmutableAI invalid namespace ${property}`)
        // set namespace
        call.namespace = property
    }
    // use property name to set module name
    else if (call.module === undefined) {
        call.module = property
        // if call is for model
        if (call.namespace === 'model') {
            return newLocalModel(call)
        }
    }
    // use property name to set method name
    else if (call.method === undefined) {
        call.method = property
    }
    // if all properties set this is error
    else {
        console.log(call.namespace, call.module, call.method)
        throw new Error(`ImmutableAI property accessed with namespace, module, and method set: ${property}, ${call.namespace}, ${call.module}, ${call.method}`)
    }
    // return proxy to either set next property or call method
    return call.proxy
}

/**
 * @function newLocalModel
 *
 * @param {object} call
 *
 * @returns {ImmutableCoreModelLocal}
 */
function newLocalModel (call) {
    // get clone of call and reset original
    call = resetCall(call)
    // require immutable core
    assert.ok(GLOBAL.immutableCoreModel !== undefined, 'ImmutableAI configuration error: immutableCoreModel required')
    // get model - throws error if not found
    var model = GLOBAL.immutableCoreModel.model(call.module)
    // return new local model with session
    return model.session(call.session)
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
    // get clone of call and reset original
    call = resetCall(call)
    // require immutable core
    assert.ok(GLOBAL.immutableCore !== undefined, 'ImmutableAI configuration error: immutableCore required')
    // require call properties
    assert.ok(call.namespace !== undefined, 'ImmutableAI method call without namespace')
    assert.ok(call.module !== undefined, 'ImmutableAI method call without module name')
    assert.ok(call.method !== undefined, 'ImmutableAI method call without method name')
    // create method signature
    var signature = call.module+GLOBAL.localNamespaces[call.namespace]+'.'+call.method
    // get method - throws error if not found
    var method = GLOBAL.immutableCore.method(signature)
    // create empty object for args if not defined
    if (args === undefined) {
        args = {}
    }
    // set session for args
    args.session = call.session
    // call method with args and session
    return method(args)
}

/**
 * @function resetCall
 *
 * reset call properties to undefined and return clone of original call
 *
 * @params {object} call
 *
 * @returns {object}
 */
function resetCall (call) {
    // shallow clone call so that original can be reset
    var callClone = _.clone(call)
    // reset call state
    call.namespace = undefined
    call.module = undefined
    call.method = undefined
    // return cloned call
    return callClone
}