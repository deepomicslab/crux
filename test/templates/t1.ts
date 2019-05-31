export default `//bvt
svg {
    width = auto
    height = 1200

    @let array = [1, 3, 8, 6, 5, 4, 2, 7, 3]
    @let array2 = [6, 4, 3, 2, 4, 9, 1, 5, 8]
    @let array3 = [3, 7, 2, 5, 6, 5, 7, 3, 4]

    Rows {
        XYPlot {
            height = 300
            width = 500
            padding-y = 20
            padding-x = 20
            data = { array, array2, array3 }
            stackedData = { stacked: ["array2", "array3"] }
            Rect { fill = "#efefef" }
            AxisBackground {}
            StackedBars {
                data = "stacked"
                :children (data) {
                    Rect.full {
                        fill = data.key === "array2" ? "green" : "yellow"
                    }
                }
            }
            Bars {
                data = "array3"
                :children(data) {
                    Rect {
                        width = 100%; height = 100%
                        fill = "red"
                        stage:active {
                            fill = "green"
                        }
                        on:click = $el.setStage($el.stage ? null : "active")
                        on:mouseenter = $el.setStage("active")
                        on:mouseleave = $el.setStage(null)
                    }
                    Text {
                        text = "Value:" + data.value
                    }
                }
            }
            Axis("bottom") { y = 100% }
            Axis("left") {}
        }
        XYPlot {
            height = 300
            width = 500
            padding-y = 20
            padding-x = 20
            data = { array, array2, array3 }
            invertValueAxis = true
            Rect { fill = "#efefef" }
            GroupedBars {
                data = ["array", "array2", "array3"]
                Rect.full { fill = "grey"; stroke = "blue" }
                Circle.centered { x = 50%; y = 50%; r = 4; fill = "blue" }
            }
            Axis {
                orientation = "top"
            }
            Axis {
                x = 100%
                orientation = "right"
            }
        }
        XYPlot {
            height = 300
            width = 500
            padding-y = 20
            padding-x = 20
            data = array
            flip = true
            invertValueAxis = true
            Rect { fill = "#efefef" }
            Bars {
                Rect { width = 100%; height = 100% }
            }
            Dots {
                Circle.centered { r = 4; fill = "blue" }
                :links(d) {
                    Line {
                        x1 = d.from.x
                        y1 = d.from.y
                        x2 = d.to.x
                        y2 = d.to.y
                        stroke = "red"
                        strokeWidth = 4
                    }
                }
            }
            Axis {
                orientation = "top"
            }
            Axis {
                orientation = "left"
            }
        }
    }
}
`;

const a = 1;
