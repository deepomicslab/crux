import { parseNewick } from "../../../src/utils";
import * as newickData from "./data";
import template_t from "./t";
import { Node, treeAlgo } from "./tree-algo";

import sunburstData from "../../tree-data/sunburst-data";

const template = `//bvt
svg {
    height = 800
    Tree {
        width = 800; height = 800
        isCluster = true
        direction = "radical"
        scale = "scale"
        data = data
        leafSize = 100
        activeLink.stroke = "#66ccff"
        branchShouldStayOnTop = linkOnTop
        :link ({ link, pos, tree }) {
            Path {
                @let onTop = linkOnTop(link)
                stroke = onTop ? "#0f0" : link.target.data.name.length % 2 === 0 ? "#f00" : "#00f"
                strokeWidth = onTop ? 4 : 2
                fill = "none"
                d = tree.getPath(...pos)
            }
        }
    }
    // SunburstTree {
    //     data = data;
    //     :partition({ leaf, color }) {
    //         Arc {
    //             x1 = leaf.x0; x2 = leaf.x1;
    //             r1 = leaf.y0; r2 = leaf.y1;
    //             fill = color
    //             pad = 0;
    //         }
    //     }
    //     :overlay({ leaf }) {
    //         Text.centered {
    //             text = leaf.data.name
    //             x = (leaf.x0 + leaf.x1) / 2
    //             y = (leaf.y0 + leaf.y1) / 2
    //         }
    //     }
    // }
}
`;

const data = {
    data: treeAlgo(parseNewick(newickData.tumor) as Node, bg),
    // data: d,
    // data: sunburstData,
    bg,
    linkOnTop(link) {
        const h = hasChildren(link.target, "Lachnospiraceae bacterium KGMB03038");
        return h;
    },
};

function hasChildren(node, name) {
    if (node.data.name === name) return true;
    if (!node.children) return false;
    for (const c of node.children) {
        if (hasChildren(c, name)) return true;
    }
    return false;
}

function bg(data) {
    const name: string = data.name;
    if (!name) return undefined;
    if (name.startsWith("N")) {
        return "#66ccff";
    } else if (name.startsWith("T")) {
        return "#ff4d4d";
    } else {
        return "#aaa";
    }
}

export { template, data };
