import * as d3 from "d3-hierarchy";
import { ScaleContinuousNumeric, scaleLinear, scaleLog } from "d3-scale";
import { max, min } from "../../utils/math";

import { Anchor } from "../../defs/geometry";
import { useTemplate } from "../../ext/decorator";
import { Component } from "../component";
import { ComponentOption } from "../component-options";

export interface TreeData<T = any> {
    name: string;
    data: T;
    length: number;
    children: TreeData[];
    _radius?: number;
    _minAngle?: number;
    _maxAngle?: number;
}

export interface TreeOption extends ComponentOption {
    data: TreeData;
    deg: number;
    r: number;
    direction: "top" | "bottom" | "left" | "right" | "radical";
    scale: "none" | "scale" | "log";
    isCluster: boolean;
    linkStyle: "rightAngle" | "straight";
    treeRotation: number;
    leafSize: number;
    branchInteraction: boolean;
    branchShouldStayOnTop: (link: d3.HierarchyPointLink<TreeData>, tree: Tree) => boolean;
}

@useTemplate(`//bvt
Component {
    @let tree = _extMethods
    Component {
        width = 100%; height = 100%
        coord = isRadical ? "polar" : "cartesian"
        @for (link, i) in _links {
            Component {
                @let isActive = isActiveLink(link)
                @let isOnTop = isLinkOnTop(link)
                @let pos = [getX(link.source), getY(link.source), getX(link.target), getY(link.target)]
                key = "l" + i
                zIndex = isActive || isOnTop ? 1 : null
                @yield link with { link, pos, tree, isActive } default {
                    Path {
                        stroke = isActive ? "#000" : "#aaa"
                        fill = "none"
                        d = getPath(...pos)
                        @props isActive ? prop.opt.activeLink : prop.opt.link
                    }
                }
            }
        }
        @for (node, i) in _nodes {
            Component {
                key = "c" + i
                coord = "cartesian"
                x = getX(node); y = getY(node);
                @yield node with { node, tree } default {
                    Circle.centered {
                        r = 2
                        fill = "#999"
                        behavior:tooltip {
                            content = node.data._radius.toString()
                        }
                        @props prop.opt.node
                    }
                }
            }
        }
        @for (leaf, i) in _leaves {
            Component {
                key = "f" + i
                x = getX(leaf, prop.isCluster)
                y = getY(leaf, prop.isCluster)
                width = 0
                rotation = leafRotation(leaf)
                coord = "cartesian"
                on:mouseenter = setActive(leaf)
                on:mouseleave = setActive(null)
                @yield leaf with { leaf, tree } default {
                    Container {
                        anchor = leafAnchor(leaf)
                        padding = 4
                        Text {
                            text = leaf.data.name
                        }
                        behavior:tooltip {
                            content = leaf.data._radius.toString()
                        }
                        @props prop.opt.leaf
                    }
                }
            }
            @if isScaled && prop.isCluster {
                Component(isRadical ? "RadicalLine" : "Line") {
                    x = getX(leaf);
                    x1 = getX(leaf);
                    x2 = getX(leaf, true);
                    y1 = getY(leaf)
                    y2 = getY(leaf, true)
                    stroke = "#ccc"
                    @props prop.opt.linkExtension
                }
            }
        }
    }
}
`)
export class Tree extends Component<TreeOption> {
    protected state!: { activePath: Set<any> };

    // @ts-ignore
    private _scaleY: ScaleContinuousNumeric<number, number> | null = null;

    private _root!: d3.HierarchyPointNode<TreeData>;
    private _leaves!: Array<d3.HierarchyPointNode<TreeData>>;
    private _nodes!: Array<d3.HierarchyPointNode<TreeData>>;
    private _links!: d3.HierarchyPointLink<TreeData>[];
    // @ts-ignore
    private _leafLinks!: d3.HierarchyPointLink<TreeData>[];

    // @ts-ignore
    private _nodeCount!: number;
    private _leafCount!: number;
    // @ts-ignore
    private _leafDeg!: number;

    private isRadical = false;
    private isHorizontal = false;
    private isInversed = false;
    // @ts-ignore
    private isScaled = false;
    // @ts-ignore
    private width!: number;
    // @ts-ignore
    private height!: number;

    // @ts-ignore
    private _extMethods!: any;

    public init() {
        this.state = {
            activePath: new Set(),
        };
        this._extMethods = {};
        ["leafRotation", "leafAnchor", "isRightHalf", "getPath", "isActiveLink"].forEach(name => {
            this._extMethods[name] = this._bindMethod(this[name]);
        });
    }

    public willRender() {
        const data = this.prop.data;
        this.isRadical = this.prop.direction === "radical";

        let width: number, height: number;
        switch (this.prop.direction) {
            case "radical":
                const totalR = this.prop.r || Math.min(this.$geometry.width, this.$geometry.height) / 2;
                if (totalR <= 0) {
                    console.warn(`Tree: radius is 0. The tree should have a proper size.`);
                }
                width = this.prop.deg;
                height = totalR - this.prop.leafSize;
                this.isHorizontal = false;
                this.isInversed = false;
                break;
            case "top":
            case "bottom":
                this.width = width = this.$geometry.width;
                this.height = height = this.$geometry.height - this.prop.leafSize;
                this.isHorizontal = false;
                this.isInversed = this.prop.direction === "top";
                break;
            case "right":
            case "left":
                this.width = width = this.$geometry.height;
                this.height = height = this.$geometry.width - this.prop.leafSize;
                this.isHorizontal = true;
                this.isInversed = this.prop.direction === "left";
                break;
            default:
                width = 0;
                height = 0;
        }

        const hierarchy = d3.hierarchy(data).sum(d => d.length);

        const cluster = d3
            .cluster<TreeData>()
            .size([width, height])
            .separation(() => 1);

        this._root = cluster(hierarchy);

        switch (this.prop.scale) {
            case "none":
                this._scaleY = null;
                this.isScaled = false;
                break;
            case "scale":
                this._scaleY = scaleLinear()
                    .range([0, height])
                    .domain([0, getMaxLength(this._root)]);
                this.isScaled = true;
                break;
            case "log":
                this._scaleY = scaleLog()
                    .range([0, height])
                    .domain([1, getMaxLength(this._root) + 1]);
                this.isScaled = true;
                break;
        }

        this._root.eachBefore(n => {
            if (n.parent) {
                n.data._radius = n.data.length + n.parent.data._radius!;
            } else {
                n.data._radius = 0;
            }
        });

        // min and max angle
        this._root.eachAfter(n => {
            if (n.children) {
                n.data._minAngle = min(n.children, c => c.data._minAngle!);
                n.data._maxAngle = max(n.children, c => c.data._maxAngle!);
            } else {
                n.data._minAngle = n.data._maxAngle = n.x;
            }
        });

        this._links = this._root.links();
        // console.log(this);
        this._leafLinks = this._links.filter(d => !d.target.children);

        this._leaves = [];
        this._nodes = [];
        this._root.each(n => {
            if (n.children) {
                this._nodes.push(n);
            } else {
                this._leaves.push(n);
            }
        });

        this._nodeCount = this._nodes.length;
        this._leafCount = this._leaves.length;
        this._leafDeg = this.prop.deg / this._leafCount;
    }

    public didUpdate() {
        // console.log(this.$ref.links);
    }

    public defaultProp() {
        return {
            ...super.defaultProp(),
            deg: 360,
            scale: "none",
            direction: "bottom",
            treeRotation: 0,
            leafSize: 20,
            branchInteraction: true,
        };
    }

    // @ts-ignore
    private getPath(x1: number, y1: number, x2: number, y2: number) {
        if (this.isRadical) {
            const xDiff = Math.abs(x2 - x1);
            const c0 = Math.cos((x1 = ((x1 - 90) / 180) * Math.PI));
            const s0 = Math.sin(x1);
            const c1 = Math.cos((x2 = ((x2 - 90) / 180) * Math.PI));
            const s1 = Math.sin(x2);

            let path: string;
            switch (this.prop.linkStyle) {
                case "straight":
                    return `M${y1 * c0},${y1 * s0} L${y2 * c1},${y2 * s1}`;
                default:
                    path = `M${y1 * c0},${y1 * s0} `;
                    if (x2 !== x1) {
                        path += `A${y1},${y1} 0 ${xDiff > 180 ? 1 : 0} ${x2 > x1 ? 1 : 0} ${y1 * c1},${y1 * s1}`;
                    }
                    path += `L${y2 * c1},${y2 * s1}`;
                    return path;
            }
        } else {
            if (this.isHorizontal) {
                return `M${x1},${y1} L${x1},${y2} L${x2},${y2}`;
            } else {
                return `M${x1},${y1} L${x2},${y1} L${x2},${y2}`;
            }
        }
    }

    // @ts-ignore
    private getX(node: d3.HierarchyPointNode<TreeData>, forceEnd = false) {
        if (this.isHorizontal) {
            const y = forceEnd || this.prop.scale === "none" ? node.y : this._scaleY!(node.data._radius!);
            return this.isInversed ? this.height - y + this.prop.leafSize : y;
        } else {
            return this.isInversed ? this.width - node.x : node.x;
        }
    }

    // @ts-ignore
    private getY(node: d3.HierarchyPointNode<TreeData>, forceEnd = false) {
        if (this.isHorizontal) {
            return this.isInversed ? this.width - node.x : node.x;
        } else {
            const y = forceEnd || this.prop.scale === "none" ? node.y : this._scaleY!(node.data._radius!);
            return this.isInversed ? this.height - y + this.prop.leafSize : y;
        }
    }

    // @ts-ignore
    private leafRotation(leaf: any) {
        const isRight = this.isRightHalf(leaf.x);
        switch (this.prop.direction) {
            case "radical":
                return [isRight ? leaf.x - 90 : leaf.x + 90, "_", "_"];
            case "bottom":
                return [90, "_", "_"];
            case "top":
                return [270, "_", "_"];
            default:
                return 0;
        }
    }

    // @ts-ignore
    private leafAnchor(leaf: any) {
        const isRight = this.isRightHalf(leaf.x);
        switch (this.prop.direction) {
            case "radical":
                return (isRight ? Anchor.Left : Anchor.Right) | Anchor.Middle;
            case "left":
                return Anchor.Right | Anchor.Middle;
            case "top":
            case "bottom":
            case "right":
                return Anchor.Left | Anchor.Middle;
        }
    }

    // @ts-ignore
    private isRightHalf(deg: number): boolean {
        switch (this.prop.direction) {
            case "radical":
                const thres1 = 180 - this.prop.treeRotation;
                const thres2 = 360 - this.prop.treeRotation;
                return deg < thres1 || deg > thres2;
            case "left":
                return false;
            default:
                return true;
        }
    }

    // @ts-ignore
    private setActive(node_: d3.HierarchyPointNode<TreeData> | string) {
        let node: d3.HierarchyPointNode<TreeData>;
        if (typeof node_ === "string") {
            const n = this._leaves.find(x => x.data.name === node_);
            if (!n) {
                console.warn(`Tree: setActive: cannot find a leaf with name "${node_}"`);
                return;
            }
            node = n;
        } else {
            node = node_;
        }
        if (node === null) {
            this.setState({ activePath: new Set() });
        } else {
            this.setState({ activePath: new Set(ancestor(node)) });
        }
    }

    public isActiveLink(link: d3.HierarchyPointLink<TreeData>) {
        if (!this.prop.branchInteraction) return;
        return this.state.activePath.has(link.source.data) && this.state.activePath.has(link.target.data);
    }

    public isLinkOnTop(link: d3.HierarchyPointLink<TreeData>) {
        return this.prop.branchShouldStayOnTop ? this.prop.branchShouldStayOnTop(link, this) : false;
    }

    public ancestorOfNode(node: d3.HierarchyPointNode<TreeData>) {
        return ancestor(node);
    }
}

function* ancestor(node: d3.HierarchyPointNode<TreeData>) {
    let n: d3.HierarchyPointNode<TreeData> | null = node;
    while (n) {
        yield n.data;
        n = n.parent;
    }
}

function getMaxLength(d: d3.HierarchyNode<TreeData>): number {
    return d.data.length + (d.children ? max(d.children, dd => getMaxLength(dd))! : 0);
}

// @ts-ignore
function getMinLength(d: d3.HierarchyNode<TreeData>): number {
    let min = 99999999;
    d.each(node => {
        const len = node.data.length;
        if (len > 0 && len < min) {
            min = len;
        }
    });
    return min;
}
