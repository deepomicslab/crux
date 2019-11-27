# Basic concepts

## Components

**Components** are fundamental units for constructing visualizations, and all visualizations in Oviz are made up of components. There are 3 types of them:

- **Primitives**, the primary and atomic graphical elements, such as `Rect`, `Circle`, and `Line`.
  Primitive elements cannot have children.
- **Components**, containers that can have all 3 types of components as children inside.
  `Component`s are merely containers, so they never actually render anything on the graph;
  however, they can affect the behaviors of its children; for example, a component defines a local coordinate system for all their children.
- **Custom Components**, subclasses of `Component` that have predefined children inside.
  Depending on their settings, it might be possible or impossible to add extra children to it (will be covered later).


Use the following syntax to define an element or component.
The curly brackets (`{}`) mark the boundary of the component block.
Props and child components of the component are all declared inside this block.

```bvt
Component {
}
```

To define children inside a component, declare them directly inside the parent block:

```bvt
Component {
    Rect { }
}
```

?> `{` `}` pairs can appear in the same line or different lines. However, `{` must appear in the same line with the component name.

## Props

Elements and components can have multiple properties or **props**. Props define various attributes from their positions or appearances to complex layouts.
For example, a `Rect` has `fill` as one of its props, which controls the fill color.
Custom components can render different content based on the props supplied.

Some regular props which are available for all elements and components are `x`, `y`, `rotation`, and `anchor`.

Use the following syntax to set props:

```bvt
Component {
    x = 10
    y = 10
    Rect {
        fill = "red"
    }
}
```

Spaces around `=` are not required but strongly recommended. It is possible to write multiple props in the same line,
as long as you separate them by `;`.

```bvt
Component {
    x=10  // valid
    Rect { x = 20; y = 40 }  // `;` must be used when writing multiple props in the same line
}
```

Values for props could be **any JavaScript expression**.

```bvt
Component {
    x = 10 + 20 * 0.5
    y = myFunc(arg)
    data = [1, 2, 3]
}
```

It is also possible to call custom JavaScript functions in prop values. We will cover it later.

Prop values can also span **multiple lines**, as long as the value starts and ends with brackets (`(`, `[` or `{`).

```bvt
Component {
    data = {
        array: [1, 2, 3],
        dict: { key: "value" }
    }
}
```

?> That said, when your multi-line expression starts with a bracket but does not end with another one, such as writing an arrow function, you must add an extra pair of surrounding brackets:

```js
(a) => {
    return a + 1
}
```

should be

```js
((a) => {
    return a + 1 
})
```

## Commands: Assignments

**Commands** bring advanced control when rendering complicated components. They can appear anywhere inside a block.

### @let

`@let` declares a variable that is available in the current block scope (including all child blocks).
The value can be any JavaScript expression.

```bvt
@let var1 = 1
@let var2 = var1 + 3

Component {
    x = var2
}
```

!> Variables declared by `@let` finally become JavaScript variables, so their names should follow all JavaScript's conventions.

### @expr

`@expr` executes an arbitrary JavaScript expression.

It is not a good idea to put lots of logic inside the template, and usually, you should not use it at all.
However, it serves as a useful debugging tool as you can log values during the rendering process. You might also find it useful when you need to do some extra jobs between iterations.

```bvt
@let var1 = 1
@expr console.log(var1)
```

### The order of commands, props, and child components

In Oviz, you are free to put commands, props, and declarations of child components anywhere inside the parent's block in any order.
However, in some cases, the order of execution matters. Oviz handles the order of them following these rules:

Commands, props, and child components are treated separately: declarations of the same kind are grouped and executed together.
However, `@let` and `@expr` in a block are always executed _before_ any other operations such as assigning props.
The order for `@let` and `@expr` commands themselves are preserved nevertheless.

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

```bvt
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

It is recommended that **`@let` and `@expr` should always stay at the top of the block** to avoid ambiguity.
You should also write all commands first, then all props, and all declarations of child components at the end, without mixing them up.

## Commands: Controls

### @if

`@if` only renders its content when a JavaScript expression evaluates to true.

<div class="demo" data-height="150">
Component {
    @let a = 4
    @let b = 3
    @if a > 2 && b < 5 {
        Rect {
            width = 20; height = 20
        }
    }
}
</div>

It is possible to have multiple children inside one `@if` block.

### @elsif and @else

`@else` / `@elsif` are also available.

```bvt
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

### @for

`@for` loops through data and renders its content for multiple times.

The basic syntax looks like:

```bvt
@for item in data {
    // ...
}
```

It is also possible to refer the index in the loop:

```bvt
@for (item, index) in data {
    // ...
}
```

`data` here can be:

- An array; or
- An object (dictionary), in this case, `index` is the key, and `item` is the value; or
- A number _n_, in this case, it is treated as _range(n)_, i.e., an array with length equals to _n_.
  `item` is the index, from 0 to _n-1_. `index` here is identical to `item`.

<div class="demo" data-height="150">
Component {
    @let data = [1, 2, 3, 4]
    @for (item, index) in data {
        Rect {
            y = index * 20
            height = 18
            width = item * 20
        }
    }
}
</div>

?> It's possible to use some simple JavaScript expressions for the data, such as `foo.bar` or `foo[bar]`, but complicated expressions that contain spaces or `{`, such as arbitrary JavaScript object or array literals, are not supported.
If you indeed need it, you can declare it using `@let` first.

### @props

Sometimes it might be more precise and expressive if we can customize not only the prop values but also the names.

The `@props` command provides an easy way to serve a dynamic object (dictionary) as props, so you are free to add any logic before passing the props actually to a component.

<div class="demo" data-height="200">
Rect {
    @let dynamicProps = {
        width: 50,
        height: 50,
    }
    @props dynamicProps
}
</div>

Again, values for `@props` can be simple JavaScript expressions, such as an array indexing or a function call.

## Helpers

**Helpers** are special built-in functions that can be used in prop values and `@let` commands.
They act quite like a regular JavaScript function but are prefixed with `@`.
In general, they look like `@helper-name(arg, arg2)`.

For example, we have `@rad()`, which converts a value in radian to value in degree, and its counterpart `@deg()`.

```bvt
Arc {
    x1 = @deg(Math.PI / 2)
}
```

Since they act as a regular Javascript function, it is possible to nest them together.

```bvt
Arc {
    x1 = myOtherFunc(@rad(myFunc(value) + 20))
}
```

Here `@rad()` and `@deg()` are simple utility functions, but most other helpers are designed to work for complicated cases.
We will cover it later.

See the [reference for helpers](ref/helpers.md) for a complete list of all helpers.
