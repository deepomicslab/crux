import * as d3 from "d3";
import { useTemplate } from "../../ext/decorator";
import { Component } from "../component";
import { ComponentOption } from "../component-options";

export type SunburstTreeData<T = Record<string, unknown>> = {
    children: SunburstTreeData[];
} & T;

export interface SunburstTreeOption extends ComponentOption {
    data: SunburstTreeData;
    valueGetter: (d: SunburstTreeData) => number;
    colorScheme: "rainbow" | "warm" | "cool" | "spectral" | "redblue" | [string, string];
    partitionPadding: number;
}

@useTemplate(`
Component {
    coord = "polar"
    @for (node, index) in _nodes {
        Component {
            key = index
            @for (leaf, idx) in node {
                Component {
                    key = idx;
                    @let color = _color((leaf.children ? leaf : leaf.parent).data.name)
                    @yield partition with { leaf, color } default {
                        Arc {
                            x1 = leaf.x0; x2 = leaf.x1;
                            r1 = leaf.y0; r2 = leaf.y1;
                            fill = color
                            pad = 0;
                            @props prop.partition
                        }
                    }
                }
            }
            Component {
                key = "overlay"
                @for (leaf, idx) in node {
                    Component {
                        key = idx
                        @let color = _color((leaf.children ? leaf : leaf.parent).data.name)
                        @yield overlay with { leaf, color }
                    }
                }
            }
        }
    }
}`)
export class SunburstTree extends Component<SunburstTreeOption> {
    private _nodes!: Array<d3.HierarchyNode<SunburstTreeData>[]>;
    private _radius!: number;
    // @ts-ignore
    private _color!: d3.ScaleOrdinal<string, unknown>;

    willRender() {
        this._radius = Math.min(this.$geometry.width, this.$geometry.height) / 2;
        const root = d3
            .hierarchy<SunburstTreeData>(this.prop.data)
            .sum(this.prop.valueGetter)
            .sort((a, b) => b.value! - a.value!);

        const partition = d3.partition().size([360, this._radius]).padding(this.prop.partitionPadding);

        const cs = this.prop.colorScheme;
        const interpolate =
            typeof cs === "string"
                ? {
                      rainbow: d3.interpolateRainbow,
                      warm: d3.interpolateWarm,
                      cool: d3.interpolateCool,
                      spectral: d3.interpolateSpectral,
                      redblue: d3.interpolateRdYlBu,
                  }[cs]
                : d3.interpolateHsl(cs[0], cs[1]);

        this._color = d3.scaleOrdinal().range(d3.quantize(interpolate, this.prop.data.children.length + 1));
        partition(root);

        this._nodes = [];
        root.descendants().forEach(row => {
            if (row.depth === 0) return;
            if (!this._nodes[row.depth]) this._nodes[row.depth] = [];
            this._nodes[row.depth].push(row);
        });
    }

    defaultProp(): SunburstTreeOption {
        return {
            ...super.defaultProp(),
            valueGetter: d => d.value,
            colorScheme: "rainbow",
            partitionPadding: 0.1,
        };
    }
}
