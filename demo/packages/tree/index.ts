import { parseNewick } from "../../../src/utils";
import * as newickData from "./data";
import template_t from "./t";
import { bg, Node, treeAlgo } from "./tree-algo";

import sunburstData from "../../tree-data/sunburst-data";

const template = `//bvt
svg {
    height = 800
    SunburstTree {
        data = data;
        :partition({ leaf, color }) {
            Arc {
                x1 = leaf.x0; x2 = leaf.x1;
                r1 = leaf.y0; r2 = leaf.y1;
                fill = color
                pad = 0;
            }
        }
        :overlay({ leaf }) {
            Text.centered {
                text = leaf.data.name
                x = (leaf.x0 + leaf.x1) / 2
                y = (leaf.y0 + leaf.y1) / 2
            }
        }
    }
}
`;

const data = {
    // data: treeAlgo(parseNewick(newickData.tumor) as Node, bg),
    data: sunburstData,
    bg,
};

export { template, data };
