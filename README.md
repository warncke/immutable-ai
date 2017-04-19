# immutable-ai

Immutable AI provides a convenient object oriented interface for
[immutable-core](https://www.npmjs.com/package/immutable-core).

Immutable AI can be used directly, as demonstrated here, but it is integrated
with [immutable-app](https://www.npmjs.com/package/immutable-app) and
[immutable-core](https://www.npmjs.com/package/immutable-core) by default.

## Creating a new Immutable AI instance

    const ImmutableAI = require('immutable-ai')
    const immutable = require('immutable-core')

    ImmutableAI.immutableCore(immutable)

    immutable.module('barModule', {
        bar: function (args) {
            ...
        }
    })

    immutable.module('fooModule', {})

    immutable.method('fooModule.foo', function (args) {
        // create new instance from args
        var ai = ImmutableAI(args)
        // call barModule.bar using Immutable AI
        ai.module.bar.bar()
    })

Immutable Core methods are functional and stateless which means that all of the
data they operate on must be passed in the arguments.

Typically all Immutable Core method calls must include a `session` object which
includes the state needed to provide access control.

Immutable AI provides an object oriented facade for Immutable Core that removes
the tedious, error prone, and potentially risky necessity of manually passing
session objects between Immutable method calls.

## Using Immutable AI by default

    immutable.method('fooModule.foo', function (args) {
        this.module.bar.bar()
    })

With Immutable AI integration enabled in Immutable Core every Immutable method
call will be invoked using `Function.prototype.call` with an Immutable AI
instance as the `this` arg.

The Immutable AI instance will always be identical to calling
`ImmutableAI(args)` from within the method body.

## Immutable AI namespaces

    // create a new ImmutableAI instance
    var ai = ImmutableAI({
        session: { ... }
    })

    // call foo method on fooModule
    ai.module.foo.foo(...)

    // perform a select on fooModel
    ai.model.foo.select.by.id(...)

    // call the list method for fooController
    ai.controller.foo.list(...)

Immutable AI provides three local name spaces for method calls: controller,
model, module.

Each namespace simply adds a postfix to the name that follows it and uses this
to lookup the correct Immutable Core module.

Immutable Core Model and Immutable Core Controller append the words 'Model' and
'Controller' to their respective names in order to form their Immutable Core
module name.

To be used with Immutable AI all other modules must be named like `fooModule`
and addressed via the `module` namespace.

## Invalid calling patterns

    // create a new ImmutableAI instance
    var ai = ImmutableAI({
        session: { ... }
    })

    // THIS IS BAD!
    var module = ai.module.foo

    // this works
    module.foo(...)

    // THIS FAILS!
    module.bar(...)

The ImmutableAI proxy stores the state of each property access to set the
namespace, module, and method to call, then when the method is called the
state of the proxy is reset.

To make it simple: ALWAYS use ImmutableAI by making the entire call in a single
statement like:

    ai.module.foo.foo(...)