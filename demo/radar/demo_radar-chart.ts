export default `//bvt
svg {
    width = auto
    height = 1200
    @let radarData = [
        {key: "A", values: [606, 565, 576, 33, 805]},
        {key: "B", values: [993, 119, 915, 303, 395]},
        {key: "C", values: [861, 523, 594, 197, 527]},
        {key: "D", values: [275, 248, 873, 712, 312]},
        {key: "E", values: [465, 118, 0, 185, 339]}
    ]
    Component {
        RadarChart {
            height = 400; width = 400
            padding = 20
            data = radarData
            categories = ["First", "Second", "Third", "Fourth", "Fifth"]
            :legend (d) {
                Legend {
                    data = d
                }
            }
        }
    }
}
`;
