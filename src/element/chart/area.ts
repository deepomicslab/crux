import { template } from "../../template/tag";
import { BaseChart, BaseChartOption } from "./base-chart";

const a1: number[] = [];
const a2: number[] = [];
const a3: number[] = [];

export interface AreaOption extends BaseChartOption {
    data: any[];
    xOffset: number;
    fill: string;
    stroke: string;
    pathOptions: any;
}

export class Area extends BaseChart<AreaOption> {
    public render = template`
    Component {
        Path {
            d = $v.isSVG ? getPath() : getCanvasPath.bind(this)
            fill = prop.fill || "#aaa"
            stroke = prop.stroke
            @props prop.pathOptions
        }
    }
    `;

    private _hasMinValue = false;

    private updateData() {
        this._hasMinValue = false;
        const value = this.data.values as any[];
        const xOffset = this.prop.xOffset || 0;

        value.forEach((d, i) => {
            let minValue = 0;
            if ("minValue" in d) {
                this._hasMinValue = true;
                minValue = this.getY(d.minValue);
            }
            a1[i] = this.getX(d.pos + xOffset);
            a2[i] = this.getY(d.value);
            a3[i] = minValue;
        });
    }

    // @ts-ignore
    private getPath(): string {
        this.updateData();
        const len = (this.data.values as any[]).length;
        const yMin = this.getY(0);
        // generate path
        let path = `M${a1[0]},${yMin} `;

        for (let i = 0; i < len; i++) {
            path += `L${a1[i]},${a2[i]} `;
        }
        if (this._hasMinValue) {
            for (let i = len - 1; i >= 0; i--) {
                path += `L${a1[i]},${a3[i]} `;
            }
        }
        path += `z`;
        return path;
    }

    // @ts-ignore
    private getCanvasPath(path: Path2D) {
        this.updateData();
        const len = (this.data.values as any[]).length;
        const yMin = this.getY(0);
        // generate path
        path.moveTo(a1[0], yMin);

        for (let i = 0; i < len; i++) {
            path.lineTo(a1[i], a2[i]);
        }
        if (this._hasMinValue) {
            for (let i = len - 1; i >= 0; i--) {
                path.lineTo(a1[i], a3[i]);
            }
        }
        path.closePath();
    }
}
