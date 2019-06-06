# Advanced Layout

The framework provides several components to achieve complicated dynamic layouts.

## Container

`Container` is a special component that adjusts its size dynamically based on its children's sizes.

A component can have dynamic size. For example, `GeneArea` needs to draw several layers, but the count of layers is determined by the input data. The `Text` element also has a dynamic size.

It is necessary to do extra layouts based on dynamic sizes in lots of common scenarios, such as adding a border or background `Rect` to a `Text`.

<div class="demo" data-height="120">
Container {
    Text {
        text = "Some Text"
        fontSize = 16
    }
}
</div>

Now the `Container` has the same size as the `Text`, but we cannot see it graphically; so we are going to add a background rect.

By specifying `detached`, the `Rect` is now not counted during `Container`'s size calculation.
All detached children will be laid out only after `Container`'s size is determined.

<div class="demo" data-height="200">
Container {
    Rect {
        detached = true
        width = 100%; height = 100%
    }
    Text {
        text = "Some Text";
        fontSize = 16
    }
}
</div>

It is also possible to specify `padding`s for a container.

<div class="demo" data-height="200">
Container {
    padding = 6
    Rect {
        detached = true
        width = 100%; height = 100%
        fill = "none"; stroke = "red"
    }
    Text {
        text = "Some Text";
        fontSize = 16
    }
}
</div>

If `width` or `height` is designated explicitly for a `Container`, it will always use this fixed value instead.
You can try it by adding a fixed `width` or `height` value in the above demo.

## Rows

`Rows` is another special component which will adjust its children so that they are stacked in different rows without overlapping.
`Rows` can contain only components (not primitive elements) as direct children.

`Rows` can be used together with `Container`s.

<div class="demo" data-height="200">
Rows {
    Component {
        width = 200; height = 20;
        Rect.full { fill = "red" }
    }
    Container {
        padding = 4
        Text {
            text = "Some Text";
            fontSize = 16
        }
    }
    Component {
        width = 200; height = 20;
        Rect.full { fill = "blue" }
    }
    Container {
        padding = 4
        Text {
            text = "Some Other Text";
            fontSize = 16
        }
    }
    Component {
        width = 200; height = 40;
        Rect.full { fill = "gray" }
    }
}
</div>

## Columns

Similarily, there is also a `Columns` to handle horizontal stacked layouts.

Similar to `Container`, in horizontal direction, `Rows` will **adjust its width automatically** based on its children's width.
And in vertical direction, `Columns` will **adjust its height automatically** based on its children's width.

Therefore, `Rows`, `Columns` and `Container` can be nested to create grids or more complicated layouts.

<div class="demo" data-height="200">
Columns {
    Component {
        width = 20; height = 42;
        Rect.full { fill = "gray" }
    }
    Rows {
        Columns {
            Component {
                width = 100; height = 20;
                Rect.full { fill = "red" }
            }
            Container {
                padding = 4
                Text {
                    text = "Some Text";
                    fontSize = 16
                }
            }
        }
        Columns {
            Container {
                padding = 4
                Text {
                    text = "Some Other Text";
                    fontSize = 16
                }
            }
            Component {
                width = 100; height = 20;
                Rect.full { fill = "blue" }
            }
        }
    }
    Component {
        width = 20; height = 42;
        Rect.full { fill = "gray" }
    }
}
</div>

Another example:

<div class="demo" data-height="200">
Rows {
    @for i in 12 {
        Columns {
            key = i
            @for j in 24 {
                Container {
                    key = j;
                    Text {
                        text = (i + j) % 2 ? "●" : "○"
                        fontSize = 16
                    }
                }
            }
        }
    }
}
</div>