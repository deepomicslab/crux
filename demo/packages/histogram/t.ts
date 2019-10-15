export default `//bvt
svg {
    width = 900
    height = 1600
    Rows {
        @let fills = ["#aac9cecc", "#b6b4c2cc", "#c9bbc8cc", "#e5c1cdcc", "#f3d8cfcc"]
        @let point_data = hist_data.map(d => [d.pos, d.value/2])
        @let cum_point_data = hist_cumulated.map(d => [d.pos, d.value])
        Container { padding-y = 20; Text("Histogram with line") { fontSize = 24 } }
        Columns {
            XYPlot {
                height = 200; width = 300;
                padding = 20
                padding-l = 40
                data = hist_data
                dataHandler = {
                    hist_data: {
                        value: d => d.value,
                        pos: d => d.pos,
                    },
                }
                Text {
                    text = "Our lab member's age μ = 35.61，σ = 13.84"
                    anchor = @anchor("middle", "center")
                    y = -15
                    x = 50%
                }
                AxisBackground;
                Bars {
                    :children (data) {
                        Rect.full {
                            fill = "#fff3c0"
                            anchor = @anchor("top", "middle")
                            x = 50%
                            stroke = "black"
                            strokeWidth = 0.3
                        }
                    }
                }
                Axis("bottom") {
                    y = 100%
                    tickCount = 5
                }
                Axis("left");
                Polyline {
                    points = @scaled(point_data)
                    style:stroke-dasharray = 3
                    stroke = "red"
                }
                Component {
                    x = -30; y = 50%
                    rotation = @rotate(-90)
                    Text {
                        text = "percentage"
                        anchor = @anchor("bottom", "center")
                    }
                }
                Text {
                    text = "Age"
                    x = 50%; y = 100%+15
                    anchor = @anchor("top", "center")
                }
            }
            XYPlot {
                height = 200; width = 300; padding = 20
                data = hist_reverse_cumulated
                valueRange = [0, 1.1]
                dataHandler = {
                    hist_data: {
                        value: d => d.value,
                        pos: d => d.pos,
                    },
                }
                Text {
                    text = "Our lab member's age μ = 35.61，σ = 13.84"
                    anchor = @anchor("middle", "center")
                    y = -15
                    x = 50%
                }
                AxisBackground { orientation = "vertical"; dashArray = "1, 2" }
                AxisBackground { dashArray = "1, 2" }
                StepLine {
                    stroke = "red"
                    fill = "none"
                }
                Component {
                    x = -30; y = 50%
                    rotation = @rotate(-90)
                    Text {
                        text = "percentage"
                        anchor = @anchor("bottom", "center")
                    }
                }
                Text {
                    text = "Age"
                    x = 50%; y = 100%+15
                    anchor = @anchor("top", "center")
                }
                Axis("bottom") { y = 100% }
                Axis("left");
            }
            XYPlot {
                height = 200; width = 300; padding = 20
                data = hist_cumulated
                valueRange = [0, 1.1]
                dataHandler = {
                    hist_data: {
                        value: d => d.value,
                        pos: d => d.pos,
                    },
                }
                Text {
                    text = "Our lab member's age μ = 35.61，σ = 13.84"
                    anchor = @anchor("middle", "center")
                    y = -15
                    x = 50%
                }
                AxisBackground { orientation = "vertical"; dashArray = "1, 2" }
                AxisBackground { dashArray = "1, 2" }
                StepLine {
                    stroke = "red"
                    fill = "none"
                }
                Polyline {
                    points = @scaled(cum_point_data)
                    style:stroke-dasharray = 3
                    stroke = "black"
                }
                Component {
                    x = -30; y = 50%
                    rotation = @rotate(-90)
                    Text {
                        text = "percentage"
                        anchor = @anchor("bottom", "center")
                    }
                }
                Text {
                    text = "Age"
                    x = 50%; y = 100%+15
                    anchor = @anchor("top", "center")
                }
                Axis("bottom") { y = 100% }
                Axis("left");
            }
        }
        Columns {
            XYPlot {
                @let legendData = Object.keys(multiline).map(s => ({label: s, fill: multiline[s].color}))
                height = 200; width = 300; padding = 20
                data = multiline
                valueRange = [0, 0.1]
                padding-l = 40
                dataHandler = {
                    default: {
                        values: d => d.values,
                        pos: d => d.pos,
                        value: d => d.value,
                    },
                }
                Text {
                    text = "Our lab member's age μ = 35.61，σ = 13.84"
                    anchor = @anchor("middle", "center")
                    y = -15
                    x = 50%
                }
                flip = true
                invertValueAxis = true
                AxisBackground { orientation = "vertical"; dashArray = "1, 2" }
                AxisBackground { dashArray = "1, 2" }
                @for (d, index) in multiline {
                    StepLine {
                        data = d.key
                        key = index
                        stroke = d.color
                        fill = "none"
                    }
                }
                Component {
                    x = -30; y = 50%
                    rotation = @rotate(-90)
                    Text {
                        text = "percentage"
                        anchor = @anchor("bottom", "center")
                    }
                }
                Legend {
                    x = 100%
                    y = 100%
                    data = legendData
                    anchor = @anchor("bottom", "right")
                }
                Text {
                    text = "Age"
                    x = 50%; y = 100%+15
                    anchor = @anchor("top", "center")
                }
                Axis("bottom") { y = 100% }
                Axis("left");
            }
            XYPlot {
                @let legendData = Object.keys(stepline).map(s => ({label: s, fill: stepline[s].color}))
                height = 200; width = 300; padding = 20
                data = stepline
                dataHandler = {
                    default: {
                        values: d => d.values,
                        pos: d => d.pos,
                        value: d => d.value,
                    },
                }
                Text {
                    text = "Data over time - Step"
                    anchor = @anchor("middle", "center")
                    y = -15
                    x = 50%
                }
                AxisBackground { orientation = "vertical"; dashArray = "1, 2" }
                AxisBackground { dashArray = "1, 2" }
                @for (d, index) in stepline {
                    StepLine {
                        data = d.key
                        key = index
                        stroke = d.color
                        fill = "none"
                        closedStart = false
                        closedEnd = false
                    }
                }
                Component {
                    x = -30; y = 50%
                    rotation = @rotate(-90)
                    Text {
                        text = "data"
                        anchor = @anchor("bottom", "center")
                    }
                }
                Legend {
                    data = legendData
                    anchor = @anchor("top", "left")
                }
                Text {
                    text = "time"
                    x = 50%; y = 100%+15
                    anchor = @anchor("top", "center")
                }
                Axis("bottom") { y = 100% }
                Axis("left");
            }
            XYPlot {
                @let legendData = Object.keys(multiline2).map(s => ({label: s, fill: multiline2[s].color}))
                height = 200; width = 300; padding = 20
                data = multiline2
                valueRange = [0, 0.1]
                dataHandler = {
                    default: {
                        values: d => d.values,
                        pos: d => d.pos,
                        value: d => d.value,
                    },
                }
                Text {
                    text = "Our lab member's age μ = 35.61，σ = 13.84"
                    anchor = @anchor("middle", "center")
                    y = -15
                    x = 50%
                }
                flip = true
                invertValueAxis = true
                AxisBackground { orientation = "vertical"; dashArray = "1, 2" }
                AxisBackground { dashArray = "1, 2" }
                @for (d, index) in multiline2 {
                    StepLine {
                        data = d.key
                        key = index
                        stroke = "black"
                        fill = d.color
                    }
                }
                Component {
                    x = -30; y = 50%
                    rotation = @rotate(-90)
                    Text {
                        text = "percentage"
                        anchor = @anchor("bottom", "center")
                    }
                }
                Legend {
                    x = 100%
                    y = 100%
                    data = legendData
                    anchor = @anchor("bottom", "right")
                }
                Text {
                    text = "Age"
                    x = 50%; y = 100%+15
                    anchor = @anchor("top", "center")
                }
                Axis("bottom") { y = 100% }
                Axis("left");
            }
        }
        Columns {
            XYPlot {
                height = 200; width = 300;
                padding-b = 20
                padding = 20
                padding-l = 40
                data = unequal
                @let min = bins[0]
                @let max = bins[bins.length - 1]
                UnequalBins {
                    bins = bins
                    xScale = @scaleLinear(min, max)
                }
                Axis("bottom") {
                    y = 100%
                    xScale = @scaleLinear(min, max)
                }
                Axis("left") {}
                Text {
                    text = "Age"
                    x = 50%; y = 100%+15
                    anchor = @anchor("top", "center")
                }
                Component {
                    x = -30; y = 50%
                    rotation = @rotate(-90)
                    Text {
                        text = "percentage"
                        anchor = @anchor("bottom", "center")
                    }
                }
                Text {
                    text = "Activity members' age - Unequal Bins"
                    anchor = @anchor("middle", "center")
                    y = -15
                    x = 50%
                }
            }
            XYPlot {
                height = 200; width = 300;
                padding-b = 20
                padding = 20
                padding-l = 40
                data = unequal
                @let min = bins[0]
                @let max = bins[bins.length - 1]
                flip = true
                invertValueAxis = true
                UnequalBins {
                    bins = bins
                    yScale = @scaleLinear(min, max)
                }
                Axis("bottom") {
                    y = 100%
                }
                Axis("left") {
                    yScale = @scaleLinear(min, max)
                }
                Text {
                    text = "Age"
                    x = 50%; y = 100%+15
                    anchor = @anchor("top", "center")
                }
                Component {
                    x = -30; y = 50%
                    rotation = @rotate(-90)
                    Text {
                        text = "percentage"
                        anchor = @anchor("bottom", "center")
                    }
                }
                Text {
                    text = "Activity members' age - Unequal Bins"
                    anchor = @anchor("middle", "center")
                    y = -15
                    x = 50%
                }
            }
            XYPlot {
                @let legendData = Object.keys(multiline).map(s => ({label: s, fill: multiline[s].color}))
                height = 200; width = 300; padding = 20
                data = multiline
                valueRange = [0, 0.1]
                padding-l = 40
                dataHandler = {
                    default: {
                        values: d => d.values,
                        pos: d => d.pos,
                        value: d => d.value,
                    },
                }
                Text {
                    text = "Our lab member's age μ = 35.61，σ = 13.84"
                    anchor = @anchor("middle", "center")
                    y = -15
                    x = 50%
                }
                AxisBackground { orientation = "vertical"; dashArray = "1, 2" }
                AxisBackground { dashArray = "1, 2" }
                @for (d, index) in multiline {
                    StepLine {
                        data = d.key
                        key = index
                        stroke = d.color
                        fill = "none"
                    }
                }
                Component {
                    x = -30; y = 50%
                    rotation = @rotate(-90)
                    Text {
                        text = "percentage"
                        anchor = @anchor("bottom", "center")
                    }
                }
                Legend {
                    data = legendData
                    anchor = @anchor("top", "left")
                }
                Text {
                    text = "Age"
                    x = 50%; y = 100%+15
                    anchor = @anchor("top", "center")
                }
                Axis("bottom") { y = 100% }
                Axis("left");
            }
        }
        Container { padding-y = 20; Text("Box Plot") { fontSize = 24 } }
        Columns {
            XYPlot {
                height = 200
                width = 300
                padding-l = 30
                padding-r = 10
                padding-y = 20
                data = { side_by_side}
                dataHandler =  {
                    default: {
                        pos: d => d.key,
                        min: d => d.min,
                        value: d => d.max,
                    }
                }
                AxisBackground {
                    dashArray = "1, 2"
                }
                AxisBackground {
                    orientation = "vertical"
                    dashArray = "1, 2"
                }
                Text {
                    text = "Data in Groups - Multiple Histogram Side By Side"
                    anchor = @anchor("middle", "center")
                    y = -15
                    x = 50%
                }
                Text {
                    text = "Set"
                    x = 50%; y = 100%+15
                    anchor = @anchor("top", "center")
                }
                Component {
                    x = -30; y = 50%
                    rotation = @rotate(-90)
                    Text {
                        text = "Figure"
                        anchor = @anchor("bottom", "center")
                    }
                }
                @for (data, i) in side_by_side {
                    @let values = data.values
                    Line {
                        x1 = @scaledX(data.key)
                        x2 = @scaledX(data.key)
                        dashArray = "2, 2"
                        y1 = @scaled(data.max)
                        y2 = @scaled(data.min)
                        key = data.key
                    }
                    @for (d, j) in values {
                        Rect {
                            key = i * 2 + j * 10
                            x = @scaledX(data.key)
                            y = @scaled(d.pos)
                            width = d.value * 260 / 3
                            height = @scaled(data.max - data.gap)
                            anchor = @anchor("bottom", "center")
                            fill = data.color
                            stroke = "black"
                        }
                    }
                }
                Axis("bottom") { y = 100% }
                Axis("left") {}
            }
        }
        Container { padding-y = 20; Text("Heatmap") { fontSize = 24 } }
        Columns {
            @let heatmapData = hist2d_data.map(arr => arr.map(d => Math.log10(d) === -Infinity ? -1 : Math.log10(d)))
            @let dataLength = hist2d_data.length
            Container {
                width = 300; height = 300
                Text {
                    text = "Data in Groups- 2D Histogram"
                    x = 50%
                    anchor = @anchor("middle", "center")
                }
                Component {
                    width = 300; height = 300
                    HeatMap {
                        height = 100%-20; width = 100%-20;
                        padding-r = 40
                        padding-t = 20
                        padding-l = 40
                        data = hist2d_data
                        startColor = "blue"
                        endColor = "yellow"
                    }
                    Text {
                        text = "Age"
                        x = 50%; y = 100%
                        anchor = @anchor("top", "center")
                    }
                    Component {
                        x = 10; y = 50%
                        rotation = @rotate(-90)
                        Text {
                            text = "percentage"
                            anchor = @anchor("bottom", "center")
                        }
                    }
                    Axis {
                        xScale = @scaleLinear(0, dataLength, 0, 200)
                        orientation = "bottom"
                        y = 100%-20
                        x = 40
                    }
                    Axis {
                        yScale = @scaleLinear(0, dataLength, 260, 0)
                        orientation = "left"
                        y = 20
                        x = 40
                    }
                }
            }
            HeatMap {
                height = 300; width = 300; padding-r = 40; padding-y = 20
                data = heatmapData
                startColor = "blue"
                endColor = "yellow"
            }
            HeatMap {
                height = 300; width = 300; padding-r = 40; padding-y = 20
                data = heatmapData
                startColor = "#eee"
                endColor = "#333"
            }
        }
    }
}
`;
