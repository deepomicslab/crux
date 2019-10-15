export default `//bvt
svg{
    width = auto
    height = 1280
    XYPlot {
        height = 600; width = 100%; padding = 20
        data = {scatterData, residualData, regressionData}
        hasPadding = false
        discreteCategory = false
        dataHandler = {
            scatter_data: {
                pos: d => d[0],
                min: d => 0,
                value: d => d[1],
            },
            residual_data: {
                pos: d => d[0],
                min: d => d[1],
                value: d => d[2],
            },
            regression_data: {
                pos: d => d[0],
                min: d => 0,
                value: d => d[1],
            }
        }
        Axis("bottom") { y = 100% }
        Axis("left") {}
        AxisBackground {}
        Area {
            data = "residualData"
            fill = "red"
            pathOptions = {
                fillOpacity: 0.5
            }
        }
        Dots {
            data = "scatterData"
            // r = 1
            // fill = "blue"
            Circle.centered { r = 2; fill ="#3d83ff" }
        }
        Polyline {
            points = @scaled(regressionData)
            color = "red"
        }
    }
}
`;
