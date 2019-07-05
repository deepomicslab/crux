import { template } from "../../template/tag";
import { BaseChart, BaseChartOption } from "./base-chart";

const a1: number[] = [];
const a2: number[] = [];
const a3: number[] = [];

export interface AreaOption extends BaseChartOption {
    data: any[];
    fill: string;
    stroke: string;
    pathOptions: any;
}

export class Area extends BaseChart<AreaOption> {
    public render = template`
    Component {
        Path {
            d = getPath()
            fill = prop.fill || "#aaa"
            stroke = prop.stroke
            @props prop.pathOptions
        }
    }
    `;

    // @ts-ignore
    private getPath(): string {
        let hasMinValue = false;
        const value = this.data.values as any[];
        const len = value.length;

        value.forEach((d, i) => {
            let minValue = 0;
            if ("minValue" in d) {
                hasMinValue = true;
                minValue = this.getY(d.minValue);
            }
            a1[i] = this.getX(d.pos);
            a2[i] = this.getY(d.value);
            a3[i] = minValue;
        });

        const yMin = this.getY(0);
        // generate path
        let path = `M${a1[0]},${yMin} `;

        for (let i = 0; i < len; i++) {
            path += `L${a1[i]},${a2[i]} `;
        }
        if (hasMinValue) {
            for (let i = len - 1; i >= 0; i--) {
                path += `L${a1[i]},${a3[i]} `;
            }
        }
        path += `z`;
        return path;
    }
}
