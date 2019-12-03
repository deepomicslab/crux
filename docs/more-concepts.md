# More Concepts

Oviz has several syntactic sugars in the template system to reduce trivial and tedious work.

## Initializers

A **initializer** is an optional "argument" that can be provided immediately after a component name.
For example, the initializer of `Text` is a string, which is the text content, i.e., the value for the `text` prop.

<div class="demo" data-height="50">
Text("Hello!") {}
</div>

This is exactly the same as the following template but a little bit shorter.

```bvt
Text {
    text = "Hello!"
}
```

See the documentation for each component for whether it accepts an initializer and its expected type.

## Components Without Props

When a component's prop block is empty, it can **be omitted** as long as a `;` is added after the component name.

<div class="demo" data-height="50">
Text("Hello!");
</div>

## Modifiers

**Modifiers** can be added after a component tag to serve as a shortcut to a set of predefined props.
For example, `.full` is the combination of `width = 100%` and `height = 100%`:

<div class="demo" data-height="150">
Component {
    width = 100; height = 100
    Rect.full;
}
</div>

This is the same as writing:

```bvt
Component {
    width = 100; height = 100
    Rect {
        width = 100%; height = 100%
    }
}
```

See the documentation for a list of available modifiers.

## Prefixes of Props

Props can have various **prefixes** in the form of `prefix:prop = value`. We only introduce one of them and will cover the remaining ones later.

### Style

Sometimes you might want direct access to the rendered SVG element, especially when you want some SVG/CSS features that the framework is not yet capable of providing.
Props starting with `style:` are added to the `style` attribute directly in the SVG element on the page.

For example, to set the cursor to `"pointer"`:

<div class="demo" data-height="150">
// Hover me!
Rect {
    width = 100; height = 100;
    fill = "blue"
    style:cursor = "pointer"
}
</div>

However, this usage is discouraged and is for demonstration only since we already have the `cursor` prop that works with both SVG and canvas.

!> Note that this only works for the SVG renderer.

## Dynamic Component Name

Sometimes the type of a component is not determined until runtime. In this case, you can use a simple `Component` and provide the name as its initializer:

```bvt
Component("Axis");

Component(name);

Component(data > 0 ? "Rect" : "Circle") {
    fill = "red"
}
```

<div class="demo" data-height="150">
Component {
    @for item in 10 {
        Component(item % 2 ? "Rect" : "Circle") {
            x = item * 20 + 20
            y = 20
            width = 10
            height = 10
            anchor = @anchor("center", "middle")
            r = 5
        }
    }
}
</div>
