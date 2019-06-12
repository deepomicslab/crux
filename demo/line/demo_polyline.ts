export default `//bvt
svg {
    width = auto
    height = 1280
    @let data = [[88, 10], [26, 72], [43, 99], [26, 70], [39, 91], [16, 67], [99, 69], [90, 71], [63, 52], [64, 22]]
    XYPlot {
        height = 1280; width = 100%; padding = 20; hasPadding = false
        data = { data }
        Component {
            data = "data"
            Polyline {
                points = data
            }
        }
    }
}
`;
