# XYPlot

!> Tutorial for `XYPlot` may be obselete and subject to update. Please refer to [chart.oviz.org](https://chart.oviz.org) for demo cases.

`XYPlot` creates plots that show data in two dimensions, such as bar charts, line charts and scatter charts.
It supports combination of multiple charts, adding axes and background to the plot, and drawing any additional elements inside.

## Data

XYPlot requires **an array** to be its data.

XYPlot creates **a scale system** automatically, therefore it needs to know the following information in order to calculate the scale of data:

- Position of each item, or the category it belongs to;
- Value for each item, and an optional minimum value for each item.

For example,

- In a scatter plot, the position would determine the x position and the value would determine the y position;
- In a bar chart, the position would be the category and the value would determine the bar height;

It then determines its two axes: **category axis** for positions, and **value axis** for values.
By default the category axis is horizontal and the value axis is vertical,
but it is possible to exchange them by supplying the `flip` prop.

### Providing data

By default, `XYPlot` handles several commonly used data formats automatically,
but if you want to supply data in other formats, a **data handler** can be used to get those values from it.

```js
interface DataHandler {
    values: (d: any) => any[];
    pos: (d: any, i: number) => number|string;
    value: (d: any, i: number) => number;
    min: (d: any, i: number) => number;
}
```

- `values` gets the data array from the raw data.
- `pos` gets the position from an item in the data array.
- `min` gets the minimum value from an item in the data array.
- `value` gets the value from an item in the data array.

In `pos`, `min` and `value`, the current index `i` is also provided.

Here are some examples:

For a scatter plot:

```bvt
XYPlot {
    data = {
        data: [{ x: 1, y: 2 }, { x: 3, y: 4 }]
    }
    dataHandler = {
        values: d => d.data,
        pos: d => d.x,
        value: d => d.y
    }
}
```

<div class="demo" data-height="150">
XYPlot {
    padding = 20
    discreteCategory = true
    data = {
        default: {
            data: [{ x: 1, y: 2 }, { x: 3, y: 4 }]
        }
    }
    dataHandler = {
        default: {
            values: d => d.data,
            pos: d => d.x,
            value: d => d.y
        }
    }
    Dots {
        data = "default"
        Circle.centered { r = 4; fill = "#3d8eff" }
    }
    Axis("bottom") { y = 100% }
    Axis("left");
}
</div>

For a ranged bar chart:
```bvt
XYPlot {
    data = [["Tom", 2000, 3000], ["Mary", 4000, 5000]]
    dataHandler = {
        pos: d => d[0],
        min: d => d[1],
        value: d => d[2]
    }
}
```
<div class="demo" data-height="150">
XYPlot {
    padding = 20
    discreteCategory = true
    data = [["Tom", 10, 30], ["Mary", 20, 50]]
    dataHandler = {
        default: {
            pos: d => d[0],
            min: d => d[1],
            value: d => d[2]
        }
    }
    Bars {
    }
    Axis("bottom") { y = 100% }
    Axis("left");
}
</div>

?> Although some charts need further processing of the input data,
XYPlot only cares about `pos`, `value` and `min`.

### Default data format

XYPlot handles some default data formats by using several default data handlers.

- If the data is an array of numbers (`number[]`),
  - for example `[1, 2, 3, 4]`:
  - it will be treated as `[value, value, ...]`, i.e.
  - `pos` is `(d, i) => i`
  - `value` is `d => d`.
- If the data is an array where each item is a tuple with two numbers (`[number, number][]`),
  - for example `[[1, 2], [3, 4]]`:
  - it will be treated as `[[min, max], [min, max], ...]`, i.e.
  - `pos` is `(d, i) => i`
  - `value` is `d => d[1]`.
  - `min` is `d => d[0]`.
- If the data is an array where each item is a tuple of which the first item is a string (`[string, number][]`),
  - for example `[["a", 2], ["b", 4]]`:
  - it will be treated as `[[pos, value], [pos, value], ...]`, i.e.
  - `pos` is `d => d[0]`
  - `value` is `d => d[1]`.
- If the data is an array where each item is an object (`{pos: string, value: number}[]`),
  - for example `[{ pos: 1, value: 2 }, { pos: 3, value: 4 }]`:
  - `pos` is `d => d.pos`
  - `value` is `d => d.value`.

## Charts

The framework provides various **charts** components; and some of them can be used by inserting them into `XYPlot`.

For example, to draw a bar chart we simply add a `Bars` into the `XYPlot`:

<div class="demo" data-height="150">
XYPlot {
    padding = 20
    data = [1, 2, 3, 4, 5]
    Bars;
}
</div>

Since the `XYPlot` creates its scale system, we can put `Axis` components inside it and it will work automatically.
`padding` is used to create extra space around the plot itself, in which we can put `Axis`, or some other labels/legends.

<div class="demo" data-height="150">
XYPlot {
    discreteCategory = true
    padding = 20
    data = [1, 2, 3, 4, 5]
    Bars;
    Axis("bottom") { y = 100% }
    Axis("left");
}
</div>

It is possible to customize the appearance of each bar by using named children (see [the reference for Bars](plot/xy-plot-charts.md#bars) for details):

<div class="demo" data-height="150">
XYPlot {
    discreteCategory = true
    padding = 20
    data = [1, 2, 3, 4, 5]
    Bars {
        Rect.full {
            cornerRadius = 6
            fill = "#66c"
            stroke = "#fcf"
        }
    }
    Axis("bottom") { y = 100% }
    Axis("left");
}
</div>

Another example of `Dots`, which renders a dot chart:

<div class="demo" data-height="150">
XYPlot {
    discreteCategory = true
    padding = 20
    data = [1, 2, 3, 4, 5]
    Dots;
    Axis("bottom") { y = 100% }
    Axis("left");
}
</div>

### Multiple data sets and charts

It is possible to add more charts in the same XYPlot. In this case, you may have multiple data sets, so you need to supply **an object** for XYPlot's `data` prop:

```
XYPlot {
    data = {
        data1: [1, 2, 3, 4],
        data2: [5, 4, 3, 2]
    }
}
```

And now you need to specify the **data key** for each chart:

```
XYPlot {
    Bars { data = "data1" }
    Dots { data = "data2" }
}
```

<div class="demo" data-height="150">
XYPlot {
    width = 100%
    height = 100%
    padding = 20
    discreteCategory = true
    data = {
        data1: [1, 2, 3, 4],
        data2: [5, 4, 3, 2]
    }
    Bars { data = "data1" }
    Dots {
        data = "data2"
        Circle.centered { r = 2; fill = "red" }
    }
    Axis("bottom") { y = 100% }
    Axis("left");
}
</div>

### Stacked and grouped charts

Sometimes you need bars or other charts to be stacked or grouped.
By supplying `stackedData` XYPlot can calculate scales for stacked data correctly:

```bvt
XYPlot {
    data = {
        data1: [1, 2, 3, 4],
        data2: [5, 4, 3, 2]
    }
    stackedData = {
        stacked: ["data1", "data2"]
    }
}
```

`stackedData` needs to be an object and the key of each stacked data group, such as `stacked` in the above case, will be used by child charts as the data key.

Now you can fraw stacked bars using `StackedBars`:

<div class="demo" data-height="150">
XYPlot {
    discreteCategory = true
    padding = 20
    data = {
        data1: [1, 2, 3, 4],
        data2: [5, 4, 3, 2]
    }
    stackedData = {
        stacked: ["data1", "data2"]
    }
    StackedBars {
        data = "stacked"
        :children (data) {
            Rect.full {
                fill = data.key === "data1" ? "#ffb13d" : "#3d8eff"
            }
        }
    }
    Axis("bottom") { y = 100% }
    Axis("left");
}
</div>

For `GroupedBars`, you only need to supply an array of data keys:

<div class="demo" data-height="150">
XYPlot {
    discreteCategory = true
    padding = 20
    data = {
        data1: [1, 2, 3, 4],
        data2: [5, 4, 3, 2]
    }
    GroupedBars {
        data = ["data1", "data2"]
        :children (data) {
            Rect.full {
                fill = data.key === "data1" ? "#ffb13d" : "#3d8eff"
            }
        }
    }
    Axis("bottom") { y = 100% }
    Axis("left");
}
</div>

## Backgrounds and Labels

It is also possible to add backgrounds and labels directly to the plot.

<div class="demo" data-height="250">
XYPlot {
    discreteCategory = true
    padding = 40
    data = {
        data1: [1, 2, 3, 4],
        data2: [5, 4, 3, 2]
    }
    Rect {
        fill = "#ffd"
    }
    GroupedBars {
        data = ["data1", "data2"]
        :children (data) {
            Rect.full {
                fill = data.key === "data1" ? "#ffb13d" : "#3d8eff"
            }
        }
    }
    Axis("bottom") { y = 100% }
    Axis("left");
    Text("Title") {
        x = 50%
        y = -10
        fontSize = 14
        anchor = @anchor("bottom", "center")
    }
    Text("Category") {
        x = 50%
        y = 100%+12
        fill = "gray"
        anchor = @anchor("top", "center")
    }
}
</div>
