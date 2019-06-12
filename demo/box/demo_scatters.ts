export default `//bvt
svg {
    width = auto
    height = 1200

    @let scatter_data = [
        [655, 850, 940, 985, 985, 985, 986, 1070],
        [760, 800, 845, 885, 960],
        [780, 840, 855, 880, 940],
        [720, 767.5, 815, 865, 920],
        [740, 807.5, 810, 870, 950]
    ]

    XYPlot {
        height = 300
        padding-x = 40
        padding-y = 20
        data = { scatter_data }
        Rect { fill = "#f4f4f4" }
        AxisBackground {}
        Scatters1D {
            data = "scatter_data"
        }
        Axis("bottom") { y = 100% }
        Axis("left") {}
    }
}
`;
