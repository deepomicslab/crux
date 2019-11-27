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

Suppose that we are going to define a component `Greetings` to render a line of salutation with a custom name.
We will use `prop.name` to get the name from props. Props will be covered in next chapter.

#### From the Template

If the custom component contains the template only, i.e., it doesn't have any properties and methods, the easiest way to create a component is by using `Oviz.c`:

```js
const Greetings = Oviz.c(`Component {
    Text {
        text = "Hello, " + prop.name
    }
}`);
```

<div class="demo" data-height="100">
Greetings {
    name = "Alex"
}
</div>
<div class="bvd-code">
Crux.c(`Component {
    Text {
        text = "Hello, " + prop.name
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

Similar to a global template, a component's template should contain only one element (_root element_) at the root level.
The root element should be a `Component` or a custom component rather than a primitive. If you only need to render a primitive element,
such as `Rect` or `Text`, simply wrap it in a `Component`.
However,  it usually makes little sense to write a custom component just to render a primitive element. You may want to _create a new primitive_ instead.

?> The template should not have `svg` or `canvas` definition because it is for a component rather than the whole visualization.

## Registering Components

You need to register a custom component so that Oviz can find it by its name. Components can be registered either globally or locally. 

#### Globally

Registering a component globally makes it available to all templates and components. You can use `Oviz.use.component` to register multiple components at once. In the case of name confliction, a warning will appear in the console.

```js
Oviz.use.component({ MyComponent });
```

#### Locally

By registering a component locally, it can be used in templates within a visualizer or component. If your visualization uses a global template, it's possible to specify a dictionary of components to be registered as a visualizer option.

```js
Oviz.visualize({
  components: { MyComponent },
});
```

If you need to register other components within a custom component, add a static class member to the component:

```js
class NewComponent extends Oviz.Component {
    static components = { MyComponent };
}
```
