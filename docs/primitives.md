# Component Library

This section briefly lists all primitives and some commonly used components provided by Oviz, so you can have a grasp of what basic graphical elements can be used to construct your visualization.

!> Note that this is not a comprehensive list.

!> It doesn't mean that all Oviz provides are these built-in components: **the real value of Oviz reveals when creating primitives and components by yourself.**

## Rect

`Rect` is a _primitive_ that renders a rectangle.

<div class="demo" data-height="100">
Rect {
    width = 100; height = 100;
}
</div>

Props available:

<div class="propdoc">
width,height
number
0
</div>

Width and height. Negative values also work.

<div class="propdoc">
xEnd,yEnd
number
N/A
</div>

Sometimes it might be more convenient to specify the right-most and the bottom position rather than width and height.

<div class="propdoc">
minWidth,minHeight
number
N/A
</div>

Take precedence if the width/height (speficied by `width`/`height` or calculated from `xEnd`/`yEnd`) is smaller. This can be used to ensure that the rectangle has an 1px width/height to be visible.

<div class="propdoc">
cornerRadius
number
0
</div>

The corner radius.

## Circle

`Circle` is a _primitive_ that renders a circle.

<div class="demo" data-height="100">
Circle {
    r = 50
}
</div>

Props available:

| Name | Type     | Usage       | Default |
| ---- | -------- | ----------- | ------- |
| `r`  | `number` | The radius. | 5       |

## Triangle

`Triangle` is a _primitive_ that renders a triangle that fits the provided width and height.

<div class="demo" data-height="100">
Triangle {
    width = 100; height = 100;
}
</div>

Props available:

| Name              | Type     | Usage                                      | Default |
| ----------------- | -------- | ------------------------------------------ | ------- |
| `width`, `height` | `number` | Width and height.                          | 8       |
| `orientation`     | `string` | Can be "top", "bottom", "left" or "right". | "top"   |

## Line

`Line` is a _primitive_ that renders a line.

<div class="demo" data-height="100">
Line {
    x1 = 0; y1 = 0; x2 = 100; y2 = 100
}
</div>

Props available:

<div class="propdoc">
x1,x2,y1,y2
number
0
</div>

Start and end position.

<div class="propdoc">
x,y
number
N/A
</div>

If `x1` and `x2` (or `y1` and `y2`) are the same, you may supply a single `x` (or `y`) instead.

## Polyline

`Polyline` is a _primitive_ that renders a polyline.

<div class="demo" data-height="100">
Polyline {
    points = [[0, 0], [100, 100], [200, 0], [300, 100]]
}
</div>

Props available:

<div class="propdoc">
points
[number, number][]
[]
</div>

The x and y coordinates of points.

## Polygon

Similar to `Polyline` but the path is closed.

<div class="demo" data-height="150">
Polygon {
    points = [
        [10, 10],
        [20, 120],
        [120, 100],
        [80, 40],
        [140, 30]
    ]
}
</div>

## Path

`Path` is a _primitive_ that renders a custom SVG or Canvas shape.

<div class="demo" data-height="100">
Path {
    d = "M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z"
}
</div>

Props available:

<div class="propdoc">
d
string
N/A
</div>

The path definition. See this [MDN link](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths) for more info.

## Text

`Text` is a _primitive_ that renders some text.

<div class="demo" data-height="100">
Text {
    text = "Hello, world!"
    fontSize = 18
}
</div>

Props available:

<div class="propdoc">
text
string
N/A
</div>

The text content.

<div class="propdoc">
html
string
N/A
</div>

The content as an HTML string (SVG only).

<div class="propdoc">
fontSize
number
12
</div>

The font size.

<div class="propdoc">
fontFamily
string
"Arial"
</div>

The font family.

<div class="propdoc">
maxWidth
number
N/A
</div>

Compress the text if its width exceeds `maxWidth`.

#### Drawing text with fixed length

`Text` is the only primitive that measures its size at runtime.
However, sometimes you may want to draw text with a fixed width or height, such as sequencing reads.
In such cases, you may want to use a monospaced font first and add some additional props.

`Text` provides the following props for rendering fix-sized text:

<div class="propdoc">
noSizeMeasurement
boolean
false
</div>

Disable size measurement at runtime. This can speed up rendering.
This option can be used when the text size does not affect the layout, or when using `fixedWidth` or `fixedHeight`.
If a fixed size is not provided, the default width and height will be 0.

<div class="propdoc">
fixedWidth,fixedHeight
number
N/A
</div>

Designate the width and height for the text component.
This size will be used for calculating its layout size and position.

<div class="propdoc">
drawFixedWidth
boolean
false
</div>

Render the text using the designated size. The text may be compressed or stretched.

<div class="demo" data-height="100">
Text {
    text = "ACGTAACGTCCGATACGTAACGTCCGAT"
    fontFamily = "monospace"
    noSizeMeasurement = true
    drawFixedWidth = true
    fixedWidth = 150
    fixedHeight = 14
}
</div>

## Arc

`Arc` renders an arc with thickness.

It is not required to be put in a polar coordinate syetem, although recommended.

<div class="demo" data-height="150">
Component {
    coord = "polar"
    Circle.centered { r = 2; fill = "red" }
    Arc {
        x1 = 45
        x2 = 135
        r1 = 30
        r2 = 70
    }
}
</div>

## ArcLine

`ArcLine` renders an arc.

It is not required to be put in a polar coordinate syetem, although recommended.

<div class="demo" data-height="150">
Component {
    coord = "polar"
    Circle.centered { r = 2; fill = "red" }
    ArcLine {
        x1 = 45
        x2 = 135
        r = 60
        fill = "none"
    }
}
</div>

## RadicalLine

`RadicalLine` renders a line in polar coordinate system, of which the
start and end point has same angle but different radius.

It is not required to be put in a polar coordinate syetem, although recommended.

<div class="demo" data-height="150">
Component {
    coord = "polar"
    Circle.centered { r = 2; fill = "red" }
    RadicalLine {
        r1 = 20
        r2 = 80
        x = 60
    }
}
</div>

## Arrow

`Arrow` is a _component_ that comprises a line and a triangle.

<div class="demo" data-height="100">
Arrow {
    x1 = 0; y1 = 0; x2 = 90; y2 = 90;
}
</div>

Props available:

| Name                   | Type     | Usage                   | Default |
| ---------------------- | -------- | ----------------------- | ------- |
| `x1`, `x2`, `y1`, `y2` | `number` | Start and end position. | 0       |

## Axis

`Axis` is a _component_ that renders an axis.
It must be put inside a scale system. The `orientation` prop controls the direction of ticks and labels: "left" or "right" for vertical axes, and "top" or "bottom" for horizontal ones.

<div class="demo" data-height="100">
Axis {
    x = 10; y = 10; width = 100%-40
    orientation = "bottom"
    xScale = @scaleLinear(0, 1000)
}
</div>

Props available:

| Name              | Type           | Usage                                                                                                            | Default |
| ----------------- | -------------- | ---------------------------------------------------------------------------------------------------------------- | ------- |
| `orientation`     | `string`       | Can be "top", "bottom", "left" or "right".                                                                       | "top"   |
| `tickCount`       | `number`       | Specify an expected number of ticks. The actual count of ticks may be different from this value due to rounding. | 5       |
| `tickInterval`    | `number`       | Specify the tick interval explicitly.                                                                            | N/A     |
| `ticks`           | `number[]`     | Specify the tick values explicitly.                                                                              | N/A     |
| `tickFormat`      | `() => string` | Specify the label for each tick.                                                                                 | N/A     |
| `includeEndTicks` | `boolean`      | Whether display the ticks at the start and the end.                                                              | true    |

### Axis Background

`AxisBackground` is a _component_ that renders an axis as horizontal and vertical rules. It accepts basically the same props as `Axis`.

See [Customizing Components](sockets.md) on how to customize labels and rules.

<div class="demo" data-height="100">
AxisBackground {
    x = 10; y = 10; width = 100%-20; height = 100%-20
    yScale = @scaleLinear(0, 1000)
    showLabels = true
    includeEndTicks = true
}
</div>

Additional props available:

| Name          | Type     | Usage                              | Default      |
| ------------- | -------- | ---------------------------------- | ------------ |
| `orientation` | `string` | Can be "horizontal" or "vertical". | "horizontal" |

## Legend

`Legend` is a _component_ that renders a legend.

The `data` for a `Legend` can be generated automatically if you are using `@colorMap`. See the next chapter for the usage of color maps.

<div class="demo" data-height="100">
Component {
    Legend {
        @let map = @colorMap(4)
        data = map.legendData()
        x = 10; y = 10; padding = 8
    }
}
</div>

Props available:

| Name          | Type           | Usage                                                                   | Default |
| ------------- | -------------- | ----------------------------------------------------------------------- | ------- |
| `type`        | `string`       | Shape of the marker. Can be "dot", "rect", and "line".                  | "rect"  |
| `title`       | `string`       | The optional title for this legend.                                     | N/A     |
| `data`        | `LegendData[]` | An array that defines style for each marker and content for each label. | []      |
| `lineHeight`  | `number`       | Line height for each row.                                               | 12      |
| `legendWidth` | `number`       | The width value for "rect" and "line" marker.                           | 20      |
| `padding`     | `number`       | Padding for the legend.                                                 | 0       |

```js
interface LegendData {
    type: string;
    // Label content
    label: string;
    // Stroke and fill color for the marker
    stroke: string;
    fill: string;
}
```

## Common Props for Primitives

These graphical props are available for all _primitives_.

| Name            | Type     |
| --------------- | -------- |
| `fill`          | `string` |
| `fillOpacity`   | `number` |
| `stroke`        | `string` |
| `strokeOpacity` | `number` |
| `strokeWidth`   | `number` |
| `dashArray`     | `string` |
