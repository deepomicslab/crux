export default `//bvt
svg {
    height = 400
    Component {
        @let pieData = [{ value: 6 }, { value: 5 }, { value: 2 }]
        PieChart {
            height = 200; width = 300; padding = 20
            data = pieData
        }
        Legend {
            data = [
                { label: "A" },
                { label: "B" },
            ]
        }
    }
}
`;
