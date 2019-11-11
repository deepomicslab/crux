# Custom Components

The best feature that Oviz provides is the ability to create custom components.
The need for writing your own components emerges when your visualization grows more and more complicated, and you might face some situations such as:

_You want to reuse some part of your visualization._
It can be a generalization of several similar code segments for the sake of the DRY principle, or a full-featured component that can be used across projects or even released for everyone.

_You need to store some states to handle interactions._
For example, your visualization renders a list of items, and the one that the user's cursor hovers should be highlighted. Therefore, you must keep track of the index of the currently highlighted item, and update it on `mouseenter` or `mouseleave` events.

Similar to the built-in components, your custom component mainly has two responsibilities: externally, it handles props and renders its content; internally, it maintains its state and handles interaction with the user.

## The Render Function

Components are JavaScript classes.

A component renders its content through a render function: a method `render()` should be defined for each component class. When called, the render function returns a tree of element definitions in the form of JavaScript objects. In OViz, you don't write the render function directly; instead, you write the template.

Each template will be compiled to a render function, even for the template you supplied to `Oviz.visualize`: it becomes the render function of the root component.

Although a function (can also be used as a string tag) `Oviz.t` is provided to compile a template string to a render function directly, it's not recommended to do it manually. Oviz provides two more elegant ways to create components.

## Creating Components

#### From the Template

If your custom component contains the template only, i.e., it doesn't have any properties and methods, the easiest way to create a component is by using `Oviz.c`:

```js
const Greetings = Oviz.c(`Component {
    Text {
        text = "Hello, " + prop.name
        fill = prop.color
    }
}`);
```

<div class="demo" data-height="100">
Greetings {
    name = "Alex"
    color = "blue"
}
</div>
<div class="bvd-code">
Crux.c(`Component {
    Text {
        text = "Hello, " + prop.name
        fill = prop.color
    }
}`, "Greetings");
</div>


#### Using a Class

Otherwise, for an orthodox approach, you can extend the `Oviz.Component` class and define the `render` method.
In this method, you return the template tagged with `this.t`, which will handle all the compiling stuff:

```js
class MyComponent extends Oviz.Component {
    render() {
        return this.t`Component {
            // ...
        }`;
    }
}
```

In TypeScript, the component also requires a type argument that declares its props.

```js
interface MyComponentOption extends ComponentOption {
    // props
}

class MyComponent extends Component<MyComponentOption> {

}
```

#### Writing the template

The template's _root component_ should be a `Component` or a custom component rather than a primitive. If you only need to render a primitive element,
such as `Rect` or `Text`, simply wrap it in a `Component`.
However,  it usually makes little sense to write a custom component just to render a primitive element. You may want to _create a new primitive_ instead.

?> The template should not have `svg` or `canvas` definition because it is for a component rather than the whole visualization.

## Registering Components

```js
Oviz.use.component({ Greetings });
```

## Accessing Props

For example, we are going to define a `Greetings` to render a line of salutation with a given name and text color.
It should accept a `name` and a `color` prop, both are strings.

```js
interface GreetingsOption extends ComponentOption {
    name: string;
    color: string;
}

class Greetings extends Component<GreetingsOption> {
    public render = template`
    Container {
        Text {
            text = "Hello, " + prop.name
            fill = prop.color
        }
    }
    `;
}
```

<div class="demo" data-height="100">
Greetings {
    name = "Alex"
    color = "blue"
}
</div>
<div class="bvd-code">
class Greetings extends Crux.Component {}
Greetings.prototype.render = Crux.t`
Container {
    Text {
        text = "Hello, " + prop.name
        fill = prop.color
    }
}
`
Greetings;
</div>

Use `prop` to access given props inside the template. Note that `prop` is **readonly**, hence it is not possible to modify `prop`
inside the component. This is because that props are passed from the parent and the parent has control on it; once modified, it
might conflict with the parent's state.

It is also possible to provide **default values** for props. Simply override the `defaultProp()` method in your component class:

```js
class Greetings extends Component<GreetingsOption> {
    public render = template`
    Container {
        Text {
            text = "Hello, " + prop.name
            fill = prop.color
        }
    }
    `;

    public defaultProp() {
        return {
            ...super.defaultProp(),
            name: "Someone",
            color: "red",
        }
    }
}
```

<div class="demo" data-height="100">
Greetings;
</div>
<div class="bvd-code">
class Greetings extends Crux.Component {
    defaultProp() {
        return {
            ...super.defaultProp(),
            name: "Someone",
            color: "red",
        }
    }
}
Greetings.prototype.render = Crux.t`
Container {
    Text {
        text = "Hello, " + prop.name
        fill = prop.color
    }
}
`
Greetings;
</div>

The `defaultProp()` method should return an object. By extending `super.defaultProp()`, it inherits all default prop values for a
regular `Component` such as `width = 100%`, but if you do not need them, simply return a fresh object.

Several props, namely "x", "y", "width", "height", "anchor" and "rotation", are passed down to the actually rendered component.
For example, if we write

```
Greetings {
    name = "John"
    x = 20; y = 40
}
```

`x = 20` and `y = 40` will be passed down to the `Container` inside `Grettings`, therefore
(of course) they will affect the position of the rendered text, and you can try adding them in the above demo.
However, if you do not need this behavior, simply override them inside the root component:

```js
class RectWith50PxWidth extends Component {
    render = template`
    Component {
        width = 50
        Rect.full;
    }
    `;
}
```

<div class="demo" data-height="100">
RectWith50PxWidth {
    width = 100  // the width will always be 50
    height = 50
}
</div>
<div class="bvd-code">
class RectWith50PxWidth extends Crux.Component {}
RectWith50PxWidth.prototype.render = Crux.t`
Component {
    width = 50
    Rect.full;
}
`
RectWith50PxWidth
</div>

## Accessing Class Members

All class members, including member methods are available in the template. Please refer to the
[Component reference](ref/component.md) for more details. In JavaScript, accessing other class members would
require using `this` keyword; but **`this` is not needed** (and should not be used) in templates.

For example, we can extract the string concatenation part in `Greetings` into a method:

```js
class Greetings extends Component<GreetingsOption> {
    public render = template`
    Container {
        Text {
            text = renderGreetings()
            fill = prop.color
        }
    }
    `;

    private renderGreetings() {
        return "Hello, " + this.prop.name;
    }
}
```

Note that `renderGreetings()` is used without `this` and in this method, `this.prop` is used to get props in JavaScript.

Getters, setters, and other class members are also available in the template.
It is also possible to use the method itself directly for props such as event handlers.

```js
class MyComponent extends Component {
    public render = template`
    Component {
        x = computedValue
        y = value
        on:click = clickHandler
    }
    `;

    private value;

    private get computedValue() {
        return // ...
    }
    private clickHandler(ev) {
        // ...
    }
}
```

### refs