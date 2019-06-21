import { template } from "../../template/tag";
import { BaseChart, BaseChartOption } from "./base-chart";

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

    private _cachedPath = "";
    private _cachedData: [number, number, number][] = [];

    // @ts-ignore
    private getPath(): string {
        let hasMinValue = false;
        const value = this.data.values as any[];
        const data = value.map((d, i) => {
            let minValue = 0;
            if ("minValue" in d) {
                hasMinValue = true;
                minValue = this.getY(d.minValue);
            }
            return [
                this.getX(d.pos),
                this.getY(d.value),
                minValue,
            ] as [number, number, number];
        });

        // check dirty
        if (this._cachedData.length === data.length &&
            this._cachedData.every((d, i) =>
                data[i][0] === this._cachedData[i][0] && data[i][1] === this._cachedData[i][1] && data[i][2] === this._cachedData[i][2])
        ) {
            return this._cachedPath;
        }
        this._cachedData = data;

        // generate path
        let path = `M${data[0][0]},${this.getY(0)} `;
        for (const d of data) {
            path += `L${d[0]},${d[1]} `;
        }
        if (hasMinValue) {
            data.reverse();
            for (const d of data) {
                path += `L${d[0]},${d[2]} `;
            }
        }
        path += `z`;
        this._cachedPath = path;
        return path;
    }
}
