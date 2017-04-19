'use strict'

const ImmutableAI = require('../lib/immutable-ai')
const assert = require('chai').assert

describe('immutable-ai', function () {

    // fake session to use for testing
    var session = {
        sessionId: '11111111111111111111111111111111',
    }

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
})