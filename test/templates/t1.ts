export default `//bvt
svg {
    width = auto
    height = 1200

    @let array = [1, 3, 8, 6, 5, 4, 2, 7, 3]
    @let array2 = [6, 4, 3, 2, 4, 9, 1, 5, 8]
    @let array3 = [3, 7, 2, 5, 6, 5, 7, 3, 4]

    Component {
        width = 800
        height = 600
        coord = "polar"
        Rect {
            anchor = @anchor(middle, center)
            width = 100%
            height = 100%
            fill = "none"
            stroke = "#000"
        }
        Circle {
            anchor = @anchor(middle, center)
            r = 300
            fill = "#ccc"
        }
        Circle.centered { r = 2; fill = "blue" }
        Component {
            Rect.centered {
                x = 45; y = 100;
                width = 10; height = 10; fill = "red"
            }
        }
        Component {
            x = 45; y = 100;
            width = 200; height = 150;
            coord = "cartesian"
            Rect.full.centered {
                stroke = "#000"
                fill = "none"
            }
        }
    }
}
`;

const a = 1;
