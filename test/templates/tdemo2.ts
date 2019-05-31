export default `//bvt
svg {
    width = auto
    height = 800
    Component {
        @let data1 = [1, 2, 3, 4, 5]
        @let data2 = [6, 2, 4, 2, 1]
        XYPlot {
            width = 300
            height = 200
            padding = 20
            data = { data1, data2 }
            stackedData = {
                "stacked": ["data1", "data2"]
            }
            valueRange = [0, 10]
            Rect { fill = "#ccc" }
            StackedBars {
                data = "stacked"
                :children (d) {
                    Rect.full { fill = d.key == "data1" ? "red" : "blue" }
                    Circle.centered { x = 50%; y = 50%; r = 2; fill ="#fff" }
                }
                :overlay (d) {
                    Text { text = "aaaaaaaaaaaaaaaa" }

                }
            }
            Axis("bottom") { y = 100% }
            Axis("left") {}
            Axis("right") { x = 100% }
        }
    }
}
`;
