export default `//bvt
svg {
    width = auto
    height = 1800
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

}
`;
