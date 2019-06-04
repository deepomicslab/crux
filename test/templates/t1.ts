export default `//bvt
svg {
    width = auto
    height = 600

    @let array = [1, 3, 8, 6, 5, 4, 2, 7, 3]
    @let array2 = [6, 4, 3, 2, 4, 9, 1, 5, 8]
    @let array3 = [3, 7, 2, 5, 6, 5, 7, 3, 4]
    Component {
        @let data = [
            [150, 490], [420, 830], [800, 260], [600, 80]
        ]
        xScale = @scale-linear(0, 1000)
        yScale = @scale-linear(0, 1000)
        coord = "polar"
        Circle.centered {
            r = 100; fill = "#ddd"
        }
        Circle.centered {
            r = 4; fill = "red"
        }
        Component {
            @for (item, index) in data {
                Circle.centered {
                    key = index
                    x = @scaled-x(item[0])
                    y = @scaled-y(item[1])
                    r = 4
                    fill = "green"
                }
            }
        }
    }

}
`;

const a = 1;
