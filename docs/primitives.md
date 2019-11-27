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

| Name | Type | Usage | Default |
|------|------|-------|---------|
|`width`, `height`|`number`|Width and height. Negative values also work.|20|
|`xEnd`, `yEnd`|`number`|Sometimes it might be more convenient to specify the right-most and the bottom position rather than width and height.|N/A|
|`minWidth`, `minHeight`|`number`|Take precedence if the width/height (speficied by `width`/`height` or calculated from `xEnd`/`yEnd`) is smaller. This can be used to ensure that the rectangle has an 1px width/height to be visible.|N/A|
|`cornerRadius`|`number`|Supply a number if rounded corners are needed.|0|

## Circle

`Circle` is a _primitive_ that renders a circle.

<div class="demo" data-height="100">
Circle {
    r = 50
}
</div>

Props available:

| Name | Type | Usage | Default |
|------|------|-------|---------|
|`r`|`number`|The radius.|5|

## Triangle

`Triangle` is a _primitive_ that renders a triangle that fits the provided width and height.

<div class="demo" data-height="100">
Triangle {
    width = 100; height = 100;
}
</div>

Props available:

| Name | Type | Usage | Default |
|------|------|-------|---------|
|`width`, `height`|`number`|Width and height.|8|
|`orientation`|`string`|Can be "top", "bottom", "left" or "right".|"top"|

## Line

`Line` is a _primitive_ that renders a line.

<div class="demo" data-height="100">
Line {
    x1 = 0; y1 = 0; x2 = 100; y2 = 100
}
</div>

Props available:

| Name | Type | Usage | Default |
|------|------|-------|---------|
|`x1`, `x2`, `y1`, `y2`|`number`|Start and end position.|0|
|`x`, `y`|`number`|If `x1` and `x2` (or `y1` and `y2`) are the same, you can supply a single `x` (or `y`) instead.|N/A|

## Polyline

`Polyline` is a _primitive_ that renders a polyline.

<div class="demo" data-height="100">
Polyline {
    points = [[0, 0], [100, 100], [200, 0], [300, 100]]
}
</div>

Props available:

| Name | Type | Usage | Default |
|------|------|-------|---------|
|`points`|`[number, number][]`|The x and y coordinates of points.|[]|

## Polygon

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

| Name | Type | Usage | Default |
|------|------|-------|---------|
|`d`|`string`|The path definition.|N/A|

## Text

`Text` is a _primitive_ that renders some text.

<div class="demo" data-height="100">
Text {
    text = "Hello, world!"
}
</div>

Props available:

| Name | Type | Usage | Default |
|------|------|-------|---------|
|`text`|`string`|The text content.|""|
|`html`|`string`|The raw html content. SVG Only.|""|
|`fontSize`|`number`|The font size.|12|
|`fontFamily`|`string`|The font family.|N/A|

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

| Name | Type | Usage | Default |
|------|------|-------|---------|
|`x1`, `x2`, `y1`, `y2`|`number`|Start and end position.|0|

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

| Name | Type | Usage | Default |
|------|------|-------|---------|
|`orientation`|`string`|Can be "top", "bottom", "left" or "right".|"top"|
|`tickCount`|`number`|Specify an expected number of ticks. The actual count of ticks may be different from this value due to rounding.|5|
|`tickInterval`|`number`|Specify the tick interval explicitly.|N/A|
|`ticks`|`number[]`|Specify the tick values explicitly.|N/A|
|`tickFormat`|`() => string`|Specify the label for each tick.|N/A|
|`includeEndTicks`|`boolean`|Whether display the ticks at the start and the end.|true|

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

| Name | Type | Usage | Default |
|------|------|-------|---------|
|`orientation`|`string`|Can be "horizontal" or "vertical".|"horizontal"|

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

| Name | Type | Usage | Default |
|------|------|-------|---------|
|`type`|`string`|Shape of the marker. Can be "dot", "rect", and "line".|"rect"|
|`title`|`string`|The optional title for this legend.|N/A|
|`data`|`LegendData[]`|An array that defines style for each marker and content for each label.|[]|
|`lineHeight`|`number`|Line height for each row.|12|
|`legendWidth`|`number`|The width value for "rect" and "line" marker.|20|
|`padding`|`number`|Padding for the legend.|0|

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

| Name | Type |
|------|------|
|`fill`|`string`|
|`fillOpacity`|`number`|
|`stroke`|`string`|
|`strokeOpacity`|`number`|
|`strokeWidth`|`number`|
|`dashArray`|`string`|