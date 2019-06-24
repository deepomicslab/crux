export default `//bvt
svg{
    width = auto
    height = 1280
    XYPlot {
        height = 600; width = 100%; padding = 20
        data = {scatter_data, residual_data, regression_data}
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
            data = "residual_data"
            fill = "red"
            pathOptions = {
                fillOpacity: 0.5
            }
        }
        Scatter {
            data = "scatter_data"
            r = 1
            fill = "blue"
        }
        Polyline {
            points = @scaled(regression_data)
            color = "red"
        }
    }
}
`;
