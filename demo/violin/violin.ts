export default `//bvt
svg {
    width = auto
    height = 600
    // @let leftData = result.result[0]
    // @let rightData = result.result[1]
    // @let colorArray = Object.values(result.c.colors)
    Component {
        XYPlot {
            height = 400; width = 500
            padding-l = 40; padding-y = 20
            valueRange = [-20,70]
            data = { result }
            // dataHandler = {
            //     default: {
            //         values: d => d.values,
            //         pos: d => d[0],
			// 		min: d => d[1],
			// 		value: d => d[2],
            //     }
            // }
            // flip = true
            // invertValueAxis = true
            Rect { fill = "#efefef" }
            Violins {
                data = "result"
                equalMaxCount = "cat"
                // split = true
                // cut = true
                // dataLine = false
                // quartile = false
                // extremeLine = false
                // half = "left"
                fill = ["red", "blue", "green", "yellow"]
            }
            Axis("bottom") { y = 100% }
            Axis("left") { includeEndTicks = false }
            Text {
                text = xlabel
                x = 50%; y = @geo(100, 15)
                anchor = @anchor("top", "center")
            }
            Component {
                x = -25; y = 50%
                rotation = @rotate(-90)
                Text {
                    text = ylabel
                    anchor = @anchor("bottom", "center")
                }
            }
        }
        // Legend {
        //     x = 500; y = 20
        //     data = result.c.legendData()
        // }
    }
}`;
