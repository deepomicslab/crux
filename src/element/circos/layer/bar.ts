import { template } from "../../../template/tag";
import { CircosContent, CircosContentOption } from "./content";

export interface CircosContentBarOption extends CircosContentOption {
    data: any[];
    valueGetter: (d: any) => number;
    minValueGetter: (d: any) => number;
    startPosGetter: (d: any) => number;
    endPosGetter: (d: any) => number;
}

export class CircosContentBar extends CircosContent<CircosContentBarOption> {
    public render = template`
    Component {
        @for (d, i) in points {
            Arc.rad {
                key = i
                x1 = d[0]
                x2 = d[1]
                r1 = d[3]
                r2 = d[2]
                fill = "#999"
                @props prop.opt.bar
            }
        }
    }
    `;

    // @ts-ignore
    private points!: [number, number, number, number][];
    private innerR!: number;

    public willRender() {
        const vg = this.prop.valueGetter;
        const mg = this.prop.minValueGetter;
        const sg = this.prop.startPosGetter;
        const eg = this.prop.endPosGetter;

        this.innerR = this.layer.innerR;
        this.points = this.prop.data.map(d => [
            this._scale(sg(d), true),
            this._scale(eg(d), true),
            this._scale(vg(d), false),
            mg ? this._scale(mg(d), false) : this.innerR,
        ]);
    }

    public defaultProp() {
        return {
            ...super.defaultProp(),
            valueGetter: (d: any) => d,
            posGetter: (d: any, i: number) => i,
        };
    }
}
