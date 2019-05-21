import { Component } from "../component";
import { ComponentOption } from "../component-options";
import { parseData, XYPlot, XYPlotDataAcceptable } from "../plot";

export interface BaseChartOption extends ComponentOption, XYPlotDataAcceptable {
    data: any[];
}

export class BaseChart<Option extends BaseChartOption = BaseChartOption> extends Component<Option> {
    protected data: any[];
    protected columnWidth: number;

    protected flipped = false;
    protected inverted = false;

    public willRender() {
        const dataProp = this.prop.data;
        if (Array.isArray(dataProp)) {
            this.data = parseData(this as any, dataProp);
        }
        if (this.$parent instanceof XYPlot) {
            if (!this.data) {
                if (this.$parent.hasMultipleData) {
                    if (typeof dataProp !== "string")
                        throw new Error(`Chart: a data key must be used when supplying multiple data to the plot.`);
                    this.data = this.$parent.data[dataProp];
                } else {
                    this.data = this.$parent.data as any[];
                }
            }
            this.columnWidth = this.$parent.columnWidth;
            this.flipped = this.$parent.flipped;
            this.inverted = this.$parent.inverted;
        } else {
            throw new Error(`Chart: please supply data.`);
        }
    }

    protected propValue(name: string, d: any, i: number, g: any[]): any {
        const val = this.prop[name];
        return typeof val === "function" ? val.call(null, d, i, g) : val;
    }
}
