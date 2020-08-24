import * as d3 from "d3";
import { useTemplate } from "../../ext/decorator";
import { scaleBranchLengths } from "../../utils/newick-helper";
import { Component } from "../component";
import { ComponentOption } from "../component-options";
import { AnnotationColor } from "./annotation-color";
import { getPath } from "./radial-tree";

export interface CircularHeatTreeData {
    name: string;
    data: any;
    length: number;
    children: CircularHeatTreeData[];
}

export interface CircularHeatTreeOption extends ComponentOption {
    treeData: CircularHeatTreeData;
    heatData: any[];
    annotationData: any[];
    radius?: number;
    innerRadius?: number; // radial tree
    outerRadius?: number; // heatmap
    rectSize?: number;
    annotationKey?: string;
    idKey?: string;
    colorShare?: boolean;
}

interface Annotation {
    annotation: Array<string>;
    heat: Record<string, Record<string, string[]>> | string[];
    heatColumns: number;
}

@useTemplate(`
Component {
    Component {
        width = 100%;
        height = 100%;
        coord = "polar";
        width = (prop.outerRadius + annotation.heatColumns * prop.rectSize) * 2;
        height = (prop.outerRadius + annotation.heatColumns * prop.rectSize) * 2;
        @let height = root[0].height;
        @for i in root.length{
            @let node = root[i];
            @let l = link[i];
            Component {
                key = "container" + i
                @if l {
                    Path {
                        fill = "none";
                        d = getPath(l.source.x, l.source.y, l.target.x, l.target.y);
                        dashArray = l.target.dash ? "5,5" : "";
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
                    key= "container arc" + i;
                    Arc {
                        x1=node.x - widthAvg / 2;
                        x2=node.x + widthAvg / 2;
                        r1=prop.outerRadius;
                        r2=node.y+prop.radius;
                        fill= anno.get("", map[node.data.name]);
                        stroke = "white";
                        stroke-width = 0;
                    }
                }
                Component {
                    x = node.x;
                    y = prop.outerRadius;
                    coord = "polar";
                    Container {
                        padding = 4;
                        @let rect = snv[node.data.name];
                        @for k in rectKey.length {
                            Arc {
                                key= "arc" + i + "-" + k;
                                x1=node.x - widthAvg / 2;
                                x2=node.x + widthAvg / 2;
                                r1=prop.outerRadius + k * prop.rectSize;
                                r2=prop.outerRadius + ((k+1) * prop.rectSize);
                                fill = heat.get(rectKey[k],rect[rectKey[k]]);
                                stroke = "white";
                            }
                        }
                    }
                }
            }
        }
        Component {
            y = prop.outerRadius;
            coord = "cartesian";
            @for k in rectKey.length {
                Text {
                    x = -prop.rectSize * rectKey[k].length * 0.6;
                    y = prop.rectSize * -(k+1);
                    key = "t" + k;
                    text = rectKey[k];
                    fontSize = prop.rectSize + "px";
                }
            }
        }
    }
    AnnotationLegend {
        schemes = [anno, heat];
        height = 800;
        startX = (prop.outerRadius + annotation.heatColumns * prop.rectSize) * 2 + 50;
        rectHeight = prop.rectSize;
    }
}
`)
export class CircularHeatTree extends Component<CircularHeatTreeOption> {
    // @ts-ignore
    private root!: d3.HierarchyPointNode<CircularHeatTreeData>[];
    // @ts-ignore
    private link!: d3.HierarchyPointLink<CircularHeatTreeData>[];
    private map: Record<string, string> = {};
    private snv: Record<string, Record<string, string>> = {};
    // @ts-ignore
    private _color!: d3.ScaleOrdinal<string, string>;
    // @ts-ignore
    private _annotationColor!: d3.ScaleOrdinal<string, string>;
    // @ts-ignore
    private rectKey!: Array<string>;
    // @ts-ignore
    private widthAvg!: number;
    private annotation!: Annotation;
    // @ts-ignore
    private heat!: ColorScheme;
    // @ts-ignore
    private anno!: ColorScheme;
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
            heatData,
            annotationData,
            innerRadius,
            annotationKey,
            idKey,
            colorShare = false,
        } = this.prop;

        const d = d3.hierarchy(treeData);

        const tree = d3
            .cluster<CircularHeatTreeData>()
            .size([340, innerRadius!])
            .separation((a, b) => 1);

        const root = tree(d);
        scaleBranchLengths(root.descendants(), innerRadius!);

        let leafLength = 0;
        const des = root.descendants();
        des.forEach((row) => {
            if (row.height === 0) leafLength += 1;
        });
        this.widthAvg = 340 / leafLength;
        const links = root.links();

        const columns: string[] = heatData["columns"];
        this.annotation = {
            annotation: [],
            heat: {},
            heatColumns: columns.length - 1,
        };

        const annotation = {};

        annotationData.forEach((row) => {
            this.map[row[idKey!]] = row[annotationKey!];
            if (!annotation[row[annotationKey!]]) {
                annotation[row[annotationKey!]] = true;
                this.annotation.annotation.push(row[annotationKey!]);
            }
        });

        const existing: Record<string, {}> = {};
        heatData.forEach((row) => {
            this.snv[row[idKey!]] = {
                ...row,
            };

            columns.forEach((key: string) => {
                if (key !== idKey!) {
                    if (!this.annotation.heat[key]) {
                        this.annotation.heat[key] = [];
                        existing[key] = {};
                    }
                    if (!existing[key][row[key]]) {
                        this.annotation.heat[key].push(row[key]);
                        existing[key][row[key]] = true;
                    }
                }
            });

            delete this.snv[row[idKey!]].ID;
        });

        this.anno = new AnnotationColor({
            annotation: Object.values(this.map),
        });
        this.heat = new AnnotationColor({
            annotation: this.annotation.heat,
            colorShare,
        });

        this.root = des;
        this.link = links;
        this.rectKey = heatData["columns"].slice(1);
        // this.rectKey = columns.splice(1, columns.length - 1);
        this._color = d3.scaleOrdinal(d3.schemeCategory10);
        this._annotationColor = d3.scaleOrdinal(d3.schemeSet2);
    }

    public defaultProp() {
        return {
            ...super.defaultProp(),
            margin: 40,
            radius: 1.5,
            rectSize: 10,
            outerRadius: 360,
            innerRadius: 320,
            annotationKey: "Ressistance",
            idKey: "ID",
            colorShare: false,
        };
    }
}
