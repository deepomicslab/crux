# Event Handlers

There are various ways to assign event handlers inside a component.

#### Using a method

Typically, you use a method directly as the event handler. In this case, simply write the method name:

```js
class MyComponent extends Oviz.Component {
    eventHandler(el, ev) {
        // ...
    }
}
```

```bvt
Component {
    on:click = eventHandler
}
```

The event handler accepts two arguments:

The First one is the _target element_, or the element that _the listener is attached to_.
It's also the element that triggered the event handler.
Note that it's different from the component itself (`this`). 

The second one is the JavaScript event object. Depending on the renderer, it may contain extra information.

#### Using a method with dynamic arguments

Sometimes, you need to pass arguments to the event handler. In this case, write the event handler with its arguments like a function call:

```bvt
Component {
    on:click = eventHandler(1, 2)
}
```

?> Oviz will handle function binding and make the event call efficient. For example, it won't generate thousands of distinctive event listeners in a loop that runs thousands of times.

You may now face a problem: since the arguments are given, how can the event handler access the target element and the current event object?
Oviz provides a global event context `Oviz.event` that contains all these data.

```js
Oviz.event.event  // the current event object
Oviz.event.elm    // the target element
Oviz.event.vnode  // the current Virtual DOM Node (for SVG only)
```

#### Using an anonymous function

Although not recommended, you can use an anonymous function as the event handler. Functions declared with `function` keyword and arrow functions are all allowed.

```bvt
Component {
    on:click = function(el, ev) { foo() }
    on:click = () => foo()
}
```

#### Using an expression

Although not recommended, you can use a JavaScript expression as the event handler. The target element and event object are available as `$el` and `$ev` in this expression.

```bvt
Component {
    on:click = foo.bar = 1
}
```