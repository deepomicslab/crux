export default `//bvt
svg {
    width = auto
    height = 1200

    @let array = [1, 3, 8, 6, 5, 4, 2, 7, 3]
    @let array2 = [6, 4, 3, 2, 4, 9, 1, 5, 8]
    @let array3 = [3, 7, 2, 5, 6, 5, 7, 3, 4]
    @let array4 = [[3, 4], [6, 9], [2, 5], [1, 2]]

    Rows {
        XYPlot {
            height = 300
            width = 500
            padding = 20
            hasPadding = false
            data = { array, array2, array3 }
            stackedData = { stacked: ["array2", "array3"] }
            Rect { fill = "#efefef" }
            AxisBackground {}
            StackedArea {
                data = "stacked"; fill = "red"
                :children(d) {
                    Path {
                        d = d.path
                        fill = d.key === "array2" ? "green" : "yellow"
                    }
                }
            }
            Axis("bottom") { y = 100% }
            Axis("left") {}
        }
        XYPlot {
            height = 300
            width = 500
            padding = 20
            hasPadding = false
            data = array4
            Area;
            Axis("bottom") { y = 100% }
            Axis("left") {}
        }
    }
}
`;
