export default `//bvt
svg {
    width = auto
    height = 1800

    @let heatmapData = [
        [10, 5, 4, 12, 6, 7, 9, 4],
        [3, 4, 8, 3, 10, 1, 2, 8],
        [5, 1, 8, 9, 4, 9, 3, 11],
        [3, 2, 9, 8, 6, 10, 2, 8],
        [10, 5, 4, 12, 6, 7, 9, 4],
        [3, 4, 8, 3, 10, 1, 2, 8],
        [5, 1, 8, 9, 4, 9, 3, 11],
        [3, 2, 9, 8, 6, 10, 2, 8]
    ]

    Rows {
        Columns {
            XYPlot {
                height = 400; width = 400; padding = 20
                data = heatmapData
                @let xnum = heatmapData.length
                @let ynum = heatmapData[0].length
                valueRange = [0, ynum]
                HeatMap;
            }
            XYPlot {
                height = 400; width = 400; padding = 20
                data = heatmapData
                @let xnum = heatmapData.length
                @let ynum = heatmapData[0].length
                valueRange = [0, ynum]
                HeatMap {
                    colorMap = "grey"
                }
            }
        }
    }
}
`;
