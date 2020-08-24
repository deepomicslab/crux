import * as d3 from "d3-hierarchy";
import { useTemplate } from "../../ext/decorator";
import { Component } from "../component";
import { ComponentOption } from "../component-options";
import { getPath } from "./radial-tree";

export interface HyperbolicTreeData {
    name: string;
    data: any;
    length: number;
}

export interface HyperbolicOption extends ComponentOption {
    data: HyperbolicTreeData;
    margin?: number;
    radius?: number;
}

@useTemplate(`
Component {
    x = 50;
    y = 50;
    Component {
        coord = "polar"
        width = 100%;
        height = 100%;

        @for i in root.length{
            @let node = root[i];
            @let l = link[i];
            Container {
                key = "container" + i;
                @if l {
                    @let isLast = l.source.parent && l.source.parent.height === root[0].height
                    Path {
                        fill = "none";
                        d = getPath(l.source.x, l.source.y, l.target.x, l.target.y);
                        dashArray = (isLast || (l.target.parent && l.target.parent.height === root[0].height)) ? "5,5" : "";
                        stroke = @color("lineColor");
                    }
                    Circle.centered {
                        x = l.source.x;
                        y = l.source.y;
                        r = prop.radius;
                    }
                    Circle.centered {
                        x = l.target.x;
                        y = l.target.y;
                        r = prop.radius;
                    }
                }
            }

            @let isRight = isRightHalf(node.x);
            @if node.height === 0 {
                Component {
                    key = "f" + i;
                    x = node.x;
                    y = node.y;
                    rotation = @rotate(isRight ? node.x - 90 : node.x + 90, 0);
                    coord = "cartesian"
                    Container {
                        anchor = @anchor(isRight ? "left" : "right", "middle");
                        padding = 4;
                        Text {
                            text = node.data.name;
                        }
                    }
                }
            }
        }
    }
}`)
export class HyperbolicTree extends Component<HyperbolicOption> {
    // @ts-ignore
    private root!: d3.HierarchyPointNode<HyperbolicTreeData>[];
    // @ts-ignore
    private link!: d3.HierarchyPointLink<HyperbolicTreeData>[];
    // @ts-ignore
    private getPath = getPath;

    // @ts-ignore
    private isRightHalf(deg: number): boolean {
        const thres1 = 180;
        const thres2 = 360;
        return deg < thres1 || deg > thres2;
    }

    private get getSize(): [number, number] {
        return [360, this.$geometry.height / 2 - 150];
    }

    public willRender() {
        const data = this.prop.data;
        const d = d3.hierarchy<HyperbolicTreeData>(data);
        const cluster = d3
            .cluster<HyperbolicTreeData>()
            .size(this.getSize)
            .separation((a, b) => 1);
        const root = cluster(d);
        this.root = root.descendants();
        this.link = root.links();
    }

    public defaultProp() {
        return {
            ...super.defaultProp(),
            margin: 40,
            radius: 3,
        };
    }
}
