import { parseNewick } from "../../../src/utils";
import dataStr from "./data";
import template_t from "./t";
import { treeAlgo, bg, Node } from "./tree-algo";

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
    data: treeAlgo(parseNewick(dataStr) as Node, bg),
    bg,
};

export { template, data };
