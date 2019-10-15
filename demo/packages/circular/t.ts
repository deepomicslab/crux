export default `//bvt
svg {
    width = 800
    height = 800
    Component {
        coord = "polar"
        width = 800
        height = 800
        yScale = @scaleLinear(0, 100)
        Arc {
            x1 = 0; r2 = 40
            y1 = 10; r2 = 50
            fill = "#66c"
        }
        Circle.centered {
            x = 135; y = 60; r = 2
            fill = "red"
        }
        ArcLine {
            x1 = 45; x2 = 135; r = 60
            stroke = "#000"
        }
        RadicalLine {
            x = 270; r1 = 10; r2 = 100;
            stroke = "#000"
        }
    }
}
`;
