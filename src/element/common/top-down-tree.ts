import { cluster, hierarchy, tree } from "d3-hierarchy";
import { useTemplate } from "../../ext/decorator";
import { Component } from "../component";
import { ComponentOption } from "../component-options";

export interface TopDownTreeData<T = any> {
    name: string;
    data: T;
    length: number;
    children: TopDownTreeData[];
}

export interface TopDownTreeOption extends ComponentOption {
    data: TopDownTreeData;
    direction: "top" | "left" | "right" | "bottom";
    lineType?: "normal" | "cluster";
    radius?: number;
    textOffsetX?: number;
    textOffsetY?: number;
    displayNode?: boolean;
}

@useTemplate(`
Component {
    Component {
        coord = "cartesian"
        @for i in root.length {
            @let node = root[i]
            @let l = link[i]
            @if l {
                Container {
                    key = "container" + i;
                    @let source = orientation($geometry.width, $geometry.height, l.source)[prop.direction]
                    @let target = orientation($geometry.width, $geometry.height, l.target)[prop.direction]
                    @if prop.displayNode {
                        Circle.centered {
                            x = source.x
                            y = source.y
                            r = prop.radius
                        }
                        Circle.centered {
                            x = target.x
                            y = target.y
                            r = prop.radius
                        }
                    }
                    @if prop.direction == "left" || prop.direction == "right" {
                        Line {
                            x1 = source.x
                            x2 = source.x
                            y1 = source.y
                            y2 = target.y
                            stroke =  @color("lineColor")
                        }
                        Line {
                            x1 = source.x
                            x2 = target.x
                            y1 = target.y
                            y2 = target.y
                            stroke = @color("lineColor")
                        }
                    }
                    @if prop.direction == "top" || prop.direction == "bottom" {
                        Line {
                            x1 = source.x
                            x2 = target.x
                            y1 = source.y
                            y2 = source.y
                            stroke = @color("lineColor")
                        }
                        Line {
                            x1 = target.x
                            x2 = target.x
                            y1 = source.y
                            y2 = target.y
                            stroke = @color("lineColor")
                        }
                    }
                }
            }
            @if node.height === 0 {
                @let n = orientation($geometry.width, $geometry.height, node)[prop.direction]
                Component {
                    key = "f" + i
                    rotation = @rotate(rotate)
                    coord = "cartesian"
                    @let margin = offset
                    x = prop.textOffsetX ? prop.textOffsetX + n.x + margin.x : n.x + margin.x
                    y = prop.textOffsetY ? prop.textOffsetY + n.y + margin.y : n.y + margin.y
                    Text {
                        text = node.data.name
                    }
                }
            }
        }
    }
}
`)
export class TopDownTree extends Component<TopDownTreeOption> {
    // @ts-ignore
    private root!: d3.HierarchyPointNode<TopDownTreeData>[];
    // @ts-ignore
    private link!: d3.HierarchyPointLink<TopDownTreeData>[];

    // @ts-ignore
    private get offset() {
        const offset = 5,
            direction = this.prop.direction;
        if (direction === "top") return { x: offset, y: 10 };
        else if (direction === "left") return { x: offset, y: -offset };
        else if (direction === "bottom") return { x: -offset, y: -offset };
        else return { x: -150, y: -offset };
    }

    // @ts-ignore
    private get rotate(): number {
        const direction = this.prop.direction;
        if (direction === "top") return 90;
        else if (direction === "left") return 0;
        else if (direction === "right") return 0;
        else return 270;
    }

    private orientation(width: number, height: number, d?: {x: number, y: number}): any {
        return {
            top: {
                size: [width, height],
                x: d ? d.x + this.prop.radius! : this.prop.radius,
                y: d ? d.y + this.prop.radius! : this.prop.radius,
            },
            right: {
                size: [height, width],
                x: d ? width + this.prop.radius! - d.y : this.prop.radius,
                y: d ? d.x + this.prop.radius! : this.prop.radius,
            },
            bottom: {
                size: [width, height],
                x: d ? d.x + this.prop.radius! : this.prop.radius,
                y: d ? height + this.prop.radius! - d.y : this.prop.radius,
            },
            left: {
                size: [height, width],
                x: d ? d.y + this.prop.radius! : this.prop.radius,
                y: d ? d.x + this.prop.radius! : this.prop.radius,
            },
        };
    }

    public willRender() {
        const data = this.prop.data,
            width = this.$geometry.width,
            height = this.$geometry.height,
            direction = this.prop.direction;

        const d = hierarchy<TopDownTreeData>(data);

        if (this.prop.lineType === "normal") {
            const treeLayout = tree<TopDownTreeData>()
                .size(this.orientation(width, height)[direction].size);

            const root = treeLayout(d);
            this.root = root.descendants();
            this.link = root.links();
        } else {
            const clusterLayout = cluster<TopDownTreeData>()
                .size(this.orientation(width, height)[direction].size)
                .separation((a, b) => 1);

            const root = clusterLayout(d);
            this.root = root.descendants();
            this.link = root.links();
        }
    }

    public defaultProp() {
        return {
            ...super.defaultProp(),
            lineType: "normal",
            radius: 3,
            textOffsetX: 0,
            textOffsetY: 0,
            direction: "top",
            displayNode: true,
        };
    }
}
