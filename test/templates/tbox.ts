export default `
svg {
    width = auto
    height = 1200

    @let array = [1, 3, 8, 6, 5, 4, 2, 7, 3]
    @let array2 = [6, 4, 3, 2, 4, 9, 1, 5, 8]
    @let array3 = [3, 7, 2, 5, 6, 5, 7, 3, 4]
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
        ]
    }

    Rows {
        XYPlot {
            height = 300
            width = 500
            padding-y = 20
            padding-l = 40
            data = { boxData }
            Rect { fill = "#efefef" }
            AxisBackground {}
            Boxes {
                data = "boxData";
                :outlier {
                    Circle.centered { r = 2; fill = "red" }
                }
                :box {
                    Rect.full { stroke = "#000" }
                }
                :whiskle {
                    Line { x1 = 0; x2 = 100%; y1 = 0; y2 = 0; stroke = "#000" }
                    Line { x1 = 0; x2 = 100%; y1 = 100%; y2 = 100%; stroke = "#000" }
                    Line { x1 = 50%; x2 = 50%; y1 = 0; y2 = 100%; stroke = "#000" }
                }
                :median {
                    Line { x1 = 0; x2 = 100%; y1 = 0; y2 = 0; stroke = "#000" }
                }
            }
            Axis("bottom") { y = 100% }
            Axis("left") {}
        }
    }
}
`;
