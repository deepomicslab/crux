import { interpolateHsl } from "d3-interpolate";

import { template } from "../../../template/tag";
import { CircosContent, CircosContentOption } from "./content";

export interface CircosContentRectOption extends CircosContentOption {
    data: any[];
    valueGetter: (d: any) => number;
    startPosGetter: (d: any) => number;
    endPosGetter: (d: any) => number;
    startColor: string;
    endColor: string;
}

export class CircosContentRect extends CircosContent<CircosContentRectOption> {
    public render = template`
    Component {
        @for (d, i) in points {
            Arc.rad {
                key = i
                x1 = d[0]
                x2 = d[1]
                r1 = innerR
                r2 = outerR
                fill = d[2]
                @props prop.opt.bar
            }
        }
    }
    `;

    // @ts-ignore
    private points: [number, number, string][];
    // @ts-ignore
    private innerR: number;
    // @ts-ignore
    private outerR: number;

    public willRender() {
        const vg = this.prop.valueGetter;
        const sg = this.prop.startPosGetter;
        const eg = this.prop.endPosGetter;

        const ir = this.innerR = this.layer.innerR;
        const or = this.outerR = this.layer.outerR;
        const i = interpolateHsl(this.prop.startColor, this.prop.endColor);

        this.points = this.prop.data.map(d => [
            this._scale(sg(d), true),
            this._scale(eg(d), true),
            i((this._scale(vg(d), false) - ir) / (or - ir)),
        ]);
    }

    public defaultProp() {
        return {
            ...super.defaultProp(),
            valueGetter: (d: any) => d,
            startPosGetter: (d: any, i: number) => i,
            endPosGetter: (d: any, i: number) => i,
            startColor: "#ddd",
            endColor: "#111",
        };
    }
}
