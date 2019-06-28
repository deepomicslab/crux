import { max, min } from "d3-array";
import d3 = require("d3-hierarchy");
import { ScaleContinuousNumeric, scaleLinear, scaleLog } from "d3-scale";

import { template } from "../../template/tag";
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
    treeRotation: number;
}

export class Tree extends Component<TreeOption> {
    public render = template`
    Component {
        Component {
            @let isRadical = prop.direction === "radical"
            width = 100%; height = 100%
            coord = isRadical ? "polar" : "cartesian"
            yScale = _scaleY
            @for (link, i) in _links {
                Path {
                    ref = "links[]"
                    key = "l" + i
                    stroke = "#aaa"
                    fill = "none"
                    d = getPath(link.source.x, @scaled-y(getR(link.source)), link.target.x, @scaled-y(getR(link.target)))
                    @props prop.opt.link
                }
            }
            @for (node, i) in _nodes {
                Circle.centered {
                    key = "c" + i
                    x = node.x; y = @scaled-y(getR(node));
                    r = 2
                    fill = "red"
                }
            }
            @for (leaf, i) in _leaves {
                @let isRight = isRightHalf(leaf.x)
                Component {
                    key = "f" + i
                    x = leaf.x
                    y = leaf.y
                    rotation = @rotate(isRight ? leaf.x - 90 : leaf.x + 90, 0, 0)
                    coord = "cartesian"
                    @let data = leaf.data
                    @yield leaf with { isRight, data } default {
                        Container {
                            anchor = @anchor(isRight ? "left" : "right", "middle")
                            padding = 4
                            Text {
                                text = data.name
                            }
                        }
                    }
                }
            }
        }
    }
    `;

    private _scaleY: ScaleContinuousNumeric<number, number> | null = null;

    private _root!: d3.HierarchyPointNode<TreeData>;
    private _leaves!: Array<d3.HierarchyPointNode<TreeData>>;
    private _nodes!: Array<d3.HierarchyPointNode<TreeData>>;
    private _links!: d3.HierarchyPointLink<TreeData>[];
    private _leafLinks!: d3.HierarchyPointLink<TreeData>[];

    private _nodeCount!: number;
    private _leafCount!: number;
    private _leafDeg!: number;

    public willRender() {
        const data = this.prop.data;
        const r = this.prop.r || Math.min(this.$geometry.width, this.$geometry.height) / 2;

        const hierarchy = d3.hierarchy(data)
            .sum(d => d.length);

        const cluster = d3.cluster<TreeData>()
            .size([this.prop.deg, r])
            .separation(() => 1);

        this._root = cluster(hierarchy);

        const _s = this.prop.scale;
        if (_s === "none") {
            this._scaleY = null;
        } else if (_s === "scale") {
            this._scaleY = scaleLinear()
                .range([0, r])
                .domain([0, getMaxLength(this._root)]);
        } else if (_s === "log") {
            this._scaleY = scaleLog()
                .range([0, r])
                .domain([getMinLength(this._root), getMaxLength(this._root)]);
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
                n.data._minAngle = min(n.children, c => c.data._minAngle);
                n.data._maxAngle = max(n.children, c => c.data._maxAngle);
            } else {
                n.data._minAngle = n.data._maxAngle = n.x;
            }
        });

        this._links = this._root.links();
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
        console.log(this.$ref.links);
    }

    public defaultProp() {
        return {
            ...super.defaultProp(),
            deg: 360,
            scale: "none",
            direction: "bottom",
            treeRotation: 0,
        };
    }

    public getLinks(node: d3.HierarchyPointNode<TreeData>) {
        console.log(node.links())
    }

    private getPath(startAngle: number, startRadius: number, endAngle: number, endRadius: number) {
        const c0 = Math.cos(startAngle = (startAngle - 90) / 180 * Math.PI);
        const s0 = Math.sin(startAngle);
        const c1 = Math.cos(endAngle = (endAngle - 90) / 180 * Math.PI);
        const s1 = Math.sin(endAngle);
        // return
        let path = `M${startRadius * c0},${startRadius * s0} `;
        if (endAngle !== startAngle)  {
            path += `A${startRadius},${startRadius} 0 0 ${endAngle > startAngle ? 1 : 0} ${startRadius * c1},${startRadius * s1}`;
        }
        path += `L${endRadius * c1},${endRadius * s1}`;
        return path;
    }

    private getR(node: d3.HierarchyPointNode<TreeData>) {
        if (this.prop.scale === "none") {
            return node.y;
        }
        return node.data._radius;
    }

    private isRightHalf(deg: number): boolean {
        const thres1 = 180 - this.prop.treeRotation;
        const thres2 = 360 - this.prop.treeRotation;
        return deg < thres1 || deg > thres2;
    }
}

function getMaxLength(d: d3.HierarchyNode<TreeData>): number {
    return d.data.length + (d.children ? max(d.children, dd => getMaxLength(dd))! : 0);
}

function getMinLength(d: d3.HierarchyNode<TreeData>): number {
    let min = 99999999;
    d.each((node) => {
        const len = node.data.length;
        if (len > 0 && len < min) { min = len; }
    });
    return min;
}
