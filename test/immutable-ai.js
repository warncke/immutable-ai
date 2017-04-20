'use strict'

const ImmutableAI = require('../lib/immutable-ai')
const assert = require('chai').assert

describe('immutable-ai', function () {

    // fake session to use for testing
    var session = {
        sessionId: '11111111111111111111111111111111',
    }

    beforeEach(function () {
        // reset immutable core
        ImmutableAI.immutableCore({})
    })

    it('should create ImmutableAI instance', function () {
        // create ImmutableAI instance
        var ai = ImmutableAI({session: session})
    })

    it('should throw error on invalid args', function () {
        assert.throws(function () {
            // call without args - should throw
            var ai = ImmutableAI()
        })
    })

    it('should call method with session', function () {
        // set mock immutableCore
        ImmutableAI.immutableCore({
            method: function (signature) {
                assert.strictEqual(signature, 'fooModule.bar')
                return function () {
                    return 'foo'
                }
            }
        })
        // create ImmutableAI instance
        var ai = ImmutableAI({session: session})
        // call bar method in fooModule
        var ret = ai.module.foo.bar()
        // check return value
        assert.strictEqual(ret, 'foo')
    })

    it('should perform multiple calls', function () {
        // set mock immutableCore
        ImmutableAI.immutableCore({
            method: function (signature) {
                assert.strictEqual(signature, 'fooModule.bar')
                return function () {
                    return 'foo'
                }
            }
        })
        // create ImmutableAI instance
        var ai = ImmutableAI({session: session})
        // call bar method in fooModule
        var ret = ai.module.foo.bar()
        // check return value
        assert.strictEqual(ret, 'foo')
        // set mock immutableCore
        ImmutableAI.immutableCore({
            method: function (signature) {
                assert.strictEqual(signature, 'barModule.bam')
                return function () {
                    return 'baz'
                }
            }
        })
        // create ImmutableAI instance
        var ai = ImmutableAI({session: session})
        // call bar method in fooModule
        var ret = ai.module.bar.bam()
        // check return value
        assert.strictEqual(ret, 'baz')
    })

    it('should allow custom local namespaces', function () {
        // set mock immutableCore
        ImmutableAI.immutableCore({
            method: function (signature) {
                assert.strictEqual(signature, 'fooMyNamespace.bar')
                return function () {
                    return 'foo'
                }
            }
        })
        // set custom namesapce
        ImmutableAI.localNamespace('myNamespace', 'MyNamespace')
        // create ImmutableAI instance
        var ai = ImmutableAI({session: session})
        // call bar method in fooMyNamespace
        var ret = ai.myNamespace.foo.bar()
        // check return value
        assert.strictEqual(ret, 'foo')
    })

    it('should throw error on missing namespace', function () {
        // create ImmutableAI instance
        var ai = ImmutableAI({session: session})
        // call ai - should throw error
        assert.throws(function () {
            ai()
        }, 'ImmutableAI method call without namespace')
    })

    it('should throw error on invalid namespace', function () {
        // create ImmutableAI instance
        var ai = ImmutableAI({session: session})
        // call ai - should throw error
        assert.throws(function () {
            ai.foo()
        }, 'ImmutableAI invalid namespace foo')
    })

    it('should throw error on missing module', function () {
        // create ImmutableAI instance
        var ai = ImmutableAI({session: session})
        // call ai - should throw error
        assert.throws(function () {
            ai.module()
        }, 'ImmutableAI method call without module name')
    })

    it('should throw error on missing method', function () {
        // create ImmutableAI instance
        var ai = ImmutableAI({session: session})
        // call ai - should throw error
        assert.throws(function () {
            ai.module.foo()
        }, 'ImmutableAI method call without method name')
    })

    it('should throw error on missing immutable core', function () {
        // clear immutable core
        ImmutableAI.immutableCore(undefined)
        // create ImmutableAI instance
        var ai = ImmutableAI({session: session})
        // call ai - should throw error
        assert.throws(function () {
            ai.module.foo.bar()
        }, 'ImmutableAI configuration error: immutableCore required')
    })

    it('should bubble immutable core method resolution error', function () {
        // clear immutable core
        ImmutableAI.immutableCore({
            method: function () {
                throw new Error('FOOBAR')
            }
        })
        // create ImmutableAI instance
        var ai = ImmutableAI({session: session})
        // call ai - should throw error
        assert.throws(function () {
            ai.module.foo.bar()
        }, 'FOOBAR')
    })
})