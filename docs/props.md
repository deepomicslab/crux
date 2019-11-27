# Props and Storage

## Accessing Class Members

All class members, including properties and methods are available in the template. 
In JavaScript, you use the `this` keyword to access class members; but **`this` is not needed** (and should not be used) in templates.

For example, we can extract the string concatenation part in `Greetings` into a method:

```js
class Greetings extends Oviz.Component {
    render() {
        return this.t`Container {
            Text {
                text = renderGreetings()
            }
        }`;

    renderGreetings() {
        return "Hello, " + this.prop.name;
    }
}
```

Note that `renderGreetings()` is used without `this` and in the template, and `this.prop` is used to get props in JavaScript.

Getters, setters, and other class members are also available in the template. For example, we can use a getter instead of `renderGreetings()`:

```js
class Greetings extends Oviz.Component {
    render() {
        return this.t`Container {
            Text {
                text = greetingString
            }
        }`;

    get greetingString() {
        return "Hello, " + this.prop.name;
    }
}
```

## Accessing props

The most important task for a component is prop handling.

Suppose that we want to add some background color to the name for the `Greetings` component. Therefore, it should accept two props: `name` and `color`, both to be strings.

We use the class member `prop` to access user given props inside the template.

We can then compose a template for the `Greetings` component using a `Columns` containing two text segments, and the right one has a `Rect` as its background.

```js
class Greetings extends Oviz.Component {
    render() {
        return this.t`Columns {
            Container {
                padding = 2
                Text("Hello,") { fontSize = 18 }
            }
            Container {
                padding = 2
                Rect.full.detached {
                    fill = prop.color
                }
                Text(prop.name) {
                    fontSize = 18
                    fill = "#fff"
                }
            }
        }`;
    }
}
```

<div class="demo" data-height="100">
Greetings {
    name = "Alex"
    color = "blue"
}
</div>
<div class="bvd-code">
class Greetings extends Crux.Component {
    render() {
        return this.t`Columns {
            Container {
                padding = 2
                Text("Hello,") { fontSize = 18 }
            }
            Container {
                padding = 2
                Rect.full.detached {
                    fill = prop.color
                }
                Text {
                    text = prop.name
                    fontSize = 18
                    fill = "#fff"
                }
            }
        }`;
    }
}
Greetings;
</div>

If using TypeScript, you may also need an interface:

```js
interface GreetingsOption extends ComponentOption {
    name: string;
    color: string;
}
```

#### The prop object is readonly

Note that `prop` is **readonly**, hence it is not possible to modify `prop`
inside the component. This is because props are passed from the parent, and the parent thus might have control over it; if changed inside the component, it might conflict with the parent's state.

If you try to write to a prop key, Oviz will throw an error:

```js
this.prop.color = "red";

// Error: this.prop is readonly
```

## Default props

It is also possible to provide **default values** for props. Simply override the `defaultProp()` method in your component class:

```js
class Greetings extends OViz.Component {
    defaultProp() {
        return {
            ...super.defaultProp(),
            name: "my friend",
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
            name: "my friend",
            color: "red",
        }
    }
    render() {
        return this.t`Columns {
            Container {
                padding = 2
                Text("Hello,") { fontSize = 18 }
            }
            Container {
                padding = 2
                Rect.full.detached {
                    fill = prop.color
                }
                Text {
                    text = prop.name
                    fontSize = 18
                    fill = "#fff"
                }
            }
        }`;
    }
}
Greetings;
</div>

The `defaultProp()` method should return an object. By extending `super.defaultProp()`, it inherits all default prop values for a
regular `Component` such as `width = 100%`; however, if you don't need them, simply return a bare object.

Although it's not a typical case, getting the default props from parent class manually also enables you to manipulate them before applying, such as discarding certain props from the parent.

## Inherited props from parents

Several props, namely "x", "y", "width", "height", "anchor" and "rotation", are passed down to the actually rendered component.
To explain the reason, let's take a look at the final element tree rendered by `Greetings`:

```
Greetings
  -> Columns
    -> Container
      -> Text
    -> Container
      -> Rect
      -> Text
```

Note that the _actually rendered_ component is `Columns` rather than `Greetings`. Therefore, geometry props applied to `Greetings`
should also be applied to `Columns`, otherwise they will have no effect.

If we write

```bvt
Greetings {
    name = "John"
    x = 20; y = 40
}
```

`x = 20` and `y = 40` will be passed down to the `Columns` inside `Greetings` and affect the final position of the rendered text:

<div class="demo" data-height="100">
Greetings {
    name = "John"
    x = 20; y = 40
}
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
    render() {
        return this.t`Columns {
            Container {
                padding = 2
                Text("Hello,") { fontSize = 18 }
            }
            Container {
                padding = 2
                Rect.full.detached {
                    fill = prop.color
                }
                Text {
                    text = prop.name
                    fontSize = 18
                    fill = "#fff"
                }
            }
        }`;
    }
}
Greetings;
</div>

However, if you do not need this behavior, you may override them inside the root component:


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
