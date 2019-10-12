import { stackedLayout } from "../../../algo";
import { template } from "../../../template/tag";
import { CircosContent, CircosContentOption } from "./content";

export interface CircosContentStackedDotOption extends CircosContentOption {
    data: any[];
    posGetter: (d: any) => number;
    colorGetter: (d: any) => string;
    pointSize: number;
}

export class CircosContentStackedDot extends CircosContent<CircosContentStackedDotOption> {
    public render = template`
    Component {
        @for (layer, l) in points {
            @for (p, i) in layer {
                Circle.centered {
                    key = l + "," + i
                    x = p.pos
                    y = getR(l)
                    points = points
                    fill = p.color || "#f66"
                    r = prop.pointSize
                    @props prop.opt.dot
                }
            }
        }
    }
    `;

    // @ts-ignore
    private points: {pos: number, d: any}[][];

    // @ts-ignore
    private getR(layer: number) {
        return Math.min(
            this.prop.pointSize + this.layer.innerR + layer * this.prop.pointSize * 2,
            this.layer.outerR,
        );
    }

    public willRender() {
        const pg = this.prop.posGetter;
        const cg = this.prop.colorGetter;
        const ps = this.prop.pointSize;

        const points = this.prop.data.map(d => {
            const pos = this._scale(pg(d), true);
            return {
                pos, d,
                color: cg ? cg(d) : null,
                xPos: pos * this.layer.innerR,
            };
        });

        this.points = stackedLayout(points)
            .value(d => d.xPos)
            .extent(d => [d.xPos - ps, d.xPos + ps])
            .run();
    }

    public defaultProp() {
        return {
            ...super.defaultProp(),
            posGetter: (d: any, i: number) => i,
            pointSize: 2,
        };
    }
}
