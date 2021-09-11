# Charts for XYPlot

## Bars

### Default Bars

You just need to write the `Bar` component inside the `XYPlot` block, and Oviz will draw a default bar chart for you.

<div class="demo" data-height="150">
XYPlot {
    padding = 20
    data = [{pos: "bar1", value: 5, name: "Oviz"}, {pos: "bar2", value: 3, name: "oViz"}, {pos: "bar3", value: 10, name: "ovIz"}, {pos: "bar4", value: 6, name:"oviZ"}]
    gap = 20
    Bars {}
    Axis("bottom") { y = 100% }
    Axis("left");
}
</div>

Oviz will take the props of the parent `XYPlot` and compute the bar sockets props. Inside each bar socket, Oviz draw a full-size `Rect` with default color.

### Overwrite bar using delegate props
You can overwrite the bar props by providing the delegate props `bar`.

<div class="demo" data-height="150">
XYPlot {
    padding = 20
    data = [{pos: "bar1", value: 5, name: "Oviz"}, {pos: "bar2", value: 3, name: "oViz"}, {pos: "bar3", value: 10, name: "ovIz"}, {pos: "bar4", value: 6, name:"oviZ"}]
    Bars {
        bar.fill = "green"
        bar.stroke = "black"
    }
    Axis("bottom") { y = 100% }
    Axis("left");
}
</div>

### Overwrite using sockets

You can use sockets to completely overwrite the bars. Bar chart provide the following 2 sockets: 
1. `:children(d)`, the socket for the bar, the default socket.
2. `:overlay(d)`, the socket for the overlay.

Both 2 sockets are attached with data:
```typescript
interface socketData {
    data: any,
    pos: number,
    value: number,
    minValue: number,
}
```

<div class="demo" data-height="150">
XYPlot {
    padding = 20
    data = [{pos: "bar1", value: 5, name: "Oviz"}, {pos: "bar2", value: 3, name: "oViz"}, {pos: "bar3", value: 10, name: "ovIz"}, {pos: "bar4", value: 6, name:"oviZ"}]
    Bars {
        :children(d) {
            Rect.full {
                fill = d.value > 6 ? "red" : "blue"
                behavior:tooltip {
                    content = d.data.name +  ": " + d.value
                }
            }
        }
        :overlay(d) {
            Text.centered {
                x = 50%; y = -3; text = d.value
            }
        }
    }
    Axis("bottom") { y = 100% }
    Axis("left");
}
</div>


## StackedBars

## GroupedBars

## Dots

## Areaa

## StackedArea

## Scatters

## Heatmap

## Contour

## Histogram

## StepLine

## UnequalBins

## Violins
