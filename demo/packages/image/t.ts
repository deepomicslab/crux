export default `//bvt
svg {
    width = auto
    height = 800
    Component {
        x = 40
        y = 20
        Rect {
            x = 20
            y = 20
            fillOpacity = "1"
            stroke = "blue"
            strokeWidth = 2
            width = 100
            height = 80
        }
        Image {
            @expr console.log(image)
            width = 100; height = 100
            url = image
        }
        Line {
            x = 100
            // x1 = 0
            y1 = 0
            // x2 = 150
            y2 = 200
            strokeWidth = 2
            dashArray = "4,4"
        }
        Arrow {
            x = 100
            y = 20
            x2 = 160
            y2 = 0
            line.dashArray = "2,2"
        }
    }
}
`;
