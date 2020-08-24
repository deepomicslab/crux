import * as d3 from "d3";
import { useTemplate } from "../../ext/decorator";
import { Component } from "../component";
import { ComponentOption } from "../component-options";

export interface CircularTreeData<T = any> {
    name: string;
    data: T;
    length: number;
    children: CircularTreeData[];
    size: number;
}

export interface CircularTreeOption extends ComponentOption {
    data: CircularTreeData;
}

@useTemplate(`
Component {
    @for (node, index) in _nodes{
        Circle.centered{
            key = index;
            x = node.x;
            y = node.y;
            r = node.r;
            @let dynamicProps = {
                fill: node.children ? _color(node.depth): null,
            };
            @props dynamicProps
        }
    }
}`)
export class CircularTree extends Component<CircularTreeOption> {
    // @ts-ignore
    private _nodes!: d3.HierarchyCircularNode<CircularTreeData>[];
    // @ts-ignore
    private _depth: number = 1;
    // @ts-ignore
    private _color!: d3.ScaleOrdinal<string, string>;

    public willRender() {
        const width = this.$geometry.width;
        const height = this.$geometry.height;

        const pack = d3
            .pack<CircularTreeData>()
            .size([width - 20, height - 20])
            .padding(2);
        const root = d3
            .hierarchy<CircularTreeData>(this.prop.data)
            .sum((d) => d.size);

        const nodes = pack(root).descendants();
        this._nodes = nodes;
        this._color = d3.scaleOrdinal(d3.schemeCategory10);
    }
}
