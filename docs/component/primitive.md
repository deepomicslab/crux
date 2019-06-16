# Primitive Element

The following props are available for all primitive elements:

> **fill**: `string`

> **fillOpacity**: `number`

> **stroke**: `string`

> **strokeOpacity**: `number`

> **strokeWidth**: `number`

> **dashArray**: `string`

See [SVG's stroke-dasharray attribute](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray).

<div class="demo" data-height="100">
Line {
    x1 = 10; y1 = 10; x2 = 180; y2 = 10;
    dashArray = "4,4"
}
</div>

> **shapeRendering**: `string`

See [SVG's shapeRendering attribute](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/shape-rendering).

> **cursor**: `string`

The cursor name.

## Rect

<div class="demo" data-height="100">
Rect {
    width = 100
    height = 50
}
</div>

> **width**, **height**: `GeometryValue`

Width and height.

> **minWidth**, **minHeight**: `number`

If `width` or `height` is smaller than `minWidth` or `minHeight`, the min values will be used.
These props are useful when we want to make sure the actual width or height is larger than 1px.

> **cornerRadius**: `number`

Corner radius.

## Circle

<div class="demo" data-height="100">
Circle {
    r = 40
}
</div>

> **r**: `number`

The radius.

## Line

<div class="demo" data-height="100">
Line {
    x1 = 10; y1 = 10; x2 = 180; y2 = 80;
}
</div>

> **x1**, **x2**, **y1**, **y2**: `GeometryValue`

The start and end coordinates.

## Path

<div class="demo" data-height="100">
Path {
    d = "M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z"
    fill = "#7ca"
}
</div>

`Path` is a primitive path element which only supports the raw `d` property.
Consider using `Polygon` or `Polyline` if you need to draw some specific shapes.

> **d**: `string`

The path command string. See [SVG's d attribute](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d).

## Text

<div class="demo" data-height="50">
Text {
    text = "Hello world!"
    fontSize = 24
}
</div>

> **text**: `string`

The text content.

> **fontSize**: `number`

The font size.

> initializer: **text**

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
    fill = "#ffa"
}
</div>

> **points**: `[number, number][]`

The points in [x, y] format.

The [@scaled](ref/helpers#scaled) helper can be used to scale the points in a scale system conveniently.

## Polyline

<div class="demo" data-height="150">
Polyline {
    points = [
        [10, 10],
        [70, 80],
        [20, 60],
        [80, 40],
        [140, 20]
    ]
}
</div>

> **points**: `[number, number][]`

The points in [x, y] format.

The [@scaled](ref/helpers#scaled) helper can be used to scale the points in a scale system conveniently.

## Arc

`Arc` renders an arc with thickness.

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

> **x1**, **x2**, **r1**, **r2**: `GeometryValue`

`x1` `x2` controls the start and end angle, and `r1` `r2` controls the start and end radius.

> **pad**: `number`

The pad angle.

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
    }
}
</div>

> **x1**, **x2**, **r**: `GeometryValue`

`x1` `x2` controls the start and end angle, and `r` controls the radius.

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

> **r1**, **r2**, **x**: `GeometryValue`

`x` controls the angle, and `r1` `r2` controls the start and end radius.
