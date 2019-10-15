export default `//bvt
svg {
    height = 800
    Rows {
        @let pieData = [{ value: 6, name: "A" }, { value: 5, name: "B" }, { value: 2, name: "C" }]
        PieChart {
            height = 200; width = 300; padding = 20
            data = pieData
            arc.stroke = "#fff"
            :label (d) {
                Text.centered {
                    text = d.data.name + ": " + d.data.percentage.toFixed(1) + "%"
                }
            }
            :legend (d) {
                Legend {
                    x = 220
                    data = d
                }
            }
        }
        PieChart {
            height = 200; width = 300; padding = 20
            data = pieData
            innerRadius = 50
            arc.pad = 0.04
            :label (d) {
                Text.centered {
                    text = d.data.name + ": " + d.data.percentage.toFixed(1) + "%"
                }
            }
        }
        PieChart {
            height = 200; width = 300; padding = 20
            data = [{ value: 6, name: "A" }]
            totalValue = 20
            arc.stroke = "#fff"
            :background {
                Circle.centered {
                    r = 100%+1
                    fill = "none"
                    stroke = "#999"
                }
            }
        }
    }
}
`;
