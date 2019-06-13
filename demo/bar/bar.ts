export default `//bvt
svg {
    width = auto
    height = 1800

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

    @let array = [1, 3, 8, 6, 5, 4, 4, 7, 3]
    @let array2 = [6, 4, 3, 2, 4, 9, 8, 5, 8]
    @let array3 = [3, 7, 2, 5, 6, 5, 7, 3, 4]

    Rows {
        Columns {
            XYPlot {
                discreteCategory = true
                height = 300; width = 400; padding = 20
                data = barData
                AxisBackground;
                Bars;
                Axis("bottom") { y = 100% }
                Axis("left");
            }
            XYPlot {
                discreteCategory = true
                height = 300; width = 400; padding = 20
                data = barData
                flip = true
                invertValueAxis = true
                AxisBackground { orientation = "vertical" }
                Bars;
                Axis("bottom") { y = 100% }
                Axis("left");
            }
            XYPlot {
                height = 300; width = 400; padding = 20
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
                    pivot = null
                    :children (d) {
                        Rect {
                            anchor = @anchor("top", "center")
                            x = 50%
                            width = 2
                            height = 100%
                            fill = "#f66"
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
                height = 300; width = 400; padding = 20
                data = { array, array2, array3 }
                @let data = { array, array2 }
                AxisBackground;
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
                Axis("bottom") {
                    y = 100%
                }
                Axis("left");
            }
            Rows {
                height = 300; width = 400
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
                height = 300; width = 400; padding = 20
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
            XYPlot {
                height = 300; width = 400; padding = 20
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
        }
    }
}
`;
