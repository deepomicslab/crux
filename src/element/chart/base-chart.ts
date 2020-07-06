import { oneLineTrim } from "common-tags";
import { Anchor } from "../../defs/geometry";
import { Component } from "../component";
import { ComponentOption } from "../component-options";
import { parseData, ParsedData, XYPlot } from "../plot";

export interface BaseChartOption extends ComponentOption {
    data: any[] | string;
    dataHandler: any;
    columnWidth: number;
}

export class BaseChart<Option extends BaseChartOption = BaseChartOption> extends Component<Option> {
    protected data!: ParsedData | Record<string, ParsedData>;
    protected columnWidth!: number;

    protected flipped = false;
    protected inverted = false;

    public willRender() {
        const dataProp = this.prop.data;
        if (this.$parent instanceof XYPlot) {
            this.inheritData();
            this.columnWidth = this.$parent.columnWidth;
            this.flipped = this.$parent.flipped;
            this.inverted = this.$parent.inverted;
        } else if (Array.isArray(dataProp)) {
            this.data = parseData(this as any, dataProp, this.prop.dataHandler);
        } else {
            throw new Error(`Chart: please supply data.`);
        }
    }

    protected inheritData() {
        const dataProp = this.prop.data;
        const $p = this.$parent as XYPlot;
        if ($p.hasMultipleData) {
            const getData = (k: string) => {
                if (typeof k !== "string") {
                    throw new Error(`The chart required a non-string data key "${k}". Data keys should be strings.`);
                }
                if (!(k in (this.$parent as any).data)) {
                    throw new Error(`The chart required a data key "${k}", but it doesn't exist in the plot.`);
                }
                return (this.$parent as any).data[k];
            };
            if (typeof dataProp === "string") {
                this.data = getData(dataProp);
            } else if (Array.isArray(dataProp)) {
                this.data = {};
                dataProp.forEach(p => (this.data[p] = getData(p)));
            } else {
                throw new Error(oneLineTrim`Chart: a data key or an array of data keys
                 must be used when supplying multiple data to the plot.`);
            }
        } else {
            this.data = $p.data;
        }
    }

    protected propValue(name: string, d: any, i: number, g: any[]): any {
        const val = this.prop[name];
        return typeof val === "function" ? val.call(null, d, i, g) : val;
    }

    protected getAnchor() {
        return this.flipped
            ? (this.inverted ? Anchor.Left : Anchor.Right) | Anchor.Middle
            : (this.inverted ? Anchor.Top : Anchor.Bottom) | Anchor.Center;
    }

    protected getX(value: number) {
        return this._scale(value, !this.flipped);
    }

    protected getY(value: number) {
        return this._scale(value, this.flipped);
    }

    protected getWidth() {
        return this.prop.columnWidth || this.columnWidth;
    }

    protected flippedOpts(opts: any) {
        const result = {};
        Object.keys(FLIP_OPT_MAP).forEach(k => {
            const key = this.flipped ? FLIP_OPT_MAP[k] : k;
            result[key] = opts[k] || 0;
        });
        return result;
    }

    protected getHeight(value: number, offset: number) {
        const h = this._scale(value + offset, this.flipped) - this._scale(offset, this.flipped);
        return this.inverted ? h : -h;
    }
}

const FLIP_OPT_MAP = {
    x: "y",
    y: "x",
    width: "height",
    height: "width",
    x1: "y1",
    x2: "y2",
    y1: "x1",
    y2: "x2",
};
