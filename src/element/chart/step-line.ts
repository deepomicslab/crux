import { template } from "../../template/tag";
import { ParsedData } from "../plot";
import { BaseChart, BaseChartOption } from "./base-chart";

export interface StepLineOption extends BaseChartOption {
    stroke: string;
    pathOptions: any;
    fill: string;
    closedEnd: boolean;
    closedStart: boolean;
}

export class StepLine extends BaseChart<StepLineOption> {
    public render = template`
        Component {
            xScale = getScale(true) || createXScale()
            yScale = getScale(false) || createYScale()

            Path {
                d = getPath()
                fill = prop.fill || "#aaa"
                stroke = prop.stroke
                @props prop.pathOptions
            }
        }
    `;

    public data!: ParsedData;

    // @ts-ignore
    private _cachedPath = "";
    // @ts-ignore
    private getPath(): string {
        let path = "";
        const closedStart = typeof this.prop.closedStart !== "undefined" ? this.prop.closedStart : true;
        const closedEnd = typeof this.prop.closedEnd !== "undefined" ? this.prop.closedEnd : true;
        const width = (this.getX(this.data.values[1].pos) - this.getX(this.data.values[0].pos)) / 2;
        const xStart = this.getX(this.data.values[0].pos) - width;
        const y0 = this.getY(0);
        if (closedStart) {
            path += `M${this.flipped ? y0 : xStart}, ${this.flipped ? xStart : y0}`;
        }
        this.data.values.forEach((d, i) => {
            const xFrom = this.getX(d.pos) - width;
            const xTo = this.getX(d.pos) + width;
            const y = this.getY(d.value);
            path += !closedStart && i === 0 ? "M" : "L";
            path += `${this.flipped ? y : xFrom}, ${this.flipped ? xFrom : y} L${this.flipped ? y : xTo}, ${this.flipped ? xTo : y}`;
        });
        if (closedEnd) {
            const xEnd = this.getX(this.data.values[this.data.values.length - 1].pos) + width;
            path += `L${this.flipped ? y0 : xEnd}, ${this.flipped ? xEnd : y0}`;
        }
        this._cachedPath = path;
        return path;
    }

    public willRender() {
        super.willRender();
    }
}
