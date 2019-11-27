# States

The props are readonly in a component. However, components must be mutable in interactive visualizations.
The component may have different appearances when mouse hovered, clicked or data changed;
its children may be updated, moved, created or hidden based on the user intertaction.
The **state** system provides a universal solution to internal mutability of components.

The `state` is simply a member inside a component which you can access using `this.state` in JavaScript and `state` in templates.
The most important property of states is:

!>When its state is updated, the component **re-renders automatically**.

## Defining states

Suppose that we are going to create a component `MousePos`, which renders a dot that moves with the mouse cursor.
We use states to store the x and y position of the mouse cursor. When the mouse moved, they should be updated and trigger a next render loop, during which the dot's position is updated using the new x and y.

Typically, the state object is initialized in the `init()` method. If a `state` object is not created in this method, Oviz will use an empty object instead.

```js
class MousePos extends Oviz.Component {
    init() {
        this.state = {
            x: 0, y: 0,
        }
    }
}
```

Then we write the template as usual:

```js
class MousePos extends Oviz.Component {
    render() {
        return this.t`Component {
            Circle.centered {
                x = state.x
                y = state.y
            }
        }`;
    }
}
```

Note that `state` is referenced inside the template.

## Updating states

Now we are going to update the circle's position on mouse movements. Since the circle's position is connected with the `x` and `y` state,
we only need to update them. 

In Oviz, states should be updated using `setState()`. It accepts an object, containing all states that should be updated. Therefore, you can update multiple states at once.

We define a method `mouseMoved` as the event handler. 
In this method, we use a utility method `Oviz.utils.mouse` to get the relative mouse position to an element from an event,
and then update the state using `setState()`:

```js
class MousePos extends Oviz.Component {
    init() {
        this.state = {
            x: 0, y: 0,
        }
    }

    render() {
        return this.t`Component {
            on:mousemove = mouseMoved
            Rect.full { fill = "#ccc" }
            Circle.centered {
                x = state.x
                y = state.y
            }
        }`;
    }

    mouseMoved() {
        const [x, y] = Oviz.utils.mouse();
        this.setState({ x, y });
    }
}
```

<div class="demo" data-height="200">
MousePos;
</div>
<div class="bvd-code">
class MousePos extends Crux.Component {
    constructor() {
        super()
        this.state = { x: 0, y: 0 }
    }
    mouseMoved(ev, el) {
        const [x, y] = Crux.utils.mouse(el, ev);
        this.setState({ x, y });
    }
}
MousePos.prototype.render = Crux.t`
Component {
    on:mousemove = mouseMoved
    Rect.full { fill = "#ccc" }
    Circle.centered {
        x = state.x
        y = state.y
    }
}
`
{ component: { MousePos: MousePos }}
</div>

!> Never write to `this.state` directly. Use `this.setState()` instead.

## Stages

You might think that the **stage** concept mentioned in the template part sounds quite similar to an internal state; that is correct: The stage system is completely based on states.

The `stage` is a special state: Oviz will initialize it to `null` even if you didn't declare it.

When accessing `this.stage`, you are actually reading `this.state.stage`; similarlly, when setting the stage, `this.stage = val` is essentially equivalent to `setState({ stage: val })`.