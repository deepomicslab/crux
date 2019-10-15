# Customizing Components

One of the most potent features Oviz provides is the ability to encapsulate new components,
and it already has a standard charts and diagrams library with a lot of predefined components.
However, it's not easy to make a component flexible and extensible enough.

## Delegated Props

Say we have a component `BarChart` which renders a bar chart.
Typically, we have bars and labels in it, and they should change according to the input data.
Props are the most obvious and essential way to control them, and the `BarChart` probably has such properties as `data`.
However, how about if we want to control the appearance, such as the fill color of bars and labels?

One solution would be defining more props on `BarChart`, such as `barFill`, `barStroke`, `barStrokeWidth`, and so on.
A significant disadvantage is that such props can hardly be exhaustive.
Numerous props must be added to provide sufficient elasticity and meet the need for fully controlling the bars,
which in return result in inflexibility of `BarChart` and repeated work.

To solve this problem, we have **delegated props**.
It is a mechanism which let custom components to expose certain children, and users can thus supply any prop for them.

Rather than having dedicated props on `BarChart`, we now supply props _directly_ to the bars inside. Delegated props look like:

```bvt
element.prop = value
```

And the template for using a `BarChart` that supports delegated props may look like:

```bvt
BarChart {
    data = data
    bar.fill = "#000"
    bar.stroke = "#66c"
    label.fontSize = 12
}
```

See the documentation of each component for their supported delegated props.
We will also cover later on how to add support for delegated props when writing a new component.

## Sockets

Custom components have their predefined children, but it brings stiffness if their types and numbers are immutable.
For example, a user would like to add some custom markers to each bar of the bar chart - which is almost impossible in most chart libraries.
Although some of them may provide some preliminary support, they can't be flexible enough to allow detailed customization for the marker: how about if the user wants to add interactions (like tooltips) for them?

As a front-end framework partly inspired by Vue and React, Oviz has a mechanism called **socket** to support the customization of a component's children.

A custom component may have multiple sockets defined in its template, indicating that the user can _insert_ anything here. Each socket has a _name_ and some optional _data_ attached.

![socket](socket.png)

Socket blocks start with `:`, following by the socket's name. You are free to supply anything as the content of the socket block, and the content will be inserted at the corresponding place.
It's possible to write more than one component in a socket block.

```bvt
SomeComponent {
    :socket (data) {
        // component to insert
    }
}
```

### Attached data

The content you provided may serve as a template and be _rendered multiple times_.
Recall the bar chart marker example, since the number of bars changes according to input data, we don't know the precise count of markers, and it's also impracticable to provide sockets separately for each marker.
Instead, we only have one socket and use the attached data to distinguish each marker.

You can think the `data` in the parentheses as the argument of the socket block; therefore you can change its name freely.

If we have a `BarChart` component that supports custom markers via a socket named `marker`, and we know that the socket has attached data in the following format:

```js
{
    name: string, // the category name
    value: number, // the corresponding value of the bar
}
```

Here is a possible usage if we want to draw a custom marker that comprises a circle whose radius is proportional to the value, and a label:

```bvt
BarChart {
    :marker (item) {
        Circle {
            r = item.value / 10
        }
        Text {
            text = item.name
        }
    }
}
```

![barchart with socket](barchart-socket.png)

If you don't need the attached data, you can omit it safely:

```bvt
SomeComponent {
    :socket {
        // component to insert
    }
}
```

### The default children socket

If you add children directly to a custom component without providing the socket block, you are using the default `children` socket.
That said, writing

```bvt
SomeComponent {
    Circle;
}
```

is equivalent to

```bvt
SomeComponent {
    :children {
        Circle;
    }
}
```

Therefore, if a component doesn't support a `children` socket, adding children blocks directly to it has no effect.

