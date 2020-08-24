import * as d3 from "d3-hierarchy";
import { useTemplate } from "../../ext/decorator";
import { Component } from "../component";
import { ComponentOption } from "../component-options";

export const getPath = (
    startAngle: number,
    startRadius: number,
    endAngle: number,
    endRadius: number,
) => {
    const c0 = Math.cos((startAngle = ((startAngle - 90) / 180) * Math.PI));
    const s0 = Math.sin(startAngle);
    const c1 = Math.cos((endAngle = ((endAngle - 90) / 180) * Math.PI));
    const s1 = Math.sin(endAngle);
    let path = `M${startRadius * c0},${startRadius * s0} `;
    if (endAngle !== startAngle) {
        path += `A${startRadius},${startRadius} 0 0 ${
            endAngle > startAngle ? 1 : 0
        } ${startRadius * c1},${startRadius * s1}`;
    }
    path += `L${endRadius * c1},${endRadius * s1}`;
    return path;
};

export interface RadialTreeData {
    name: string;
    length: number;
    dash?: boolean;
}

export interface RadialTreeOption extends ComponentOption {
    data: RadialTreeData;
    radius?: number;
    lineType?: "normal" | "cluster";
}

@useTemplate(`
Component {
    Component {
        coord = "polar"
        width = 100%;
        height = 100%;
        @let height = root[0].height
        @for i in root.length{
            @let node = root[i]
            @let l = link[i]
            Component {
                key = 'container' + i
                @if l {
                    Path {
                        key = "l" + i
                        d = getPath(l.source.x, l.source.y, l.target.x, l.target.y)
                        dashArray = l.target.data.dash ? "5,5" : ""
                        fill = "none"
                        stroke = @color("lineColor")
                    }
                    Circle.centered {
                        key = i;
                        x = l.source.x;
                        y = l.source.y;
                        r = prop.radius;
                    }
                    Circle.centered {
                        key = 'target'+i;
                        x = l.target.x;
                        y = l.target.y;
                        r = prop.radius;
                    }
                }
            }

            @let isRight = isRightHalf(node.x)
            @if node.height === 0 {
                Component {
                    key = "f" + i
                    x = node.x
                    y = node.y
                    rotation = @rotate(isRight ? node.x - 90 : node.x + 90, 0)
                    coord = "cartesian"
                    Container {
                        anchor = @anchor(isRight ? "left" : "right", "middle")
                        padding = 4
                        Text {
                            text = node.data.name
                        }
                    }
                }
            }
        }
    }
}
`)
export class RadialTree extends Component<RadialTreeOption> {
    // @ts-ignore
    private root!: d3.HierarchyPointNode<RadialTreeData>[];
    // @ts-ignore
    private link!: d3.HierarchyPointLink<RadialTreeData>[];
    // @ts-ignore
    private getPath = getPath;

    // @ts-ignore
    private isRightHalf(deg: number): boolean {
        const thres1 = 180;
        const thres2 = 360;
        return deg < thres1 || deg > thres2;
    }

    public willRender() {
        const { data } = this.prop;

        const d = d3.hierarchy<RadialTreeData>(data);

        const tree = (this.prop.lineType === "normal" ? d3.tree : d3.cluster)<
            RadialTreeData
        >()
            .size([360, this.$geometry.height / 2 - 150])
            .separation((a, b) => 1);

        const root = tree(d);
        const des = root.descendants();
        const links = root.links();
        const depthMinY = {};

        if (this.prop.lineType === "cluster") {
            des.forEach((d) => {
                if (!depthMinY[d.depth]) {
                    depthMinY[d.depth] = d.y;
                }
                if (d.depth !== des[0].height && !d.children && d.height === 0)
                    d.data.dash = true;
                depthMinY[d.depth] = Math.min(depthMinY[d.depth], d.y);
            });
            const linkSources = new Set(links.map((d) => d.source.data.name));
            des.forEach((d) => {
                if (linkSources.has(d.data.name)) {
                    d.y = depthMinY[d.depth];
                }
            });
        }

        this.root = des;
        this.link = links;
    }

    public defaultProp() {
        return {
            ...super.defaultProp(),
            lineType: "normal",
            radius: 3,
        };
    }
}
