import d3 = require("d3-array");

import { GeometryValue, offset } from "../../defs/geometry";
import { ElementDef } from "../../rendering/render-tree";
import { template } from "../../template/tag";
import { Component } from "../component";
import { ComponentOption } from "../component-options";

export interface XYPlotPoint {
    pos: number;
    value: number;
    data?: any;
}

export interface XYPlotDataAcceptable {
    posGetter?: string | ((d: any) => number);
    valueGetter?: string | ((d: any) => number);
}

export interface XYPlotOption extends ComponentOption, XYPlotDataAcceptable {
    data: any[] | Record<string, any>;
    gap: number;
    // layout
    flip: boolean;
    invertValueAxis: boolean;
    // padding
    padding: number;
    "padding-x": number;
    "padding-y": number;
    "padding-l": number;
    "padding-r": number;
    "padding-t": number;
    "padding-b": number;
}

export class XYPlot extends Component<XYPlotOption> {
    public render = template`
    Component {
        Component {
            @let p = _paddings

            x = p[3]
            y = p[0]
            width = @geo(100, -p[1]-p[3])
            height = @geo(100, -p[0]-p[2])
            xScale = _xScale
            yScale = _yScale

            @children
        }
    }
    `;

    public data: XYPlotPoint[] | Record<string, XYPlotPoint[]>;
    public hasMultipleData = false;
    public columnWidth: number;

    private _paddings: [number, number, number, number];
    private _xScale: any;
    private _yScale: any;
    private _allData: XYPlotPoint[];

    public willRender() {
        const data = this.prop.data;
        if (data) {
            if (Array.isArray(data)) {
                this.data = this._allData = parseData(this, data);
            } else if (typeof data === "object") {
                this.hasMultipleData = true;
                this.data = {};
                Object.keys(data).forEach(k => this.data[k] = parseData(this, data[k]));
                this._allData = Object.values(this.data).flat();
            } else {
                throw new Error(`XYPlot: data supplied must be an array or an object.`);
            }
        }
        this._paddings = this.getPadding();
        this._xScale = this.createScale(true);
        this._yScale = this.createScale(false);
    }

    public willInsertChildren(children: ElementDef[]) {
        children.forEach(c => {
            c.opt.props.width = GeometryValue.fullSize;
            c.opt.props.height = GeometryValue.fullSize;
        });
    }

    // API

    public get flipped() { return !!this.prop.flip; }
    public get inverted() { return !!this.prop.invertValueAxis; }
    public get categoryScale() { return this.flipped ? this._yScale : this._xScale; }
    public get valueScale() { return this.flipped ? this._xScale : this._yScale; }

    // private use

    private createScale(x: boolean) {
        const size = x ? this.$geometry.width : this.$geometry.height;
        const func = this.flipped === x ? this.createValueScale : this.createCategoryScale;
        return func.call(this, size);
    }

    private createCategoryScale(size: number) {
        const [pt, pr, pb, pl] = this._paddings;
        const pRange = d3.extent(this._allData, d => d.pos);
        const n = (this.hasMultipleData ? this.data[Object.keys(this.data)[0]] : this.data).length;

        const width = size - pl - pr;
        const gap = typeof this.prop.gap === "number" ? this.prop.gap : (width * 0.1 / n);
        const columnSizeWithGap = (width - gap) / n;
        this.columnWidth = columnSizeWithGap - gap;
        const padding = (columnSizeWithGap + gap) * 0.5;
        const domain: [number, number] = [padding, width - padding];
        return this._createScale_linear(true, pRange, domain);
    }

    private createValueScale(size: number) {
        const [pt, pr, pb, pl] = this._paddings;
        const width = size - pt - pb;
        return this._createScale_linear(
            false,
            [0, d3.max(this._allData, d => d.value)],
            this.inverted ? [0, width] : [width, 0],
        );
    }

    private getPadding(): [number, number, number, number] {
        const result = [0, 0, 0, 0] as [number, number, number, number];
        let p: number;
        if (p = this.prop.padding) {
            result.fill(p);
        }
        if (p = this.prop["padding-x"]) result[1] = result[3] = p;
        if (p = this.prop["padding-y"]) result[0] = result[2] = p;
        if (p = this.prop["padding-t"]) result[0] = p;
        if (p = this.prop["padding-r"]) result[1] = p;
        if (p = this.prop["padding-b"]) result[2] = p;
        if (p = this.prop["padding-l"]) result[3] = p;
        return result;
    }

    private offset = offset;
}

export function getGetter(vf: string | ((d: any, i: number) => any)) {
    return typeof vf === "string" ? (d: any) => d[vf] : vf;
}

export function parseData(elm: Component<ComponentOption & XYPlotDataAcceptable>, data: any[]) {
    const d = data[0];
    if (typeof d === "number") {
        return data.map((d, i) => ({ pos: i, value: d, data: d }));
    } else if (Array.isArray(d)) {
        return data.map(([i, d]) => ({ pos: i, value: d, data: d }));
    } else {
        const value = getGetter(elm.prop.valueGetter || "value");
        const pos = getGetter(elm.prop.posGetter) || ((d, i) => i);
        return data.map((d, i) => ({
            pos: pos(d, i), value: value(d, i), data: d,
        }));
    }
}
