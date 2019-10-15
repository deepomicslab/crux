# Interactions

## Stages

A common notion involved in interactions is the transition between different states.
For example, a marker needs to be highlighted when the mouse hovered it; we can then describe such interaction as a transition between two states: _normal_ and _hovered_.

A component needs to change its appearance when in different states; and in Oviz, we use **stage** to represent such a state.
Each stage is an _alternative set of props_, which is similar to a CSS class to some extent.

Stages have their names as strings, but by default, a component has no stage and its stage is `null`.
New stages can then be defined using stage blocks in the following format:

```bvt
Rect {
    width = 200; height = 200;
    fill = "red"
    stage:active {
        fill = "blue"
    }
    stage:muted {
        fill = "gray"
    }
}
```

This `Rect` has two stages, `active` and `muted`.

When a component enters another stage, props defined in the stage block will overwrite the normal ones.
So when the `Rect` is in the `active` stage, its fill color would be `blue`.

Setting and unsetting stages involve JavaScript. Suppose we have a reference to a component called `component`:

- `component.stage` returns the current stage name, as a string;
- `component.stage = "active"` or `component.setStage("active")` sets the stage ("active" in this example). Use `null` to unset the stage.

We will see some demos in the next section.

## Events

Most interactions are triggered by events. We use event listeners to attach custom action when an event is fired on a component. To add event listeners, use `on:`:

<div class="demo" data-height="150">
// Click the rect!
Rect {
    width = 100; height = 100;
    fill = "red"
    on:click = window.alert("Clicked")
}
</div>

The event names are standard JavsScript event names, and you can find a complete list [here](https://developer.mozilla.org/en-US/docs/Web/Events#Standard_events). Some commonly used ones include `mouseenter`, `mouseleave`, `wheel` and `click`.

The value, i.e., the listener for the event could be:

- A JavaScript expression, such as `window.alert("Clicked")`. Two special variables are available in this expression, `$ev`, which represents the current JavaScript `Event` object, and `$el`, which is the element that the listener is **attached to**.
- A function definition, such as `((e) => {})`. This function can also accept two arguments, the first one is the `$ev` that we have already explained above, and the second one is `$el`.
- A function name. If the template is in a custom component, it can invoke the component's member function directly. We will cover this later.

?> `$el` can be different from the event target, which is the element that triggered the event.

Now we combine stages and event listeners:

<div class="demo" data-height="170">
// Hover me!
Rect {
    width = 100; height = 100;
    fill = "gray"
    stage:active {
        fill = "red"
    }
    on:mouseenter = $el.stage = "active"
    on:mouseleave = $el.stage = null
}
</div>

The `Rect` enters stage "active" on mouse enter, and return to the normal stage when the mouse left.

## Behaviors

**Behaviors** are blocks with props. But instead of inserting children, it adds new behaviors to the component by listening to events.
Behavior blocks starts with `behavior:`.

```bvt
Component {
    behavior:name {
        // options
    }
}
```

It is designed to generalize common strategies so that when you need to apply the same behavior to other components, you don't need to add multiple event listeners to them.
Oviz provides some commonly used behaviors, and you can define new ones if needed.

For example, to make a component change its stage when mouse hovered, you need to add both `mouseenter` and `mouseleave` event listeners to it.
A behavior `stage` can be used instead:

```bvt
Rect {
    behavior:stage {
        mouseEnter = "active"
    }
}
```

**Tooltip** is another behavior that adds tooltip to a component:

<div class="demo" data-height="170">
Rect {
    width = 100
    height = 100
    behavior:tooltip {
        content = "Tooltip content"
    }
}
</div>

You can also customize the appearance of the tooltip in the tooltip block:

<div class="demo" data-height="170">
Rect {
    width = 100
    height = 100
    behavior:tooltip {
        content = "Tooltip content"
        fontSize = 14
        xOffset = 5
    }
}
</div>