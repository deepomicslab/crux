import { template } from "../../../template/tag";
import { CircosContent, CircosContentOption } from "./content";

export interface CircosContentDotOption extends CircosContentOption {
    data: any[];
    valueGetter: (d: any) => number;
    posGetter: (d: any) => number;
}

export class CircosContentDot extends CircosContent<CircosContentDotOption> {
    public render = template`
    Component {
        @for (p, index) in points {
            Circle.centered {
                key = index
                x = p[0]
                y = p[1]
                points = points
                fill = "#f66"
                r = 2
                @props prop.opt.line
            }
        }
    }
    `;

    // @ts-ignore
    private points: [number, number][];

    public willRender() {
        const vg = this.prop.valueGetter;
        const pg = this.prop.posGetter;

        this.points = this.prop.data.map(d => [
            this._scale(pg(d), true),
            this._scale(vg(d), false),
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
