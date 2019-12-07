# XYPlot Props

### data

> data: `any[] | Record<string, any>`

Can be an array or object (when supplying mutiple data sets).

Note that if you would like to use a `dataHandler` and the custom data set is an object, you must supply a data key for it, even if it's the only data set.
Therefore, it is recommended to preprocess the data before supplying it to XYPlot.

### dataHandler

> dataHandler: `Record<string, DataHandler>`

The data handler for each data set. The key should be the matching data key, or a `default` data handler can be provided as default.

```
dataHandler = {
    data1: { ... },
    default: { ... }
}
```

### stackedData

> stackedData: `Record<string, string[]>`

Specify stacked data. The key is the name of the stacked data set and the value is an array of data keys.

```
XYPlot {
    data = {
        data1: [1, 2, 3, 4],
        data2: [5, 4, 3, 2]
    }
    stackedData = {
        stacked: ["data1", "data2"]
    }
    StackedBars { data = "stacked" }
}
```

### discreteCategory

> discreteCategory: `boolean`

Whether the category axis is discrete.


With same data
```js
[{pos: 1, value: 5}, {pos: 3, value: 3}, {pos: 4, value: 2}, {pos: 7, value: 6}]
```

When `discreteCategory` is `true`:

<div class="demo" data-height="150">
XYPlot {
    padding = 20
    discreteCategory = true
    data = [{pos: 1, value: 5}, {pos: 3, value: 3}, {pos: 4, value: 2}, {pos: 7, value: 6}]
    Dots;
    Axis("bottom") { y = 100% }
    Axis("left");
}
</div>

When `discreteCategory` is `false`:

<div class="demo" data-height="150">
XYPlot {
    padding = 20
    data = [{pos: 1, value: 5}, {pos: 3, value: 3}, {pos: 4, value: 2}, {pos: 7, value: 6}]
    Dots;
    Axis("bottom") { y = 100% }
    Axis("left");
}
</div>

By default, the category axis is discrete when position (category) values are strings.

### categoryRange

> categoryRange: `any[]`

Specify range for the category axis manually, when the category axis is continuous.

### valueRange

> valueRange: `any[]`

Specify range for the value axis manually.

<div class="demo" data-height="150">
XYPlot {
    padding = 20
    valueRange = [0, 10]
    data = [1, 2, 3, 4, 5]
    Bars;
    Axis("bottom") { y = 100% }
    Axis("left") {}
}
</div>

### capToMinValue

> capToMinValue: `boolean`

If min value for each data item is specified, whether set the lower bound of the value axis to the minimum min value.

When `capToMinValue` is `true`:

<div class="demo" data-height="150">
XYPlot {
    padding = 20
    capToMinValue = true
    data = [[5, 8], [4, 6], [7, 10], [6, 8]]
    Bars;
    Axis("bottom") { y = 100% }
    Axis("left");
}
</div>

When `capToMinValue` is `false`:

<div class="demo" data-height="150">
XYPlot {
    discreteCategory = true
    padding = 20
    data = [[5, 8], [4, 6], [7, 10], [6, 8]]
    Bars;
    Axis("bottom") { y = 100% }
    Axis("left");
}
</div>

### gap

> gap: `number`

The gap between each column.

### hasPadding

> hasPadding: `boolean`

Whether it has padding at the left and right side.

For area charts, this prop should be `false`.

### flip

> flip: `boolean`

Whether exchange the value axis and the category axis.

<div class="demo" data-height="150">
XYPlot {
    discreteCategory = true
    padding = 20
    flip = true
    invertValueAxis = true
    data = [1, 2, 3, 4, 5]
    Bars;
    Axis("bottom") { y = 100% }
    Axis("left") {}
}
</div>

### invertValueAxis

> invertValueAxis: `boolean`

Whether invert the value axis.

<div class="demo" data-height="150">
XYPlot {
    discreteCategory = true
    padding = 20
    invertValueAxis = true
    data = [1, 2, 3, 4, 5]
    Bars;
    Axis("top");
    Axis("left");
}
</div>

### padding

> padding: `number`

Padding around the plot.