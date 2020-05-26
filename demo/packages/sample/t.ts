export default `//bvt
svg {
    width = auto
    height = 800

    // Tree {
    //     width = 800
    //     height = 800
    //     r = 300
    //     data = treeData
    //     direction = "radical"
    //     link.stroke = "#aaa"
    //     link(:active).stroke = "#555"
    //     link(:active).strokeWidth = 2
    //     link.on:mouseenter = $el.stage = "active"
    //     link.on:mouseleave = $el.stage = null
    // }

    Component {
        x = 40
        y = 20
        Rect {
            x = 20
            y = 20
            fillOpacity = 1
            stroke = "blue"
            strokeWidth = 2
            width = 100
            height = 80
            fill = @gradient("fill", 90, "#f00", "#ff0")
        }
        Component {
            x = 70; y = 60
            Circle {
                anchor = @anchor("middle", "center")
                fill = "yellow"
                r = 30
                stroke = "blue"
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
            Triangle {
                x = 100; y = 0
                anchor = @anchor("center", "bottom")
            }
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
