export default `//bvt
svg {
    height = 800
    Tree {
        width = 800; height = 500
        isCluster = true
        direction = "radical"
        // scale = "scale"
        // linkStyle = "straight"
        data = data
        leafSize = 100
        activeLink.stroke = "#66ccff"
        // :leaf ({ leaf, tree }) {
        //     Container {
        //         anchor = tree.leafAnchor(leaf)
        //         padding = 4
        //         Rect.detached.full {
        //             fill = bg(leaf.data)
        //         }
        //         Text {
        //             text = leaf.data.name
        //         }
        //         behavior:tooltip {
        //             content = leaf.data._radius.toString()
        //         }
        //     }
        // }
    }
}
`;
