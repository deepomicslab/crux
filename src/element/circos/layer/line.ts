import { template } from "../../../template/tag";
import { CircosContent, CircosContentOption } from "./content";

export interface CircosContentLineOption extends CircosContentOption {
    data: any[];
    valueGetter: (d: any) => number;
    posGetter: (d: any) => number;
}

export class CircosContentLine extends CircosContent<CircosContentLineOption> {
    public render = template`
    Component {
        Polyline {
            points = points
            stroke = "#f66"
            @props prop.opt.line
        }
    }
    `;

    // @ts-ignore
    private points: [number, number][];

    public willRender() {
        const vg = this.prop.valueGetter;
        const pg = this.prop.posGetter;

        this.points = [
            [this.section.startAngle, this.layer.innerR],
            ...this.prop.data.map(d => [
                this._scale(pg(d), true),
                this._scale(vg(d), false),
            ] as [number, number]),
            [this.section.endAngle, this.layer.innerR],
        ];
    }

    public defaultProp() {
        return {
            ...super.defaultProp(),
            valueGetter: (d: any) => d,
            posGetter: (d: any, i: number) => i,
        };
    }
}
