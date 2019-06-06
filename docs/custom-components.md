# Custom Components

The need of writing your own components emerges when your visualization grows more and more complicated.
You might face some situations such as:

- Some part of your visualization needs to be reused;
- There are some complex interaction logics;
- You need to add hooks during the lifetime of a component and do some extra work.

Similar to the default components the framework provides, your custom component will handle props and have a custom render function.
It can also have members, methods and internal states.

## Extending the Component Class

You start defining a custom component by extending the `Component` class.
In TypeScript, the component also requires a generic type argument which declares accepted props.

The component should have a render function. Rather than writing a `function` manually,
the framework provides a convenient tag `template` to compile a template into a render function.

```js
interface MyComponentOption extends ComponentOption {
    // props
}

class MyComponent extends Component<MyComponentOption> {
    public render = template`
    Component {
        // ...
    }
    `;
}
```

?> The template's root component should be a `Component` or a custom component. If you only need to render a primitive element,
simply wrap it in a `Component`. However, creating a custom component just to render a primitive element is not quite useful.
You may want to create a new primitive component instead.

?> The template should not have `svg` or `canvas` definition because it is for a component rather than the whole visualization.

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
Greetings.prototype.render = Crux.template`
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
Greetings.prototype.render = Crux.template`
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
RectWith50PxWidth.prototype.render = Crux.template`
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