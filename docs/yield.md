# Sockets

As mentioned in part one, **sockets** provides a mechanism to insert custom children into custom components. It's a simple task for custom components to support sockets.

## Basic usage

Inside a custom component, we use the `@yield` command to yield, or to declare a socket for plugging in.
The basic syntax of `@yield` looks like `@yield <name>`, where `<name>` is the name of this "slot".

The following component defines two sockets:

```js
class TwoSockets extends Component {
    render() {
        return this.t`Rows {
            Container {
                Text("This is the 'a' slot:");
            }
            Container {
                @yield a
            }
            Container {
                Text("This is the 'b' slot:");
            }
            Container {
                @yield b
            }
        }`;
    }
}
```

When using this component, we supply slots will be inserted to the position of the corresponding `@yield`:

```bvt
TwoSockets {
    :a {
        Rect;
    }
    :b {
        Circle;
    }
}
```

<div class="demo" data-height="200">
TwoSockets {
    :a {
        Rect {
            width = 50; height = 20
            fill = "blue"
        }
    }
    :b {
        Circle {
            r = 10; fill = "red"
        }
    }
}
</div>
<div class="bvd-code">
class TwoSockets extends Crux.Component {}
TwoSockets.prototype.render = Crux.t`
Rows {
    Container {
        Text("This is the 'a' slot:");
    }
    Container {
        @yield a
    }
    Container {
        Text("This is the 'b' slot:");
    }
    Container {
        @yield b
    }
}
`
TwoSockets
</div>

## The default socket

The _children_ socket is the default socket for a custom component.
If the user provides children components without wrapping by a socket block, they are placed inside the default children socket.

The following template defines a `Wrapper` component that wraps its children inside a frame:

```bvt
Component {
    x = 10; y = 10; width = 100%-20; height = 100%-20
    Rect {
        y = 20; height = 100%-20; width = 100%
        fill = "none"; stroke = "red"
    }
    Text("Any children will be inserted here");
    Component {
        y = 20
        @yield children
    }
}
```

<div class="demo" data-height="200">
Wrapper {
    width = 100%; height = 100%
    // try add anything!
    Rect {
        width = 50; height = 50
        fill = "blue"
    }
}
</div>
<div class="bvd-code">
class Wrapper extends Crux.Component {}
Wrapper.prototype.render = Crux.t`
Component {
    x = 10; y = 10; width = 100%-20; height = 100%-20
    Rect {
        y = 20; height = 100%-20; width = 100%
        fill = "none"; stroke = "red"
    }
    Text("Any children will be inserted here");
    Component {
        y = 20
        @yield children
    }
}
`
Wrapper
</div>

## Sockets with data

It is possible to yield with attached data at the same time. The syntax looks like:

```bvt
@yield <name> with <data>
```

The following example defines a `MultipleSockets` component that yields the same `content` socket for four times inside a loop.
For each time, it yields with the current array item as attached data.

```js
class MultipleSockets extends Component {
    public render = template`
    Component {
        @let data = [1, 2, 3, 4]
        @for (item, index) in data {
            Component {
                key = index
                y = index * 20
                @yield content with item
            }
        }
    }
    `
}
```

When using `MultipleSockets`, the user captures the attached data with the following syntax:

```bvt
MultipleSockets {
    :content (data) {
        // ...
    }
}
```

<div class="demo" data-height="200">
MultipleSockets {
    :content (data) {
        Text("Value is " + data);
    }
}
</div>
<div class="bvd-code">
class MultipleSockets extends Crux.Component {}
MultipleSockets.prototype.render = Crux.t`
Component {
    @let data = [1, 2, 3, 4]
    @for (item, index) in data {
        Component {
            key = index
            y = index * 20
            @yield content with item
        }
    }
}
`
MultipleSockets
</div>

When supplying `Rect`s for the `content` socket, it draws a simple bar chart:

<div class="demo" data-height="200">
MultipleSockets {
    :content(data) {
        Rect { height = 12; width = data * 20 }
    }
}
</div>
<div class="bvd-code">
class MultipleSockets extends Crux.Component {}
MultipleSockets.prototype.render = Crux.t`
Component {
    @let data = [1, 2, 3, 4]
    @for (item, index) in data {
        Component {
            key = index
            y = index * 20
            @yield content with item
        }
    }
}
`
MultipleSockets
</div>

?> Note that the supplied named children are rendered multiple times in this example. Therefore, when using sockets, a components may need to wrap the socket content with containers and provide `key`s if necessary.

?> If the component yields `children` with data, a `:children` block will be required
when using it in order to capture data.

## Sockets with default content

It is also possible to provide a default block so that if the corresponding named children block is not provided,
or `@yield children` is used but the children is empty, the default block will be rendered.

Try adding a default block to `Wrapper`:

```js
class Wrapper extends Component {
    render() {
        return this.t`Component {
            x = 10; y = 10; width = 100%-20; height = 100%-20
            Rect {
                y = 20; height = 100%-20; width = 100%
                fill = "none"; stroke = "red"
            }
            Text("Any children will be inserted here");
            Component {
                y = 20
                @yield children default {
                    Text("Empty...");
                }
            }
        }`
    }
}
```

<div class="demo" data-height="200">
Wrapper {
    width = 100%; height = 100%
    // no children
}
</div>
<div class="bvd-code">
class Wrapper extends Crux.Component {}
Wrapper.prototype.render = Crux.t`
Component {
    x = 10; y = 10; width = 100%-20; height = 100%-20
    Rect {
        y = 20; height = 100%-20; width = 100%
        fill = "none"; stroke = "red"
    }
    Text("Any children will be inserted here");
    Component {
        y = 20
        @yield children default {
            Text("Empty...");
        }
    }
}
`
Wrapper
</div>