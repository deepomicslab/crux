import * as d3 from "d3";
import { useTemplate } from "../../ext/decorator";
import { Component } from "../component";
import { ComponentOption } from "../component-options";

export interface IcicleTreeData {
    name: string;
    children: IcicleTreeData[];
    value: number;
    height: number;
    depth: number;
    parent: IcicleTreeData;
    data: any;
    y0: number;
    y1: number;
    x0: number;
    x1: number;
}

export interface IcicleTreeOption extends ComponentOption {
    data: IcicleTreeData;
}

@useTemplate(`
Component {
    @for (node, index) in _nodes{
        Component{
            x = node.y0
            y = node.x0
            key = index
            Rect {
                width = node.y1-node.y0
                height = node.x1-node.x0
                fill=getColor(node)
            }
            @if node.depth <= 2 {
                Text{
                    text = node.data.name + ', ' + (node.data.value | '');
                    fill = 'white';
                }
            }
        }
    }
}`)
export class IcicleTree extends Component<IcicleTreeOption> {
    // @ts-ignore
    private _nodes!: d3.HierarchyRectangularNode<IcicleTreeData>[];
    private _color!: d3.ScaleOrdinal<string, string>;

    // @ts-ignore
    private getColor(d: IcicleTreeData) {
        if (!d.depth) return "#ccc";
        while (d.depth > 1) d = d.parent;
        return this._color(d.data.name);
    }

    private partition(data: IcicleTreeData) {
        const width = this.$geometry.width,
            height = this.$geometry.height;

        const root = d3
            .hierarchy<IcicleTreeData>(data)
            .sum((d) => d.value)
            .sort((a, b) => b.height - a.height || b.value! - a.value!);
        return d3.partition<IcicleTreeData>().size([height, width]).padding(1)(root);
    }

    public willRender() {
        const root = this.partition(this.prop.data);
        this._color = d3.scaleOrdinal(d3.schemeCategory10);
        this._nodes = root.descendants();
    }
}
