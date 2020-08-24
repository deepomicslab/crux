import * as d3 from "d3";
import { useTemplate } from "../../ext/decorator";
import { scaleBranchLengths } from "../../utils/newick-helper";
import { Component } from "../component";
import { ComponentOption } from "../component-options";
import { AnnotationColor, IConfig } from "./annotation-color";

export interface TreeAnnotationData {
    name: string;
    data: any;
    children: TreeAnnotationData[];
    parent: TreeAnnotationData[];
    x: number;
    y: number;
}

export interface TreeAnnotationOption extends ComponentOption {
    treeData: TreeAnnotationData;
    colAnnotation: any[];
    treeAnnotation: any[];
    radius?: number;
    rectWidth?: number;
    rectHeight?: number;
    id: string;
    treeWidth?: number;
    treeHeight?: number;
    treeAnnotationMargin?: number;
    scaleBranchLength?: boolean;
    annotationBorderColor?: string;
    treeAnnoKey?: string;
    colorShare?: boolean;
}

interface Annotation {
    rect: any;
    columns: {
        name: string;
        value: string[];
        color: any;
        vScale?: any;
    }[];
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
                    @let source = orientation($geometry.width, $geometry.height, l.source)
                    @let target = orientation($geometry.width, $geometry.height, l.target)
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
                    Line{
                        x1 = source.x
                        x2 = source.x
                        y1 = source.y
                        y2 = target.y
                        stroke = @color("lineColor")
                    }
                    Line{
                        x1 = source.x
                        x2 = target.x
                        y1 = target.y
                        y2 = target.y
                        stroke = @color("lineColor")
                    }
                }
            }
            @if node.height == 0 {
                @let n = orientation($geometry.width, $geometry.height, node)
                @let margin = offset
                Component {
                    key = "f" + i
                    rotation = @rotate(0)
                    coord = "cartesian"
                    x = n.x + margin.x
                    y = n.y + margin.y
                    Text {
                        text = node.data.name
                    }
                }
            }
            @if node.height == 0 {
                @let margin = offset
                @let anno = treeAnnotation ? treeAnnotation[node.data.name.replace("s__", "")] : null
                @let heat = mapping ? mapping[node.data.name.replace("s__", "")] : null
                Component {
                    @if anno {
                        @let source = orientation($geometry.width, $geometry.height, node)
                        @let target = orientation($geometry.width, $geometry.height, node.parent)
                        @let height = treeAnnotationHeight(node, node.parent)
                        Component {
                            @let keys = Object.keys(treeAnnotation)
                            @for index in keys.length {
                                @let key = keys[index]
                                @let value = treeAnnotation[key]
                                Rect {
                                    x = target.x
                                    y = source.y - height / 2
                                    key = "treeAnnotation-" + anno + index + key
                                    width = source.x > target.x ? source.x - target.x : target.x - source.x
                                    height = height
                                    fill = treeColor.get("", anno)
                                    fillOpacity = 0.2
                                    stroke = prop.annotationBorderColor
                                }
                            }
                        }
                    }
                    @if heat {
                        Container {
                            @let n = orientation($geometry.width, $geometry.height, node)
                            @let keys = Object.keys(heat)
                            @for index in keys.length {
                                @let key = keys[index]
                                @let value = heat[key]
                                Rect {
                                    key = "genus" + i + index
                                    x = prop.treeWidth + prop.treeAnnotationMargin + prop.rectWidth * index
                                    y = n.y - prop.rectHeight / 2
                                    width = prop.rectWidth
                                    height = prop.rectHeight
                                    fill = colColor.get(key, heat[key])
                                    stroke = prop.annotationBorderColor
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    @if colColor.keys {
        Component {
            @let keys = colColor.keys
            @for index in keys.length {
                Component {
                    @let margin = offset
                    key = "label-" + keys[index] + index
                    rotation = @rotate(90)
                    coord = "cartesian"
                    x = prop.treeWidth + prop.rectWidth * index + 1 + prop.treeAnnotationMargin + margin.x * 2
                    y = prop.treeHeight + 10
                    Text {
                        text = keys[index]
                    }
                }
            }
        }
    }
    AnnotationLegend {
        schemes = [treeColor, colColor]
        height = 800
        rectHeight = 20
    }
}
`)
export class TreeAnnotation extends Component<TreeAnnotationOption> {
    // @ts-ignore
    private root!: d3.HierarchyPointNode<TreeAnnotationData>[];
    // @ts-ignore
    private link!: d3.HierarchyPointLink<TreeAnnotationData>[];
    // @ts-ignore
    private annotation!: Annotation | null;
    private treeAnnotation: any = {};
    private mapping: any = {};
    private data: IConfig = {
        annotation: {},
        colorShare: false,
    };
    // @ts-ignore
    private colColor!: ColorScheme | null;
    // @ts-ignore
    private treeColor!: ColorScheme | null;

    // @ts-ignore
    private treeAnnotationHeight(
        node: TreeAnnotationData,
        parent: TreeAnnotationData,
    ): number {
        const index = parent.children.findIndex((e) => e === node);

        let height = 0;
        if (
            index === parent.children.length - 1 &&
            parent.children.length > 1
        ) {
            height = Math.abs(parent.children[index - 1].x - node.x);
        } else {
            height = Math.abs(node.x - parent.children[index + 1].x);
        }
        return height;
    }

    // @ts-ignore
    private orientation(width: number, height: number, d?: any): any {
        return {
            size: [height, width],
            x: d ? d.y + this.prop.radius : this.prop.radius,
            y: d ? d.x + this.prop.radius : this.prop.radius,
            d,
        };
    }

    // @ts-ignore
    private get offset() {
        const offset = 5;
        return { x: offset, y: -offset };
    }

    private layout(anno: any[]) {
        anno.map((row: any) => {
            const id = row[this.prop.id!];
            this.mapping[id] = {
                ...row,
            };
            delete this.mapping[id][this.prop.id!];
            Object.keys(row).forEach((key) => {
                if (key === this.prop.id!) return;
                if (!this.data.annotation[key]) {
                    this.data.annotation[key] = [];
                }

                if (this.data.annotation[key]) {
                    this.data.annotation[key].push(row[key]);
                }
            });
        });
    }

    public willRender() {
        const {
            treeData,
            colAnnotation,
            treeAnnotation,
            colorShare,
        } = this.prop;
        this.data.colorShare = colorShare;
        const d = d3.hierarchy<TreeAnnotationData>(treeData);
        const tree = d3
            .cluster<TreeAnnotationData>()
            .size([this.prop.treeHeight!, this.prop.treeWidth!])
            .separation((a, b) => 1);

        const root = tree(d);
        if (this.prop.scaleBranchLength) {
            scaleBranchLengths(root.descendants(), this.prop.treeWidth!);
        }
        this.root = root.descendants();
        this.link = root.links();

        this.layout(colAnnotation);
        treeAnnotation.forEach((row) => {
            const id = row[this.prop.id];
            this.treeAnnotation[id] = row[this.prop.treeAnnoKey!];
            delete this.treeAnnotation[id][this.prop.id];
        });

        this.colColor = colAnnotation.length
            ? new AnnotationColor(this.data)
            : null;

        if (Object.keys(this.treeAnnotation).length) {
            this.treeColor = new AnnotationColor({
                annotation: Object.values<string>(this.treeAnnotation),
            });
        } else {
            this.treeColor = null;
        }
    }

    public defaultProp() {
        return {
            ...super.defaultProp(),
            treeWidth: 500,
            treeHeight: 1000,
            radius: 1,
            rectHeight: 10,
            rectWidth: 10,
            treeData: [],
            treeAnnotation: [],
            colAnnotation: [],
            treeAnnotationMargin: 220,
            scaleBranchLength: false,
            annotationBorderColor: "black",
            treeAnnoKey: "c_Genus",
            colorShare: false,
        };
    }
}
