# Advanced Layout

Not all components have a fixed size that is initially known. `Text` is a perfect example.
The `Text` component renders some text content which may be static, but due to different font families and font sizes,
you never know its actual width and height after rendering.

`GeneArea` is another component with dynamic size.
It displays some genes located on a chromosome segment, but since they cannot overlap with each other, the total number of rows is initially undetermined.

<div class="demo no-editor" data-height="120">
GeneArea {
    genes = genes
    rowHeight = 12
    intronHeight = 12
    rawGap = 2
    labelPos = "right"
    label.fill = "#777"
}
</div>
<div class="bvd-code">
(function() { return { data: { genes: JSON.parse('[{"strand":"+","trans_name":"001","trans_name_orig":"AC072062.1-001","refseg":"chr2","cytoband":"q35","most_left_pos":215674952,"most_right_pos":215827998,"gene_name":"AC072062.1","exons":[]},{"strand":"+","trans_name":"001","trans_name_orig":"AC072062.3-001","refseg":"chr2","cytoband":"q35","most_left_pos":215886721,"most_right_pos":215906980,"gene_name":"AC072062.3","exons":[]},{"strand":"+","trans_name":"001","trans_name_orig":"AC073284.4-001","refseg":"chr2","cytoband":"q35","most_left_pos":216139714,"most_right_pos":216142670,"gene_name":"AC073284.4","exons":[]},{"strand":"+","trans_name":"201","trans_name_orig":"snoU13.181-201","refseg":"chr2","cytoband":"q35","most_left_pos":216167488,"most_right_pos":216167587,"gene_name":"snoU13_ENSG00000238663","exons":[]},{"strand":"+","trans_name":"001","trans_name_orig":"ATIC-001","refseg":"chr2","cytoband":"q35","most_left_pos":216176539,"most_right_pos":216214486,"gene_name":"ATIC","exons":[]},{"strand":"+","trans_name":"001","trans_name_orig":"AC012462.1-001","refseg":"chr2","cytoband":"q35","most_left_pos":216300975,"most_right_pos":216301715,"gene_name":"AC012462.1","exons":[]},{"strand":"+","trans_name":"001","trans_name_orig":"AC012462.2-001","refseg":"chr2","cytoband":"q35","most_left_pos":216318429,"most_right_pos":216328594,"gene_name":"AC012462.2","exons":[]},{"strand":"+","trans_name":"001","trans_name_orig":"AC012462.3-001","refseg":"chr2","cytoband":"q35","most_left_pos":216341389,"most_right_pos":216344971,"gene_name":"AC012462.3","exons":[]},{"strand":"+","trans_name":"001","trans_name_orig":"AC012668.2-001","refseg":"chr2","cytoband":"q35","most_left_pos":216410920,"most_right_pos":216578618,"gene_name":"AC012668.2","exons":[]},{"strand":"+","trans_name":"001","trans_name_orig":"AC093850.2-001","refseg":"chr2","cytoband":"q35","most_left_pos":216582765,"most_right_pos":216584147,"gene_name":"AC093850.2","exons":[]},{"strand":"+","trans_name":"001","trans_name_orig":"AC122136.2-001","refseg":"chr2","cytoband":"q35","most_left_pos":216734645,"most_right_pos":216735241,"gene_name":"AC122136.2","exons":[]}]') }} })()
</div>

Oviz has specific optimization for such components.

## Container

It is necessary to do extra layouts based on dynamic sizes in lots of common scenarios. You may want to add borders or a background rectangle to a `Text`, but how do you know the correct width and height of this rectangle? You may be using the `GeneArea` but want to draw another component beneath it, how do you know its Y offset?

`Container` is a special component that adjusts its size dynamically based on its children's sizes. It automatically set its width to the maximum X value of all its children, and similarly, its height to maximum Y value.

<div class="demo" data-height="120">
Container {
    Text {
        text = "Some Text"
        fontSize = 16
    }
}
</div>

Now the `Container` should have the same size as the `Text`. Now we are going to add a background rectangle for it to prove that.

By specifying `detached`, which is available as a prop or a modifier, a component is not counted during `Container`'s size calculation. Instead, it will be laid out after `Container`'s size is determined. In other words, the sizes available for a detached component is already the runtime size of the container.

<div class="demo" data-height="200">
Container {
    Rect.full {
        detached = true
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
    Rect.full.detached {
        fill = "none"; stroke = "red"
    }
    Text {
        text = "Some Text";
        fontSize = 16
    }
}
</div>

If `width` or `height` is designated explicitly for a `Container`, it always uses this fixed value instead.
You can try it by adding a fixed `width` or `height` value to the `Container` in the above demo.

`Container` is the fundamental component involved in Oviz's auto-layout system. Whenever you have a component with dynamic size, especially `Text`, the first thing you may want to do is to wrap it in a container.

## Rows

`Rows` is another special component that adjusts its children's positions so that they are _stacked vertically_ without overlapping.

`Rows` can contain only components (not primitives, such as `Rect` and `Text`) as direct children. If you need to use primitives with `Rows`, wrap them in `Container`s.

`Rows` itself is also a component with dynamic size, obviously.

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

Similarly, there is also a `Columns` to handle horizontal stacked layouts.

<div class="demo" data-height="140">
Columns {
    Container {
        padding = 2
        Text("Hello") { fontSize = 16 }
    }
    Container {
        padding = 2
        Text("World") { fontSize = 16 }
    }
}
</div>

## Nested Layouts

For `Columns` and `Rows`, they behave like the `Container` in the perpendicular direction. In other words, `Rows` will **adjust its width automatically** based on its children's max width, and `Columns` will **adjust its height automatically** based on its children's max height.
If you provide a fixed width or height value, it takes precedence.

?> However, in the same direction, i.e., `width` provided for `Columns` and `height` provided for `Rows` are ignored.

`Columns`, `Rows` and `Containers` can be nested to create grids or more complicated layouts.

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

Here's another example:

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

These layout components are so powerful that even for static components, it's usually more convenient to use them to achieve different layouts. If you are going to stack some components vertically, it's recommended to use `Rows` because you don't have to sum up their heights manually. Moreover, if the height of one component is going to be changed later, you only need to modify its individual height, without needing to worry whether it breaks the layout.
