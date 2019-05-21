import { template } from "../../template/tag";
import { BaseChart, BaseChartOption } from "./base-chart";

export interface AreaOption extends BaseChartOption {
    data: any[];
}

export class Area extends BaseChart<AreaOption> {
    public render = template`
    Component {
        Path {
            d = getPath()
            fill = prop.fill
            stroke = prop.stroke
        }
    }
    `;

    private _cachedPath = "";
    private _cachedData: [number, number][] = [];

    private getPath(): string {
        const maxY = this.$geometry.height;
        const data = this.data.map((d, i) => [
            this._scale(i, true),
            this._scale(d, false),
        ] as [number, number]);

        // check dirty
        if (this._cachedData.length === data.length &&
            this._cachedData.every((d, i) =>
                data[i][0] === this._cachedData[i][0] && data[i][1] === this._cachedData[i][1])
        ) {
            return this._cachedPath;
        }
        this._cachedData = data;

        // generate path
        let path = `M${data[0][0]},${maxY} `;
        let d: [number, number];
        for (d of data) {
            path += `L${d[0]},${maxY - d[1]} `;
        }
        path += `L${d[0]},${maxY} z`;
        this._cachedPath = path;
        return path;
    }
}
