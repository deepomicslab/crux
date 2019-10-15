# Coordinate System

Each `Component` can also define its own scaled coordinate system.

## Scale

`Component` can also set up a local scale system. They accept two scale props, `xScale` and `yScale`,
and values for them should be `@scale-` helpers such as `@scaleLinear`.
This is especially useful when we need to map some raw data to the actual sizes of graph components.

- Supplying no argument to the helper, such as `@scaleLinear()`, will make it return the identical scale with domain and range both being [0, width].
- Supplying 2 arguments to the helper, such as `@scaleLinear(0, 1000)`, makes it sets the domain to [0, 1000] and the range will be [0, width].
- Supplying 4 arguments to the helper sets both the domain and range.

Scalings are not applied automatically. Corresponding helpers `@scaledX` and `@scaledY` must be used together.

<div class="demo" data-height="250">
Component {
    @let data = [
        [150, 490], [420, 830], [800, 260], [600, 80]
    ]
    xScale = @scaleLinear(0, 1000)
    yScale = @scaleLinear(0, 1000)
    @for (item, index) in data {
        Circle.centered {
            key = index
            x = @scaledX(item[0])
            y = @scaledY(item[1])
            r = 4
            fill = "red"
        }
    }
}
</div>

A list of supported scale helpers can be found in the reference.

Scale system can be inherited. Unless the child components define their own scale systems, in which case the parent's scale system will be
overwritten, the scale system is avilable for **all nested child components**.

Some components, such as `Axis`, require to be put in a scale system:

<div class="demo" data-height="250">
Component {
    @let data = [
        [150, 490], [420, 830], [800, 260], [600, 80]
    ]
    Component {
        x = 20; y = 20
        width = 100%-40; height = 100%-40
        xScale = @scaleLinear(0, 1000)
        yScale = @scaleLinear(0, 1000)
        @for (item, index) in data {
            Circle.centered {
                key = index
                x = @scaledX(item[0])
                y = @scaledY(item[1])
                r = 4
                fill = "red"
            }
        }
        Axis("top");
        Axis("left") { height = 100% }
    }
}
</div>

## Coordinate System

`Component` can also has its own coordinate system type. The prop `coord` can be either `"cartesian"` or `"polar"`, and `"cartesian"` is the default.
Once `"polar"` is specified, all containing components' positions (`x` and `y`) will be treated as coodinates inside a polar coordinate system.

In a polar coordinate system, `x` becomes **the angle in degree (°)** and `y` becomes the **radius**.

The origin of the polar coordinate system will be the **center point** of this component.

<div class="demo" data-height="200">
Component {
    coord = "polar"
    Circle.centered {
        r = 100; fill = "#ddd"
    }
    Circle.centered {
        r = 4; fill = "red"
    }
    Circle.centered {
        x = 135; y = 40
        r = 4; fill = "green"
    }
}
</div>

It is possible to have nested components inside, but in this case components will only serve as pure wrappers to group child elements,
because the origin should always the same point. In other words, **components' positions are ignored** inside polar coordinate system.

In the following example, the component has x = 45 and y = 40, but it is ignored since
it makes no sense to translate its children in a polar coordinate system.
Therefore, the blue dot's coordinate is (225°, 40) rather than (270°, 80).

<div class="demo" data-height="200">
Component {
    coord = "polar"
    Circle.centered {
        r = 100; fill = "#ddd"
    }
    Circle.centered {
        r = 4; fill = "red"
    }
    Component {
        x = 45; y = 40
        Circle.centered {
            x = 225; y = 40
            r = 4; fill = "blue"
        }
    }
    Circle.centered {
        x = 135; y = 40
        r = 4; fill = "green"
    }
}
</div>

However, if the nested component defines its own coordinate system rather than inheriting the root one, all children inside this component
will be translated as normal.

<div class="demo" data-height="200">
Component {
    coord = "polar"
    Circle.centered {
        r = 100; fill = "#ddd"
    }
    Circle.centered {
        r = 4; fill = "red"
    }
    Component {
        coord = "cartesian"
        x = 45; y = 40
        Circle.centered {
            r = 4; fill = "green"
        }
        Rect.centered {
            x = 10; y = 10
            width = 10; height = 10
            fill = "blue"
        }
        Rect.centered {
            x = -10; y = -10
            width = 10; height = 10
            fill = "blue"
        }
    }
}
</div>

It is also possible to combine scales with a polar coordinate system:

<div class="demo" data-height="200">
Component {
    @let data = [
        [150, 490], [420, 830], [800, 260], [600, 80]
    ]
    xScale = @scaleLinear(0, 1000)
    yScale = @scaleLinear(0, 1000)
    coord = "polar"
    Circle.centered {
        r = 100; fill = "#ddd"
    }
    Circle.centered {
        r = 4; fill = "red"
    }
    Component {
        @for (item, index) in data {
            Circle.centered {
                key = index
                x = @scaledX(item[0])
                y = @scaledY(item[1])
                r = 4
                fill = "green"
            }
        }
    }
}
</div>
