import { parseNewick } from "../../../src/utils";
import * as newickData from "./data";
import template_t from "./t";
import { bg, Node, treeAlgo } from "./tree-algo";

const template = `//bvt
svg {
    height = 800
    HyperbolicTree {
        width = 800; height = 800
        data = data
    }
}
`;

const data = {
    data: treeAlgo(parseNewick(newickData.tumor) as Node, bg),
    bg,
};

export { template, data };
