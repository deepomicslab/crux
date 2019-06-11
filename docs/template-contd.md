# Template Continued

## Initializers and Modifiers

Several syntactic sugar are available in the template system to reduce some trivial and teious work.

**Initializer** is an optional argument that can be supplied immediately after a component name.
For example, `Text`'s initializer accepts a string, which is the text content, i.e. the value for the `text` prop.

When a component block is empty, it can **be omitted** as long as a `;` is added after the component name.

<div class="demo" data-height="50">
Text("Hello!");
</div>

This is excatly the same as the following template but a little bit shorter.

```
Text {
    text = "Hello!"
}
```

**Modifiers** can be added after a component name to serve as a shortcut to a set of predifined props.
For example, `.full` is the combination of `width = 100%` and `height = 100%`:

<div class="demo" data-height="150">
Component {
    width = 100; height = 100
    Rect.full;
}
</div>

This is excatly the same as writing:

```
Component {
    width = 100; height = 100
    Rect {
        width = 100%; height = 100%
    }
}
```

## Stage

**Stage** is another set of props for a component, which is somehow similar to a css class.
It is extremely useful when the component needs to change among different states. For example, highlight the component
when the mouse hovered.

To define a stage, use the `stage:` syntax:

```
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

When the component enters a stage, props defined in the stage will override default ones.

Setting and unsetting stages involve JavaScript. Suppose we have a reference to a component called `component`:

- `component.stage` returns the current stage name, as a string;
- `component.setStage("active")` sets the stage ("active" in this example). Use `null` to unset the stage.

We will see demos in the next section.

## Events

**Event handlers** enable interactions on components.

To add event listeners, use `on:`:

<div class="demo" data-height="150">
// Click the rect!
Rect {
    width = 100; height = 100;
    fill = "red"
    on:click = alert("Clicked")
}
</div>

The event names are standard JavsScript event names, and you can find a complete list [here](https://developer.mozilla.org/en-US/docs/Web/Events#Standard_events). Some commonly used ones include `mouseenter`, `mouseleave`, `wheel` and `click`.

The value, i.e. the listener for the event could be:

- A JavaScript expression, such as `alert("Clicked")`. Two special variables are available in this expression, `$ev`, which represents the current JavaScript `Event` object, and `$el`, which is the element that the listener is **attached to**.
- A function definition, such as `function (event) { }`. This function can also accept two arguments, the first one is `$ev` which we have already explained above and the second one is `$el`.
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
    on:mouseenter = $el.setStage("active")
    on:mouseleave = $el.setStage(null)
}
</div>

The rect enters stage "active" on mouse enter, and return to normal stage when the mouse leaved.

## Style

Sometimes you might want direct access to the rendered svg element, especially when you want some
svg/css features that the framework is not yet capable to provide.
Props starting with `style:` will be added to the `style` attribute directly in the svg element on the page.

For example, to set the cursor to `"pointer"`:

<div class="demo" data-height="150">
// Hover me!
Rect {
    width = 100; height = 100;
    fill = "blue"
    style:cursor = "pointer"
}
</div>

!> Note that this only works for the svg renderer.

## Helpers

Helpers are special "methods" that will be transformed during compilation. In general they look like `@helper-name(arg, arg2)`.

Some props require the value to be helpers, such as:

- Geometry props, including `x`, `y`, `width`, `height` etc., can have a `@geo` helper as its value.
  For example `@geo(100, -5)` is equvalient to `100%-5`, and you can also use variables in this helper, such as `@geo(width, x * 2)`.
- `clip`: requires the value to be a `@clip` helper.

<div class="demo" data-height="220">
Component {
    @let widths = [25, 50, 75, 100]
    Rows {
    width = 100%
        @for (width, index) in widths {
            Component {
                key = index
                width = @geo(width, 0)
                height = 25
                Rect.full;
            }
        }
    }
}
</div>

See the [reference for helpers](ref/helpers.md) for a complete list of all helpers.
