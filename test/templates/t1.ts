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
        Legend {
            width = 200
            data = [
                { label: "Data 1", fill: "red" },
                { label: "Data 2", type: "circle" },
                { label: "Data 3", type: "line" },
            ]
        }
    }
}
`;

const a = 1;
