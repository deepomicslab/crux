import * as d3 from "d3";
import { useTemplate } from "../../ext/decorator";
import { scaleBranchLengths } from "../../utils/newick-helper";
import { Component } from "../component";
import { ComponentOption } from "../component-options";
import { AnnotationColor } from "./annotation-color";
import { getPath } from "./radial-tree";

export interface AnnotationRadialData<T = any> {
    name: string;
    data: T;
    length: number;
    children: AnnotationRadialData[];
}

export interface AnnotationRadialOption extends ComponentOption {
    treeData: AnnotationRadialData;
    annotationData: any[];
    radius?: number;
    innerRadius?: number;
    outerRadius?: number;
    matchKey: string;
    annotationKey: string;
    nodeAnnotationKey: string;
    rectSize?: number;
}

@useTemplate(`
Component {
    Component {
        coord = "polar";
        width = 100%;
        height = 100%;
        coord = "polar";
        width = prop.outerRadius * 2;
        height = prop.outerRadius * 2;
        @let height = root[0].height;
        @for i in root.length {
            @let node = root[i]
            @let location = mapping[node.data.name];
                @if location {
                    Arc {
                        key = "arc" + i;
                        x1 = node.x - widthAvg / 2;
                        x2 = node.x + widthAvg / 2;
                        r1 = prop.outerRadius;
                        r2 = 0;
                        fill = anno.get(node.data.name, location.Location);
                    }
                }
        }
        @for i in root.length{
            @let node = root[i];
            @let l = link[i];
            Component {
                key = "container" + i;
                @if l {
                    Path {
                        key = "l" + i;
                        fill = "none";
                        d = getPath(l.source.x, l.source.y, l.target.x, l.target.y);
                        dashArray = l.target.dash ? "5,5" : "";
                        stroke = @color("lineColor");
                    }
                    @if l.source {
                        @let source = mapping[l.source.data.name]
                        @if source {
                            Circle.centered {
                                key = i;
                                x = l.source.x;
                                y = l.source.y;
                                r = prop.radius;
                                fill = nodeAnno.get(l.source.data.name, source.Disease);
                                stroke = "black";
                            }
                        }
                    }
                    @if l.target {
                        @let target = mapping[l.target.data.name]
                        @if target {
                            Circle.centered {
                                key = "target"+i;
                                x = l.target.x;
                                y = l.target.y;
                                r = prop.radius;
                                fill = nodeAnno.get(l.target.data.name, target.Disease);
                                stroke = "black";
                            }
                        }
                    }
                }
            }
        }
    }
    AnnotationLegend {
        schemes = [anno, nodeAnno];
        height = prop.annotationHeight;
        startX = prop.outerRadius * 2 + 50;
        rectHeight = prop.rectSize;
    }
}`)
export class AnnotationRadial extends Component<AnnotationRadialOption> {
    // @ts-ignore
    private root!: d3.HierarchyPointNode<unknown>[];
    // @ts-ignore
    private link!: d3.HierarchyPointLink<unknown>[];
    private mapping: Record<string, object> = {};
    // @ts-ignore
    private color!: d3.ScaleOrdinal<string, string>;
    // @ts-ignore
    private widthAvg!: number;
    // @ts-ignore
    private anno!: ColorScheme;
    // @ts-ignore
    private nodeAnno!: ColorScheme;
    // @ts-ignore
    private getPath = getPath;

    // @ts-ignore
    private isRightHalf(deg: number): boolean {
        const thres1 = 180;
        const thres2 = 360;
        return deg < thres1 || deg > thres2;
    }

    public willRender() {
        const {
            treeData,
            annotationData,
            innerRadius,
            nodeAnnotationKey,
            annotationKey,
        } = this.prop;
        const d = d3.hierarchy(treeData);
        const tree = d3
            .cluster()
            .size([360, innerRadius!])
            .separation((a, b) => 1);

        const root = tree(d);
        scaleBranchLengths(root.descendants(), innerRadius!);
        const des = root.descendants();
        const links = root.links();
        let leafLength = 0;
        des.forEach((row) => {
            if (row.height === 0) leafLength += 1;
        });
        this.widthAvg = 360 / leafLength;

        const nodeScheme: string[] = [];
        const annotation: string[] = [];
        annotationData.forEach((row) => {
            this.mapping[row[this.prop.matchKey]] = {
                [nodeAnnotationKey]: row[nodeAnnotationKey],
                [annotationKey]: row[annotationKey],
            };

            nodeScheme.push(row[nodeAnnotationKey]);
            annotation.push(row[annotationKey]);
        });

        this.nodeAnno = new AnnotationColor({
            annotation: nodeScheme,
        });
        this.anno = new AnnotationColor({
            annotation,
        });
        this.color = d3.scaleOrdinal(d3.schemeCategory10);
        this.root = des;
        this.link = links;
    }

    public defaultProp() {
        return {
            ...super.defaultProp(),
            radius: 6,
            innerRadius: 340,
            outerRadius: 400,
            matchKey: "ID",
            annotationKey: "Location",
            nodeAnnotationKey: "Disease",
            rectSize: 10,
            annotationHeight: 800,
        };
    }
}
