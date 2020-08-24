import * as d3 from "d3";
import { useTemplate } from "../../ext/decorator";
import { Component } from "../component";
import { ComponentOption } from "../component-options";

export interface TreeMapData {
    name: string;
    children: TreeMapData[];
    parent: TreeMapData;
}

export interface TreeMapOption extends ComponentOption {
    data: TreeMapData;
}

@useTemplate(`
Component {
    @for (node, index) in _nodes{
        Component {
            key = index;
            x = node.x0;
            y = node.y0;
            width = node.x1 - node.x0;
            height = node.y1 - node.y0;
            @yield rect with node default {
                Rect.full {
                    fill = getColor(node)
                }
                Text {
                    text = node.data.name
                }
            }
        }
    }
}`)
export class TreeMap extends Component<TreeMapOption> {
    private _root!: d3.HierarchyRectangularNode<TreeMapData>;
    // @ts-ignore
    private _nodes!: d3.HierarchyRectangularNode<TreeMapData>[];
    private _color!: d3.ScaleOrdinal<string, string>;

    // @ts-ignore
    private getColor(d: d3.HierarchyRectangularNode<TreeMapData>) {
        if (!d.depth) return "#ccc";
        while (d.depth > 1) d = d.parent!;
        return this._color(d.data.name);
    }

    public willRender() {
        const treemap = d3
            .treemap<TreeMapData>()
            .size([this.$geometry.width, this.$geometry.height])
            .paddingInner(1);

        const root = d3.hierarchy(this.prop.data).sum((d: any) => d.size);

        this._root = treemap(root);
        this._nodes = this._root.leaves();
        this._color = d3.scaleOrdinal(d3.schemeCategory10);
    }
}
