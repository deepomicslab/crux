export default `//bvt
svg {
    width = auto
    height = 1200

    Component {
        Text {
            text = "Categorial Scatterplot"
            anchor = @anchor("top", "center")
            x = 50%
        }
        XYPlot {
            height = 300
            padding-x = 40
            padding-y = 20
            data = { scatterData }
            dataHandler = {
                scatterData: {
                    pos: d => d.key,
                    min: d => 0,
                    value: d => Math.max(...d.values),
                },
            }
            Rect { fill = "#f4f4f4" }
            AxisBackground {}
            Scatters1D {
                data = "scatterData"
            }
            Axis("bottom") { y = 100% }
            Text {
                text = "x_axis_label"
                x = 50%; y = 100%+15
                anchor = @anchor("top", "center")
            }
            Axis("left") {}
            Component {
                x = -25; y = 50%
                rotation = @rotate(-90)
                Text {
                    text = "y_axis_label"
                    anchor = @anchor("bottom", "center")
                }
            }
        }
    }
}
`;
