export default `//bvt
svg {
    width = auto
    height = 1200
    Component {
        height = 400; width = 100%; padding = 20
        VennDiagram {
            data = vennData
            :legend (d) {
                Legend {
                    data = d
                }
            }
        }
    }
}
`;
