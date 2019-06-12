export default `//bvt
svg{
    width = auto
    height = 1280
    @let residual_data = [[0, -10, 6], [30, 21.4, 41.2], [50, 42.3, 51], [80, 76, 84], [100, 90, 102]]
    XYPlot {
        height = 200; width = 100%; padding = 20
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
            fill = "#bbb"
            pathOptions = {
                fillOpacity: 0.5
            }
        }
        Dots {
            data = "scatter_data"
            r = 2
            fill = "blue"
        }
        Dots {
            data = "regression_data"
            :links(d) {
                Line {
                    x1 = d.from.x; y1 = d.from.y
                    x2 = d.to.x; y2 = d.to.y
                    stroke = "red"
                    strokeWidth = 2
                }
            }
            :children(d) {}
        }
    }
}
`;
