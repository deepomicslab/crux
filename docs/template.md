# Template

## Component Block

Use the following syntax to define an element or component.

```bvt
Component {

}
```

Components are basic units for constructing visualizations. Basically there are 3 types of them:

- **Primitive Elements**, the basic and atomic graphical elements, such as `Rect`, `Circle` and `Line`.
  Primitive elements cannot have children.
- **Components**, containers that can have children inside.
  `Component`s are merely containers, so actually they never render anything on the graph;
  however they can define a local coordinate system for all their children.
- **Custom Components**, subclasses of `Component` that have predefined children inside.
  It might be possible or impossible to add extra children to it.

To define children inside a component, simply declare them inside the parent block:

```
Component {
    Rect { }
}
```

?> `{` `}` pairs can appear in a same line or different lines.

## Props

Elements and components can have multiple props. Props define numerous attributes from
their positions or appearances to complex layouts. Custom components are able to render different content
based on the props received.

Some basic props which are available for all elements and components are `x`, `y`, `rotation` and `anchor`.

Use the following syntax to add props:

```
Component {
    x = 10
    y = 10
    Rect {
        fill = "red"
    }
}
```

Spaces around `=` are not required but strongly recommended. Multiple props can be written in the same line,
and `;` is required to separate them.

```
Component {
    x=10  // valid
    Rect { x = 20; y = 40 }  // `;` must be used when writing multiple props in the same line
}
```

Valid values for props are **any JavaScript expressions**.

```
Component {
    x = 10 + 20 * 0.5
    y = myFunc(arg)
    data = [1, 2, 3]
}
```

It is also possible to call custom JavaScript functions in prop values if the template belongs to a custom component.
We will cover it later.

Prop values can also span **multiple lines**, as long as the value starts and ends with brackets (`(`, `[` or `{`).

```
Component {
    data = {
        array: [1, 2, 3],
        dict: { key: "value" }
    }
}
```

## Commands

Commands bring advanced controls on rendering complicated components.

#### @let

`@let` declares a variable that can be used in the current block scope (including all child blocks).
The value can be any JavaScript expressions.

```
@let var1 = 1
@let var2 = variable1 + 3

Component {
    x = variable2
}
```

!> Variables declared by `@let` will finally become JavaScript variables, so their names should follow all JavaScript's conventions.

#### @expr

`@expr` executes a JavaScript expression.

```
@let var1 = 1
@expr console.log(var1)
```

!> Execution order matters. `@let` and `@expr` in a block will always execute before any other operations such as assigning props.
The order for `@let` and `@expr` commands themselves will be preserved, though.

For example:

<div class="demo" data-height="150">
Component {
    @let var1 = 10
    Component {
        Text { text = "var1: " + var1 }
        x = var1
        @expr var1 += 10
        y = var1
        @expr var1 += 20
    }
}
</div>

is equivalent to

```
@let var1 = 10
Component {
    @expr var1 += 10
    @expr var1 += 20
    x = var1
    y = var1
    Text { text = "var1: " + var1 }
}
```

Therefore `x` and `y` for this component are all `40`, and the `Text` element renders `40`.

**`@let` and `@expr` should always stay at the top of the block to avoid ambiguity.**

#### @if

`@if` only renders its content when a JavaScript expression evaluates to true.

<div class="demo" data-height="150">
Component {
    @let a = 4
    @let b = 3
    @if a > 2 && b < 5 {
        Rect {
            width = 20; height = 20
            fill = "red"
        }
    }
}
</div>

It is possible to have multiple children inside one `@if` block.

#### @elsif and @else

`@else` / `@elsif` are also available.

```
@if a > 2 {
    Rect {}
}
@elsif a > 0 {
    Circle {}
}
@else {
    Line {}
}
```

#### @for

`@for` loops through data and renders its content for multiple times.

The basic syntax looks like:

```
@for item in data {
    // ...
}
```

It is also possible to refer the index in the loop:

```
@for (item, index) in data {
    // ...
}
```

`data` here can be:

- An array; or
- An object (dictionary), in this case `index` will be each key and `item` will be the value; or
- A number _n_, in this case it is treated as _range(n)_, i.e. an array with length equals to _n_.
  `index` and `item` will be the index, from 0 to _n-1_.

!> The prop `key` must be supplied when using the `@for` command.
`key` will be used to distinguish different copies of the same component within a loop.

<div class="demo" data-height="150">
Component {
    @let data = [1, 2, 3, 4]
    @for (item, index) in data {
        Rect {
            key = index
            y = index * 20
            height = 18
            width = item * 20
        }
    }
}
</div>

As mentioned above, an unique `key` must be supplied for **each component of the same kind** in each loop.
In other words, it is possible to supply a same key for components that are of different kinds, but the key
must be **unique** 1) _for this kind of component_ and 2) _in each iteration_.

```
@for (item, index) in data {
    Component {
        key = index
    }
    // OK to supply same key to different kind of elements
    Rect {
        key = index
    }
    // Need to supply different key if there are multiple elements of the same kind
    Circle {
        key = index + "-c1"
    }
    Circle {
        key = index + "-c2"
    }
}
```

The index can be used as the key when there is no other choice. Better choices include `id` or `key`,
or any other property in the data which can be used to identify the data item. For example:

```js
let data = [{ id: 1, name: "John" }, { id: 7, name: "Kenneth" }, { id: 19, name: "Mary" }]
```
```
@for item in data {
    Component {
        key = data.id
        Text { text = data.name }
    }
}
```

?> It's possible to use certain JavaScript expressions for the data, such as `foo.bar` or `foo[bar]`,
but complicated expressions, such as arbitrary JavaScript object or array literals are not supported.
If really needed, you can declare it using `@let` first.

### @props

Sometimes it might be clearer and more expressive if we can customize not only the prop values, but also the names.

The `@props` command provides an easy way to serve a dynamic object as props, so you are free to add any logic before
actually passing the props to a component.

Another important usage of `@props` will be introduced later in [Adcanved Components](advanced-components).

<div class="demo" data-height="200">
Rect {
    @let dynamicProps = {
        width: 50,
        height: 50,
    }
    @props dynamicProps
}
</div>

?> Followed by `@props` there can be a variable or a simple JavaScript expression, such as a function call.

## Layout

The framework features a layout system.

Let us start with a simple case. Note that `width` and `height` are available props for `Component` and `Rect`
(but not all components support them, for example `Circle` only has `r` to determine its size).

The rendered result of this template is shown below. A rect with full width and height is added to show the size of the root component.
Everything works pretty obviously.

<div class="demo" data-height="220">
Component {
    width = 200; height = 200
    Rect {
        width = 100%; height = 100%
        fill = "none"; stroke = "#000"
    }
    Rect {
        x = 20; y = 20;
        width = 40; height = 60
        fill = "red"
    }
}
</div>

Geometry values, such as `x`, `y`, `width`, `height` and `r` for `Circle`, can also be **relative value with an optional offset**.
For example, `100%`, `80%`, `100%-10`, `50%+5` are all valid geometry expression.
Now we can draw a rect that stretches over the container but has a 10px margin around.

<div class="demo" data-height="220">
Component {
    width = 200; height = 200
    Rect {
        width = 100%; height = 100%
        fill = "none"; stroke = "#000"
    }
    Rect {
        x = 10; y = 10
        width = 100%-20; height = 100%-20
        fill = "red"
    }
}
</div>

?> By default, a `Component` has `width = 100%` and `height = 0`.

A component, or any custom component (i.e. a subclass of a component) **defines its own coordinate system**.
Each child element/component's position is translated from the origin point of its parent component.

<div class="demo" data-height="220">
Component {
    x = 50; y =50;
    width = 200; height = 200
    Rect {
        width = 100%; height = 100%
        fill = "none"; stroke = "#000"
    }
    Rect {
        x = 20; y = 20
        width = 40; height = 60
        fill = "red"
    }
}
</div>

The point that the a compnent's position (origin point) is aligned to, or the **anchor**, can also be customized.
There are 3 possible hortizontal positions (`left`, `center`, `right`) and 3 vertical ones (`top`, `middle`, `left`),
so there are 9 possible anchor positions in total. The default anchor for all components is `(top, left)`.

The result of the following template is shown below.
A blue dot is added to show the origin point (defined by `x` and `y`) of the rect.

<div class="demo" data-height="220">
Component {
    Rect {
        anchor = @anchor("left", "top")
        x = 100; y = 100
        width = 40; height = 40
        fill = "rgba(255,255,0,.4)"
    }
    Rect {
        anchor = @anchor("middle", "center")
        x = 100; y = 100
        width = 40; height = 40
        fill = "rgba(255,0,0,.2)"
    }
    Rect {
        anchor = @anchor("right", "bottom")
        x = 100; y = 100
        width = 40; height = 40
        fill = "rgba(0,0,255,.2)"
    }
    Circle {
        anchor = @anchor("middle", "center")
        x = 100; y = 100;
        fill = "blue"; r = 2
    }
}
</div>

A **helper** `@anchor(middle, center)` is used to define anchor. We will cover helpers later, but it is sufficient to guess its usage from the syntax.

