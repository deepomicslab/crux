export default `//bvt
svg {
    height = 1100;
    width = 1300;
    Component {
        TopDownTree {
            height = 200;
            width = 790;
            x = 210;
            data = data1;
            lineType = "cluster";
            textOffsetY = 700;
            displayNode = false;
        }
        TopDownTree {
            height = 700;
            width = 200;
            y = 200;
            data = data2;
            direction = "left";
            lineType = "cluster";
            displayNode = false;
            textOffsetX = 790;
        }
        HeatMap {
            y = 210;
            x = 210;
            height = 690;
            width = 790;
            data = data;
            startColor = "#77DDFF";
            endColor = "#8a1515";
        }
    }
}
`;
