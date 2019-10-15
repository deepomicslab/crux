export default `//bvt
canvas {
    width = auto
    height = 1200

    @let array = [1, 3, 8, 6, 5, 4, 2, 7, 3]
    @let array2 = [6, 4, 3, 2, 4, 9, 1, 5, 8]
    @let array3 = [3, 7, 2, 5, 6, 5, 7, 3, 4]
    @let array4 = [[3, 4], [4, 7], [6, 9], [2, 5], [1, 2]]
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
        ]
    }

    Rows {
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
                            cursor = "pointer"
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
                height = 200; width = 300; padding = 20
                data = array
                invertValueAxis = true
                AxisBackground;
                Bars;
                Axis("top");
                Axis("left");
            }
            XYPlot {
                height = 200; width = 300; padding = 20
                data = array
                flip = true
                invertValueAxis = true
                AxisBackground { orientation = "vertical" }
                Bars;
                Axis("top");
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
        }
        Columns {
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
            XYPlot {
                height = 200; width = 300; padding = 20
                data = { boxData }
                valueRange = [400, 1200]
                Rect { fill = "#efefef" }
                AxisBackground {}
                Boxes {
                    data = "boxData";
                }
                Axis("bottom") { y = 100% }
                Axis("left") {}
            }
            XYPlot {
                height = 200; width = 300; padding = 20
                data = { boxData }
                valueRange = [400, 1200]
                Rect { fill = "#efefef" }
                AxisBackground {}
                Boxes {
                    data = "boxData";
                    :box (d) {
                        Rect.full {
                            fill = "#3d8eff"
                        }
                    }
                    :whiskle (d) {
                        Rect {
                            x = 10%; width = 80%; height = 100%
                            fill = "#8db3e8"
                        }
                    }
                    :median (d) {
                        Circle.centered { r = 4; x = 50%; fill = "#ffb13d" }
                        Line { x1 = 0; x2 = 100%; y1 = 0; y2 = 0; stroke = "#ffb13d"; dashArray = "2,2" }
                    }
                    :outlier {
                        Circle.centered { r = 2; fill = "#777" }
                    }
                }
                Axis("bottom") { y = 100% }
                Axis("left") {}
            }
        }
        Columns {
            XYPlot {
                height = 200; width = 600; padding = 20
                data = { array, array2, array3 }
                AxisBackground {}
                GroupedBars {
                    data = ["array", "array2", "array3"]
                    :children (data) {
                        Rect {
                            x = 1
                            width = 100%-2
                            height = 100%
                            fill = { array: "#ff3d8b", array3: "#ffb13d", array2: "#3d8eff" }[data.key]
                            stroke = "#777"
                            cornerRadius = 6
                        }
                    }
                    :group (d) {
                        Rect.full {
                            fill = "rgba(200,200,200,." + (d.array.pos % 2 === 0 ? "3" : "8") + ")"
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
        Columns {
            @let pieData = [{ value: 6 }, { value: 5 }, { value: 2 }]
            PieChart {
                height = 200; width = 300; padding = 20
                data = pieData
                :children (d) {
                    Arc {
                        x1 = d.start; x2 = d.end; r1 = 0; r2 = 80
                        fill = ["#ff3d8b", "#3d8eff", "#ffb13d"][d.index]
                    }
                    Text.centered {
                        x = (d.start + d.end) * 0.5;
                        y = 40;
                        text = d.data.value
                    }
                }
            }
            PieChart {
                height = 200; width = 300; padding = 20
                data = pieData
                :children (d) {
                    Arc {
                        x1 = d.start; x2 = d.end; r1 = 60; r2 = 80
                        pad = 0.02
                        fill = ["#ff3d8b", "#3d8eff", "#ffb13d"][d.index]
                    }
                }
            }
            PieChart {
                height = 200; width = 300; padding = 20
                data = pieData
                :children (d) {
                    Arc {
                        x1 = d.start; x2 = d.end; r1 = 40; r2 = 80
                        pad = 0.04
                        fill = "#aaa"
                    }
                    PieChart {
                        height = 200; width = 300; padding = 20
                        startAngle = d.start; endAngle = d.end
                        data = pieData
                        :children (d) {
                            Arc {
                                x1 = d.start; x2 = d.end; r1 = 40; r2 = 80
                                pad = 0.04
                                fill = ["#ff3d8b", "#3d8eff", "#ffb13d"][d.index]
                            }
                        }
                    }
                }
            }
            Clock {
                height = 200; width = 300; padding = 20
            }
        }
    }
}
`;
