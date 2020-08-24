import * as d3 from "d3";
import { useTemplate } from "../../ext/decorator";
import { Component } from "../component";
import { ComponentOption } from "../component-options";

export interface SunburstTreeData {
    name: string;
    children: SunburstTreeData[];
    value: number;
}

export interface SunburstTreeOption extends ComponentOption {
    data: SunburstTreeData;
}

@useTemplate(`
Component {
    width = 100%
    height = 100%
    coord = "polar"
    @let height = 0
    @for (node, index) in _nodes{
        Component {
            key=index
            @for (leaf, j) in node{
                Arc {
                    key=j;
                    x1=leaf.x0;
                    x2=leaf.x1;
                    r1=leaf.y0;
                    r2=leaf.y1;
                    fill=_color((leaf.children ? leaf : leaf.parent).data.name);
                    pad=0.0001;
                }
            }
        }
    }
}`)
export class SunburstTree extends Component<SunburstTreeOption> {
    private _nodes!: Record<number, d3.HierarchyNode<SunburstTreeData>[]>;
    private _radius!: number;
    // @ts-ignore
    private _color!: d3.ScaleOrdinal<string, unknown>;

    public willRender() {
        this._radius =
            Math.min(this.$geometry.width, this.$geometry.height) / 2 - 100;
        const root = d3
            .hierarchy<SunburstTreeData>(this.prop.data)
            .sum((d) => d.value)
            .sort((a, b) => b.value! - a.value!);

        const partition = d3.partition().size([360, this._radius]).padding(1);

        this._color = d3
            .scaleOrdinal()
            .range(
                d3.quantize(
                    d3.interpolateRainbow,
                    this.prop.data.children.length + 1,
                ),
            );
        partition(root);

        this._nodes = [];
        root.descendants().forEach((row) => {
            if (row.depth === 0) return;
            if (!this._nodes[row.depth]) this._nodes[row.depth] = [];
            this._nodes[row.depth].push(row);
        });
    }
}
