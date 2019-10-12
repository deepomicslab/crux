import { template } from "../../../template/tag";
import { toCartesian } from "../../../utils/math";
import { CircosContent, CircosContentOption } from "./content";

export interface CircosContentAreaOption extends CircosContentOption {
    data: any[];
    valueGetter: (d: any) => number;
    posGetter: (d: any) => number;
}

export class CircosContentArea extends CircosContent<CircosContentAreaOption> {
    public render = template`
    Component {
        Path {
            d = areaPath
            fill = "#aaa"
            @props prop.opt.area
        }
    }
    `;

    private points!: [number, number][];
    private startPoint!: [number, number];
    private endPoint!: [number, number];

    // @ts-ignore
    private get areaPath() {
        const [sx, sy] = toCartesian(this.startPoint[0], this.startPoint[1], true);
        const [ex, ey] = toCartesian(this.endPoint[0], this.endPoint[1], true);
        let str = `M${sx},${sy}`;
        for (const p of this.points) {
            const [x, y] = toCartesian(p[0], p[1], true);
            str += `L${x},${y}`;
        }
        str += `L${ex},${ey}`;
        const r = this.layer.innerR;
        str += `A${r} ${r} 0 0 0 ${sx} ${sy} z`;
        return str;
    }

    public willRender() {
        const vg = this.prop.valueGetter;
        const pg = this.prop.posGetter;

        const minY = this.getScale(false).range()[0];
        const [minX, maxX] = this.getScale(true).range();

        this.points = this.prop.data.map(d => [
            this._scale(pg(d), true),
            this._scale(vg(d), false),
        ]);
        this.startPoint = [minX, minY];
        this.endPoint = [maxX, minY];
    }

    public defaultProp() {
        return {
            ...super.defaultProp(),
            valueGetter: (d: any) => d,
            posGetter: (d: any, i: number) => i,
        };
    }
}
