export default `//bvt
svg {
    width = auto
    height = 800

    Tree {
        width = 800
        height = 800
        r = 300
        data = treeData
        // scale = "scale"
        direction = "radical"
        link.stroke = "#aaa"
        link(:active).stroke = "#555"
        link(:active).strokeWidth = 2
        link.on:mouseenter = $el.stage = "active"
        link.on:mouseleave = $el.stage = null
    }
}
`;
