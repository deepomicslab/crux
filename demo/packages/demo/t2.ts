export default `//bvt
svg {
    width = 900
    height = 6000
    Rows {
        @let array = [1, 3, 8, 6, 5, 4, 2, 7, 3]
        @let array2 = [6, 4, 3, 2, 4, 9, 1, 5, 8]
        @let array3 = [3, 7, 2, 5, 6, 5, 7, 3, 4]
        @let array4 = [[3, 4], [4, 7], [6, 9], [2, 5], [1, 2]]
        @let barData = [
            ["Tom", 11],
            ["Dick", 12],
            ["Harry", 55],
            ["Slim", 44],
            ["Jim", 13]
        ]
        @let acorrData = [
            [1, 20],
            [3, -11],
            [5, 100],
            [-4, 32],
            [-7, -34],
            [-10, -53]
        ]
        @let boxData = {
            values: [
                [655, 850, 940, 980, 1070],
                [760, 800, 845, 885, 960],
                [780, 840, 855, 880, 940],
                [720, 767.5, 815, 865, 920],
                [740, 807.5, 810, 870, 950]
            ],
            outliers: [
                [ 0, 650 ], [ 2, 620 ], [ 2, 720 ], [ 2, 720 ], [ 2, 950 ], [ 2, 970 ]
            ],
            means: [
                899, 850, 859, 817.5, 835.5
            ],
        }
        @let fills = ["#aac9cecc", "#b6b4c2cc", "#c9bbc8cc", "#e5c1cdcc", "#f3d8cfcc"]
        Container { padding-y = 20; Text("Bar Chart and Range Chart") { fontSize = 24 } }
        Columns {
            XYPlot {
                height = 200; width = 300;
                padding = 20
                padding-t = 24
                data = array
                Rect { fill = "#efefef" }
                AxisBackground;
                Bars {
                    :children (data) {
                        Rect.full {
                            fill = "#3d8eff"
                            stage:active {
                                fill = "#ffb13d"
                            }
                            on:mouseenter = $el.setStage("active")
                            on:mouseleave = $el.setStage(null)
                        }
                        Circle.centered {
                            x = 50%; y = 50%; r = 2; fill = "#fff"
                        }
                    }
                    :overlay (data) {
                        Container {
                            anchor = @anchor("center", "bottom")
                            x = 50%
                            y = -3
                            padding = 4
                            Rect.full {
                                fill = "#000"
                                detached = true
                                cornerRadius = 3
                            }
                            Text {
                                anchor = @anchor("left", "top")
                                text = "Value:" + data.value
                                fill = "#fff"
                            }
                        }
                    }
                }
                Axis("bottom") { y = 100% }
                Axis("left");
            }
            XYPlot {
                discreteCategory = true
                height = 200; width = 300; padding = 20
                data = barData
                flip = true
                invertValueAxis = true
                AxisBackground { orientation = "vertical" }
                Bars {
                    bar.fill = "#f96"
                }
                Axis("bottom") { y = 100% }
                Axis("left");
            }
            XYPlot {
                height = 200; width = 300; padding = 20
                data = acorrData
                valueRange = [-80, 120]
                dataHandler = {
                    default: {
                        min: d => 0,
                        value: d => d[1],
                        pos: d => d[0]
                    }
                }
                AxisBackground;
                Bars {
                    pivot = 0
                    :children (d) {
                        Rect {
                            anchor = @anchor("top", "center")
                            x = 50%
                            width = 4
                            height = 100%
                            fill = "#ff3d8b"
                        }
                    }
                }
                Axis("bottom") { y = 100% }
                Axis("left");
            }
        }
        Columns {
            XYPlot {
                // discreateCategory = true
                height = 200; width = 300; padding = 20
                data = { array, array2, array3 }
                AxisBackground;
                GroupedBars {
                    data = ["array", "array2", "array3"]
                    :children (data) {
                        Rect {
                            x = 1
                            width = 100%-2
                            height = 100%
                            fill = { array: "#ff3d8b", array3: "#ffb13d", array2: "#3d8eff" }[data.key]
                            cornerRadius = 6
                        }
                    }
                    :group (d) {
                        Rect.full {
                            fill = "rgba(200,200,200,." + (d.array.pos % 2 === 0 ? "3" : "8") + ")"
                        }
                    }
                }
                Axis("bottom") {
                    y = 100%
                }
                Axis("left");
            }
            XYPlot {
                height = 200; width = 300; padding = 20
                @expr narray2 = array2.map((x, i) => x / (array2[i] + array3[i]))
                @expr narray3 = array3.map((x, i) => x / (array2[i] + array3[i]))
                data = { narray2, narray3 }
                stackedData = { stacked: ["narray2", "narray3"] }
                AxisBackground {}
                StackedBars {
                    data = "stacked"
                    :children (data) {
                        Rect.full {
                            fill = data.key === "narray3" ? "#ffb13d" : "#3d8eff"
                        }
                    }
                }
                Axis("bottom") { y = 100% }
                Axis("left") {}
            }
            XYPlot {
                height = 200; width = 300; padding = 20
                data = { array2, array3 }
                stackedData = { stacked: ["array2", "array3"] }
                AxisBackground {}
                StackedBars {
                    data = "stacked"
                    :children (data) {
                        Rect.full {
                            fill = data.key === "array3" ? "#ffb13d" : "#3d8eff"
                        }
                    }
                }
                Axis("bottom") { y = 100% }
                Axis("left") {}
            }
        }
        Columns {
            Container {
                height = 200; width = 300
                XYPlot {
                    width = 100%; height = 50%; padding-t = 20; padding-x = 20
                    data = array.map(x => x * 10)
                    valueRange = [0, 110]
                    Bars {
                        :children (d) {
                            Rect.full {
                                fill = "#ff3d8b"
                                stroke = "#777"
                            }
                        }
                        :overlay (d) {
                            Container {
                                anchor = @anchor("center", "bottom")
                                x = 50%
                                y = 0%
                                padding = 4
                                Text {
                                    anchor = @anchor("left", "top")
                                    text = d.value
                                }
                            }
                        }
                    }
                    Axis("bottom") { y = 100% }
                    Axis("left") {}
                }
                XYPlot {
                    y = 50%
                    width = 100%; height = 50%; padding-b = 20; padding-x = 20
                    data = array2.map(x => x * 10)
                    valueRange = [0, 110]
                    invertValueAxis = true
                    Bars {
                        :children (d) {
                            Rect.full {
                                fill = "#ffb13d"
                                stroke = "#777"
                            }
                        }
                        :overlay (d) {
                            Container {
                                anchor = @anchor("center", "top")
                                x = 50%
                                y = 100%
                                padding = 4
                                Text {
                                    anchor = @anchor("left", "top")
                                    text = d.value
                                }
                            }
                        }
                    }
                    Axis("bottom") { y = 100% }
                    Axis("left") {}
                }
            }
            XYPlot {
                height = 200; width = 300; padding = 20
                data = array4
                AxisBackground {}
                Bars {}
                Axis("bottom") { y = 100% }
                Axis("left") {}
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
                data = { boxData }
                Rect { fill = "#ffffff"; stroke="#000000" }
                AxisBackground {
                    dashArray = "1, 2"
                }
                AxisBackground {
                    orientation = "vertical"
                    includeEndTicks = true
                    dashArray = "1, 2"
                }
                Boxes {
                    data = "boxData";
                    :box (_d) {
                        Rect.full  {
                            fill = "#00000000"
                            stroke = "#003366"
                            x = 25%
                            width = 50%
                        }
                    }
                    :median(d) {
                        Line {x1 = 33%; x2 = 66%; stroke = "#800080"; dashArray = "2, 2"}
                    }

                    :mean(means) {
                        Line {x1 = 33%; x2 = 66%; stroke = "#ed2939"}
                    }

                    :outlier(o) {
                        Circle.centered { r = 2; fill = "#ff4500" }
                    }
                    :whiskle (d) {
                        Line { x1 = 41.25%; x2 = 57.75%; y1 = 0; y2 = 0; stroke = "#000" }
                        Line { x1 = 41.25%; x2 = 57.75%; y1 = 100%; y2 = 100%; stroke = "#000" }
                        Line { x1 = 50%; x2 = 50%; y1 = 0; y2 = 100%; stroke = "#0078d7"; dashArray = "3, 2" }
                    }
                }
                Axis("bottom") { y = 100% }
                Axis("left") {}
            }
            XYPlot {
                height = 200
                width = 300
                padding-l = 30
                padding-r = 10
                padding-y = 20
                data = { boxData }
                Rect { fill = "#ffffff"; stroke="#000000" }
                AxisBackground {
                    dashArray = "1, 2"
                }
                AxisBackground {
                    orientation = "vertical"
                    includeEndTicks = true
                    dashArray = "1, 2"
                }
                Boxes {
                    data = "boxData";
                    :box (_d) {
                        Rect.full  {
                            fill = fills[_d.pos]
                            stroke = "#003366"
                            x = 25%
                            width = 50%
                        }
                    }
                    :median(d) {
                        Line {x1 = 33%; x2 = 66%; stroke = "#800080"; dashArray = "2, 2"}
                    }

                    :mean(means) {
                        Line {x1 = 33%; x2 = 66%; stroke = "#ed2939"}
                    }

                    :outlier {

                    }
                    :whiskle (d) {
                        Line { x1 = 41.25%; x2 = 57.75%; y1 = 0; y2 = 0; stroke = "#000" }
                        Line { x1 = 41.25%; x2 = 57.75%; y1 = 100%; y2 = 100%; stroke = "#000" }
                        Line { x1 = 50%; x2 = 50%; y1 = 0; y2 = 100%; stroke = "#0078d7"; dashArray = "3, 2" }
                    }
                }
                Axis("bottom") { y = 100% }
                Axis("left") {}
            }
            XYPlot {
                height = 200
                width = 300
                padding-l = 30
                padding-r = 10
                padding-y = 20
                flip = true
                valueRange = [400, 1200]
                invertValueAxis = true
                data = { boxData }
                Rect { fill = "#ffffff"; stroke="#000000" }
                AxisBackground {
                    dashArray = "1,2"
                }
                AxisBackground {
                    orientation = "vertical"
                    includeEndTicks = true
                    dashArray = "1,2"
                }
                Boxes {
                    data = "boxData";
                    :box (_d) {
                        Rect.full  {
                            fill = "#00000000"
                            stroke = "#003366"
                            y = 25%
                            height = 50%
                        }
                    }
                    :median(d) {
                        Line {y1 = 33%; y2 = 66%; stroke = "#800080"; dashArray = "2, 2"}
                    }

                    :mean(means) {
                        Line {y1 = 33%; y2 = 66%; stroke = "#ed2939"}
                    }

                    :outlier(o) {
                        Circle.centered { r = 2; fill = "#ff4500" }
                    }
                    :whiskle (d) {
                        Line { y1 = 41.25%; y2 = 57.75%; x1 = 0; x2 = 0; stroke = "#000" }
                        Line { y1 = 41.25%; y2 = 57.75%; x1 = 100%; x2 = 100%; stroke = "#000" }
                        Line { y1 = 50%; y2 = 50%; x1 = 0; x2 = 100%; stroke = "#0078d7"; dashArray = "3, 2" }
                    }
                }
                Axis("bottom") { y = 100% }
                Axis("left") {}
            }
        }
        Columns {
            XYPlot {
                height = 200
                width = 300
                padding-l = 30
                padding-r = 10
                padding-y = 20
                valueRange = [400, 1200]
                data = { boxData }
                Rect { fill = "#ffffff"; stroke="#000000" }
                AxisBackground {
                    dashArray = "1, 2"
                }
                AxisBackground {
                    orientation = "vertical"
                    includeEndTicks = true
                    dashArray = "1, 2"
                }
                Boxes {
                    data = "boxData";
                    :box (notchData) {
                        Path {d = notchData.path; fill = fills[notchData.pos]}
                    }
                    :whiskle (d) {
                        Line { x1 = 15%; x2 = 85%; y1 = 0; y2 = 0; stroke = "#000" }
                        Line { x1 = 15%; x2 = 85%; y1 = 100%; y2 = 100%; stroke = "#000" }
                        Line { x1 = 50%; x2 = 50%; y1 = 0; y2 = 100%; stroke = "#0078d7"; dashArray = "3, 2" }
                    }
                }
                Axis("bottom") { y = 100% }
                Axis("left") {}
            }
            XYPlot {
                height = 200
                width = 300
                padding-l = 30
                padding-r = 10
                padding-y = 20
                data = { boxData }
                Rect { fill = "#aaa"; stroke="#fff" }
                AxisBackground {
                    stroke = "#fff"
                }
                AxisBackground {
                    orientation = "vertical"
                    includeEndTicks = true
                    stroke = "#fff"
                }
                Boxes {
                    data = "boxData";
                    :box (_d) {
                        Rect.full  {
                            fill = "#fff"
                            stroke = "#003366"
                            x = 25%
                            width = 50%
                        }
                    }
                    :median(d) {
                        Line {x1 = 25%; x2 = 75%; stroke = "#000"}
                    }
                    :outlier(o) {
                        Circle.centered { r = 2; fill = "#000" }
                    }
                    :whiskle (d) {
                        Line { x1 = 50%; x2 = 50%; y1 = 0; y2 = 100%; stroke = "#000" }
                    }
                }
                Axis("bottom") { y = 100% }
                Axis("left") {}
            }
            XYPlot {
                height = 200
                width = 300
                padding-l = 30
                padding-r = 10
                padding-y = 20
                flip = true
                invertValueAxis = true
                data = { boxData }
                Rect { fill = "#aaa"; stroke="#fff" }
                AxisBackground {
                    stroke = "#fff"
                }
                AxisBackground {
                    orientation = "vertical"
                    includeEndTicks = true
                    stroke = "#fff"
                }
                Boxes {
                    data = "boxData";
                    :box (_d) {
                        Rect.full  {
                            fill = "#fff"
                            stroke = "#003366"
                            y = 25%
                            height = 50%
                        }
                    }
                    :median(d) {
                        Line {y1 = 25%; y2 = 75%; stroke = "#000"}
                    }
                    :mean {
                    }
                    :outlier(o) {
                        Circle.centered { r = 2; fill = "#000" }
                    }
                    :whiskle (d) {
                        Line { y1 = 50%; y2 = 50%; x1 = 0; x2 = 100%; stroke = "#000" }
                    }
                }
                Axis("bottom") { y = 100% }
                Axis("left") {}
            }
        }
        Container { padding-y = 20; Text("Line Chart and Area Chart") { fontSize = 24 } }
        Columns {
            XYPlot {
                height = 200; width = 300; padding = 20
                data = { array, array2 }
                AxisBackground {}
                Dots {
                    data = "array"
                    Circle.centered { r = 4; fill = "#3d8eff" }
                    :links(d) {
                        Line {
                            x1 = d.from.x; y1 = d.from.y
                            x2 = d.to.x; y2 = d.to.y
                            stroke = "#aaa"
                            strokeWidth = 1
                        }
                    }
                }
                Dots {
                    data = "array2"
                    Circle.centered { r = 4; fill = "#ffb13d" }
                    :links(d) {
                        Line {
                            x1 = d.from.x; y1 = d.from.y
                            x2 = d.to.x; y2 = d.to.y
                            stroke = "#aaa"
                            strokeWidth = 1
                        }
                    }
                }
                Axis("bottom") { y = 100% }
                Axis("left") {}
            }
            XYPlot {
                height = 200; width = 300; padding = 20
                data = array
                hasPadding = false
                AxisBackground {}
                Area {}
                Dots {
                    :children (d) {
                        Circle.centered { r = 4; fill = "#3d8eff" }
                        Text {
                            anchor = @anchor("bottom", "center")
                            y = -6
                            text = d.value
                        }
                    }
                    :links(d) {
                        Line {
                            x1 = d.from.x
                            y1 = d.from.y
                            x2 = d.to.x
                            y2 = d.to.y
                            stroke = "#3d8eff"
                            strokeWidth = 2
                        }
                    }
                }
                Axis("bottom") { y = 100% }
                Axis("left") {}
            }
            Component {
                height = 200; width = 300;
                XYPlot.full {
                    padding = 20
                    hasPadding = false
                    data = array
                    Dots {
                        :children (d) {
                            Text { text = d.value; anchor = @anchor("bottom", "center"); y = -2; fill = "#aaa" }
                        }
                        :links(d) {
                            Line {
                                x1 = d.from.x; y1 = d.from.y
                                x2 = d.to.x; y2 = d.to.y
                                stroke = "#3d8eff"
                                strokeWidth = 1
                            }
                        }
                    }
                    Axis("right") { x = 100%; stroke = "#3d83ff" }
                }
                XYPlot.full {
                    padding = 20
                    hasPadding = false
                    data = array3.map(x => x * 10)
                    Dots {
                        :children (d) {
                            Text { text = d.value; anchor = @anchor("bottom", "center"); y = -2 }
                        }
                        :links(d) {
                            Line {
                                x1 = d.from.x; y1 = d.from.y
                                x2 = d.to.x; y2 = d.to.y
                                stroke = "#ffb13d"
                                strokeWidth = 2
                            }
                        }
                    }
                    Axis("bottom") { y = 100% }
                    Axis("left") { stroke = "#ffb13d"}
                }
            }
        }
        Columns {
            XYPlot {
                height = 200; width = 300; padding = 20
                data = array
                hasPadding = false
                AxisBackground {}
                Area { fill = "#ffb13d" }
                Axis("bottom") { y = 100% }
                Axis("left") {}
            }
            XYPlot {
                height = 200; width = 300; padding = 20
                data = array
                hasPadding = false
                invertValueAxis = true
                AxisBackground {}
                Area {}
                Axis("top") {}
                Axis("left") {}
            }
            XYPlot {
                height = 200; width = 300; padding = 20
                data = { array2, array3 }
                stackedData = { stacked: ["array2", "array3"] }
                hasPadding = false
                AxisBackground {}
                StackedArea {
                    data = "stacked"
                    :children (data) {
                        Path {
                            d = data.path
                            fill = data.key === "array3" ? "#ffb13d" : "#3d8eff"
                        }
                    }
                }
                Axis("bottom") { y = 100% }
                Axis("left") {}
            }
        }
        Container { padding-y = 20; Text("Scatter Plot and Linear Regression") { fontSize = 24 } }
        Columns {
            @let scatterData2 = [
                [655, 850, 940, 985, 985, 985, 986, 1070],
                [760, 800, 845, 885, 960],
                [780, 840, 855, 880, 940],
                [720, 767.5, 815, 865, 920],
                [740, 807.5, 810, 870, 950]
            ]
            XYPlot {
                width = 300
                height = 300
                padding-l = 30
                padding-r = 10
                padding-y = 20
                valueRange = [600, 1200]
                data = scatterData2
                Rect { fill = "#f4f4f4" }
                AxisBackground {}
                Scatters1D {
                    fill = "#3d83ff"
                }
                Axis("bottom") { y = 100% }
                Axis("left") {}
            }
            // @let residual_data = [[0, -10, 6], [30, 21.4, 41.2], [50, 42.3, 51], [80, 76, 84], [100, 90, 102]]
            XYPlot {
                height = 300; width = 600; padding = 20
                data = {scatter_data, residual_data, regression_data}
                hasPadding = false
                discreteCategory = false
                dataHandler = {
                    scatter_data: {
                        pos: d => d[0],
                        min: d => 0,
                        value: d => d[1],
                    },
                    residual_data: {
                        pos: d => d[0],
                        min: d => d[1],
                        value: d => d[2],
                    },
                    regression_data: {
                        pos: d => d[0],
                        min: d => 0,
                        value: d => d[1],
                    }
                }
                Axis("bottom") { y = 100% }
                Axis("left") {}
                AxisBackground {}
                Area {
                    data = "residual_data"
                    fill = "red"
                    pathOptions = {
                        fillOpacity: 0.5
                    }
                }
                Dots {
                    data = "scatter_data"
                    Circle.centered { r = 1; fill ="#3d83ff" }
                }
                Polyline {
                    points = @scaled(regression_data)
                    color = "red"
                }
                // Dots {
                //     data = "regression_data"
                //     :links(d) {
                //         Line {
                //             x1 = d.from.x; y1 = d.from.y
                //             x2 = d.to.x; y2 = d.to.y
                //             stroke = "#ff3d8b"
                //             strokeOpacity = 0.7
                //             strokeWidth = 2
                //         }
                //     }
                //     :children(d) {}
                // }
            }
        }
        Container { padding-y = 20; Text("Heatmap") { fontSize = 24 } }
        Columns {
            @let heatmapData = [
                [10, 5, 4, 12, 6, 7, 9, 4, 8, 6, 10, 2],
                [3, 4, 8, 3, 10, 1, 2, 8, 9, 4, 9, 3],
                [5, 1, 8, 9, 4, 9, 3, 11, 7, 4, 7, 9],
                [3, 2, 9, 8, 6, 10, 2, 8, 3, 5, 1, 2],
                [3, 4, 8, 3, 10, 1, 2, 8, 8, 6, 10, 2],
                [10, 5, 4, 12, 6, 7, 9, 4, 12, 2, 8, 3],
                [3, 4, 8, 3, 10, 1, 2, 8, 8, 6, 10, 2],
                [5, 1, 8, 9, 4, 9, 3, 11, 4, 8, 8, 9],
                [5, 1, 8, 9, 4, 9, 3, 11, 7, 4, 7, 9],
                [3, 2, 9, 8, 6, 10, 2, 8, 9, 2, 3, 2],
                [10, 5, 4, 12, 6, 7, 9, 4, 12, 2, 8, 3],
                [3, 4, 8, 3, 10, 1, 2, 8, 9, 4, 9, 3]
            ]
            HeatMap {
                height = 300; width = 300; padding-r = 40; padding-y = 20
                data = heatmapData
            }
            HeatMap {
                height = 300; width = 300; padding-r = 40; padding-y = 20
                data = heatmapData
                startColor = "#2a8"
                endColor = "#0ad"
            }
            HeatMap {
                height = 300; width = 300; padding-r = 40; padding-y = 20
                data = heatmapData
                startColor = "#eee"
                endColor = "#333"
            }
        }
        Container { padding-y = 20; Text("Pie Chart and Donut Chart") { fontSize = 24 } }
        Columns {
            @let pieData = [{ value: 6, name: "A" }, { value: 5, name: "B" }, { value: 2, name: "C" }]
            PieChart {
                height = 200; width = 300; padding = 20
                data = pieData
                pieProps = {
                    stroke: "#fff"
                }
                :label (d) {
                    Text.centered {
                        text = d.data.name + ": " + d.data.percentage.toFixed(1) + "%"
                    }
                }
                :legend (d) {
                    Legend {
                        x = 220
                        data = d
                    }
                }
            }
            PieChart {
                height = 200; width = 300; padding = 20
                data = pieData
                innerRadius = 50
                pieProps = {
                    pad: 0.04
                }
                :label (d) {
                    Text.centered {
                        text = d.data.name + ": " + d.data.percentage.toFixed(1) + "%"
                    }
                }
            }
            PieChart {
                height = 200; width = 300; padding = 20
                data = [{ value: 6, name: "A" }]
                totalValue = 20
                pieProps = {
                    stroke: "#fff"
                }
                :background {
                    Circle.centered {
                        r = 100%+1
                        fill = "none"
                        stroke = "#999"
                    }
                }
            }
        }
        Container { padding-y = 20; Text("Radar Chart") { fontSize = 24 } }
        Columns {
            @let radarData = [
                {key: "A", values: [606, 565, 576, 33, 805]},
                {key: "B", values: [993, 119, 915, 303, 395]},
                {key: "C", values: [861, 523, 594, 197, 527]},
                {key: "D", values: [275, 248, 873, 712, 312]},
                {key: "E", values: [465, 118, 0, 185, 339]}
            ]
            RadarChart {
                height = 300; width = 300
                padding = 20
                data = radarData
                categories = ["First", "Second", "Third", "Fourth", "Fifth"]
                :legend (d) {
                    Legend {
                        data = d
                    }
                }
            }
            RadarChart {
                height = 300; width = 300
                padding = 20
                data = radarData
                categories = ["First", "Second", "Third", "Fourth", "Fifth"]
                area.fill = "none"
                :legend (d) {
                    Legend {
                        data = d
                    }
                }
            }
        }
        Container { padding-y = 20; Text("Custom Plot Content") { fontSize = 24 } }
        Columns {
            XYPlot {
                height = 200; width = 300; padding = 20
                data = array3
                hasPadding = false
                Rect { fill = "#eee" }
                Area { fill = "#ccc" }
                Text("Label") { x = 50%; y = 100%; anchor = @anchor("top", "center") }
                Text("Label") { x = 50%; y = 0; anchor = @anchor("bottom", "center") }
                Component {
                    x = 0; y = 50%
                    rotation = @rotate(-90)
                    Text("Label") { anchor = @anchor("bottom", "center") }
                }
                Component {
                    x = 100%; y = 50%
                    rotation = @rotate(90)
                    Text("Label") { anchor = @anchor("bottom", "center") }
                }
                Circle.centered {
                    x = 50%; y = 50%; r = 40; fill = "#ffb13d"
                }
                Component.full {
                    @let eyeR = 15
                    coord = "polar"
                    Circle.centered {
                        x = -45; y = eyeR; r = 6; fill = "#555"
                    }
                    Circle.centered {
                        x = 45; y = eyeR; r = 6; fill = "#555"
                    }
                    ArcLine {
                        x1 = 135; x2 = 225; r = 20; stroke = "#555"; strokeWidth = 4
                    }
                }
            }
        }
        Container { padding-y = 20; Text("Custom Components") { fontSize = 24 } }
        Clock {
            height = 200; width = 300; padding = 20
        }
    }
}
`;
