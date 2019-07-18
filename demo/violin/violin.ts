export default `//bvt
svg {
    width = auto
    height = 1000

    @let violinData = {
        //bin: value, count
        values: [
            [655, 1070],
            [760, 960],
            [780, 940],
            [720, 920],
            [740, 950],
        ],
        bins: [
            [[655, 1], [850, 2], [940, 5] , [980, 3], [1070, 2]],
            [[760, 1], [800, 5], [845, 2], [885,3], [960, 2]],
            [[780, 1], [840, 1], [855, 3], [880, 5], [940, 2]],
            [[720, 1], [767.5, 2], [815, 5], [865, 3], [920,2]],
            [[740, 1], [807.5, 2], [810, 3], [870, 5], [950,2]],
        ],
        means: [
            899, 850, 859, 817.5, 835.5
        ],
        quartiles: [
            [940, 940, 980],
            [800, 845, 885],
            [855, 880, 880],
            [815, 815, 865],
            [810, 870, 870],
        ],
    }

    XYPlot {
        height = 500
        width = 500
        padding-y = 20
        padding-l = 40
        flip = true
        invertValueAxis = true
        data = { violinData }
        Rect { fill = "#efefef" }
        AxisBackground {
            dashArray = "2, 2"
        }
        AxisBackground {
            orientation = "vertical"
            dashArray = "2, 2"
            includeEndTicks = true
        }
        Violins {
            data = "violinData"
            dataLine = true
            quartile = true
        }
        Axis("bottom") { y = 100% }
        Axis("left") {}
    }
}
`;
