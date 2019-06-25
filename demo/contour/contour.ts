export default `//bvt
svg {
    width = auto
    height = 1200

    Rows {
        Columns {
            XYPlot {
                height = 500; width = 600; padding = 20
                data = contour_density_data
                dataHandler = {
                    default: {
                        pos: d => d[0],
                        min: d => 0,
                        value: d => d[1],
                    }
                }
                valueRange = [40, 100]
                ContourDensity {
                    bandWidth = 40
                }
                Dots {
                    Circle.centered { r = 2; fill = "#3d83ff" }
                }
            }
            XYPlot {
                height = 500; width = 600; padding = 20
                data = contour_density_data
                dataHandler = {
                    default: {
                        pos: d => d[0],
                        min: d => 0,
                        value: d => d[1],
                    }
                }
                valueRange = [40, 100]

                ContourDensity {
                    withColor = true
                    bandWidth = 40
                }
                Dots {
                    Circle.centered { r = 2; fill = "#3d83ff" }
                }
            }
        }
        Columns {
            XYPlot {
                height = 500; width = 600; padding = 20
                data = contour_data
                dataHandler = {
                    default: {
                        pos: d => d[0],
                        min: d => 0,
                        value: d=> d[1],
                    }
                }
                valueRange = [40, 100]

                Axis("left") {}
                Contour {
                    size = [256, 256]
                    thresholds = contour_thresholds
                }
            }
            XYPlot {
                height = 500; width = 600; padding = 20
                data = contour_data
                dataHandler = {
                    default: {
                        pos: d => d[0],
                        min: d => 0,
                        value: d=> d[1],
                    }
                }
                valueRange = [40, 100]

                Axis("left") {}
                Contour {
                    size = [256, 256]
                    withColor = true
                    colorScale = "log"
                    thresholds = contour_thresholds
                }
            }
        }
    }
}
`;