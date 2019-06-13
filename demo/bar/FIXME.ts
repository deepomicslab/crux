export default `//bvt
svg {
    width = auto
    height = 1800

    @let errData1 = [
        [1, 20],
        [3, 11],
        [5, 100], 
        [4, 32], 
        [7, 34], 
        [10, 53]
    ]

    @let errData2 = [
        [1, 20],
        [3, 11],
        [5, 100], 
        [-8, 32], 
        [-4, -14], 
        [-2, -33]
    ]

    Rows {
        Columns {
            XYPlot {
                // FIXME: When the x-axis are numbers, the bars cannot align properly
                height = 300; width = 400; padding = 20
                data = errData1
                pivot = 0
                // valueRange = [-80, 120]
                dataHandler = {
                    default: {
                        values: d => d,
                        min: d => 0, 
                        value: d => d[1], 
                        pos: d => d[0]
                    }
                }
                AxisBackground; 
                Bars {
                    :children (d) {
                        Rect.full { 
                            width = 2
                            fill = "#000"
                        }
                    }
                }
                Axis("bottom") { y = 100% }
                Axis("left");
            }
            XYPlot {
                height = 300; width = 400; padding = 20
                data = errData2
                // FIXME: As we have discussed, there should be 
                // a base line at the middle of the image. I think 
                // the prop should belongs to XYPlot and tried to 
                // modify xy-plot.ts file. But there is something 
                // wrong with the verticle axis when there are 
                // negative values. As arbitrary modifications may 
                // increase your work load while merging the files, 
                // I revert the corresponding components (xy-plot 
                // and axis) to the main branch version. 
                valueRange = [-80, 120]
                dataHandler = {
                    default: {
                        values: d => d,
                        min: d => 0, 
                        value: d => d[1], 
                        pos: d => d[0]
                    }
                }
                AxisBackground; 
                Bars {
                    :children (d) {
                        Rect.full { 
                            width = 2
                            fill = "#000"
                        }
                    }
                }
                Axis("bottom") { y = 100% }
                Axis("left");
            } 
        }
    }
}
`;