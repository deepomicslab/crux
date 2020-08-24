import * as d3 from "d3";

export const scaleBranchLengths = (nodes: any, w: number) => {
    // Visit all nodes and adjust y pos width distance metric
    const visitPreOrder = (root: any, callback: any) => {
        callback(root);
        if (root.children) {
            for (let i = root.children.length - 1; i >= 0; i--) {
                visitPreOrder(root.children[i], callback);
            }
        }
    };
    visitPreOrder(nodes[0], (node: any) => {
        node.rootDist =
            (node.parent != null ? node.parent.rootDist : 0) +
            (Number(node.data.attribute) || 0);
    });
    const rootDists: any[] = nodes.map((n: any) => {
        return n.rootDist;
    });
    const yscale = d3
        .scaleLinear()
        .domain([0, d3.max(rootDists)])
        .range([0, w]);
    visitPreOrder(nodes[0], (node: any) => {
        node.y = yscale(node.rootDist);
    });
    return yscale;
};
