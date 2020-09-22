import * as d3 from "d3-hierarchy";

import { currentEventContext } from "../../event";
import { useTemplate } from "../../ext/decorator";
import { Component } from "../component";
import { ComponentOption } from "../component-options";

interface TreeData<T = any> {
    name: string;
    data: T;
    length: number;
    children: TreeData[];
    _radius?: number;
    _minAngle?: number;
    _maxAngle?: number;
}

interface TreeOption extends ComponentOption {
    data: TreeData;
    deg: number;
    r: number;
    scale: "none" | "scale" | "log";
    linkStyle: "rightAngle" | "straight";
    treeRotation: number;
    leafSize: number;
    branchInteraction: boolean;
}

@useTemplate(`//bvt
Component {
    @let tree = _extMethods
    Component {
        x = 50%; y = 50%
        Circle.centered {
            r = radius
            fill = "#f4f4f4"
        }
        @for (link, i) in _links {
            Component {
                key = "l" + i
                @yield link with { link, tree } default {
                    Path {
                        stroke = "#000"; fill = "none"
                        d = getPath(link)
                    }
                }
            }
        }
        @for (node, i) in _nodes {
            Component {
                key = "c" + i
                coord = "cartesian"
                x = node.x
                y = node.y
                on:mousedown = dragStart(node)
                @yield node with { node, tree } default {
                    Circle.centered {
                        r = 8
                        fill = node.parent ? "#999" : "#f00"
                        @props prop.opt.node
                    }
                    Text {
                        text = node.data.name
                    }
                }
            }
        }
    }
}
`)
export class HyperbolicTree extends Component<TreeOption> {
    protected state!: { activePath: Set<any> };

    private _root!: Node;

    radius: number = 0;

    // @ts-ignore
    private _extMethods!: any;
    // @ts-ignore
    private _nodes!: Node[];
    // @ts-ignore
    private _links!: Link[];

    public init() {
        this.state = {
            activePath: new Set(),
        };
        this._extMethods = {};
    }

    public willRender() {
        if (this._firstRender) {
            const data = this.prop.data;

            const totalR = this.prop.r || Math.min(this.$geometry.width, this.$geometry.height) / 2;
            if (totalR <= 0) {
                console.warn(`Tree: radius is 0. The tree should have a proper size.`);
            }
            this.radius = totalR;

            const hierarchy = d3.hierarchy(data).sum(d => (d.children ? 0 : 1));

            this._root = Node.fromHierarchy(this, hierarchy);
            this._root.layout(0, 2 * Math.PI);
            console.log(this._root);

            this._links = [...this._root.links()];
            this._nodes = [...this._root.nodes()];
        }
    }

    clicked(n: Node) {
        const time = 300;
        const steps = 8;
        const currX = this.fromScreen(n.x);
        const currY = this.fromScreen(n.y);
        const endX = this.fromScreen(0);
        const endY = this.fromScreen(0);
        const dx = (endX - currX) / steps;
        const dy = (endY - currY) / steps;
        const animate = (n: number) => {
            if (n !== 0) {
                this.drawFrame(dx * n, dy * n);
            }
            if (n < steps) {
                setTimeout(() => animate(n + 1), time / steps);
            } else {
                this._root.endTranslation();
            }
        };
        animate(0);
    }

    private dragging = false;
    private draggedNode?: Node;
    private startPos = { x: 0, y: 0 };
    private moved = false;

    private moveListener = (e: MouseEvent) => {
        if (!this.dragging) return;
        this.moved = true;
        e.stopPropagation();
        e.preventDefault();
        const dx = e.screenX - this.startPos.x;
        const dy = e.screenY - this.startPos.y;
        const nx = this.fromScreen(this.draggedNode!.x + e.movementX);
        const ny = this.fromScreen(this.draggedNode!.y + e.movementY);
        if (nx * nx + ny * ny > 0.9) {
            return;
        }
        this.drawFrame(this.fromScreen(dx), this.fromScreen(dy));
    };

    private upListener = () => {
        this.dragging = false;
        if (!this.moved) {
            this.clicked(this.draggedNode!);
        }
        this.moved = false;
        document.body.removeEventListener("mousemove", this.moveListener);
        document.body.removeEventListener("mouseup", this.upListener);
        this._root.endTranslation();
    };

    dragStart(n: Node) {
        this.dragging = true;
        this.draggedNode = n;
        const e = currentEventContext.event as MouseEvent;
        this.startPos.x = e.screenX;
        this.startPos.y = e.screenY;
        document.body.addEventListener("mousemove", this.moveListener);
        document.body.addEventListener("mouseup", this.upListener);
    }

    drawFrame(dx: number, dy: number) {
        if (dx === 0 && dy === 0) return;
        this._root.updateTranslation(Point.create(dx, dy));
        this.redraw();
    }

    fromScreen(n: number) {
        return n / this.radius;
    }

    toScreen(n: number) {
        return n * this.radius;
    }

    getPath({ source, target }: Link) {
        const s = { x: source.pos.x, y: source.pos.y };
        const t = { x: target.pos.x, y: target.pos.y };
        const d = s.x * t.y - t.x * s.y;
        if (d === 0) {
            return `M${source.x},${source.y} L${target.x},${target.y}`;
        }
        // const s2 = s.x * s.x + s.y + s.y + 1;
        // const t2 = t.x * t.x + t.y + t.y + 1;
        // const cX = (s2 * t.y - t2 * s.y) / (d * 2);
        // const cY = (t2 * s.x - s2 * t.x) / (d * 2);
        // const r = Math.sqrt((s.x - cX) * (s.x - cX) + (s.y - cY) * (s.y - cY));
        // const sr = this.toScreen(r);
        const sr = this.toScreen(1.5);
        return `M${source.x},${source.y} A${sr},${sr},0,0,1,${target.x},${target.y}`;
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

    public isActiveLink(link: d3.HierarchyPointLink<TreeData>) {
        if (!this.prop.branchInteraction) return;
        return this.state.activePath.has(link.source.data) && this.state.activePath.has(link.target.data);
    }
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

class Point {
    constructor(public x: number = 0, public y: number = 0) {}

    static create(x: number, y: number) {
        return new Point(x, y);
    }

    copyFrom(p: Point) {
        this.x = p.x;
        this.y = p.y;
    }

    toE() {
        this.x = Math.tanh(this.x);
        this.y = Math.tanh(this.y);
    }

    translate(p: Point) {
        const d_r = this.x * p.x + this.y * p.y + 1;
        const d_i = this.y * p.x - this.x * p.y;
        const d = d_r * d_r + d_i * d_i;
        const r = this.x + p.x;
        const i = this.y + p.y;
        this.x = (r * d_r + i * d_i) / d;
        this.y = (i * d_r - r * d_i) / d;
    }
}

type Link = { source: Node; target: Node };

class Node {
    static fromHierarchy(tree: HyperbolicTree, h: d3.HierarchyNode<TreeData>): Node {
        const node = new Node(tree, undefined, h.data, h.depth, h.height, h.value!);
        node.children = h.children?.map(c => {
            const n = Node.fromHierarchy(tree, c);
            n.parent = node;
            return n;
        });
        return node;
    }

    children: Node[] | undefined;
    pos = new Point();
    originalPos = new Point();

    constructor(
        public tree: HyperbolicTree,
        public parent: Node | undefined,
        public data: any,
        public depth: number,
        public height: number,
        public weight: number,
    ) {}

    layout(angle: number, wedge: number) {
        if (this.parent) {
            this.pos.x = 0.45 * Math.cos(angle);
            this.pos.y = 0.45 * Math.sin(angle);

            this.pos.toE();
            this.pos.translate(this.parent.pos);
            this.originalPos = new Point();
            this.originalPos.copyFrom(this.pos);
        }

        if (!this.children) return;

        if (this.parent && wedge > Math.PI) {
            wedge = Math.PI;
        }

        let startAngle = angle - wedge / 2;
        for (const c of this.children) {
            const p = c.weight / this.weight;
            const childWidth = p * wedge;
            const childAngle = startAngle + childWidth / 2;
            c.layout(childAngle, childWidth);
            startAngle += childWidth;
        }
    }

    updateTranslation(t: Point) {
        this.pos.copyFrom(this.originalPos);
        this.pos.translate(t);
        if (this.data.name === "A") {
            console.log(this.pos.x, this.pos.y);
        }
        if (this.children) {
            for (const c of this.children) {
                c.updateTranslation(t);
            }
        }
    }

    endTranslation() {
        this.originalPos.copyFrom(this.pos);
        if (this.children) {
            for (const c of this.children) {
                c.endTranslation();
            }
        }
    }

    get x() {
        return this.pos.x * this.tree.radius;
    }

    get y() {
        return this.pos.y * this.tree.radius;
    }

    *links(): Generator<Link> {
        if (this.children) {
            for (const c of this.children) {
                yield { source: this, target: c };
            }
            for (const c of this.children) {
                yield* c.links();
            }
        }
    }

    *nodes(): Generator<Node> {
        yield this;
        if (this.children) {
            for (const c of this.children) {
                yield* c.nodes();
            }
        }
    }
}
